---
title: 速答手册
description: 全站高频面试八股的一句话答案索引——Java、MySQL、Redis、网络、消息队列、分布式与系统设计，每条链回完整笔记
---

按主题分组的高频问题速答索引，每条一句话抓核心，点链接进完整
笔记（含推导、图解与追问）。覆盖 Java、MySQL、Redis、网络、消息
队列、分布式与系统设计等后端面试高频区。

:::tip[先看后测]
过完速答想检验记忆？到[自测作答](/guide/quiz/)勾选方向逐题作答：
单选/多选/判断即时判定，答错给提示并链回对应笔记。
:::

## Java 基础与集合

| 问题 | 一句话答案 |
|---|---|
| [HashMap 原理与 1.8 变化](/java/basic/collection/02-hashmap/) | 数组 + 链表 + 红黑树，负载因子 0.75 扩容翻倍；1.8 头插改尾插解决并发成环 |
| [ConcurrentHashMap 怎么保证并发](/java/basic/collection/03-concurrenthashmap/) | 1.8 放弃分段锁：CAS 初始化 + synchronized 锁桶头，size 用 CounterCell 分散计数 |
| [ArrayList 与 LinkedList](/java/basic/collection/01-arraylist/) | 动态数组随机读 O(1)、扩容 1.5 倍；链表头尾插 O(1) 但随机访问 O(n) |
| [equals 与 hashCode 约定](/java/basic/syntax/03-equals-hashcode/) | 重写 equals 必须重写 hashCode，否则 HashMap/HashSet 语义失效 |
| [String 为什么不可变](/java/basic/syntax/02-string/) | final 存储 + 常量池复用 + 天然线程安全，拼接大量字符串用 StringBuilder |
| [SPI 机制](/java/basic/syntax/10-spi/) | ServiceLoader 从 META-INF/services 按接口加载实现——Dubbo/Spring 扩展体系的源头 |
| [BIO/NIO/AIO](/java/basic/io/01-io-model/) | 阻塞流 → 多路复用（selector 一个线程管千连接）→ 异步回调；Netty 是 NIO 的事实标准 |
| [零拷贝](/java/basic/io/02-zero-copy/) | mmap/sendfile 砍掉内核态与用户态之间的拷贝，Kafka 吞吐的底层来源 |
| [TCP 粘包拆包](/java/basic/io/03-tcp-sticky-packets/) | TCP 是字节流没有消息边界，靠定长/分隔符/长度域解码切分（Netty 解码器） |

## Java 并发

| 问题 | 一句话答案 |
|---|---|
| [线程池执行流程](/java/intermediate/concurrent/02-thread-pool/) | 核心线程 → 队列 → 非核心线程 → 拒绝策略；7 参数按业务定，禁用 Executors 预设 |
| [volatile 的语义](/java/intermediate/concurrent/03-volatile/) | 内存屏障保证可见性 + 禁止指令重排，**不保证原子性**（i++ 仍不安全） |
| [synchronized 锁升级](/java/intermediate/concurrent/04-synchronized/) | 无锁 → 偏向 → 轻量级（自旋）→ 重量级，按竞争程度逐级膨胀 |
| [AQS 的骨架](/java/intermediate/concurrent/05-aqs/) | volatile state + CLH 等待队列，独占/共享两种模板——ReentrantLock/信号量都是它 |
| [ThreadLocal 内存泄漏](/java/intermediate/concurrent/06-threadlocal/) | key 是弱引用、value 强引用，线程池线程长存——用完必须 remove |
| [CAS 与 ABA](/java/intermediate/concurrent/09-cas-atomics/) | CPU 原子指令实现无锁；ABA 用版本号（AtomicStampedReference）解决 |
| [LongAdder 为什么快](/java/intermediate/concurrent/07-longadder/) | 分段 Cell 分散热点计数，sum 弱一致——高并发写场景胜过 AtomicLong |
| [CompletableFuture 编排](/java/intermediate/concurrent/11-completablefuture/) | thenApply/thenCompose 串行、thenCombine 并行、allOf 汇聚，异常沿链传播 |
| [死锁的四个必要条件](/java/intermediate/concurrent/12-deadlock/) | 互斥、持有等待、不可剥夺、循环等待——破坏任意一条即可预防 |

