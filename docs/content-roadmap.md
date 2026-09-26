# 内容大方向规划（Content Roadmap）

> 本文件是**内容优先级的唯一真源**：补哪个方向、补哪一篇、为什么补。
> 由用户于 2026-09-25 定向（Java 为主方向 + 高级工程师必备知识），会话内勘察生成。
> 无人值守轮次的 A 车道（新章节）**按本文件 §2 当前批次取点**，
> 作业规范见 `docs/evolution-recipes.md` §2；全局轮次编号仍以 `docs/evolution.md` 为唯一真源。

## 0. 这份文档怎么用

三条硬规则，缺一即条目不入表：

1. **每条必须写「教学问题」**——这篇笔记替读者回答的一个具体问题。写不出这句话，
   说明还不知道要写什么，条目直接删除，不留占位。凑数篇是负债，不是产出
   （与 `AGENTS.md` 图表质量红线同源）。
2. **每条必须带可复核证据**——站内命中文件路径，或「零命中」+ 搜过的关键词。
   勘察结论不写「感觉缺」；`已饱和`（§4）的主题一律不补，只做互链。
3. **批次有上限**：当前批次 B1 = 12 条。B1 清空即触发复评并开启 B2，
   不预先把 B2/B3 逐条细化——清单越长越容易诱导低质写作，且勘察证据会过期。

条目字段：`ID`（稳定编号，不复用不重排）· 落点 · 轴（广度/均衡/深度）· 教学问题 · 证据 · 状态。

三条轴的定义（用户 2026-09-25 确认三条都要）：

| 轴 | 含义 | 判定标准 |
| --- | --- | --- |
| **广度** | 站内完全没有的主题（新分类或新篇） | 关键词全库零命中 |
| **均衡** | 已有分类内**缺关键主题** | 判据是「该主题在该分类下有无专篇/专节」。**篇数只是信号，不是判据**——篇数少但主题齐不算缺（例：`design-pattern` 15 篇反而已饱和，`stream` 1 篇是因为 Collector/并行语义确实没有） |
| **深度** | 已有主题往下钻（参数级、源码级、现场级） | 现篇只到「表格一行 / 顺带提一句」 |

另有一条不迁移原则：**不因分类归属或命名偏好搬动既有笔记**——读者的学习状态
（localStorage 里的圆点）以笔记路径为键，改路径等于把已学记录清零。本文件所有
条目只做「新增 + 互链」，需要结构性搬迁必须单独提请用户裁决。

## 1. 高级 Java 能力地图

以「Java 高级工程师」为目标读者画像（用户主程序方向）分七个能力域。
本表只给判断与条目指针，正文清单在 §2/§3。

| # | 能力域 | 现有密度 | 判断 | 本文件条目 |
| --- | --- | --- | --- | --- |
| D1 | 语言与运行时底座（JVM/并发/GC/内存/IO） | **厚**：jvm 10 篇 + concurrent 12 篇 + io 4 篇 | 原理侧已够用，缺的是**取证侧工具箱与堆外那条线**（均已补） | JR-02 ✅ · JR-06 ✅ |
| D2 | 工程实践与代码资产（构建依赖、测试、重构、方法论） | **空白**：依赖仲裁、shade、enforcer、覆盖率、契约测试全零命中 | 高级工程师与「背熟八股」的主分界线，且是最干净的缺口 | JR-01 ✅ |
| D3 | 框架与生态落地（Spring 全家 / MyBatis / Dubbo / Cloud） | **中**：spring 10 + boot 5 + mvc 3，此前持久层只有 1 篇、dubbo 2 篇且不含落地面 | 框架原理厚、**日常写的东西薄**——MyBatis 实战、Dubbo 泛化与上下线均已补 | JR-03 ✅ · JR-04 ✅ · JR-05 ✅ |
| D4 | 数据与中间件（MySQL / Redis / MQ / ES） | **中偏薄**：mysql 21 · redis 16 · kafka 11 · rocketmq 11 · rabbitmq 7 | 原理与机制齐，此前**生产运维面与现场排查**近零——备份恢复/PITR、锁等待取证、Redisson 工具族、Redis 可观测面已补；仍缺 Kafka 事务 | MY-01 ✅ · MY-02 ✅ · RD-01 ✅ · RD-02 ✅ · MQ-01 |
| D5 | 分布式与系统设计 | **厚**：81 篇，含 31 个设计案例 | 案例与理论饱和；缺的是 SLO/日志支柱/发布风险判据这类**治理指标** | B2 池 |
| D6 | 生产运维与稳定性（Linux/网络/容器/可观测） | **中**：linux 25 · network 18 · k8s 11 · docker 13 | 通用 Linux 排障厚，但**没有「Java 应用在容器里」这条线**（探针配 GC、CPU throttling） | OPS-01 · B2 池 |
| D7 | 工程方法论与协作（方案写作、CR、复盘、晋升） | **空白**：`聚合根`/`限界上下文`/`5Why`/`Code Review 规范` 全库零命中 | 内容确定缺，但**归属未定**（不是「技术/工具」，开新方向是结构性决策） | §5 待裁决 |

