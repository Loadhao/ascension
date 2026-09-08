---
title: 速答手册
description: 全站高频面试八股的一句话答案索引——覆盖 Java、JS、数据库、消息队列、网络、分布式、算法、Python、AI、Linux/容器等全站方向，每条链回完整笔记
---

按主题分组的高频问题速答索引，每条一句话抓核心，点链接进完整
笔记（含推导、图解与追问）。覆盖 Java、JavaScript、MySQL、PostgreSQL、
Redis、网络、消息队列、检索存储、分布式、算法、Python、AI、Linux、
Docker、Nginx、Git 等全站方向。

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
| [LinkedHashMap 做 LRU](/java/basic/collection/05-linkedhashmap-lru/) | 哈希定位 + 独立双向链表记顺序；accessOrder=true 时最近访问移到尾，头上淘汰 |
| [CopyOnWriteArrayList](/java/basic/collection/06-copyonwritearraylist/) | 读不加锁、写时复制整数组再换引用——读多写少；迭代器是快照 |
| [泛型与类型擦除](/java/basic/syntax/04-generics/) | 泛型只活在编译期，运行期 List\<String\> 与 List\<Integer\> 是同一个 Class |
| [equals 与 hashCode 约定](/java/basic/syntax/03-equals-hashcode/) | 重写 equals 必须重写 hashCode，否则 HashMap/HashSet 语义失效 |
| [String 为什么不可变](/java/basic/syntax/02-string/) | final 存储 + 常量池复用 + 天然线程安全，拼接大量字符串用 StringBuilder |
| [SPI 机制](/java/basic/syntax/10-spi/) | ServiceLoader 从 META-INF/services 按接口加载实现——Dubbo/Spring 扩展体系的源头 |
| [红黑树与 HashMap 树化](/java/basic/collection/04-red-black-tree/) | BST 退化 O(n)、AVL 严格平衡但旋转频繁；红黑树靠「红红不相邻 + 黑高相同」做到最长 ≤ 2×最短，插入修复至多 2 次旋转 |
| [反射、注解与动态代理](/java/basic/syntax/06-reflection-annotation/) | 反射经 Class 对象运行期解剖成员（forName 触发初始化）；注解是元数据，RUNTIME + 反射是框架标配；JDK 代理走接口、CGLIB 走继承 |
| [封装继承多态](/java/basic/syntax/01-oop/) | 封装维护不变量；继承慎用复合优先；重载编译期静态分派，重写运行期动态绑定 |
| [受检异常 vs 运行时](/java/basic/syntax/05-exception/) | 能恢复抛受检、是 bug 抛运行时、JVM 坏了抛 Error；finally 里 return 会劫持返回值 |
| [BIO/NIO/AIO](/java/basic/io/01-io-model/) | 阻塞流 → 多路复用（selector 一个线程管千连接）→ 异步回调；Netty 是 NIO 的事实标准 |
| [零拷贝](/java/basic/io/02-zero-copy/) | mmap/sendfile 砍掉内核态与用户态之间的拷贝，Kafka 吞吐的底层来源 |
| [TCP 粘包拆包](/java/basic/io/03-tcp-sticky-packets/) | TCP 是字节流没有消息边界，靠定长/分隔符/长度域解码切分（Netty 解码器） |
| [位运算与补码](/java/basic/syntax/07-bit-operations/) | 补码让零唯一、符号位免特判、减法变加法；`>>` 补符号位，`>>>` 补 0 会把负数变成正大数 |
| [serialVersionUID](/java/basic/syntax/08-serialization/) | JDK 序列化的版本关卡：不一致即 InvalidClassException；不声明会随类结构自动哈希漂移 |
| [深浅拷贝与 Integer 缓存](/java/basic/syntax/09-object-copy/) | clone 默认浅拷贝（引用只抄地址）；深拷贝首选拷贝构造；Integer -128~127 走缓存，包装类型永远 equals |
| [Comparable vs Comparator](/java/basic/syntax/11-common-interfaces/) | Comparable 是类内自然顺序，Comparator 是类外规则；TreeSet 去重只认 compareTo |
| [JNI 与 JNDI](/java/basic/syntax/12-jni-jndi/) | JNI 调本地库、JNDI 按名查找；lookup 不可信输入会变成远程类加载 RCE（Log4Shell） |
| [Lombok 与 APT](/java/basic/syntax/13-lombok-apt/) | SOURCE 注解在编译期改语法树；@Builder 吞无参构造，实体上 @Data 的 hashCode 是隐患 |
| [Web 容器是什么](/java/basic/tomcat/01-web-container/) | HTTP 服务器 + Servlet 容器；Servlet 无 main，靠容器回调；SpringMVC 本身就是一个 Servlet |
| [Jetty 与 Tomcat 线程池](/java/basic/tomcat/02-jetty-architecture/) | Jetty 全局共享一个线程池更轻；Tomcat 每 Connector 独立线程池，隔离性更好 |

## Java 并发

| 问题 | 一句话答案 |
|---|---|
| [进程与线程](/java/intermediate/concurrent/01-thread-basics/) | 进程是资源分配单位，线程是 CPU 调度单位；Java 创建线程本质只有 new Thread().start() |
| [线程池执行流程](/java/intermediate/concurrent/02-thread-pool/) | 核心线程 → 队列 → 非核心线程 → 拒绝策略；7 参数按业务定，禁用 Executors 预设 |
| [volatile 的语义](/java/intermediate/concurrent/03-volatile/) | 内存屏障保证可见性 + 禁止指令重排，**不保证原子性**（i++ 仍不安全） |
| [synchronized 锁升级](/java/intermediate/concurrent/04-synchronized/) | 无锁 → 偏向 → 轻量级（自旋）→ 重量级，按竞争程度逐级膨胀 |
| [AQS 的骨架](/java/intermediate/concurrent/05-aqs/) | volatile state + CLH 等待队列，独占/共享两种模板——ReentrantLock/信号量都是它 |
| [ThreadLocal 内存泄漏](/java/intermediate/concurrent/06-threadlocal/) | key 是弱引用、value 强引用，线程池线程长存——用完必须 remove |
| [CAS 与 ABA](/java/intermediate/concurrent/09-cas-atomics/) | CPU 原子指令实现无锁；ABA 用版本号（AtomicStampedReference）解决 |
| [LongAdder 为什么快](/java/intermediate/concurrent/07-longadder/) | 分段 Cell 分散热点计数，sum 弱一致——高并发写场景胜过 AtomicLong |
| [CompletableFuture 编排](/java/intermediate/concurrent/11-completablefuture/) | thenApply/thenCompose 串行、thenCombine 并行、allOf 汇聚，异常沿链传播 |
| [并发工具三件套](/java/intermediate/concurrent/10-concurrent-tools/) | CountDownLatch/CyclicBarrier/Semaphore 都是 AQS 的 state 语义封装——倒计时放行、到齐齐走、许可扣还限流；读写锁可降级不可升级 |
| [死锁的四个必要条件](/java/intermediate/concurrent/12-deadlock/) | 互斥、持有等待、不可剥夺、循环等待——破坏任意一条即可预防 |
| [阻塞队列](/java/intermediate/concurrent/08-blocking-queue/) | put/take 在空/满时阻塞，是生产者-消费者与线程池工作队列的底座 |

## JVM