## JVM

| 问题 | 一句话答案 |
|---|---|
| [运行时数据区](/java/advanced/jvm/02-memory/) | 线程私有（栈/PC/本地方法栈）+ 线程共享（堆/方法区），溢出场景各有不同 |
| [类加载与双亲委派](/java/advanced/jvm/01-class-loading/) | 加载→验证→准备→解析→初始化；委派保证核心类唯一与安全，SPI/Tomcat 打破它 |
| [GC 算法与收集器](/java/advanced/jvm/03-garbage-collection/) | 可达性分析判活；复制（新生代）/标记整理（老年代），G1 用 Region 化换可预测停顿 |
| [四种引用](/java/advanced/jvm/04-references/) | 强不回收、软引用内存不足回收（缓存）、弱引用下次必收（ThreadLocal key）、虚引用管堆外 |
| [JIT 与逃逸分析](/java/advanced/jvm/06-jit/) | 热点代码即时编译；对象不逃逸可栈上分配/标量替换，省掉堆分配 |
| [线上 JVM 故障排查](/java/advanced/jvm/08-troubleshooting/) | CPU 高：top -H 定线程 → jstack 看栈；OOM：jmap dump → MAT 分析支配树 |

## Spring 与微服务

| 问题 | 一句话答案 |
|---|---|
| [Bean 生命周期](/java/intermediate/spring/01-ioc-bean-lifecycle/) | 实例化 → 属性填充 → Aware → BeanPostProcessor 前后 → init → 销毁，扩展点全挂在链上 |
| [循环依赖与三级缓存](/java/intermediate/spring/03-circular-dependency/) | 提前暴露早期引用解决 setter 注入循环依赖；构造器循环依赖无解 |
| [@Transactional 失效场景](/java/intermediate/spring/04-transaction/) | 自调用、异常被吞、非 public、传播行为误配——本质都是代理没拦到 |
| [AOP 的实现](/java/intermediate/spring/02-aop/) | JDK 动态代理（有接口）与 CGLIB（子类），切面织入靠代理层拦截 |
| [Spring Boot 自动配置](/java/intermediate/spring-boot/01-autoconfig/) | @EnableAutoConfiguration 加载候选配置类 + 条件注解按需生效 |
| [Spring MVC 请求流程](/java/intermediate/spring-mvc/01-springmvc-flow/) | DispatcherServlet 统一收口 → HandlerMapping 找处理器 → Adapter 执行 → 渲染返回 |
| [单点登录与 OAuth2](/java/intermediate/spring-boot/02-auth-sso/) | 授权码模式两次交换（code 换 token）防前端泄露 secret；OIDC 补认证语义 |
| [注册中心 Nacos](/java/advanced/springcloud/02-registry/) | 临时实例 AP（Distro）、持久实例 CP（Raft）可切换；心跳剔除 + 客户端缓存兜底 |
| [Sentinel 熔断限流](/java/advanced/springcloud/05-sentinel/) | 滑动窗口统计，熔断器三态循环（关闭→打开→半开），失败率/慢调用触发 |
| [网关的职责](/java/advanced/springcloud/03-gateway/) | 统一入口做路由、鉴权、限流、灰度——业务无关的横切关注点上收 |

## MySQL