## 2. 当前批次 B1（12 条 · 定时任务唯一取点处）

优先级自上而下。A 车道每轮取**头部第一条非 `done` 条目**。

| ID | 方向 · 落点 | 轴 | 教学问题 | 证据（勘察命令可复核） | 状态 |
| --- | --- | --- | --- | --- | --- |
| **JR-01** | java · `java/intermediate/build/01-dependency-conflict.md`（新建 `build` 分类） | 广度 | 同一个类被两个 jar 提供时，JVM 实际加载哪个？为什么不是你以为的那个 | `shade`/`relocation`/`uber-jar`/`nearest`/`first-declared`/`requireUpperBoundDeps` 全库零命中；仅 `springcloud/01` 有 BOM 一节 | done 2026-09-25 · `java/intermediate/build/01-dependency-conflict.md` + 新建 build 分类 |
| **JR-02** | java · `java/advanced/jvm/10-arthas-jfr.md` | 深度 | 不能重启、不能加日志、接口每天偶发慢 3 秒，怎么在 5 分钟内拿到证据 | `jvm/08-troubleshooting.md:86-99` 只有一张 7 行命令表；`retransform`/`vmtool`/`StartFlightRecording`/`jfr` 全库零命中 | done 2026-09-25 · `java/advanced/jvm/10-arthas-jfr.md` |
| **JR-03** | java · `java/intermediate/spring/09-mybatis-in-practice.md` | 均衡 | 一句 `<association>` 和一次 `toString` 怎么把接口拖成 1+N 次查询 | `spring/05` 只讲 SqlSessionTemplate 代理；`PageHelper` 零命中；`rewriteBatchedStatements` 仅 `case-studies/17-excel.md:63` 提过一次 | done 2026-09-25 · `java/intermediate/spring/09-mybatis-in-practice.md` |
| JR-04 | java · `java/intermediate/stream/02-collectors.md` | 均衡 | 并行流下 `Collectors.toMap` 为什么抛 IllegalStateException，三特性各管什么 | `Characteristics`/自定义归约/`toMap` 合并冲突零命中；`stream/01` 已覆盖并行原理与 commonPool 污染（故主题缺口在 Collector 侧，不是"篇数少"） | done 2026-09-25 · `java/intermediate/stream/02-collectors.md` |
| JR-05 | java · `java/advanced/dubbo/03-generic-and-shutdown.md` | 广度 | 网关要做泛化调用、发布时怎么不丢在途请求 | `GenericService`/Dubbo 优雅停机零命中（超时×重试放大已在 `02-governance`，不重复） | done 2026-09-25 · `java/advanced/dubbo/03-generic-and-shutdown.md` |
| JR-06 | java · `java/basic/io/04-direct-memory.mdx` | 广度 | 堆内没满却 OOM，Netty 与驱动吃掉堆外怎么定位 | `jvm/02-memory` 有 `MaxDirectMemorySize` 症状行、`netty/02-refcount-leak` 讲引用计数，JDK 侧 Cleaner 归零 | done 2026-09-25 · `java/basic/io/04-direct-memory.md` |
| MY-01 | mysql · `mysql/advanced/performance-ha/04-backup-pitr.md` | 广度 | DROP 错一张表，30 分钟后怎么恢复、能丢多少 | `PITR`/`xtrabackup` 在 mysql 方向零命中；**`mongodb/intermediate/usage/10-backup.md:40` 已把「MySQL binlog PITR（三大日志篇）」当既有内容引流，指向空处** | done 2026-09-25 · `mysql/advanced/performance-ha/04-backup-pitr.md` |
| MY-02 | mysql · `mysql/intermediate/transaction-lock/04-lock-wait-triage.md` | 深度 | 谁堵了谁：锁等待链与长事务现场的取证顺序 | `innodb_lock_waits` 零命中，现只有 `innodb_trx` 一行 | done 2026-09-25 · `mysql/intermediate/transaction-lock/04-lock-wait-triage.md` |
| RD-01 | redis · `redis/intermediate/usage/07-redisson.md` | 广度 | 读写锁、信号量、限流器、延迟队列各解决什么问题、代价是什么 | `usage/03-distributed-lock.mdx` 只有可重入锁 + 看门狗 | done 2026-09-25 · `redis/intermediate/usage/07-redisson.md` |
| RD-02 | redis · `redis/intermediate/usage/08-observability.md` | 广度 | 一条命令怎么看出 Redis 快出事了 | `requirepass`/`ACL`/`slowlog`/INFO 指标在 redis 方向零命中 | done 2026-09-26 · `redis/intermediate/usage/08-observability.md` |
| MQ-01 | kafka · `kafka/intermediate/core/06-transactions-eos.md` | 深度 | Kafka 的 Exactly-Once 到哪儿就失效了 | `transactional.id` 零命中；`core/03-reliability-idempotent.md` 讲幂等专篇但事务只一行 | 待办 |
| OPS-01 | kubernetes · `kubernetes/intermediate/ops/05-java-on-k8s.md` | 广度 | GC 停顿把探针打死过谁：探针选型、优雅停机与 CPU throttling 在 Java 上如何互相牵连 | `cfs_quota`/throttling 零命中；`k8s/ops/01-probes-lifecycle`、`jvm/07-tuning`、`docker/03-lifecycle` 各写一块未串联 | 待办 |