| 问题 | 一句话答案 |
|---|---|
| [运行时数据区](/java/advanced/jvm/02-memory/) | 线程私有（栈/PC/本地方法栈）+ 线程共享（堆/方法区），溢出场景各有不同 |
| [类加载与双亲委派](/java/advanced/jvm/01-class-loading/) | 加载→验证→准备→解析→初始化；委派保证核心类唯一与安全，SPI/Tomcat 打破它 |
| [GC 算法与收集器](/java/advanced/jvm/03-garbage-collection/) | 可达性分析判活；复制（新生代）/标记整理（老年代），G1 用 Region 化换可预测停顿 |
| [四种引用](/java/advanced/jvm/04-references/) | 强不回收、软引用内存不足回收（缓存）、弱引用下次必收（ThreadLocal key）、虚引用管堆外 |
| [JIT 与逃逸分析](/java/advanced/jvm/06-jit/) | 热点代码即时编译；对象不逃逸可栈上分配/标量替换，省掉堆分配 |
| [线上 JVM 故障排查](/java/advanced/jvm/08-troubleshooting/) | CPU 高：top -H 定线程 → jstack 看栈；OOM：jmap dump → MAT 分析支配树 |
| [对象内存布局](/java/advanced/jvm/05-object-layout/) | 对象头 + 实例数据 + 8 字节对齐；压缩指针堆 >32G 自动失效，包装类型开销 4~6 倍 |
| [JVM 调优铁律](/java/advanced/jvm/07-tuning/) | 进程内存 ≠ Xmx：堆+元空间+栈×线程+直接内存；容器用 MaxRAMPercentage，一次只改一个变量 |
| [字节码与 invoke](/java/advanced/jvm/09-bytecode/) | Class 文件严格排版，常量池是符号引用地址簿；重载编译期定、重写运行期找 |

## Spring 与微服务

| 问题 | 一句话答案 |
|---|---|
| [Bean 生命周期](/java/intermediate/spring/01-ioc-bean-lifecycle/) | 实例化 → 属性填充 → Aware → BeanPostProcessor 前后 → init → 销毁，扩展点全挂在链上 |
| [循环依赖与三级缓存](/java/intermediate/spring/03-circular-dependency/) | 提前暴露早期引用解决 setter 注入循环依赖；构造器循环依赖无解 |
| [Spring 扩展点时间轴](/java/intermediate/spring/06-extension-points/) | 容器级 BFPP 改图纸，Bean 级 BPP 动成品；AOP 代理在 postProcessAfterInitialization 织入 |
| [@Transactional 失效场景](/java/intermediate/spring/04-transaction/) | 自调用、异常被吞、非 public、传播行为误配——本质都是代理没拦到 |
| [AOP 的实现](/java/intermediate/spring/02-aop/) | JDK 动态代理（有接口）与 CGLIB（子类），切面织入靠代理层拦截 |
| [Spring Boot 自动配置](/java/intermediate/spring-boot/01-autoconfig/) | @EnableAutoConfiguration 加载候选配置类 + 条件注解按需生效 |
| [Spring MVC 请求流程](/java/intermediate/spring-mvc/01-springmvc-flow/) | DispatcherServlet 统一收口 → HandlerMapping 找处理器 → Adapter 执行 → 渲染返回 |
| [单点登录与 OAuth2](/java/intermediate/spring-boot/02-auth-sso/) | 授权码模式两次交换（code 换 token）防前端泄露 secret；OIDC 补认证语义 |
| [注册中心 Nacos](/java/advanced/springcloud/02-registry/) | 临时实例 AP（Distro）、持久实例 CP（Raft）可切换；心跳剔除 + 客户端缓存兜底 |
| [Sentinel 熔断限流](/java/advanced/springcloud/05-sentinel/) | 滑动窗口统计，熔断器三态循环（关闭→打开→半开），失败率/慢调用触发 |
| [网关的职责](/java/advanced/springcloud/03-gateway/) | 统一入口做路由、鉴权、限流、灰度——业务无关的横切关注点上收 |
| [什么时候拆微服务](/java/advanced/springcloud/01-microservices-overview/) | 用运维复杂度换并行研发与精准扩容；小团队硬拆等于给自己上刑 |
| [OpenFeign 调用](/java/advanced/springcloud/04-openfeign-loadbalancer/) | 注解契约 + 动态代理 + 注册中心寻址；超时重试只给幂等操作，fallback 提前设计 |
| [配置中心动态刷新](/java/advanced/springcloud/06-config-center/) | Nacos 三级 Namespace/Group/DataId；热更新靠 @RefreshScope，免去全量重启发版 |
| [跨服务链路追踪](/java/advanced/springcloud/08-tracing/) | 单机 MDC 不够：traceId 经 W3C traceparent 贯穿；Boot 3.x 用 Micrometer Tracing 取代 Sleuth |
| [单例模式](/java/intermediate/design-pattern/02-singleton/) | 进程内真唯一：饿汉/枚举/静态内部类/DCL；难点是并发、反射、序列化围攻下仍唯一 |
| [Stream 延迟求值](/java/intermediate/stream/01-stream-principle/) | 不存数据、中间操作惰性串联，终止操作才触发；并行流走 ForkJoinPool 工作窃取 |
| [SqlSessionTemplate 单例凭什么线程安全](/java/intermediate/spring/05-mybatis-sqlsession/) | 壳是无状态 JDK 代理，真实 SqlSession 按调用临时获取、按事务生命周期管理（ThreadLocal 绑定 + 引用计数） |
| [Boot 内嵌 Web 服务器何时启动](/java/intermediate/spring/07-application-context/) | refresh 的 onRefresh 阶段，早于业务 Bean 预实例化——「Web 服务器就绪 ≠ 应用就绪」 |
| [@Configuration 的 @Bean 互调为什么不 new 第二份](/java/intermediate/spring/08-annotations-map/) | 配置类被 CGLIB 增强拦截方法互调、返回容器单例；proxyBeanMethods=false 即 lite 模式提速原理 |
| [配置中心改了配置 Bean 里的值为什么没变](/java/intermediate/spring-boot/03-configuration/) | 热更新必须标 @RefreshScope，否则只是 Environment 更新，字段仍是旧值 |
| [fat jar 能直接 java -jar 的原理](/java/intermediate/spring-boot/04-embedded-deploy/) | Main-Class 是 JarLauncher，由 LaunchedURLClassLoader 从嵌套 jar 加载类，绕过标准 ClassLoader 读不了 jar 里 jar 的限制 |
| [线上临时调日志级别](/java/intermediate/spring-boot/05-actuator/) | POST /actuator/loggers 运行时即改无需重启（端点需暴露且收敛在独立管理端口） |
| [@ExceptionHandler 的匹配顺序](/java/intermediate/spring-mvc/02-exception-advice/) | Controller 本地就近优先 → 全局 Advice 按 @Order 遍历，异常按继承链由近及远取最精确；都未命中才落 /error |
| [@Valid 与 @Validated 怎么分工](/java/intermediate/spring-mvc/03-validation/) | @Valid（规范）管嵌套级联，@Validated（Spring）管分组与类上方法级校验——方法级校验靠 AOP 代理，自调用失效 |
| [Stream 消费者重启后重复消费旧消息](/java/advanced/springcloud/07-stream/) | Consumer 没配稳定 group，每次重启被当成新的随机 group 从头消费；同 group 负载分担、不同 group 各拿一份 |
| [Spring 四家怎么叠](/java/intermediate/spring/00-family-map/) | Framework→MVC→Boot→Cloud 单向叠加；Boot 3.x = JDK 17 + jakarta，Cloud 用年份列车对齐大版本 |
| [SLF4J 门面与 MDC](/java/intermediate/log/01-logging-system/) | 门面与实现分离；MDC 是 ThreadLocal 的日志版，入口 put、finally remove，异步要 TaskDecorator 透传 |

## 设计模式