| 问题 | 一句话答案 |
|---|---|
| [一条 SQL 的执行流程](/mysql/basic/core/01-sql-execution/) | 连接器 → 分析器 → 优化器 → 执行器 → InnoDB；8.0 移除查询缓存 |
| [为什么用 B+ 树索引](/mysql/basic/core/02-index-btree/) | 矮胖多叉 + 叶子有序链表，等值与范围都友好；回表、覆盖索引、最左前缀是三板斧 |
| [事务隔离级别](/mysql/intermediate/transaction-lock/01-transaction-mvcc/) | RU/RC/RR/串行，InnoDB 默认 RR 靠 MVCC + next-key 锁防幻读 |
| [MVCC 的实现](/mysql/intermediate/transaction-lock/01-transaction-mvcc/) | undo log 版本链 + ReadView 可见性判断——不加锁的一致性读 |
| [InnoDB 的锁](/mysql/intermediate/transaction-lock/02-locks/) | 行锁（record/gap/next-key）加在索引上；无索引命中会退化为大范围锁 |
| [三大日志的作用](/mysql/intermediate/transaction-lock/03-redo-undo-binlog/) | redo 崩溃恢复（WAL）、undo 回滚与 MVCC、binlog 复制与恢复；两阶段提交保一致 |
| [主从复制与延迟](/mysql/advanced/performance-ha/02-replication-sharding/) | binlog 异步复制；延迟对策：并行复制、半同步、读写分离路由敏感查询 |
| [慢 SQL 怎么优化](/mysql/advanced/performance-ha/01-optimization/) | explain 看 type/key/rows/Extra：建索引、改写 SQL、避免函数与隐式转换失效索引 |
| [大表 DDL 怎么变更](/mysql/advanced/performance-ha/03-online-ddl/) | Online DDL / gh-ost 双写切表——锁表变更在业务高峰是事故 |
| [三范式](/mysql/basic/theory/01-normal-forms/) | 1NF 原子性、2NF 消除部分依赖、3NF 消除传递依赖；反范式是读性能的主动取舍 |

## Redis

| 问题 | 一句话答案 |
|---|---|
| [单线程为什么快](/redis/basic/core/03-thread-model/) | 内存操作 + IO 多路复用 + 无锁竞争；6.0 起网络 IO 多线程，命令执行仍单线程 |
| [数据结构与编码](/redis/basic/core/01-data-structures/) | 外层 type 内层 encoding：SDS、跳表（zset）、压缩列表/quicklist 等按量自动升级 |
| [RDB 与 AOF](/redis/basic/core/02-persistence/) | RDB 快照恢复快丢数据多，AOF 追加丢得少文件大——4.0 混合持久化取长 |
| [过期删除与内存淘汰](/redis/intermediate/usage/01-expiration-eviction/) | 过期：惰性 + 定期；内存满：8 种淘汰策略，默认 noeviction |
| [穿透/击穿/雪崩](/redis/intermediate/usage/02-cache-problems/) | 穿透查不存在的（空值缓存+布隆）、击穿热 key 失效（互斥重建）、雪崩大面积失效（过期打散） |
| [Redis 锁的演进](/redis/intermediate/usage/03-distributed-lock/) | setnx+expire 的坑 → SET NX PX + Lua 原子释放 → Redisson 看门狗续期 → RedLock 争议 |
| [主从、哨兵与集群](/redis/advanced/ha/01-replication-sentinel-cluster/) | 主从复制冗余，哨兵自动故障转移，Cluster 16384 槽分片——三层递进 |
| [大 key 与热 key 治理](/redis/intermediate/usage/06-bigkey-hotkey/) | 大 key 拆分压缩，热 key 本地缓存 + 随机打散——都先监控发现再治理 |
| [缓存架构模式](/redis/intermediate/usage/04-cache-patterns/) | Cache Aside 主流；Read/Write Through 收敛到缓存层，Write Behind 换吞吐冒风险 |

## 网络协议

