---
title: ZooKeeper 高频追问：ZAB 细节、Watcher 与 Session 陷阱
description: ZAB 选举的投票比较规则与广播和 2PC 的区别、Watcher 一次性触发的原理与丢事件窗口、Session 超时协商与"半死"状态，ZK 不适合做什么
level: basic
core: true
---

机制概览（树形模型、ZAB、Session、Watch）见
[核心机制篇](/zookeeper/basic/core/01-zookeeper-core/)，本篇集中
回答面试追问——ZK 八股的差距就在这些细节上。

## ZAB 追问

### 选举时投票怎么比

每个节点投出三元组 `(epoch, zxid, myid)`，收到别人的投票**依次
比较**：epoch 大者优先 → epoch 相同 zxid 大者优先 → 都相同 myid
大者胜出。

- **优先选数据最新的**（epoch/zxid 大）：当选者不需要从别人那里
  补多少日志，恢复快。
- zxid 是 64 位：**高 32 位 epoch（朝代）+ 低 32 位计数器**——
  每次选举 epoch 加一，防止旧 leader 复活后用旧 zxid 扰乱新朝代
  （与 Raft 的 term、[脑裂防护](/distributed/advanced/availability/02-split-brain/)
  的 fencing epoch 同构）。

### 广播阶段和 2PC 什么区别（必考）

| 维度 | 2PC | ZAB 广播 |
|---|---|---|
| 确认要求 | **全员** ack 才提交 | **过半** ack 即提交 |
| 失败动作 | 全体回滚 | **不回滚**，直接放弃该提议 → 崩溃恢复重新选主 |
| 阻塞 | 参与者锁资源干等 | 无阻塞，少数派掉线不影响提交 |

一句话：ZAB 用"过半 + 不回滚（重选主重来）"根治了 2PC 的阻塞与
单点协调者问题。崩溃恢复的关键动作是**日志对齐**：新 leader 当选
后把所有 follower 与自己的日志同步到一致（多删少补）才对外服务。

## Watcher 追问

### 为什么要"一次性触发"

事件触发后 watcher 即失效，客户端必须**重新注册**。这是刻意的
简化：保证事件顺序、避免服务端维护大量常驻 watcher 的状态膨胀。
带来一个工程坑——**重注册的间隙发生的变更，你收不到通知**。

补救套路：`getData/getChildren` 的返回 stat 里有版本号（mversion/
cversion），收到变更后**对比版本号决定要不要补拉**；配置中心类
场景干脆定时全量对账兜底。

### Watch 注册在哪一端

注册动作随 `getData(path, watch)` 请求到达**服务端**（服务端内存
记录 watch 表），触发时服务端推送**轻量事件**（只说"这个节点
变了"，不推数据内容），客户端回调本地 WatchManager 里登记的
处理器，再自行拉取最新数据——**通知 + 拉取**的组合，不是推送全量。

## Session 追问

- **超时协商**：客户端发一个期望值，服务端按
  `[minSessionTimeout, maxSessionTimeout]`（默认 2×tickTime 与
  20×tickTime）截断后生效。
- **心跳**：客户端按约 1/2~2/3 超时时间发 PING 续约；过期由服务端
  SessionTracker 判定。
- **"半死"状态（必考）**：GC 停顿/网络分区时，**服务端已判定
  session 过期、临时节点已删，客户端却还没收到过期事件**，继续
  以为自己持有锁/主角色——ZK 不会替你兜底，必须靠 fencing token
  或业务幂等自保（完整论证见
  [分布式锁选型](/distributed/intermediate/coordination/01-distributed-lock-compare/)）。
- 过期后果：该 session 的**所有临时节点被删**、所有 watcher 收到
  SessionExpired——要重建全部临时节点与 watcher。

## 追问速答卡

| 问题 | 一句话答案 |
|---|---|
| 集群为什么 3/5 台 | 奇数保证 quorum 有效容错（2n+1），见 [Quorum](/distributed/intermediate/consensus/01-paxos-raft/) |
| 读性能怎么提 | 读请求任意节点本地响应（FIFO 读）；3.5+ 支持 leader 直读；读多写少场景天然适合 |
| ZK 不适合做什么 | 存大量小数据（1MB 上限 + 全量内存）、超高 QPS 注册中心、消息队列（反模式） |
| 写为什么慢 | 所有写走 leader + 过半落盘，写吞吐是集群天花板；批量提交缓解 |
| ZK 和 etcd 怎么选 | 同为 CP 协调者；etcd gRPC 性能好、K8s 生态默认，ZK 生态老、运维经验多，见 [etcd 对比](/etcd/basic/core/) |

## 小结

- ZAB = 过半广播 + 崩溃恢复重选主；与 2PC 的区别（过半、不回滚）
  是第一高频题。
- Watcher 一次性 + 轻量通知 + 客户端重注册——重注册窗口要用版本
  号对账兜底。
- Session 过期以服务端判定为准，"半死"状态是所有基于 ZK 的锁与
  选主的正确性漏洞，fencing 是标准补丁。

## 延伸阅读

- [ZooKeeper 官方文档：Sessions 与 Watches](https://zookeeper.apache.org/doc/current/zookeeperProgrammers.html)
- [ZooKeeper Internals（ZAB 官方描述）](https://zookeeper.apache.org/doc/current/zookeeperInternals.html)
- [分布式锁选型（fencing 论证）](/distributed/intermediate/coordination/01-distributed-lock-compare/)