**每条落地时的固定动作**（沿用 `AGENTS.md` 与配方既有约定，不另立规则）：
正文 + 侧边栏注册 + `src/data/graphs/<方向>.json` 节点与边 + 分类页 `index.mdx` 导读
（新分类另建分类页）+ 至少一张主题图（颜色全走令牌，改完跑对比度审计）
+ 首题入 `src/data/quiz/<方向>.json`（带 `difficulty`）+ 速答手册一行
+ 回本表把状态改 `done <日期>`，并向 `docs/coverage-deepening.md` d 类入队第二题。

## 3. 后续池 B2 / B3（只列方向，不逐条细化）

**B2（B1 清空后复评再展开）**：测试进阶（覆盖率/JaCoCo、Testcontainers 配方、契约测试，
现只有三处顺带提及）、GraalVM/CDS 与启动加速、Tomcat 调优参数与类加载落地、
JDK 侧 mmap/DirectBuffer、Collector 之外的泛型实战、Kafka 分层存储与 Streams/Connect、
MQ 消息回溯与保留期、Redis Cluster reshard 与 Stream 实操、MySQL InnoDB 参数表与
慢查询剖析、`JSON`/窗口函数；治理指标线的 SLO 与错误预算、日志支柱（ELK/Loki）、
发布风险与回滚判据、舱壁式隔离专篇；运维线的 conntrack 表满与 fd 耗尽、
时钟同步与分布式系统的牵连、kswapd/THP/直接回收、eBPF 现代工具。

**B3（更靠后，需新证据）**：服务网格与多集群、任务编排（Temporal/DolphinScheduler）、
K8s×JVM 之后的容量与弹性联动、单元化落地细节。

**复评触发条件**：① B1 全 `done`；② 任一 `待办` 条目被并行会话写过（就地改 `done` 并
记对方轮次）；③ 出现真实读者数据（当前无，故一切判断仍以内容缺口为据）。