| 问题 | 一句话答案 |
|---|---|
| [三次握手与四次挥手](/network/basic/tcp/01-three-way-handshake/) | SYN/SYN+ACK/ACK 建立双向信道；TIME_WAIT 等 2MSL 确保最后的 ACK 丢失可重发 |
| [TCP 可靠传输](/network/basic/tcp/02-reliable-transfer/) | 序列号确认 + 滑动窗口流控 + 拥塞控制（慢启动/拥塞避免）+ 超时/快速重传 |
| [TCP 与 UDP](/network/basic/tcp/03-tcp-vs-udp/) | 面向连接可靠字节流 vs 无连接不可靠报文；实时音视频、QUIC 用 UDP 自己补可靠性 |
| [HTTPS 与 TLS 握手](/network/basic/http/02-https-tls/) | 非对称算法交换密钥 + 证书链验证身份 + 对称算法加密通信 |
| [HTTP 1.1/2/3 演进](/network/basic/http/03-http-evolution/) | 1.1 长连接、2 二进制分帧多路复用（队头阻塞在 TCP 层）、3 QUIC 基于 UDP |
| [DNS 解析全过程](/network/basic/foundation/02-dns/) | 浏览器缓存 → hosts → 本地 DNS 递归 → 根/顶级/权威迭代，层层缓存 |
| [从 URL 到页面](/network/basic/foundation/03-from-url-to-page/) | DNS → TCP 握手 → TLS → 发请求 → 响应解析渲染——一道题串起整个网络栈 |
| [跨域与 CORS](/js/intermediate/web/02-cors/) | 浏览器同源策略的安全约束，CORS 靠响应头放行，复杂请求先 OPTIONS 预检 |

## 消息队列

| 问题 | 一句话答案 |
|---|---|
| [为什么需要 MQ](/middleware/basic/mq/01-why-mq/) | 解耦、异步、削峰三大收益，代价：一致性问题、复杂度、重复消费、积压风险 |
| [三大 MQ 怎么选](/middleware/basic/mq/02-mq-comparison/) | Kafka 吞吐管道、RocketMQ 业务功能全、RabbitMQ 路由灵活——按场景不按名气 |
| [消息不丢/不重/不乱序](/middleware/intermediate/reliability/01-message-reliability/) | 生产确认 + Broker 持久化副本 + 手动 ack 三段防丢；至少一次 + 消费幂等防重；按 key 分区保序 |
| [Kafka 架构与高性能](/kafka/intermediate/core/01-kafka-architecture/) | 分区并行 + 顺序写 + 零拷贝 + 批量压缩——为吞吐而生 |
| [ISR 机制](/kafka/intermediate/core/02-replica-isr/) | 与 leader 保持同步的副本集合；acks=all + min.insync.replicas 用可用性换可靠 |
| [RocketMQ 事务消息](/rocketmq/advanced/core/01-rocketmq-features/) | 半消息先落库 + 本地事务 + 回查补偿——分布式事务的 MQ 解 |
| [消息积压怎么处理](/rocketmq/advanced/core/03-backlog/) | 先定位瓶颈（生产/存储/消费）再扩容消费组，空跑跳过 + 新 topic 换道是紧急手段 |
| [死信队列与延迟消息](/rabbitmq/intermediate/usage/01-deadletter-delay/) | 重试耗尽进死信人工兜底；延迟用死信 TTL 或延时插件（订单超时关单标准解） |

## 检索与文档存储

| 问题 | 一句话答案 |
|---|---|
| [ES 倒排索引](/elasticsearch/basic/core/01-inverted-index/) | 词项 → 文档列表，分词 + 压缩 + FST——全文检索快的根源 |
| [ES 分片与副本](/elasticsearch/basic/core/02-shard-replica/) | 主分片数建索引时定死（扩容要 reindex），副本分片扛读与容错 |
| [ES 深翻页](/elasticsearch/intermediate/usage/03-pagination/) | from+size 翻页深了协调节点归并爆炸——用 search_after / scroll |
| [MongoDB 复制集](/mongodb/intermediate/replication/01-replication-set/) | 一主多从 + 选举（Raft 族），oplog 增量同步，读写分离与自动故障转移 |
| [MongoDB 分片集群](/mongodb/advanced/sharding/01-sharding-cluster/) | mongos 路由 + config 元数据 + shard 分片，分片键选择决定均衡与查询隔离 |

