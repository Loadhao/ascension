---
title: 分布式面试速答手册
description: 分布式与集群高频八股的一句话答案索引——冲刺复习时按图索骥，每条链回完整笔记
---

按主题分组的高频问题速答索引，每条一句话抓核心，点链接进完整
笔记（含推导、图解与追问）。考前冲刺按此过一遍，哪条答不顺就
回哪篇。

## 理论与一致性

| 问题 | 一句话答案 |
|---|---|
| [CAP 怎么取舍](/distributed/basic/theory/01-cap-base/) | 分区（P）是客观存在，分区时 C 与 A 二选一，工程默认 AP + 最终一致 |
| [BASE 是什么](/distributed/basic/theory/01-cap-base/) | 基本可用 + 软状态 + 最终一致——AP 的业务化表述 |
| [集群和分布式区别](/distributed/basic/theory/03-cluster-vs-distributed/) | 集群靠复制解决不够快/不可靠，分布式靠拆分解决做不了 |
| [一致性哈希](/distributed/basic/theory/02-consistent-hashing/) | 哈希环 + 虚拟节点，扩缩容只迁移相邻段，Redis Cluster 不用它是因为槽位更可控 |
| [Quorum NWR](/distributed/advanced/consistency/03-quorum-nwr/) | W+R>N 保证读写集合相交必读到一个最新副本，但**不等于强一致** |
| [分布式怎么保证顺序](/distributed/advanced/consistency/04-time-order/) | 墙钟不可信，用逻辑时钟/版本号；要全局顺序就单写者或共识日志 |
| [Gossip 协议](/distributed/intermediate/consensus/02-gossip/) | 节点随机互传状态指数收敛，最终一致，Redis Cluster 的元数据同步方式 |
| [Raft 核心流程](/distributed/intermediate/consensus/01-paxos-raft/) | 领导者选举（任期）→ 日志复制（过半确认）→ 安全性（只选日志最新的） |

## 事务与幂等

| 问题 | 一句话答案 |
|---|---|
| [分布式事务怎么选](/distributed/intermediate/transaction/01-distributed-transaction/) | 强一致 TCC/Seata XA，最终一致本地消息表/事务消息，先定一致性档位 |
| [TCC 三大坑](/distributed/intermediate/transaction/01-distributed-transaction/) | 空回滚、幂等、悬挂——都要靠事务控制表识别"Try 做过没有" |
| [Seata AT 原理](/seata/basic/core/02-seata-deep-dive/) | 一阶段本地提交 + undo log，正确性押在全局锁上，热点行是天花板 |
| [@GlobalTransactional 失效场景](/seata/basic/core/02-seata-deep-dive/) | 自调用、吞异常、非 public、数据源未代理——排查看 undo_log 表 |
| [分布式 ID 怎么生成](/distributed/intermediate/transaction/02-distributed-id/) | 雪花（趋势递增，防时钟回拨）或号段模式，分库分表场景嵌分片基因 |
| [接口幂等怎么做](/distributed/intermediate/coordination/02-idempotency/) | 唯一业务号 + 原子判断：DEL 返回值、唯一索引、条件更新状态机 |
| [缓存与 DB 双写一致性](/distributed/advanced/consistency/02-cache-consistency/) | 先更新库再删缓存（窗口极小），生产用 Canal 订阅 binlog 异步删兜底 |

## 集群与流量

| 问题 | 一句话答案 |
|---|---|
| [四层和七层负载均衡区别](/distributed/intermediate/cluster/01-load-balancing/) | 四层按 IP+端口转发，七层解析应用层协议做内容路由——四层转发、七层代理 |
| [LVS 三种模式](/distributed/intermediate/cluster/01-load-balancing/) | NAT 全过 LB，DR 改 MAC 响应直连（最快），TUN 跨机房隧道 |
| [集群下 Session 怎么办](/distributed/intermediate/cluster/02-session-sharing/) | 主流外置 Redis；要无状态用 JWT，注销靠短过期 + refresh + 黑名单 |
| [分布式限流实现](/distributed/intermediate/traffic/01-distributed-rate-limiting/) | Redis + Lua 原子滑动窗口/令牌桶，令牌批量预扣省网络往返 |
| [超时怎么设置](/distributed/intermediate/traffic/02-timeout-retry/) | 预算制逐层递减，上层 > 下层之和；按接口 P99 定，不拍脑袋 |
| [重试怎么设计](/distributed/intermediate/traffic/02-timeout-retry/) | 三门槛：幂等、可重试错误、指数退避加抖动；配重试预算防风暴 |
| [容量水位怎么算](/distributed/intermediate/performance/03-capacity-planning/) | 峰值 QPS × 冗余，水位 ≤ 60~70%；并发数 = QPS × RT（Little's Law） |

## 可用性与治理