## 4. 已饱和清单（明确不再补，只做互链）

以下主题勘察结论为「已覆盖到专篇级」，**再写即重复**；需要引用时从新笔记链过去：

| 主题 | 代表篇 | 说明 |
| --- | --- | --- |
| 设计模式 | `java/intermediate/design-pattern/`（15 篇） | 全站最厚分类，不再加篇 |
| 虚拟线程落地 | `java/intermediate/version/04-java18-21.md` | M:N、pin、StructuredTaskScope 齐 |
| 日志体系与异步/MDC | `java/intermediate/log/01-logging-system.md` | 门面绑定、Disruptor、跨线程透传齐 |
| 生产故障排查方法论 | `java/advanced/jvm/08-troubleshooting.md` | 现象→现场→证据链框架与三大场景（JR-02 只补「工具取证与回放」，不重跑它的场景链） |
| 容器内 JVM 内存参数 | `java/advanced/jvm/07-tuning.md` | `MaxRAMPercentage`、OOM Killer 已命中 |
| 分布式锁与缓存一致性 | `redis/usage/03`、`distributed/consistency/02` | 含 binlog 订阅与延迟双删 |
| MQ 选型与可靠性 | `middleware/mq/02-mq-comparison.md`、`middleware/reliability/01` | 横向对比有专篇且在工具方向之外，符合粒度原则 |
| 系统设计案例群 | `distributed/intermediate/case-studies/`（31 篇） | 秒杀/对账/幂等/限流/延迟消息均已成篇 |
| ZK / Seata / ES 核心机制 | `zookeeper/*`、`seata/*`、`elasticsearch/*` | 死信、仲裁队列、深分页、聚合精度均已有专节 |

## 5. 待用户裁决（不擅自落地）

1. **D7 工程方法论与 DDD 的归属**：`聚合根`/`限界上下文`/`5Why`/`Code Review 规范`/
   技术方案写作与评审 全库零命中，但都不是「技术/工具」，按 `AGENTS.md` 方向粒度原则
   套不进现有目录。三个选项：① 新建 `engineering` 方向（四处同步，方向数 34→35）；
   ② 挂到 `java` 下新分类（会把横向内容焊死在 Java 上）；③ 归 `guide`（现定位为
   作者向元文档，读者向方法论混进去会稀释）。**未裁决前 B2 也不展开这一条。**
2. **core 星标是否给本批新篇**：evolution.md 候选项 2「36 个分类核心占比过高」仍挂待裁决，
   故 B1 已落地的 **6 篇新笔记一律不加 `core: true`**（已逐篇核为 0 处），等该决策落地后统一补标。
3. **是否把 B2 也逐条细化**：本文件推荐「不」（§0 规则 3）；若要一次性看全貌需同时接受
   清单过期风险，需你明确改 §0。

## 6. 变更记录

- 2026-09-25 · 建档：用户定向「Java 为主方向要补更多 + 高级工程师必备（MySQL/Redis/MQ 等）」，
  三条轴（广度/均衡/深度）全选、必备范围四组全选。据此做三路覆盖度勘察
  （Java 20 主题、中间件 60+ 主题、分布式/运维/方法论 33 主题），落 B1 = 12 条，
  首批 JR-01/JR-02/JR-03 同轮落地。接线见 `docs/evolution-recipes.md` §0.4 与 §2。
- 2026-09-25 · 首批三条落地并改 `done`：新增 `java/intermediate/build/`（分类页 +
  `01-dependency-conflict.md`）、`java/advanced/jvm/10-arthas-jfr.md`、
  `java/intermediate/spring/09-mybatis-in-practice.md`；三篇各带侧边栏注册、图谱节点与边、
  首题（`java-depconflict-133` / `java-arthasjfr-134` / `java-mybatisn1-135`，难度均 4）、
  速答行（新小节「Java 工程与构建」3 行 + JVM/Spring 各 1 行），第二题角度已入
  `coverage-deepening.md` d 类。**B1 余 9 条待办**，下一条为 JR-04。