| 问题 | 一句话答案 |
|---|---|
| [被问「为什么用这个设计模式」答什么](/java/intermediate/design-pattern/01-principles/) | 答原则不答模式——「依赖倒置，调用方只依赖抽象」；原则是价值观，模式是案例 |
| [JDK 动态代理和 CGLIB 的硬性区别](/java/intermediate/design-pattern/06-proxy/) | JDK 只能代理接口（入口 InvocationHandler），CGLIB 靠生成子类覆写方法（类和方法不能 final，入口 MethodInterceptor） |
| [策略模式和状态模式只差在哪](/java/intermediate/design-pattern/09-strategy/) | 谁决定切换——策略由调用方/外部条件选定后不自己换，状态由对象按迁移规则自己流转 |
| [@EventListener 默认同步还是异步](/java/intermediate/design-pattern/11-observer/) | 默认同步——发布线程执行，主链路耗时等于所有监听器之和；跨事务用 @TransactionalEventListener(AFTER_COMMIT) |
| [Bean 生命周期与 AQS 共同体现的模式](/java/intermediate/design-pattern/15-patterns-in-frameworks/) | 模板方法——父类定死骨架、钩子（BeanPostProcessor/tryAcquire）开放扩展，「骨架稳定+钩子开放」是优秀框架共性 |
| [工厂三件套怎么选](/java/intermediate/design-pattern/03-factory/) | 按加产品成本：简单工厂改方法、工厂方法加工厂、抽象工厂换产品族；Spring 容器即工厂 |
| [建造者 vs 原型](/java/intermediate/design-pattern/04-creational/) | 建造者治参数爆炸（build 统一校验）；原型治构造昂贵（浅拷贝只抄引用，工程优先拷贝构造） |
| [适配器换的是什么](/java/intermediate/design-pattern/05-adapter/) | 换接口不换实现；前提是老代码改不了，写法选组合（对象适配器） |
| [装饰器与代理差在哪](/java/intermediate/design-pattern/07-decorator/) | 结构同为同接口转发；装饰器穿衣服增强能力，代理把门控制访问 |
| [外观/组合/桥接/享元](/java/intermediate/design-pattern/08-structural/) | 外观简化、组合组树、桥接拆双维度（JDBC）、享元拆内外状态共享（Integer 缓存） |
| [模板方法的骨架](/java/intermediate/design-pattern/10-template-method/) | 骨架 final、钩子 protected；AQS 是继承填空，JdbcTemplate 是回调填空 |
| [责任链 vs 观察者](/java/intermediate/design-pattern/12-chain-of-responsibility/) | 责任链接力（节点自决拦截），观察者广播；Gateway/OkHttp 是递归进、逆序出 |
| [状态/迭代器/命令/备忘录](/java/intermediate/design-pattern/13-behavioral/) | 状态自己流转；fail-fast 靠 modCount；命令把请求对象化；备忘录是封装好的快照 |
| [访问者的双分派](/java/intermediate/design-pattern/14-visitor-mediator/) | 访问者赌结构稳、操作变；中介者把 N² 交互收成星状；解释器落地用解析库 |

## Java 测试

| 问题 | 一句话答案 |
|---|---|
| [JUnit 5 生命周期](/java/intermediate/test/01-junit5/) | @BeforeAll 全类一次须 static（或 PER_CLASS）；默认每方法新实例；异常用 assertThrows 拿对象再断言 |
| [mock 与 spy](/java/intermediate/test/02-mockito/) | mock 全假隔离依赖，spy 半真；匹配器全或无；spy 上用 doReturn 避免 when 先真实执行 |
| [测试成本阶梯](/java/intermediate/test/03-springboot-test/) | 纯单测占大头，@WebMvcTest/@DataJpaTest 切片接线，@SpringBootTest 只守关键路径 |

## Java 版本与新特性

| 问题 | 一句话答案 |
|---|---|
| [Lambda 为什么比匿名内部类轻](/java/intermediate/version/01-java8/) | 匿名内部类编译成真实 class 并真加载一个类；Lambda 编译成私有静态方法 + invokedynamic，多数情况不生成新类 |
| [从 8 升 11 最常见的两大报错](/java/intermediate/version/02-java9-11/) | JDK 内部 API 强封装（反射要 --add-opens）与 Java EE 模块移除（javax.* 要自己补依赖） |
| [record 为什么不能继承其他类](/java/intermediate/version/03-java14-17/) | 隐含继承 java.lang.Record，字段全 final 的不可变数据载体——适合 DTO、值对象、Map 复合 key |
| [虚拟线程要不要池化](/java/intermediate/version/04-java18-21/) | 不池化——便宜到每任务一个，限流用 Semaphore；synchronized 内阻塞会 pin 载体（22 起 JEP 491 修复） |

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

## PostgreSQL

| 问题 | 一句话答案 |
|---|---|
| [PG 与 MySQL 的 MVCC 差异](/postgresql/basic/core/01-pg-vs-mysql/) | PG 的 UPDATE 写新元组、旧元组留在表内等 VACUUM 回收（会表膨胀），InnoDB 旧版本放 undo log 由 purge 清理 |
| [Pgpool-II 与 Postgres-XL 怎么选](/postgresql/intermediate/ha/01-pgpool-postgres-xl/) | 要容灾与读扩展选零侵入中间件 Pgpool-II（连接池+读负载均衡+故障转移，写仍单主）；要写扩展选改源码的 Postgres-XL |
| [pgpool 容灾怎么防脑裂](/postgresql/intermediate/ha/02-pgpool-dr/) | 多 pgpool 互为 watchdog，quorum 多数派决策——只有拿到多数票的才持有 VIP 并执行 failover |
| [PG 表膨胀的根因与治理](/postgresql/advanced/performance/01-tuning/) | MVCC 死元组 + VACUUM 跟不上——调小 autovacuum_vacuum_scale_factor、清掉阻止清理的长事务与废弃复制槽；VACUUM FULL 拿排他锁慎用 |

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
| [管道、事务与 Lua](/redis/intermediate/usage/05-pipeline-transaction-lua/) | Pipeline 只省 RTT 不保证原子；MULTI/EXEC 不被插队但不回滚；真正多命令+逻辑原子靠 Lua |

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
| [OSI 与 TCP/IP](/network/basic/foundation/01-osi-tcpip/) | OSI 七层对照 TCP/IP 四层；排障 ping→端口→curl 逐层二分，L4/L7 用的是 OSI 编号 |
| [HTTP 方法与状态码](/network/basic/http/01-http-basics/) | GET/PUT/DELETE 幂等、POST 不幂等是重试依据；401 未认证、403 没权限、502 上游挂、504 上游超时 |

## JavaScript

| 问题 | 一句话答案 |
|---|---|
| [类型与 ===](/js/basic/core/01-js-fundamentals/) | typeof null 是历史 bug；工程永远用 ===，隐式转换只用来读题 |
| [作用域与闭包](/js/basic/core/02-scope-closure/) | 词法作用域在定义时锁定；var 循环回调共享同一个 i，用 let 或 IIFE 修复 |
| [原型链](/js/basic/core/03-prototype-class/) | __proto__ 在实例上找原型，prototype 在函数上给实例挂原型；class 是语法糖 |
| [this 绑定优先级](/js/basic/core/04-this-binding/) | new > call/apply/bind > obj.fn() > 独立调用；箭头函数没有 this |
| [事件循环](/js/basic/core/05-event-loop/) | 每个宏任务结束后清空整个微任务队列，所以 Promise.then 快于 setTimeout(0) |
| [WebSocket](/js/intermediate/web/01-websocket/) | HTTP 101 升级后同一条 TCP 全双工互发帧，绕开请求-响应 |
| [DOM 事件委托](/js/intermediate/web/03-dom-events/) | 捕获→目标→冒泡；监听挂父元素靠 target 分辨，不冒泡的事件委托不了 |
| [Node 内存](/js/intermediate/node/01-node-gc-memory/) | heapUsed 只是 V8 堆；RSS 涨而堆不涨先怀疑 Buffer 等堆外 |

## 消息队列