## Linux 与工具

| 问题 | 一句话答案 |
|---|---|
| [进程与资源排查](/linux/intermediate/system/02-process-management/) | top 看水位、ps 定进程、kill 信号分级——排查三板斧 |
| [文件权限体系](/linux/basic/permission/01-users-permissions/) | 属主/属组/其他 × 读4写2执1，chmod/umask 控制默认权限 |
| [systemd 服务管理](/linux/intermediate/system/03-system-service/) | unit 文件声明依赖与重启策略，journalctl 看日志——服务自愈的基础 |
| [文本三件套](/tools/basic/cli/01-grep-sed-awk/) | grep 找、sed 改、awk 按列算——日志统计的瑞士军刀 |

## 算法

| 问题 | 一句话答案 |
|---|---|
| [二分查找的边界](/algorithm/basic/searching/01-binary-search/) | 循环不变量定边界：左右开闭统一写法，找左/右界分别收缩 |
| [双指针与滑动窗口](/algorithm/basic/searching/03-sliding-window/) | 有序数组相向双指针、原地操作快慢指针；子串/子数组问题窗口右扩左缩 |
| [排序怎么记](/algorithm/basic/sorting/02-quick-sort/) | 快排分治原地平均 O(nlogn)，堆排稳定 O(nlogn)，归并稳定但 O(n) 空间 |
| [动态规划三步](/algorithm/intermediate/dp/01-climbing-stairs/) | 定义状态 → 写转移方程 → 定初始化与遍历顺序，全部 DP 都是这三步 |
| [回溯模板](/algorithm/intermediate/backtracking/01-subsets/) | 路径 + 选择列表 + 撤销选择；子集/排列/组合只差剪枝与去重的位置 |
| [复杂度与时空权衡](/algorithm/advanced/principles/01-time-space-tradeoff/) | 先给暴力解再优化——用空间换时间（哈希/前缀和/缓存）是最常见的降维路径 |

## 分布式与集群

理论、一致性、事务、集群、流量、可用性各主题的速答已由分布式
方向的完整体系覆盖：

