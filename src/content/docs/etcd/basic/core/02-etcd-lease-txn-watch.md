---
title: etcd 深入：Lease、事务与一致性读
description: 租约与保活的临时性实现、txn 迷你事务、按 revision 的 Watch 与压缩陷阱、linearizable 与 serializable 读的区别，K8s 对 etcd 的依赖
level: basic
core: true
---

KV 模型、Raft 落地与 MVCC 概览见[核心机制篇](/etcd/basic/core/)，
本篇把 etcd 作为"协调服务"的三件核心武器讲透——**Lease、txn、
Watch**，以及高频追问"一致性读到底强在哪"。

## Lease：临时性的实现单元

ZK 用会话绑定临时节点，etcd 的对应物是 **Lease（租约）**：

```bash
lease = etcdcli.Grant(30)          # 申请 30s 租约 → 返回 LeaseID
etcdcli.Put('services/node1', '10.0.0.1', lease_id=lease.ID)
                                   # key 挂到租约上
# 客户端定期 KeepAlive 续租；进程挂了没人续 → TTL 到期
# → 该租约上所有 key 自动删除（对应 ZK 临时节点删除）
```

- 一个 Lease 可挂**多个 key**（批量注册一组服务实例）。
- 服务注册/分布式锁的"自动释放"语义全部由 Lease 承载——
  [etcd 锁](/distributed/intermediate/coordination/01-distributed-lock-compare/)
  的 `concurrency` 包底层就是 Lease + Revision。
- KeepAlive 是**客户端主动续租**（默认每 TTL/3 一次），服务端
  不代劳——和 ZK 心跳维持会话同构。

## txn：一次原子比较再写入

etcd 的 `Txn` 是**迷你 CAS 组合器**：一个 if 块里多个 `Compare`
（版本、值、存在性）全部通过才执行 then，否则 else——整个过程
是原子的，且**在 Raft 里作为单条日志复制**：

```
if  mod_revision(key) == 100        # 没被人动过（乐观锁）
then put(key, new_value)            # 抢占成功
else get(key)                       # 拿当前值，上层重试
```

选主、分布式锁的"抢注"动作都是一条 txn 完成的——**check-then-act
被压进一次原子操作**，这正是[幂等篇](/distributed/intermediate/coordination/02-idempotency/)
说的"原子地判断处理过没有"的 etcd 实现。

## Watch 深入：按 revision 的可靠订阅

- 客户端传 `start_revision`，etcd 从**该历史版本开始**把之后所有
  事件按序回放——**断线重连不会丢事件**（把上次收到的 revision
  带回来续传即可），这是对比 ZK Watcher"一次性 + 丢窗口"的最大
  工程优势。
- 事件按 key 的修改顺序投递（同一 revision 的批量变更有事务语义）。
- **Compaction 陷阱**：MVCC 历史不能无限保留，压缩点之前的
  revision 无法再 watch——watcher 落后太多再重连会收到
  `compacted` 错误，必须**全量 list + 重新 watch** 兜底。K8s 的
  informer（List + Watch + resync）就是这个套路的产品化。

## 一致性读：linearizable vs serializable（高频）

| 模式 | 语义 | 路径 | 延迟 |
|---|---|---|---|
| **Linearizable**（默认） | 读到**最新已提交**值 | 走 Raft 共识确认 | 高（一轮共识） |
| **Serializable** | 读本地状态机的快照，**不保证最新** | 直接读 follower | 极低 |

- 只有 leader 变更前后、写后立读这种场景才必须 linearizable；
  K8s watch 场景大量读用 serializable 换吞吐。
- 追问"etcd 读要不要过半"：默认要（linearizable read 要与
  quorum 确认 leader 仍有效），serializable 不要——**配置选项
  背后是 CAP 取舍**，不是协议差异。

## K8s 为什么离不开 etcd

- 集群**唯一状态存储**：API Server 是唯一写入方，etcd 存全部
  对象（Pod/Deployment/ConfigMap…）。
- **List + Watch 驱动控制循环**：每个 controller 记住资源版本
  （resourceVersion = revision），watch 增量变化 → reconcile 收敛
  实际状态到期望状态。
- etcd 抖动 = 整个 K8s 抖动：所以生产要独立部署 + SSD +
  定期 compaction + snapshot 备份。

## 小结

- Lease = etcd 版"会话 + 临时节点"，KeepAlive 客户端续租；txn
  把 CAS 原子化，选主与锁都由它承载。
- Watch 按 revision 续传不丢事件，但要处理 compaction 的
  `compacted` 错误——K8s informer 是标准消费范式。
- 一致性读是可选项：linearizable 走共识保证最新，serializable
  读本地换吞吐——说清这个取舍就是满分答案。

## 延伸阅读

- [etcd 官方文档：数据模型与 API](https://etcd.io/docs/v3.5/learning/api/)
- [etcd Watch 设计与 compaction](https://etcd.io/docs/v3.5/learning/design_client/)
- [ZooKeeper 深挖篇（对照记忆）](/zookeeper/basic/core/02-zk-deep-dive/)