| 问题 | 一句话答案 |
|---|---|
| [为什么需要 MQ](/middleware/basic/mq/01-why-mq/) | 解耦、异步、削峰三大收益，代价：一致性问题、复杂度、重复消费、积压风险 |
| [MQ 什么时候不该用](/kafka/basic/core/01-why-mq/) | 强一致短链路、QPS 不高、下游就一个——硬上 MQ 是给自己找运维负担；削峰是堤坝不是加速器 |
| [三大 MQ 怎么选](/middleware/basic/mq/02-mq-comparison/) | Kafka 吞吐管道、RocketMQ 业务功能全、RabbitMQ 路由灵活——按场景不按名气 |
| [消息不丢/不重/不乱序](/middleware/intermediate/reliability/01-message-reliability/) | 生产确认 + Broker 持久化副本 + 手动 ack 三段防丢；至少一次 + 消费幂等防重；按 key 分区保序 |
| [Kafka 架构与高性能](/kafka/intermediate/core/01-kafka-architecture/) | 分区并行 + 顺序写 + 零拷贝 + 批量压缩——为吞吐而生 |
| [ISR 机制](/kafka/intermediate/core/02-replica-isr/) | 与 leader 保持同步的副本集合；acks=all + min.insync.replicas 用可用性换可靠 |
| [Kafka 幂等生产者](/kafka/intermediate/core/03-reliability-idempotent/) | Broker 按 PID+分区+序号去重只护单会话；不丢靠生产/存储/消费三段检查，跨会话去重仍靠消费端业务幂等 |
| [零拷贝何时失效](/kafka/intermediate/core/04-high-throughput/) | SSL/TLS 必须在用户态改写字节，sendfile 链路断开；Kafka 持久性靠副本不靠单机逐条 fsync |
| [offset 提交语义](/kafka/basic/core/02-offset/) | 提交的是「下一条要读的 offset」；先提交后处理会丢，先处理后提交可能重复 |
| [Rebalance](/kafka/intermediate/core/05-rebalance/) | 成员/订阅/分区变化触发，代价是全组停消费；处理慢被踢调 max.poll.interval.ms |
| [RocketMQ 事务消息](/rocketmq/advanced/core/01-rocketmq-features/) | 半消息先落库 + 本地事务 + 回查补偿——分布式事务的 MQ 解 |
| [消息积压怎么处理](/rocketmq/advanced/core/03-backlog/) | 先定位瓶颈（生产/存储/消费）再扩容消费组，空跑跳过 + 新 topic 换道是紧急手段 |
| [死信队列与延迟消息](/rabbitmq/intermediate/usage/01-deadletter-delay/) | 重试耗尽进死信人工兜底；延迟用死信 TTL 或延时插件（订单超时关单标准解） |
| [MQTT 为什么轻量](/mqtt/basic/core/01-mqtt-protocol/) | 发布订阅 + Broker 居中转发，PUBLISH 固定头最小 2 字节、剩余长度 1~4 字节变长编码 |
| [MQTT QoS 三档怎么选](/mqtt/basic/core/02-qos-session/) | 默认 QoS 1 + 下游幂等兜重复；可丢的高频遥测用 QoS 0；四段握手的 QoS 2 只在无法幂等且带宽充裕时用 |
| [AMQP 模型](/rabbitmq/basic/core/01-amqp-model/) | 生产者只交交换机，绑定决定进哪些队列——分发逻辑不在交换机或队列实体里 |
| [RabbitMQ 可靠投递](/rabbitmq/basic/core/02-reliable-delivery/) | confirm + 实体 durable + 消息持久化 + 手动 ack；毒消息进死信别反复 requeue |
| [RabbitMQ 集群](/rabbitmq/intermediate/usage/02-cluster-ha/) | 默认只同步元数据，普通队列消息只在声明节点；要 HA 用仲裁队列 |
| [NameServer 为何无中心](/rocketmq/basic/core/01-rocketmq-architecture/) | 路由粒度粗、稍旧可重试，取 AP 即可，不值得为路由上共识 |
| [集群消费 vs 广播](/rocketmq/basic/core/02-consumer-semantics/) | 集群：组内一人消费、进度在 Broker、有 %RETRY%；广播全量、进度在本地、无重试 |
| [send() 返回成功就落盘了吗](/kafka/basic/core/03-producer-path/) | 不——只代表进了累加器；确认要 get() 拿 Future 或回调，「发完就忘」是丢消息的高发姿势 |
| [RocketMQ 消费失败会阻塞吗](/rocketmq/basic/core/02-consumer-semantics/) | 不会——失败进 %RETRY% 按延迟级别递增重试 16 次，仍失败进 %DLQ% 死信，新消息继续消费 |
| [消息队列高性能靠什么](/rocketmq/advanced/core/02-order-performance/) | 顺序写 × 零拷贝（sendfile 管消费、mmap 管生产）× 批量压缩——linger.ms 是延迟换吞吐的旋钮 |
| [MQTT 保活](/mqtt/intermediate/usage/02-keepalive-reconnect/) | keepalive 间隔内无报文则 PINGREQ 探活；别设太小，重连用指数退避加抖动 |
| [EMQX 与 Mosquitto 怎么选](/mqtt/intermediate/usage/01-broker-emqx/) | 验证/小规模用 Mosquitto；生产规模化上 EMQX 集群，路由表全节点同步、设备不必粘滞到某台 |

## 检索与文档存储

| 问题 | 一句话答案 |
|---|---|
| [ES 倒排索引](/elasticsearch/basic/core/01-inverted-index/) | 词项 → 文档列表，分词 + 压缩 + FST——全文检索快的根源 |
| [ES 分片与副本](/elasticsearch/basic/core/02-shard-replica/) | 主分片数建索引时定死（扩容要 reindex），副本分片扛读与容错 |
| [ES 深翻页](/elasticsearch/intermediate/usage/03-pagination/) | from+size 翻页深了协调节点归并爆炸——用 search_after / scroll |
| [MongoDB 复制集](/mongodb/intermediate/replication/01-replication-set/) | 一主多从 + 选举（Raft 族），oplog 增量同步，读写分离与自动故障转移 |
| [MongoDB 分片集群](/mongodb/advanced/sharding/01-sharding-cluster/) | mongos 路由 + config 元数据 + shard 分片；复制集只解决可用性，写扩展靠分片 |
| [Mongo 容量规划](/mongodb/advanced/operations/01-capacity-planning/) | 磁盘 ≠ 原始数据：副本×3 + 索引常占 20%~50%；内存按 2× 工作集，能放下别急着分片 |
| [文档模型怎么选](/mongodb/basic/core/01-document-model/) | BSON 结构长在文档里；第一决策是内嵌还是引用，不是「没有 schema」 |
| [explain 看什么](/mongodb/advanced/operations/02-performance/) | keys/docs/returned 接近 1:1:1；COLLSCAN 就是没走到索引 |
| [ES terms 聚合为什么会丢桶](/elasticsearch/intermediate/usage/02-aggregation/) | 各分片只交局部 top-N 再合并，size 太小高频词落选——聚合字段一律 keyword，size 要设够大 |
| [ES match 与 term](/elasticsearch/intermediate/usage/01-query-dsl/) | 含某词用 match 查 text；精确等于用 term 且字段得是 keyword |
| [ES 的 filter 和 must 怎么选](/elasticsearch/intermediate/usage/01-query-dsl/) | 纯过滤放 filter——不打分、可走缓存；must 留给需要参与相关度打分的条件 |
| [ES 健康色与脑裂](/elasticsearch/intermediate/cluster/01-cluster-split-brain/) | yellow 副本缺失仍可读，red 才有主分片丢；7.x quorum 内建防脑裂 |
| [ES 集群怎么防脑裂](/elasticsearch/intermediate/cluster/01-cluster-split-brain/) | quorum 结构性排除双主——只有多数派分区能选主；master 缺位只挡元数据变更，读写照常 |

## Linux 与工具

