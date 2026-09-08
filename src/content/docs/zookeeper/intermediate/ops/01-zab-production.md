---
title: ZAB 生产注意点
description: 奇数集合与 Observer、磁盘 fsync 决定写入上限、持久递归 Watch 与 ZK 明确不该承载的负载
level: intermediate
---

[ZAB 选举与广播](/zookeeper/basic/core/02-zk-deep-dive/)把协议和
2PC 的差异讲清了。上线之后真正把集群打崩的，多半不是投票规则，
而是**集合大小、磁盘、Watch 数量和用错场景**。本篇收这些生产约束。

## 集合必须是奇数，Observer 才是读扩展

ZAB 提交要过半。节点数 N 容忍 F = (N-1)/2 个故障：

| 集合 | 可挂 | 过半 | 备注 |
|---|---|---|---|
| 1 | 0 | 无容错 | 开发用 |
| 3 | 1 | 2 | **默认生产** |
| 4 | 1 | 3 | 偶数：多一台机器却不增加容错，还抬高写延迟 |
| 5 | 2 | 3 | 要跨机房再考虑 |
| 7 | 3 | 4 | 写要等更多 ack，延迟上升明显 |

4 节点是经典错配：挂 2 台就丢 quorum（和 3 节点一样只扛 1），写却
要等 3 个 ack。需要更多读能力时不要加投票者，加 **Observer**：

- Observer 复制日志、**不投票、不进 quorum**；
- 客户端可读 Observer，写仍转发 Leader；
- 与 etcd Learner 同构——先扩只读，再决定要不要提升投票权。

跨机房：远端只放 Observer，投票者留在一个低延迟机房。远端投票者
会把每次写的过半 RTT 拉到跨城级别。

## 写吞吐的天花板在磁盘，不在 CPU

所有写走 Leader + 过半 **事务日志 fsync**。Leader 的 `dataLogDir`
所在盘的 fsync P99 就是集群写延迟。生产纪律：

- `dataDir`（快照）和 `dataLogDir`（事务日志）**分盘**；日志盘用
  低延迟 SSD，不要和数据盘、操作系统盘混用；
- `forceSync=yes`（默认）不要关——关掉等于放弃崩溃后的最新事务，
  和「ZK 强一致」的承诺相反；
- `snapCount` 控制多少事务打一次快照。太小：频繁 dump 抢 IO；太大：
  启动回放日志变慢。按写 QPS 调，而不是照抄默认 10 万；
- `autopurge.snapRetainCount` + `autopurge.purgeInterval` 必须打开，
  否则快照会把盘写满——满盘后 Leader 无法 fsync，表现为「集群卡住
  但不能选主成功」。

ZK 是**全量内存数据模型**。堆要能装下整棵 znode 树再加余量，
`jute.maxbuffer`（单节点数据上限，默认约 1MB）不要为了「当小型
KV」去调到几十 MB——一次 get 就能把网卡和 GC 打穿。

## Watch：一次性之外，还有数量税

基础篇强调 Watcher **一次性**。生产还有第二条：

- 每个 Watch 占 Leader/Follower 堆内一块表项。**十万级 Watch**
  （每个客户端 Watch 整棵子树）会让通知风暴和 GC 一起爆发；
- 3.6 引入 **持久、递归 Watch**（`addWatch` PERSISTENT_RECURSIVE）：
  触发后不失效、子树变更也通知。它解决了「重注册窗口丢事件」，
  但把数量税从「注册次数」变成「常驻表项」——更要限制 Watch 根
  的扇出；
- 四字命令（`stat`/`mntr`/`wchc`）在 3.5+ 默认关，监控走
  AdminServer / Prometheus；生产端口不要把四字命令暴露到公网。

配置中心场景宁可「Watch 一层目录 + 定时全量对账」，也不要给每个
key 挂一个 Watch。需要可靠续传时，[etcd Watch 按 revision](/etcd/basic/core/02-etcd-lease-txn-watch/)
才是更合适的产品形态。

## ZK 不该做什么（生产红线）

| 反模式 | 为什么炸 |
|---|---|
| 当消息队列 | 没有消费位移、没有堆积隔离，全量内存 + 1MB 节点 |
| 超高 QPS 服务注册（百万实例心跳） | 每次上下线是写 + Watch 通知，写路径是集群天花板 |
| 存大 JSON / 二进制 | 一次读放大、一次 Watch 通知不含数据还要再拉 |
| 偶数节点「多放一台更安全」 | 容错不增加，过半更难 |
| 把 ZK 和业务共享一块慢盘 | fsync 抖动 → 误判 Leader 死 → 选举抖动 |

Kafka 搬走 ZK、K8s 选 etcd，都是同一判断：**协调服务的正确性来自
「数据小、写少、强一致」**；把业务流量灌进去，ZAB 过半就会变成
事故放大器。

## 小结

- 投票者 3 或 5；读扩展用 Observer，不要用偶数集合「凑容错」。
- 写延迟 = 日志盘 fsync；分盘、开 autopurge、别关 forceSync。
- 持久递归 Watch 消除重注册窗口，但 Watch 数量仍是堆与通知的税；
  大扇出场景对账 + 浅 Watch，或换 etcd。

## 延伸阅读

- [ZooKeeper 管理员指南](https://zookeeper.apache.org/doc/current/zookeeperAdmin.html)
- [Observer 配置](https://zookeeper.apache.org/doc/current/zookeeperObservers.html)
- [选主配方（本方向）](/zookeeper/intermediate/coordination/01-ephemeral-election/)
