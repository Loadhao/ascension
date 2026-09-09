import type { SummaryVizConfig } from '../../components/viz/SummaryViz';

/**
 * 彩色总结卡注册表：把「对比 / 分层」类结论压缩成一张静态速记卡。
 * 数据里只写语义色调名（tone），实际配色由 custom.css 的 `--sum-*` 令牌按亮暗主题接管。
 */

/** Spring 家族：Framework 与 Boot 的分工（最容易混的一对） */
const springVsBoot: SummaryVizConfig = {
	title: 'Spring 是底层能力框架，Spring Boot 是工程化脚手架',
	badge: '一个管能力，一个管效率',
	panels: [
		{
			title: 'Spring Framework',
			sub: '解决什么：对象的来路与组装',
			tone: 'blue',
			cells: [
				{ label: 'IoC 容器', desc: '依赖注入，对象交给容器组装' },
				{ label: 'AOP', desc: '事务、日志等横切逻辑统一织入' },
				{ label: '资源与事件', desc: '统一资源抽象 + 容器事件广播' },
			],
		},
		{
			title: 'Spring Boot',
			sub: '解决什么：怎么快速跑起来',
			tone: 'green',
			cells: [
				{ label: '自动装配', desc: '按 classpath 依赖自动配好 Bean' },
				{ label: 'Starter', desc: '一组依赖 = 一套开箱能力' },
				{ label: '内嵌容器', desc: 'Tomcat 打进 jar，java -jar 直接跑' },
				{ label: 'Actuator', desc: '健康检查、指标等生产端点' },
			],
		},
	],
	link: 'Boot 自动装配 Framework 的内核',
	takeaways: ['没有替代关系，而是基于关系'],
	caption: 'Spring Boot 基于 Spring：内核还是 Framework 的，Boot 只负责把它自动装好',
};

/** String / StringBuilder / StringBuffer 三兄弟 */
const stringFamily: SummaryVizConfig = {
	title: '拼字符串怎么选：可变性定场景，线程安全定取舍',
	badge: '不变选 String，单线程拼接选 Builder',
	panels: [
		{
			title: 'String',
			sub: '不可变',
			tone: 'blue',
			cells: [
				{ label: '可变性：不可变', desc: '内部数组 final，一改就换新对象' },
				{ label: '线程安全：天然安全', desc: '状态不可变，没有并发问题' },
				{ label: '场景：少量、不变的串', desc: '常量池复用，适合做 Map 的 key' },
			],
		},
		{
			title: 'StringBuilder',
			sub: '可变 · 不加锁',
			tone: 'green',
			cells: [
				{ label: '可变性：可变', desc: '内部数组原地扩容追加' },
				{ label: '线程安全：不安全', desc: '方法没加锁' },
				{ label: '场景：单线程拼接首选', desc: '循环拼接永远用它' },
			],
		},
		{
			title: 'StringBuffer',
			sub: '可变 · 加锁',
			tone: 'amber',
			cells: [
				{ label: '可变性：可变', desc: '结构与 StringBuilder 同源' },
				{ label: '线程安全：安全', desc: '方法加 synchronized' },
				{ label: '场景：多线程拼接（罕见）', desc: '锁竞争抵消拼接收益' },
			],
		},
	],
	takeaways: ['循环里用 + 拼接是反模式：每轮新建 StringBuilder + 新 String，O(n²) 级对象创建'],
	caption: 'String 求稳、StringBuilder 求快、StringBuffer 求安全——现实中多线程拼接很罕见',
};

/** HashMap vs ConcurrentHashMap */
const hashmapVsChm: SummaryVizConfig = {
	title: 'HashMap 管单线程性能，ConcurrentHashMap 管并发安全',
	badge: '同一个结构，两种并发答案',
	panels: [
		{
			title: 'HashMap',
			sub: '单线程首选',
			tone: 'amber',
			cells: [
				{ label: '结构', desc: '数组 + 链表 + 红黑树' },
				{ label: '并发写', desc: '不安全：丢更新；JDK 7 头插还会成环死循环' },
				{ label: 'null', desc: 'key / value 都允许' },
			],
		},
		{
			title: 'ConcurrentHashMap',
			sub: '并发首选',
			tone: 'teal',
			cells: [
				{ label: '结构', desc: '同 HashMap（JDK 8 起）' },
				{ label: '并发写', desc: '空桶 CAS；非空锁桶头 + double check' },
				{ label: 'null', desc: '一律不许：并发下无法区分「不存在」' },
			],
		},
	],
	link: '读不加锁，写只锁一个桶',
	takeaways: ['全表一把锁的 synchronizedMap / Hashtable 读写全串行，性能崩塌，别用'],
	caption: 'CHM ≈ HashMap 的结构 + 桶级锁：并发读多写少场景的标准答案',
};