| 问题 | 一句话答案 |
|---|---|
| [进程与资源排查](/linux/intermediate/system/02-process-management/) | top 看水位、ps 定进程、kill 信号分级——排查三板斧 |
| [文件权限体系](/linux/basic/permission/01-users-permissions/) | 属主/属组/其他 × 读4写2执1，chmod/umask 控制默认权限 |
| [systemd 服务管理](/linux/intermediate/system/03-system-service/) | unit 文件声明依赖与重启策略，journalctl 看日志——服务自愈的基础 |
| [文本三件套](/tools/basic/cli/01-grep-sed-awk/) | grep 找、sed 改、awk 按列算——日志统计的瑞士军刀 |
| [Linux 挂载与目录树](/linux/basic/filesystem/01-filesystem/) | 单一根目录 /，分区 mount 到目录接入目录树；磁盘满三件套：df -h / df -i / lsof +L1 查已删未释放 |
| [Bash 脚本严格模式](/linux/intermediate/system/01-shell-script/) | 开头 set -euo pipefail：遇错退出、未定义变量报错、管道失败传播；赋值等号两边不能有空格 |
| [inode 与改名](/linux/basic/commands/01-file-ops/) | 名字在 dentry、数据在 inode；同盘 mv 只改指向，硬链接是两个名字指向同一 inode |
| [僵尸进程](/linux/intermediate/system/02-process-management/) | 子进程退出后父进程未 wait，尸体不占 CPU/内存，堆积说明父进程没回收 |
| [kill 与 kill -9 的区别](/linux/intermediate/system/02-process-management/) | kill 默认 SIGTERM(15) 优雅退出，kill -9 是 SIGKILL 强杀、无法捕获忽略可能丢数据，只作最后手段 |
| [Linux 网络速判](/linux/intermediate/system/04-network/) | ping 通≠端口通；解析失败查 DNS，能解析连不上查路由 |
| [curl 调接口](/tools/basic/cli/02-curl/) | -v 看握手与状态码，-H/-d 带头带体，管道接 jq 拆 JSON |
| [curl -v 的五个阶段](/tools/basic/cli/02-curl/) | `>` 是发出去的请求、`<` 是回来的响应，对照连接/TLS/请求/响应/关闭定位卡点 |
| [jq 与 -r](/tools/basic/cli/03-jq/) | 把 JSON 当值流过滤；字符串默认带引号，接到 shell 要 -r |
| [jq 的流式心智](/tools/basic/cli/03-jq/) | `.[]` 把数组展开成值流每元素一行，`.` 整体一个值；Cannot iterate 是对非数组用 [] |
| [正则贪婪](/tools/basic/efficiency/03-regex/) | 默认吃最多，量词后加 ? 变非贪婪——解析引号内容几乎总要用 |
| [编辑器效率杠杆](/tools/basic/efficiency/01-editor-ide/) | 高频动作练成肌肉记忆：快速打开、多光标、跳转定义；写过三次的样板固化成 snippet |
| [终端行编辑](/tools/basic/efficiency/02-terminal/) | Ctrl+R 反向搜历史是性价比最高的快捷键；alias + 管道/xargs 把长命令接起来 |
| [网络调试工具链](/tools/basic/efficiency/04-network-debug/) | 自下而上：ping → dig → nc -zv → curl -v；curl -I 发 HEAD 只要响应头 |

## Docker 与容器

| 问题 | 一句话答案 |
|---|---|
| [容器和虚拟机的区别](/docker/basic/fundamentals/01-concepts/) | 容器是共享宿主内核的进程级隔离，秒级启动、MB 级体积——容器是带隔离的进程，不是轻量虚拟机 |
| [容器的底层本质](/docker/advanced/orchestration/02-principles/) | Namespace 隔离「看得见什么」+ Cgroups 限制「能用多少」+ overlay2 分层文件系统上的普通宿主进程 |
| [Dockerfile 依赖为什么要先于代码 COPY](/docker/intermediate/practice/01-dockerfile/) | 构建缓存逐层检查、某层失效其下全部重建——依赖层在前，改业务代码不触发重装依赖 |
| [容器之间怎么互访](/docker/intermediate/practice/03-network/) | 放进同一自定义 bridge 用容器名互访（内置 DNS）；默认 bridge 不支持按名互访，容器 IP 重启会变别写死 |
| [数据必须挂卷](/docker/intermediate/practice/02-volume/) | 可写层随容器删除丢失；生产用具名卷，开发热加载才 bind |
| [容器生死](/docker/basic/fundamentals/03-lifecycle/) | 主进程退出容器即退出；stop 先 SIGTERM 再 SIGKILL，137 是被 SIGKILL |
| [Docker Compose](/docker/advanced/orchestration/01-compose/) | 服务名即 DNS；depends_on 只保证启动顺序，等依赖就绪要 healthcheck + service_healthy |
| [镜像怎么瘦身](/docker/advanced/orchestration/03-image-optimization/) | 先 dive 定位大层：换 alpine、多阶段构建、.dockerignore；生产 USER 非 root、密钥不进层 |
| [镜像与容器命令](/docker/basic/fundamentals/02-commands/) | pull 拉只读层、run 叠可写层成容器；-p 是宿主:容器，--rm 一次性任务退出即删 |

## Nginx

| 问题 | 一句话答案 |
|---|---|
| [Nginx 为什么能扛高并发](/nginx/basic/config/01-working-model/) | master + 多 worker 事件驱动——每个 worker 单线程跑 epoll 事件循环、从不干等 IO，worker 数等于 CPU 核数 |
| [proxy_pass 尾斜杠的区别](/nginx/intermediate/proxy/01-reverse-proxy-lb/) | 只看 proxy_pass 带不带 URI/尾斜杠：带了就替换 location 前缀，不带则原始 URI 原样转发 |
| [HTTPS 证书为什么配在 Nginx 就够](/nginx/intermediate/proxy/02-https-cache-ratelimit/) | Nginx 做 TLS 终止——对外加密、对内网走 HTTP，证书一处维护，后端不用各自配 |
| [root 与 alias](/nginx/basic/config/02-static-server/) | root 拼完整 URI，alias 剥前缀再替换；SPA 刷新靠 try_files 回退 index.html |
| [CDN 动静态](/nginx/intermediate/proxy/04-cdn/) | 静态靠边缘缓存，动态无法缓存只做选路；命中率是生命线，回源是兜底 |
| [keepalived 保 Nginx 入口](/nginx/intermediate/proxy/03-keepalived-ha/) | VRRP 组播 + priority 选举让 VIP 秒级漂移；探的是 nginx 进程不是主机，脑裂要比宕机更危险 |

## Git

| 问题 | 一句话答案 |
|---|---|
| [Git 分支为什么零成本](/git/basic/foundations/01-core-model/) | 分支只是一个 40 字节、内容为 commit 哈希的指针文件，创建/切换/删除都是 O(1) |
| [什么时候绝对不能 rebase](/git/intermediate/collaboration/01-branch-merge/) | 已推送到公共分支的提交——rebase 重写历史、哈希全变；惯例：自己分支 rebase，合入 main 用 merge |
| [公共分支的错误提交怎么撤](/git/intermediate/collaboration/03-undo-recovery/) | 用 revert 生成反向提交抵消——reset 改历史，只能用于私有分支 |
| [fetch 与 pull](/git/intermediate/collaboration/02-remote-collab/) | fetch 只更新远端快照不动工作区；pull = fetch + merge（或 rebase） |
| [什么时候可以改历史](/git/advanced/workflow/01-history-rewrite/) | 只改尚未推到公共分支的提交；rebase 是重放新哈希，不是原地修改 |
| [日常 add/commit/diff](/git/basic/foundations/02-daily-commands/) | 先分清改动在工作区还是暂存区：git diff vs --staged；add -p 逐块挑选是最被低估的功能 |
| [bisect 与 worktree](/git/advanced/workflow/02-advanced-tools/) | bisect 二分定位引入 bug 的提交；worktree 共享同一份 .git 对象开多个工作目录 |
| [团队 Git 规范](/git/advanced/workflow/03-team-standards/) | 小团队 GitHub Flow 滚 main+PR 就够；公共分支禁止裸 force push，必须 --force-with-lease |

## 算法

