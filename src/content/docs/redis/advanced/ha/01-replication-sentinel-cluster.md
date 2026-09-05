---
title: 高可用：主从、哨兵与集群
description: 全量与增量复制、哨兵的判定与选主流程、Cluster 槽位与 Gossip、三种方案选型
level: advanced
core: true
---

## 演进主线

```mermaid
flowchart LR
    A["主从复制<br/>数据多副本"] --> B["哨兵<br/>自动故障转移"]
    B --> C["Cluster<br/>数据分片 + 内置高可用"]

    A -.解决.-> P1["数据丢了"]
    B -.解决.-> P2["主库挂了要人工切"]
    C -.解决.-> P3["单机容量与写性能上限"]
```

## 主从复制

第一次是**全量**，之后是**增量**：

```mermaid
sequenceDiagram
    participant M as 主库
    participant S as 从库
    Note over S: 首次连接（psync ? ?）
    M->>M: bgsave 生成 RDB
    M->>S: 发送 RDB（期间新写入暂存 replication buffer）
    M->>S: 追加发送缓冲区增量
    Note over S: 加载 RDB → 重放增量 → 追平
    Note over S,M: 此后主库每条写命令实时传播（replication backlog 记 offset）
    Note over S: 断线重连（psync <runid> <offset>）
    M->>S: offset 还在 backlog 里 → 只补差量；不在 → 重新全量
```

要点：

- 主库为每个从库起一个**子进程**发 RDB，不阻塞主线程。
- **replication backlog（环形缓冲区）** 记最近的写命令与位点，短断线
  只需补差——backlog 太小，断线久了就退化成全量同步。
- 异步复制：主库不等从库确认——**主库刚写入未同步就宕机，这条数据
  就丢了**（这就是分布式锁篇说主从切换丢锁的根源）。

## 哨兵（Sentinel）：自动故障转移

主从只解决了"数据有备份"，主库挂了仍要人工切换。哨兵集群做三件事：
**监控、裁决、选主**。

```mermaid
flowchart TB
    A["每个哨兵每秒 ping<br/>主/从/其他哨兵"] --> B{"主库超时没回?<br/>（down-after-milliseconds）"}
    B -->|"是：主观下线 sdown"| C{"问其他哨兵：<br/>同意数 >= quorum?"}
    C -->|是| D["客观下线 odown"]
    D --> E["哨兵之间选 leader<br/>（需要 majority 过半，不是 quorum）"]
    E --> F["leader 哨兵从从库里挑新主：<br/>① 排除断线的 ② 优先级 replica-priority<br/>③ 复制 offset 最新 ④ runid 最小"]
    F --> G["执行切换：旧主变从库<br/>发布新主地址，客户端重连"]
```

两个容易混的数：**quorum 只用于"认定客观下线"**（门槛可低）；**leader
选举必须过半哨兵**（保证同一任期内只有一个 leader）——所以哨兵要部署
奇数个（≥3）。

**脑裂**残留风险：旧主没死只是卡（网络分区），分区恢复后旧主上有新写入
——会因被视为从库被**清空重同步**，分区期间的写入丢失。缓解参数：

```conf
min-replicas-to-write 1        # 主库至少有 1 个从库在同步才接受写
min-replicas-max-lag 10        # 从库延迟超 10s 视为失联 → 拒绝写入
```

## Cluster：16384 个槽

主从 + 哨兵仍是"**一个容量、单点写入**"。Cluster 把数据切片：

- 全键空间切成 **16384 个槽**，`slot = CRC16(key) % 16384`，每个主节点
  负责一段槽位。
- 客户端直连任意节点：槽在本地直接执行；不在则返回 **MOVED 重定向**。
- 槽迁移中途的 key：**ASK 重定向**到目标节点（迁移完成前新旧各持一半
  职责，客户端应答后继续向新节点发请求但记住旧节点的槽归属没变）。
- 节点间用 **Gossip 协议**（ping/pong 携带集群拓扑）互相探活与传播状态；
  主挂了它的**内置从库自动顶上**（每主至少配一个从，哨兵的活被内置了）。

```mermaid
flowchart LR
    C["client"] -->|get user:42| N1["节点A 槽 0~5460"]
    N1 -->|"CRC16(user:42)%16384=9842<br/>不在我这"| MOVED["MOVED 9842 节点C"]
    C -->|重新请求| N3["节点C 槽 10923~16383<br/>执行"]

    style MOVED fill:#f5f0e6
```

**为什么是 16384**：心跳包里要携带"我负责哪些槽"的位图，16384 bit =
2KB 刚好；槽越多图越大浪费带宽；且官方定位集群 ≤1000 节点，16384 个槽
足够分。**为什么不用一致性哈希**：槽是**显式分配**的——扩缩容时按槽
迁移、粒度可控，数据归属一目了然，不依赖哈希环的虚节点技巧。

限制：多 key 操作（mget/事务/lua）要求所有 key **同槽**——业务上用
hash tag `{orderId}:items`、`{orderId}:detail` 强制同槽。

## 选型

| 方案 | 适用 | 代价 |
|---|---|---|
| 主从 | 读多写少、可人工兜底 | 故障要人切 |
| 哨兵 | 数据量单机放得下（经验值 ≤ 10G）、要自动转移 | 仍是单主容量/写入上限 |
| Cluster | 超过单机容量或写入瓶颈 | 运维复杂、多 key 受同槽限制 |

## 小结

- 复制：首连全量 RDB + 增量差补，异步复制存在丢数据窗口。
- 哨兵：quorum 定客观下线、majority 选 leader、再挑新主；脑裂用
  min-replicas 参数缓解。
- Cluster：CRC16 分 16384 槽 + MOVED/ASK 重定向 + Gossip 探活，
  分片与高可用一体化。