/** synchronized vs ReentrantLock */
const syncVsLock: SummaryVizConfig = {
	title: 'synchronized 够用就先用，ReentrantLock 补进阶能力',
	badge: '一个省心，一个全能',
	panels: [
		{
			title: 'synchronized',
			sub: 'JVM 内置关键字',
			tone: 'blue',
			cells: [
				{ label: '释放', desc: '退出 / 异常自动释放，不会忘' },
				{ label: '公平性', desc: '只有非公平' },
				{ label: '条件队列', desc: '一个：wait / notify' },
				{ label: '进阶能力', desc: '无超时、不可中断' },
			],
		},
		{
			title: 'ReentrantLock',
			sub: 'JDK 类库（AQS）',
			tone: 'violet',
			cells: [
				{ label: '释放', desc: '必须 finally 手动 unlock' },
				{ label: '公平性', desc: '可选公平 / 非公平' },
				{ label: '条件队列', desc: '多个 Condition 分队唤醒' },
				{ label: '进阶能力', desc: 'tryLock 超时、lockInterruptibly 可中断' },
			],
		},
	],
	link: 'JDK 6 优化后性能基本持平',
	takeaways: ['简单场景默认 synchronized；要超时、可中断、公平、多条件队列才上 Lock'],
	caption: 'Lock 的每一分灵活，都要用「手动释放」的责任来换',
};

/** JVM 运行时数据区分层 */
const jvmMemoryAreas: SummaryVizConfig = {
	title: 'JVM 运行时数据区：私有区各管各的，共享区才是 GC 与 OOM 的主战场',
	badge: '按「谁活着」分区',
	layers: [
		{
			title: '线程私有',
			sub: '随线程生灭',
			tone: 'blue',
			cells: [
				{ label: '程序计数器', desc: '唯一不会 OOM 的区域' },
				{ label: '虚拟机栈', desc: '栈帧住这里；递归过深 StackOverflowError' },
				{ label: '本地方法栈', desc: '服务 native 方法' },
			],
		},
		{
			title: '线程共享',
			sub: 'GC 主战场',
			tone: 'green',
			cells: [
				{ label: '堆', desc: '对象实例；-Xms / -Xmx' },
				{ label: '元空间', desc: '类信息，用本地内存' },
				{ label: '运行时常量池', desc: 'JDK 7 起字符串常量池移入堆' },
			],
		},
		{
			title: '堆外',
			sub: '不受 -Xmx 管',
			tone: 'slate',
			cells: [
				{ label: '直接内存', desc: 'NIO / Netty；OOM 报错没有 heap space 字样' },
			],
		},
	],
	takeaways: ['StackOverflowError 看栈，Java heap space 看堆，Metaspace 看类加载，无标记 OOM 想堆外'],
	caption: '排查 OOM 第一步：先分清报错落在哪个区',
};

/** Java 集合框架四大家族总览 */
const collectionFamily: SummaryVizConfig = {
	title: '集合怎么选：重复吗、有序吗、一对一还是键值对',
	badge: '先选家族，再挑实现',
	layers: [
		{
			title: 'List',
			sub: '有序 · 可重复',
			tone: 'blue',
			cells: [
				{ label: 'ArrayList', desc: '数组，随机访问快，查多改少首选' },
				{ label: 'LinkedList', desc: '双向链表，头尾插删快，可当双端队列' },
			],
		},
		{
			title: 'Set',
			sub: '不重复',
			tone: 'green',
			cells: [
				{ label: 'HashSet', desc: '哈希表，无序，查重 O(1)' },
				{ label: 'TreeSet', desc: '红黑树，按 key 有序' },
			],
		},
		{
			title: 'Queue',
			sub: '队列语义',
			tone: 'amber',
			cells: [
				{ label: 'ArrayDeque', desc: '双端队列首选' },
				{ label: 'PriorityQueue', desc: '堆，按优先级出队' },
			],
		},
		{
			title: 'Map',
			sub: '键值对（不属 Collection）',
			tone: 'violet',
			cells: [
				{ label: 'HashMap', desc: '主力：数组 + 链表 + 红黑树' },
				{ label: 'ConcurrentHashMap', desc: '并发场景，桶级锁' },
			],
		},
	],
	takeaways: ['并发场景一律 java.util.concurrent 包，别给线程共享集合裸加锁'],
	caption: '一对一找 Collection（看重复与有序），键值映射找 Map',
};