| 问题 | 一句话答案 |
|---|---|
| [二分查找的边界](/algorithm/basic/searching/01-binary-search/) | 循环不变量定边界：左右开闭统一写法，找左/右界分别收缩 |
| [双指针与滑动窗口](/algorithm/basic/searching/03-sliding-window/) | 有序数组相向双指针、原地操作快慢指针；子串/子数组问题窗口右扩左缩 |
| [排序怎么记](/algorithm/basic/sorting/02-quick-sort/) | 快排分治原地平均 O(nlogn)，堆排稳定 O(nlogn)，归并稳定但 O(n) 空间 |
| [动态规划三步](/algorithm/intermediate/dp/01-climbing-stairs/) | 定义状态 → 写转移方程 → 定初始化与遍历顺序，全部 DP 都是这三步 |
| [回溯模板](/algorithm/intermediate/backtracking/01-subsets/) | 路径 + 选择列表 + 撤销选择；子集/排列/组合只差剪枝与去重的位置 |
| [复杂度与时空权衡](/algorithm/advanced/principles/01-time-space-tradeoff/) | 先给暴力解再优化——用空间换时间（哈希/前缀和/缓存）是最常见的降维路径 |
| [对撞双指针](/algorithm/basic/searching/02-two-pointers/) | 有序数组两端按和的大小移动一端，每步排除一批不可能的解，O(n) |
| [前缀和](/algorithm/basic/techniques/01-prefix-sum/) | O(n) 预处理后区间和 = P[r+1]-P[l]，查询 O(1) |
| [差分数组](/algorithm/basic/techniques/02-difference-array/) | 区间加 v 只改两端点，最后一趟前缀和还原 |
| [单调栈](/algorithm/basic/techniques/03-monotonic-stack/) | 栈内保持单调，弹出时「下一个更大/更小」当场确定，整体 O(n) |
| [快速选择](/algorithm/basic/searching/04-quickselect/) | 借快排分区只递归含答案的一侧，期望 O(n) 找第 K 小 |
| [归并排序](/algorithm/basic/sorting/05-merge-sort/) | 先拆后合，最坏也 O(n log n) 且稳定，代价是 O(n) 辅助数组 |
| [计数排序](/algorithm/basic/sorting/08-counting-sort/) | 值即下标、不比较，突破 Ω(n log n)，耗时 O(n+k) |
| [Floyd 判环](/algorithm/intermediate/linked-list/02-cycle-detection/) | 快慢相遇证有环；slow 回 head 同速再走，再遇即入口 |
| [拓扑排序](/algorithm/advanced/graph/02-topological-sort/) | Kahn：入度 0 即可执行；输出不足总结点数则有环 |
| [二分答案](/algorithm/advanced/binary-answer/01-koko-eating-bananas/) | 「最小的最大」对 k 本身二分，前提是判定单调 |
| [Kadane](/algorithm/intermediate/dp/03-max-subarray/) | 前面累计是负资产就丢弃重开，O(n) 求最大子数组和 |
| [二叉树遍历差别是什么](/algorithm/intermediate/tree/01-tree-traversal/) | 前/中/后序只差「访问根」在递归位置 1/2/3，走树路线相同；层序靠队列，分层先锁 size |
| [BST 的复杂度与不变量](/algorithm/intermediate/tree/02-bst/) | 平均 O(log n) 最坏 O(n)（有序插入退化成链）；中序遍历即升序；验证 BST 要 (lo,hi) 上下界夹逼 |
| [BST 上求 LCA 为什么快](/algorithm/intermediate/tree/04-lca/) | 利用有序性每层走单边，第一次分居两侧或等于 root 即答案，O(h) 无需搜全树 |
| [有效括号为什么最后 return stack.isEmpty()](/algorithm/intermediate/stack-queue/01-valid-parentheses/) | 左括号多了全程不会配对失败，只有扫完栈非空才暴露——写成 true 会漏判这一失败模式 |
| [最小栈 getMin 如何 O(1)](/algorithm/intermediate/stack-queue/02-min-stack/) | 辅助最小栈与主栈同步压弹，第二小的信息在它下面那格从入栈那天就备好了 |
| [双栈实现队列为什么快](/algorithm/intermediate/stack-queue/03-queue-via-stacks/) | 每个元素一生至多搬运两次（总 ≤ 2n）均摊 O(1)；out 栈空才倒，顺序才不乱 |
| [反转链表为什么返回 prev](/algorithm/intermediate/linked-list/01-reverse-list/) | 循环结束时 curr 已走到 null、prev 恰好停在新头；口诀「先记后改」防断链 |
| [合并有序链表为什么用 <=](/algorithm/intermediate/linked-list/03-merge-lists/) | 相等取 A 保证稳定，还避免两指针都不动的边界；剩余整段一个赋值接上 |
| [全排列撤销为什么必须成对](/algorithm/intermediate/backtracking/02-permutations/) | path 和 used 一起恢复——漏一个候选集永久污染，表现为解缺失或重复 |
| [打家劫舍的转移方程](/algorithm/intermediate/dp/02-house-robber/) | dp[i] = max(dp[i-1], dp[i-2] + nums[i])（不偷 vs 偷）；「不偷也可能更优」是理解关键 |
| [LCS 不相等时为什么取 max(上, 左)](/algorithm/intermediate/dp/04-lcs/) | 两个末字符不可能同时进 LCS，必须丢一个取较优；相等才能「都要」（左上 + 1） |
| [希尔排序最后一轮为什么快](/algorithm/basic/sorting/07-shell-sort/) | 大 gap 轮已消除远距离逆序对、数组近乎有序（先粗调后微调），gap=1 接近 O(n)；跨组交换所以不稳定 |
| [冒泡排序](/algorithm/basic/sorting/01-bubble-sort/) | 相邻逆序就交换，每轮把最大值冒到末尾；swapped 一轮未交换可提前退出 |
| [插入排序](/algorithm/basic/sorting/03-insertion-sort/) | 抽 key 插入有序前缀；近乎有序接近 O(n)，是工业排序小区间的兜底 |
| [选择排序](/algorithm/basic/sorting/04-selection-sort/) | 每轮扫出最小值与头部交换；比较次数固定、交换最少，但不稳定 |
| [堆排序](/algorithm/basic/sorting/06-heap-sort/) | 数组当完全二叉树建大顶堆，堆顶归位再下沉，任意输入 O(n log n) |
| [三路分区](/algorithm/basic/sorting/09-three-way-partition/) | 一次扫描分成 < = > 三段；大量重复时相等元素一次归位，防快排退化 |
| [搜索旋转数组](/algorithm/basic/searching/05-rotated-array-search/) | mid 两侧至少一半有序，用有序半区判断目标，每步仍排除一半 O(log n) |
| [图的 BFS/DFS](/algorithm/advanced/graph/01-graph-traversal/) | BFS 队列按层（最短路），DFS 栈扎到底（连通/环）；图必须 visited 防环 |
| [跳跃游戏](/algorithm/advanced/greedy/01-jump-game/) | 维护最远可达判可行性；最少步数把「第 k 步能到的下标」看成一层，省掉 BFS 队列 |
| [四大范式怎么选](/algorithm/advanced/principles/02-paradigm-landscape/) | 分治/贪心/DP/回溯都是聪明地穷举：子问题独立→分治，重叠→DP，要全部解→回溯 |
| [大 O 量的是什么](/algorithm/advanced/principles/03-complexity-analysis/) | 度量操作次数随 n 的增长趋势不是秒数；n 范围反推可行复杂度（1 秒 ≈ 10⁸ 次） |
| [翻转二叉树中序为什么不行](/algorithm/intermediate/tree/03-invert-tree/) | 前序/后序都能翻（交换对称）；中序会把已翻转的左子树再翻一遍 |

## Python