- 落地时按新写的「不迁移原则」执行：三篇都是**新增 + 互链**，未搬动任何既有笔记路径
  （学习状态以路径为 localStorage 键，改路径会清零读者进度）。
- 2026-09-25 · 第二批：JR-04/JR-05/JR-06 落地，**Java 侧 6 条全部完成**——
  `stream/02-collectors.md`、`dubbo/03-generic-and-shutdown.md`、`io/04-direct-memory.md`，
  三件套与速答行、题库首题（难度 4）同轮配齐；第二题角度入 `coverage-deepening.md` d 类。
  **B1 余 6 条**（MY-01/MY-02/RD-01/RD-02/MQ-01/OPS-01），头部为 **MY-01 备份恢复与 PITR**
  ——它同时补掉 `mongodb/10-backup.md:40` 指向空处的那条引流。
- 2026-09-25 · 第三批：MY-01 / MY-02 / RD-01 落地。
  `mysql/advanced/performance-ha/04-backup-pitr.md`（三类灾难分层、
  `--single-transaction` + `--source-data` 的 PITR 配对、物理备份 `--prepare`
  不可跳的原因、反向 SQL 的四条前提、可传输表空间单表恢复、延迟从库与
  `sql_safe_updates` 预防），**并据实把 `mongodb/intermediate/usage/10-backup.md`
  中「MySQL binlog PITR（三大日志篇）」那条指向空处的引流改为指向真实新页**；
  `mysql/intermediate/transaction-lock/04-lock-wait-triage.md`（三类等待各自的
  超时、8.0 `data_locks`/`data_lock_waits` 与 `sys.innodb_lock_waits`、MDL
  写者优先、kill 前估 `trx_rows_modified`）与 `redis/intermediate/usage/07-redisson.md`
  （读写锁 / 带租约信号量 / GCRA 限流器 / 延迟队列 / `RFencedLock`）**刻意避开
  03 篇已讲的看门狗与 RedLock 论证**，只做锁之外那一族。
  三件套同轮配齐（侧边栏 3 条、图谱 mysql 2 节点 6 边 + redis 1 节点 3 边、
  首题 3 道难度 4、速答手册 5 行），第二题角度入 d 类。
  **B1 余 3 条**：RD-02、MQ-01、OPS-01。
- 2026-09-26 · 第四批：RD-02 落地 `redis/intermediate/usage/08-observability.md`。
  取证入口按「谁能回答哪个问题」切分：`INFO` 六种读法（命中率公式与
  `EXISTS` 判空也算 miss、`evicted_keys` vs `expired_keys` 分诊、碎片率虚高
  的三条官方成因、`latest_fork_usec` 与 THP、`mem_not_counted_for_evict`
  对 `maxmemory` 配置的影响、`commandstats` 按 `usec_per_call` 排序）、
  `SLOWLOG` 只量执行段这一条定义（配 `slowlog-max-argc` 截断与增量 ID）、
  `LATENCY` 事件表与「160 点 + 同秒取 max，所以要平时就开」、
  `--intrinsic-latency` 必须先在服务端定基线、`MONITOR` 掉一半吞吐的官方
  基准、`CLIENT LIST` 字段与「字段会加也会删」的解析警告、`SCAN` 的
  COUNT/MATCH 语义（附游标机制图）、ACL 侧的被拒可见性与四个坑
  （key pattern 拦不住 `FLUSHALL`、`SETUSER` 增量、类目不含模块命令、
  `CONFIG REWRITE` 不写 ACL 文件）。**所有事实逐条对官方文档核验后落笔**
  （latency / latency-monitor / slowlog / monitor / scan / client-list /
  memory-optimization / eviction / acl / acl-log 十篇），未采纳未经验证的
  默认值（如 `slowlog-log-slower-than` 的具体数字改为「单位微秒」表述）。
  同轮配齐：侧边栏 1 条、图谱 1 节点 5 边、首题 `redis-observe-020`
  （难度 5）、速答 4 行、分类页导读重写，第二题（SCAN 姿势）入 d 类。
  **B1 余 2 条**：MQ-01、OPS-01。