| 问题 | 一句话答案 |
|---|---|
| [CAP 怎么取舍](/distributed/basic/theory/01-cap-base/) | 分区时 C 与 A 二选一，工程默认 AP + 最终一致 |
| [集群和分布式区别](/distributed/basic/theory/03-cluster-vs-distributed/) | 集群靠复制解决不够快/不可靠，分布式靠拆分解决做不了 |
| [一致性哈希](/distributed/basic/theory/02-consistent-hashing/) | 哈希环 + 虚拟节点，扩缩容只迁移相邻段 |
| [Raft 核心流程](/distributed/intermediate/consensus/01-paxos-raft/) | 领导者选举 → 日志复制过半确认 → 只选日志最新的当主 |
| [分布式事务怎么选](/distributed/intermediate/transaction/01-distributed-transaction/) | 强一致 TCC/XA，最终一致本地消息表/事务消息，先定一致性档位 |
| [接口幂等怎么做](/distributed/intermediate/coordination/02-idempotency/) | 唯一业务号 + 原子判断：DEL 返回值、唯一索引、条件更新状态机 |
| [分布式锁选型](/distributed/intermediate/coordination/01-distributed-lock-compare/) | Redis 是效率锁，ZK/etcd 是正确锁，正确性终解是 fencing token |
| [缓存与 DB 双写一致性](/distributed/advanced/consistency/02-cache-consistency/) | 先更新库再删缓存，Canal 订阅 binlog 异步删兜底 |
| [四层和七层负载均衡](/distributed/intermediate/cluster/01-load-balancing/) | 四层按 IP+端口转发，七层解析应用层协议——四层转发、七层代理 |
| [集群下 Session 怎么办](/distributed/intermediate/cluster/02-session-sharing/) | 外置 Redis 主流；JWT 要配短过期 + refresh + 黑名单 |
| [分布式限流实现](/distributed/intermediate/traffic/01-distributed-rate-limiting/) | Redis + Lua 原子计数，三层布防，令牌预扣省往返 |
| [脑裂怎么防](/distributed/advanced/availability/02-split-brain/) | quorum 选主 + 主自裁配置 + fencing 拒旧写 |
| [发布策略怎么选](/distributed/advanced/availability/03-release-strategies/) | 滚动默认、蓝绿换回滚速度、金丝雀控爆炸半径；schema 只做兼容变更 |
| [线上变慢怎么排查](/distributed/advanced/observability/02-metrics-alerting/) | 先看变更回滚止损 → 指标定层 → 链路定跳 → 日志归因 |
| [Quorum NWR](/distributed/advanced/consistency/03-quorum-nwr/) | W+R>N 保证读到最新副本，但不等于强一致 |
| [分布式怎么保证顺序](/distributed/advanced/consistency/04-time-order/) | 墙钟不可信，逻辑时钟/版本号；全局顺序靠单写者或共识 |
| [分库分表什么时候做](/distributed/intermediate/sharding/01-sharding-methods/) | 先调优再分片；分片键让高频查询单片命中，基因法补多维度 |
| [定时任务多实例防重](/distributed/intermediate/coordination/03-distributed-scheduler/) | 锁兜底 → 选主单跑 → 分片广播并行，幂等贯穿所有层 |
| [ZAB 和 2PC 区别](/zookeeper/basic/core/02-zk-deep-dive/) | ZAB 过半即提交、失败重选主不回滚——根治 2PC 阻塞与单点 |
| [etcd Watch 的优势](/etcd/basic/core/02-etcd-lease-txn-watch/) | 按 revision 续传断线不丢事件，撞 compaction 要全量重拉 |
| [容灾 RTO/RPO](/distributed/advanced/availability/01-dr-multi-active/) | RTO 定恢复时长、RPO 定丢数据容忍，预案必须演练验证 |
| [混沌工程](/distributed/advanced/availability/05-chaos-engineering/) | 稳态假设 + 受控注入 + 自动终止；没有预案的故障不注入 |
| [单元化 set 化](/distributed/advanced/availability/06-cell-based/) | 分片基因贯穿流量/数据/应用，单元内闭环多活，切流先停写追平 |

## 系统设计

| 问题 | 一句话答案 |
|---|---|
| [设计题的答题框架](/distributed/intermediate/case-studies/04-design-interview/) | 澄清 → 估算 → 模型 → 链路 → 规模化 → 容错权衡，每个取舍配代价 |
| [秒杀系统](/distributed/intermediate/case-studies/01-flash-sale/) | 层层收窄：限流防刷 → Redis Lua 原子预扣 → MQ 削峰 → 幂等落库 → 对账 |
| [短链系统](/distributed/intermediate/case-studies/02-short-url/) | 发号器 + 62 进制，302 保统计，缓存扛读洪峰 |
| [Feed 流](/distributed/intermediate/case-studies/03-feed-stream/) | 推拉结合：普通粉推、大 V 拉、在线推离线拉 |
| [容量规划](/distributed/intermediate/performance/03-capacity-planning/) | 峰值 × 冗余、水位 60~70% 警戒；并发 = QPS × RT，容量用压测拐点找 |

## 使用建议

- 冲刺模式：每天过 2~3 组，卡壳的条目点进完整笔记重读推导。
- 面试现场：先给一句话核心，再按追问展开——与各篇笔记
  "先结论后论证"的结构一致。
- 本手册聚焦后端面试高频区；AI、Python、前端等方向请直接走
  各方向学习路线页。
- 学习状态标记在各方向学习路线页（○ → ◐ → ●），本页只做检索
  不做进度存储。