| 问题 | 一句话答案 |
|---|---|
| [is 和 == 的区别](/python/basic/syntax/01-objects/) | is 比对象身份、== 比值（除 `x is None` 外别用 is 比值）；重写 `__eq__` 会把 `__hash__` 置为 None，必须成对重写 |
| [GIL 到底锁住了什么](/python/advanced/internals/01-gil/) | 只锁 CPython 字节码执行——IO 与 numpy 等 C 扩展会释放它，IO 密集多线程有效、CPU 密集换多进程 |
| [@ 装饰器做了什么](/python/basic/functions/03-decorators/) | 就是 `f = 装饰器(原函数)` 的一次调用加重绑定——必备 functools.wraps 与 `*args, **kwargs` 透传，带参装饰器三层嵌套 |
| [调用含 yield 的函数会发生什么](/python/basic/functions/02-iterators-generators/) | 不执行任何代码、只返回生成器对象；每次 next() 跑到 yield 暂停吐值，惰性 O(1) 内存且单次消费 |
| [可变默认值](/python/basic/functions/01-functions-closures/) | 默认值在 def 时求值一次并被所有调用共享——可变对象用 None 哨兵 |
| [引用计数与循环 GC](/python/advanced/internals/02-memory-gc/) | 计数归零立即释放是主力；分代 GC 只兜循环引用 |
| [asyncio](/python/intermediate/concurrency/02-asyncio/) | 调用 async def 只返回协程对象；await 在 IO 时让出，单线程撑起高并发连接 |
| [CPU 密集用进程](/python/intermediate/concurrency/03-multiprocessing/) | 线程绕不开 GIL；进程各有解释器才能用多核，通信要序列化 |
| [MRO 与 super](/python/basic/oop/02-inheritance-mro/) | super() 是 C3 线性化的下一站，不是「直接父类」的别名 |
| [dict 实现](/python/basic/data-structures/02-dict-set/) | 开放寻址、装载因子约 2/3 扩容；3.7+ 语言保证插入有序 |
| [typing 运行时不强制](/python/intermediate/stdlib/04-typing/) | 标注给 IDE/mypy 看，解释器不检查；边界脏数据要运行时校验 |
| [Pydantic](/python/intermediate/libs/02-pydantic/) | 把类型标注变成运行时强制，拦 HTTP/配置/第三方 JSON |
| [venv 与 uv](/python/advanced/eng/01-venv-uv/) | 隔离靠 venv，声明在 pyproject.toml，锁定在 uv.lock；应用提交 lock，库只声明宽松下限 |
| [pytest 怎么写](/python/advanced/eng/02-pytest/) | 裸 assert + fixture 按名注入；参数化加用例只加数据行，共享放 conftest.py |
| [ruff 与 mypy](/python/advanced/eng/03-ruff-mypy/) | ruff 一统 lint/format；mypy 渐进收紧，CI 门禁 check → format --check → mypy → pytest |
| [描述符与元类](/python/advanced/internals/03-descriptors-metaclass/) | 描述符是 __get__/__set__ 协议，property/ORM 字段的本体；元类拦截类的创建，是最后手段 |
| [list 与 tuple](/python/basic/data-structures/01-list-tuple/) | list 过度分配指针数组，append 均摊 O(1)、头部操作 O(n)；tuple 可哈希可作 dict key |
| [import 执行几次](/python/basic/modules/01-modules-import/) | import 是运行时执行且 sys.modules 缓存只跑一次；循环导入优先抽公共模块 |
| [包与 src 布局](/python/basic/modules/02-packages-layout/) | 包=带 __init__.py 的目录；包内相对、跨包绝对；跑脚本破坏相对导入时用 python -m |
| [__new__ 与 __init__](/python/basic/oop/01-class-basics/) | __new__ 造实例、__init__ 填内容；可变默认值性质的类属性要挪进 __init__ |
| [dataclass 与 slots](/python/basic/oop/03-dataclass-slots/) | frozen=True 当值对象；可变默认值用 default_factory；百万实例加 slots 省约一半内存 |
| [线程适合什么](/python/intermediate/concurrency/01-threading/) | GIL 下 CPU 密集无法并行字节码，但 IO 等待会释放——IO 密集用线程池，共享状态优先 Queue |
| [FastAPI 的 async 路由能塞同步阻塞吗](/python/intermediate/libs/03-fastapi/) | 不能——一个同步阻塞（requests、time.sleep）冻结全服务；CPU 密集写普通 def 让框架丢线程池 |
| [SQLAlchemy 的 Engine 和 Session 各建几个](/python/intermediate/libs/04-sqlalchemy/) | Engine 全局一个管连接池，Session 请求一个管事务；生产建表用 Alembic 不用 create_all |
| [list 的 pop(0) 和 deque.popleft() 差在哪](/python/intermediate/stdlib/01-collections/) | list 头部删除 O(n) 全员平移，deque 两端 O(1)，maxlen 白送环形缓冲 |
| [itertools.groupby 为什么分错组](/python/intermediate/stdlib/02-functools-itertools/) | 只合并相邻相同项——必须先按同一 key sorted 再 groupby |
| [re.findall 带分组返回什么](/python/intermediate/data/01-re-regex/) | 返回组不是整体——一个组→字符串列表，多个组→元组列表 |
| [库代码里该不该调 basicConfig](/python/intermediate/data/03-logging/) | 不该——库只 getLogger(__name__) 输出不配置，配置权归应用入口 |
| [Python 为什么禁裸 except](/python/basic/syntax/04-exceptions/) | 连 KeyboardInterrupt 和系统退出信号一起吞；最低 except Exception，捕获从窄到宽排队 |
| [线上 Python 进程偶尔卡死怎么定位](/python/advanced/internals/04-profiling/) | py-spy dump 打印所有线程栈——采样不侵入，十秒定位卡在哪行 |
| [for-else 何时走](/python/basic/syntax/02-control-flow/) | else 只在循环没被 break、正常耗尽时执行——专门处理「没找到」 |
| [str 与 bytes](/python/basic/syntax/03-strings/) | str 是 Unicode 码点、bytes 是字节；乱码多因编解码不一致；循环拼接用 join |
| [json dumps 中文与 datetime](/python/intermediate/data/02-json-csv/) | ensure_ascii=False 才出真中文；datetime 要 default 兜底；Excel CSV 用 utf-8-sig |
| [requests 必须写 timeout](/python/intermediate/libs/01-requests-httpx/) | 默认无限等；循环走 Session 复用连接；异步代码禁用同步 requests |
| [pathlib 与 with](/python/intermediate/stdlib/03-pathlib-io/) | 路径用 `/` 拼接；文本 IO 必带 encoding；with 把清理变成语言结构 |
| [naive vs aware](/python/intermediate/stdlib/05-datetime/) | now() 返回 naive 本地时间；存储计算一律 UTC aware；timestamp() 是秒不是毫秒 |
| [wheel 不打包依赖](/python/advanced/eng/04-packaging/) | wheel 只描述依赖，安装环境按 lockfile 解决；Docker 先拷 lock 再 `--frozen` |

## AI 与大模型