| 问题 | 一句话答案 |
|---|---|
| [脑裂怎么防](/distributed/advanced/availability/02-split-brain/) | 三层：quorum 选主 + 主自裁配置（如 min-replicas-to-write）+ fencing 拒旧 |
| [发布策略怎么选](/distributed/advanced/availability/03-release-strategies/) | 滚动是默认（配好就绪探针与优雅停机），蓝绿换秒级回滚，金丝雀控爆炸半径 |
| [schema 变更怎么发布](/distributed/advanced/availability/03-release-strategies/) | 只做兼容性加法分两次发布——代码可回滚、数据结构回滚不了 |
| [全链路灰度原理](/distributed/advanced/availability/04-full-link-gray/) | 泳道隔离 + 染色标记端到端透传 + 缺失服务回落基线，异步链路是丢标重灾区 |
| [混沌工程是什么](/distributed/advanced/availability/05-chaos-engineering/) | 稳态假设 + 受控注入故障 + 自动终止，验证预案；没有预案的故障不注入 |
| [单元化/set 化](/distributed/advanced/availability/06-cell-based/) | 按分片基因把流量/数据/应用圈进自治单元，单元内闭环多活，切流先停写追平复制 |
| [RPC 一次调用的链路](/distributed/intermediate/governance/01-rpc-principles/) | 动态代理 → 服务发现/负载均衡 → 序列化 → 协议 → 网络传输 → 解码反射调用 |
| [序列化怎么选](/distributed/intermediate/governance/01-rpc-principles/) | 默认 Protobuf（小快跨语言），JSON 换可读性，JDK 原生别用 |
| [线上接口变慢怎么排查](/distributed/advanced/observability/02-metrics-alerting/) | 先看变更（回滚止损）→ 指标定层 → 链路定跳 → 日志归因 |
| [监控告警怎么设计](/distributed/advanced/observability/02-metrics-alerting/) | 基于症状不基于原因，分级可执行；黄金四信号：延迟/流量/错误/饱和度 |

## 协调与存储

| 问题 | 一句话答案 |
|---|---|
| [分布式锁怎么选型](/distributed/intermediate/coordination/01-distributed-lock-compare/) | Redis 是效率锁（主从切换可能丢），ZK/etcd 是正确锁，正确性终解是 fencing token |
| [Redis 锁为什么要看门狗](/distributed/intermediate/coordination/01-distributed-lock-compare/) | 业务没跑完锁先过期会被别人拿走——后台线程每 1/3 过期时间续期 |
| [分库分表什么时候做](/distributed/intermediate/sharding/01-sharding-methods/) | 先调优再分片；真写入瓶颈才分库，分片键让高频查询单片命中 |
| [多维度查询怎么路由](/distributed/intermediate/sharding/01-sharding-methods/) | 基因法：把主分片键的低位嵌进订单号，两条查询路径都能单片命中 |
| [不停机迁移怎么做](/distributed/intermediate/sharding/01-sharding-methods/) | 双写 → 全量搬迁 → 对账 → 灰度切读 → 切写下线，全程可回滚 |
| [定时任务多实例怎么防重](/distributed/intermediate/coordination/03-distributed-scheduler/) | 锁兜底 → 选主单跑 → 分片广播并行；幂等贯穿所有层 |
| [ZAB 和 2PC 区别](/zookeeper/basic/core/02-zk-deep-dive/) | ZAB 过半确认即提交、失败不回滚而是重选主——根治 2PC 阻塞与单点 |
| [ZK Watcher 的一次性问题](/zookeeper/basic/core/02-zk-deep-dive/) | 触发即失效要重注册，重注册窗口靠版本号对账兜底 |
| [etcd Watch 和 ZK 的区别](/etcd/basic/core/02-etcd-lease-txn-watch/) | 按 revision 续传断线不丢事件；落后太多撞 compaction 要全量重拉 |
| [消息不丢怎么保证](/middleware/intermediate/reliability/01-message-reliability/) | 生产端确认重试 + Broker 持久化副本 + 消费端手动 ack，三段缺一不可 |
| [消息顺序怎么保证](/middleware/intermediate/reliability/01-message-reliability/) | 按业务 key 分区局部有序 + 分区内单线程，开幂等生产者防重试乱序 |
| [消息重复怎么办](/middleware/intermediate/reliability/01-message-reliability/) | MQ 只能至少一次，"恰好一次" = 至少一次 + 消费端幂等 |

## 综合设计

| 问题 | 一句话答案 |
|---|---|
| [设计题的答题框架](/distributed/intermediate/case-studies/04-design-interview/) | 澄清 → 估算 → 模型 → 链路 → 规模化 → 容错权衡，每步带代价 |
| [秒杀系统怎么设计](/distributed/intermediate/case-studies/01-flash-sale/) | 层层收窄：前端拦截 → 限流防刷 → Redis Lua 原子预扣 → MQ 削峰 → 幂等落库 → 对账 |
| [短链系统怎么设计](/distributed/intermediate/case-studies/02-short-url/) | 发号器 + 62 进制编码，302 保统计，缓存扛读洪峰，布隆过滤器防穿透 |
| [Feed 流怎么设计](/distributed/intermediate/case-studies/03-feed-stream/) | 推拉结合：普通粉推、大 V 拉、在线推离线拉，ZSet 游标分页 |

## 使用建议

- 冲刺模式：每天过 2~3 组，卡壳的条目点进完整笔记重读推导。
- 面试现场：先给一句话核心，再按面试官追问展开——和笔记的
  "先结论后论证"结构一致。
- 学习状态标记在各方向的学习路线页（○ → ◐ → ●），本页只做
  检索，不做进度存储。