/** Throwable 三支：Error / 受检异常 / RuntimeException */
const exceptionFamily: SummaryVizConfig = {
	title: '异常三支怎么分：能恢复抛受检，是 bug 抛运行时，JVM 坏了抛 Error',
	badge: 'catch 之前先想清楚接住干嘛',
	panels: [
		{
			title: 'Error',
			sub: 'JVM 级致命错误',
			tone: 'rose',
			cells: [
				{ label: '典型', desc: 'OutOfMemoryError / StackOverflowError' },
				{ label: '语义', desc: 'JVM 层面坏了，应用无法恢复' },
				{ label: '处置', desc: '不该 catch——接住也没救' },
			],
		},
		{
			title: '受检异常 Checked',
			sub: 'Exception · 编译器强制处理',
			tone: 'blue',
			cells: [
				{ label: '典型', desc: 'IOException / SQLException' },
				{ label: '语义', desc: '外部问题，调用方有能力恢复' },
				{ label: '处置', desc: '强制 try/catch 或向上抛' },
			],
		},
		{
			title: 'RuntimeException',
			sub: 'Exception · 编译器不管',
			tone: 'amber',
			cells: [
				{ label: '典型', desc: 'NPE / 数组越界 / 类型转换' },
				{ label: '语义', desc: '程序 bug，不是「异常情况」' },
				{ label: '处置', desc: '修代码；参数校验用 IllegalArgument / IllegalState' },
			],
		},
	],
	takeaways: ['面试常问：为什么 NPE 是非受检？——因为它是 bug，接住它只会掩盖错误'],
	caption: '真正的分水岭不是编译器管不管，而是「接住之后你打算怎么办」',
};

/** BIO / NIO / AIO 三种 IO 模型 */
const ioModels: SummaryVizConfig = {
	title: 'BIO 一连接一线程，NIO 一个线程管一片，AIO 内核搬完再叫我',
	badge: '阻塞看等待，同步看搬运',
	panels: [
		{
			title: 'BIO',
			sub: '同步阻塞',
			tone: 'slate',
			cells: [
				{ label: '等数据', desc: '线程干等，不让出 CPU' },
				{ label: '搬数据', desc: '内核 → 用户空间，自己读' },
				{ label: '支撑模型', desc: '一连接一线程' },
				{ label: '现状', desc: '长连接场景撑不住' },
			],
		},
		{
			title: 'NIO',
			sub: '同步非阻塞',
			tone: 'green',
			cells: [
				{ label: '等数据', desc: 'read 不死等，Selector 管一片连接' },
				{ label: '搬数据', desc: '还是自己读（Reactor）' },
				{ label: '支撑模型', desc: '多路复用，Linux 底座 epoll' },
				{ label: '现状', desc: '实战主流，Netty 的基座' },
			],
		},
		{
			title: 'AIO',
			sub: '异步',
			tone: 'teal',
			cells: [
				{ label: '等数据', desc: '发起后直接返回' },
				{ label: '搬数据', desc: '内核搬好再通知（Proactor）' },
				{ label: '支撑模型', desc: '回调 / CompletionHandler' },
				{ label: '现状', desc: '生态弱，Netty 已移除' },
			],
		},
	],
	takeaways: ['阻塞 / 非阻塞看「等的时候让不让出 CPU」；同步 / 异步看「谁把数据搬进用户空间」'],
	caption: 'NIO 的「非阻塞」是连接建立后 read 不死等，不是没有等待',
};

