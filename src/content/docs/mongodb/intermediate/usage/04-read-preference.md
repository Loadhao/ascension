---
title: 读偏好与读写关注
description: readPreference 五档决策、writeConcern 与 readConcern 的正确性权衡、与 MySQL 读写分离的对照
level: intermediate
core: true
---

复制集篇讲了副本怎么同步，本篇讲**应用怎么用副本**：readPreference
（读去哪读）+ writeConcern（写多稳才算稳）+ readConcern（读多新的
数据）——三个旋钮组合出"一致性与扩展性"的权衡，与 MySQL 读写分离
篇同构但旋钮更多。

## readPreference：读去哪

| 档位 | 行为 | 场景 |
| --- | --- | --- |
| primary | 只读主库 | 强一致读（写后立读） |
| primaryPreferred | 主优先，主不可用读从 | 主从自动容灾的读 |
| secondary | 只读从库 | 报表/分析/日志类（容忍旧数据） |
| secondaryPreferred | 从优先，从不可用读主 | 读扩展的默认选择 |
| nearest | 最低延迟节点 | 多机房就近读 |

- **写后立读必须 primary**：从库复制有延迟，写主读从会读到旧数据
  （MySQL 读写分离篇的主从延迟坑完全同构）；
- 报表/导出/全量扫描走 secondary——把重查询从主库剥离。

## writeConcern：写多稳才算写成功

- `w: 1`（默认）：主库落内存即确认——快，但主库宕机可能丢；
- `w: "majority"`：多数派节点确认——**不丢**（对照 Kafka acks=all 与
  MySQL 半同步，分布式共识的多数派思想）；
- `w: 0`：发出去就算——fire-and-forget，日志类可用。

## readConcern：读多新的数据

- `local`（默认）：读本节点最新——**可能读到被回滚的数据**；
- `majority`：读多数派已确认的数据——与 writeConcern majority 配合
  实现"读己之写不回滚"；
- `snapshot`：事务内一致性快照（多文档事务的前提）。

## 组合矩阵：按业务选

| 业务 | 组合 | 理由 |
| --- | --- | --- |
| 订单创建 | w: majority + read primary | 钱相关的强一致 |
| 商品浏览 | w: 1 + secondaryPreferred | 容忍旧数据，读扩展 |
| 日志埋点 | w: 0 | 丢了无所谓，最快 |

## 高频追问速答

- **secondary 读会不会读到回滚的数据？** readConcern local 会
  （副本回滚场景），majority 不会——对一致性有要求就升级 readConcern。
- **多文档事务有什么前提？** 副本集 + readConcern snapshot +
  writeConcern majority——事务的一致性等级由这三个旋钮共同决定。
- **与 MySQL 读写分离怎么对照？** primary/secondary ≈ 主从路由，
  writeConcern majority ≈ 半同步复制，readConcern ≈ GTID 位点
  等待——概念一一对应，旋钮粒度不同。

## 小结

- 三旋钮：readPreference（读去哪）、writeConcern（写多稳）、
  readConcern（读多新）——组合出一致性与扩展性的光谱。
- 铁律：写后立读走 primary；资金类 majority 三件套；报表日志走
  secondary——按业务分级，不必全量强一致。