| 问题 | 一句话答案 |
|---|---|
| [基座模型和聊天模型差在哪](/ai/intermediate/llm/01-llm/) | SFT 用指令-答案对教模型听懂人话，RLHF 按人类偏好教它说人爱听的话——两步对齐补上差距 |
| [RAG 和微调怎么选](/ai/intermediate/agent/06-rag/) | 解决「模型不知道」（新知识/私有知识/要引用来源）选 RAG；解决「模型不按你的方式做事」（风格/格式）选微调 |
| [MCP 解决了什么问题](/ai/intermediate/agent/08-mcp/) | AI 应用的 USB-C 开放标准——把 M×N 私有集成降为 M+N，工具从硬编码注册变运行时发现 |
| [Agent Loop 的本质](/ai/basic/agent/01-agent-loop/) | 一个 while 循环：模型只决策要不要调工具，真正执行的是 Harness，tool_result 追加回 messages 直到不再调工具 |
| [提示工程](/ai/intermediate/llm/02-prompt-engineering/) | 不改权重只改问法：零样本/少样本/CoT；结构化提示 = 角色+任务+约束+格式 |
| [权限三道闸](/ai/basic/agent/03-permission/) | 安全靠代码不靠信任模型：硬拒绝 → 规则询问 → 默认放行 |
| [专用工具](/ai/basic/agent/02-tool-use/) | 循环不变、能力进 dispatch table；让模型直接表达意图，少一层 bash 翻译 |
| [上下文工程](/ai/intermediate/agent/03-context-engineering/) | 模型只基于当次看到的信息决策，窗口治理决定能力上限 |
| [记忆层](/ai/intermediate/agent/04-memory/) | 压缩有损、新会话无摘要，细节要落到跨会话仍在的文件仓库再按需加载 |
| [子智能体](/ai/intermediate/agent/09-subagent/) | 子任务用独立 messages，只把结论回传，避免中间过程挤爆主上下文 |
| [机器学习范式](/ai/basic/foundation/01-machine-learning/) | 从「数据+规则→答案」变成「数据+答案→规则」；监督/无监督/强化学习三种信号 |
| [深度学习](/ai/basic/foundation/02-deep-learning/) | 多层网络自动提取特征，把原先靠人做的特征工程交给模型 |
| [多 Agent 第一动机](/ai/advanced/agent/01-multi-agent/) | 第一动机是上下文隔离与并行，不是堆更多算力；子 Agent 只回摘要，主线程视野不被稀释 |
| [任务系统 vs 便签](/ai/advanced/agent/02-task-system/) | TodoWrite 是给自己看的便签，Task System 是可认领的看板：持久化、有 blockedBy、跨会话还在 |
| [后台任务怎么回](/ai/advanced/agent/03-background-tasks/) | 一个 tool_use 只对应一个 tool_result：占位结果立刻回，完成后走独立通知通道 |
| [Agent 团队](/ai/advanced/agent/05-agent-teams/) | 团队=收件箱的集合，协调不需要共享内存；权限冒泡让队友干危险活仍经用户审批 |
| [自主认领任务](/ai/advanced/agent/07-autonomous-agents/) | 看板模式：任务可见、认领原子、依赖显式——不需要中央调度器；inbox 优先于任务板 |
| [Agent 框架看什么](/ai/advanced/agent/10-agent-frameworks/) | 框架解决的是多租户/并发调度/沙箱/部署这些生产外围，不是会不会推理 |
| [评测与对齐](/ai/advanced/eval/01-evaluation-align/) | 评测盯能力、对齐盯价值与安全；RLHF = 人类反馈 → 奖励模型 → 强化学习 |
| [TodoWrite 对抗什么](/ai/intermediate/agent/01-todo-planning/) | 注意力稀释是长任务的敌人；计划以可见列表对抗上下文挤压，reminder 由 Harness 负责 |
| [系统提示是组装的](/ai/intermediate/agent/02-system-prompt/) | system prompt 按当前状态运行时拼接，不是写死的字符串；加载依据是文件/工具是否真的存在 |
| [技能按需加载](/ai/intermediate/agent/05-skill-loading/) | 两级加载：目录便宜常驻 system prompt，内容昂贵通过 tool_result 按需注入 |
| [想给 agent 加行为该改循环吗](/ai/basic/agent/04-hooks/) | 不改——注册回调即可（PreToolUse/PostToolUse/Stop 等事件），加行为 = 注册回调、循环零改动 |
| [429/529 临时故障的恢复套路](/ai/intermediate/agent/07-error-recovery/) | 指数退避 + 抖动（500×2^n 封顶 32s）最多 10 次，Retry-After 优先，连续 3 次 529 切备用模型 |
| [durable 的 cron 任务进程关了还会跑吗](/ai/advanced/agent/04-cron-scheduler/) | 不会——durable 只是任务定义跨重启保留，调度器必须在 Agent 进程内跑；进程外用系统 crontab/systemd timer |
| [多 Agent 协议消息靠什么配对](/ai/advanced/agent/06-team-protocols/) | request_id 贯穿全链路，match_response 做类型匹配 + 已解决幂等两层校验 |
| [并行 Agent 为什么要 worktree](/ai/advanced/agent/08-worktree-isolation/) | 对话隔离不够，还要隔离文件系统；绑定不改任务状态，有未提交改动默认拒绝删除 |
| [综合 Harness 改了循环吗](/ai/advanced/agent/09-comprehensive-agent/) | 没改——机制很多循环一个：LLM 前注入、工具前权限、工具后回写 |
| [OpenClaw 三层](/ai/advanced/agent/11-openclaw/) | Channels + 唯一 Gateway 收口 + Workspace 隔离；LLM 不直连任何聊天平台 |

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
| [ZK 是什么](/zookeeper/basic/core/01-zookeeper-core/) | 强一致协调服务：znode 树 + 临时节点 + Watch，写走 Leader 再 ZAB 广播 |
| [ZK 分布式锁为什么用临时顺序节点](/zookeeper/basic/core/01-zookeeper-core/) | 临时节点随会话断开自动删除防死锁，顺序节点单调递增序号让最小者持锁——选主与注册中心同理 |
| [etcd Watch 的优势](/etcd/basic/core/02-etcd-lease-txn-watch/) | 按 revision 续传断线不丢事件，撞 compaction 要全量重拉 |
| [etcd 默认读要不要过半](/etcd/basic/core/02-etcd-lease-txn-watch/) | linearizable（默认）过半走 Raft 读最新已提交，serializable 读本地快照换极低延迟——CAP 取舍的旋钮 |
| [容灾 RTO/RPO](/distributed/advanced/availability/01-dr-multi-active/) | RTO 定恢复时长、RPO 定丢数据容忍，预案必须演练验证 |
| [混沌工程](/distributed/advanced/availability/05-chaos-engineering/) | 稳态假设 + 受控注入 + 自动终止；没有预案的故障不注入 |
| [单元化 set 化](/distributed/advanced/availability/06-cell-based/) | 分片基因贯穿流量/数据/应用，单元内闭环多活，切流先停写追平 |
| [Seata AT 为什么无侵入](/seata/basic/core/01-seata-core/) | 一阶段执行 SQL 时自动记前后镜像 undo log 并直接提交本地事务，失败按 beforeImage 反向补偿 |
| [AT 模式是什么隔离级别](/seata/basic/core/02-seata-deep-dive/) | 默认读未提交，写隔离靠提交前向 TC 申请行级全局锁；热点行退化串行，应换 TCC/消息最终一致 |
| [etcd 写路径](/etcd/basic/core/01-etcd-core/) | 只有 Leader 处理写，Raft 日志过半提交；Lease 到期自动删挂在其上的 key |
| [etcd 凭什么当 K8s 的存储](/etcd/basic/core/01-etcd-core/) | Raft 强一致 KV + MVCC revision 可回溯 + Watch 前缀订阅——K8s 控制循环的数据底座 |
| [ZK Watcher](/zookeeper/basic/core/02-zk-deep-dive/) | 一次性触发，重注册间隙会丢变更——靠版本号补拉；半死 session 需 fencing 自保 |
| [Gossip](/distributed/intermediate/consensus/02-gossip/) | 无中心时随机交换状态，O(log N) 轮收敛；适合元数据扩散，不能替代 Raft 提交 |
| [分布式 ID](/distributed/intermediate/transaction/02-distributed-id/) | 分库后自增会撞号；工程默认雪花（小心时钟回拨），严格连续用号段 |
| [超时与重试](/distributed/intermediate/traffic/02-timeout-retry/) | 上层超时 > 下层之和；重试三门槛：幂等、可重试错误、退避加抖动 |
| [链路追踪](/distributed/advanced/observability/01-distributed-tracing/) | traceId 贯穿、span 成树；透传 context 才能画出瀑布图 |
| [全链路灰度](/distributed/advanced/availability/04-full-link-gray/) | 请求要么走完整新链路要么走完整旧链路；入口染色透传，泳道缺的服务回落基线 |
| [一致性强度怎么选](/distributed/advanced/consistency/01-consistency-patterns/) | 资金类走强一致/共识，展示类走最终一致；刚写完读不到用粘性路由或写后短窗读主 |
| [一次 RPC 发生了什么](/distributed/intermediate/governance/01-rpc-principles/) | 动态代理→序列化→协议编码→网络传输，把远程调用伪装成本地方法；请求 ID 配异步收发 |
| [三高五大武器](/distributed/intermediate/performance/01-triple-high/) | 缓存、预处理/延后、池化、异步、MQ——都是把实时链路上的事提前或延后 |
| [接口优化先看耗时地图](/distributed/intermediate/performance/02-interface-optimization/) | CPU 1ns 与跨地域 30ms 差六个数量级；先砍最贵的跨地域/RPC 次数再谈微优化 |

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
- 本手册覆盖全站方向并持续补充；尚未收录的主题请直接走
  各方向学习路线页。