/** CMS / G1 / ZGC 三代收集器 */
const gcCollectors: SummaryVizConfig = {
	title: '收集器演进就一句话：减少 STW 停顿',
	badge: 'CMS 开路，G1 当家，ZGC 极致',
	panels: [
		{
			title: 'CMS',
			sub: 'JDK 1.4 诞生 · 已谢幕',
			tone: 'amber',
			cells: [
				{ label: '停顿', desc: '并发标记清除，首次降到毫秒级' },
				{ label: '核心技术', desc: '标记与清除阶段与业务并发' },
				{ label: '代价', desc: '标记-清除碎片，并发失败退化 Serial Old' },
				{ label: '现状', desc: 'JDK 14 移除，思想仍在' },
			],
		},
		{
			title: 'G1',
			sub: 'JDK 9 起默认',
			tone: 'blue',
			cells: [
				{ label: '停顿', desc: '软目标预测 -XX:MaxGCPauseMillis' },
				{ label: '核心技术', desc: 'Region 化堆，按回收收益排序（标记-复制无碎片）' },
				{ label: '代价', desc: 'Remembered Set 堆外维护成本' },
				{ label: '现状', desc: 'JDK 11+ 的默认选择' },
			],
		},
		{
			title: 'ZGC',
			sub: 'JDK 15 转正',
			tone: 'violet',
			cells: [
				{ label: '停顿', desc: '< 1ms 且与堆大小无关，TB 级堆依旧' },
				{ label: '核心技术', desc: '染色指针 + 读屏障，标记转移几乎全并发' },
				{ label: '代价', desc: '吞吐略让，内存占用稍高' },
				{ label: '现状', desc: '堆 > 8G 且延迟敏感再上' },
			],
		},
	],
	takeaways: ['JDK 8 用 Parallel（吞吐）或 G1（延迟）；JDK 11+ 默认 G1；堆 > 8G 且延迟敏感再上 ZGC'],
	caption: '并发标记的漏标催生两大修正流派：CMS 增量更新，G1/ZGC 走 SATB 或着色指针',
};

/** TCP vs UDP */
const tcpVsUdp: SummaryVizConfig = {
	title: 'TCP 管正确，UDP 管快慢',
	badge: '一个做全加法，一个故意做减法',
	panels: [
		{
			title: 'TCP',
			sub: '面向连接',
			tone: 'blue',
			cells: [
				{ label: '连接', desc: '三次握手建立，一对一' },
				{ label: '可靠有序', desc: '确认 + 重传，不丢不重按序交付' },
				{ label: '数据形态', desc: '字节流，无消息边界 → 粘拆包' },
				{ label: '开销与控制', desc: '头 20~60 字节，有拥塞控制' },
			],
		},
		{
			title: 'UDP',
			sub: '无连接',
			tone: 'teal',
			cells: [
				{ label: '连接', desc: '拿起就发，支持广播 / 组播' },
				{ label: '可靠有序', desc: '尽力而为，可能丢 / 重 / 乱' },
				{ label: '数据形态', desc: '数据报，一次一发天然有边界' },
				{ label: '开销与控制', desc: '头固定 8 字节，无拥塞控制' },
			],
		},
	],
	link: '可靠性上交应用层，换低延迟',
	takeaways: ['correctness 优先选 TCP，latency 优先选 UDP；HTTP/3 把可靠传输搬回 UDP 上自己造（QUIC）'],
	caption: 'UDP 不是残缺的 TCP，是故意做减法',
};

/** RDB vs AOF 两条持久化路线 */
const rdbVsAof: SummaryVizConfig = {
	title: 'RDB 快而丢窗口大，AOF 丢得少而恢复慢',
	badge: 'Redis 持久化两条路线',
	panels: [
		{
			title: 'RDB',
			sub: '快照路线',
			tone: 'blue',
			cells: [
				{ label: '记录什么', desc: '某时刻全量数据的二进制快照' },
				{ label: '文件', desc: '紧凑、恢复快' },
				{ label: '丢失窗口', desc: '两次快照之间的数据' },
				{ label: '代价', desc: 'fork 瞬间开销（写时复制）' },
			],
		},
		{
			title: 'AOF',
			sub: '命令追加路线',
			tone: 'green',
			cells: [
				{ label: '记录什么', desc: '每条写命令的文本追加' },
				{ label: '文件', desc: '体积大、恢复慢（逐条重放）' },
				{ label: '丢失窗口', desc: '最多 1 秒（everysec）' },
				{ label: '代价', desc: '持续小幅写入' },
			],
		},
	],
	link: '混合持久化 = RDB 头 + AOF 尾',
	takeaways: ['纯缓存可关持久化；一般业务混合持久化 + everysec；金融级每条必保 AOF always'],
	caption: '主从架构可把快照压力挪给从库——但空数据的主库会把从库同步成空库',
};

/** 笔记中可通过 <AlgorithmVizIsland demo="..." /> 引用的总结卡注册表 */
export const summaryDemos: Record<string, SummaryVizConfig> = {
	'spring-vs-boot': springVsBoot,
	'string-family': stringFamily,
	'hashmap-vs-chm': hashmapVsChm,
	'sync-vs-lock': syncVsLock,
	'jvm-memory-areas': jvmMemoryAreas,
	'collection-family': collectionFamily,
	'exception-family': exceptionFamily,
	'io-models': ioModels,
	'gc-collectors': gcCollectors,
	'tcp-vs-udp': tcpVsUdp,
	'rdb-vs-aof': rdbVsAof,
};
