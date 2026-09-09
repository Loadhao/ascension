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
			icon: '🧩',
			tone: 'blue',
			cells: [
				{ label: 'IoC 容器', desc: '依赖注入 + 生命周期管理，对象交给容器统一组装', tag: '核心' },
				{ label: 'AOP', desc: '动态代理把事务、日志、鉴权等横切逻辑织入业务' },
				{ label: '资源与事件', desc: '统一资源抽象、容器事件广播、Environment 配置体系' },
				{ label: '事务抽象', desc: 'PlatformTransactionManager 屏蔽本地 / JTA 差异' },
			],
		},
		{
			title: 'Spring Boot',
			sub: '解决什么：怎么快速跑起来',
			icon: '🚀',
			tone: 'green',
			cells: [
				{ label: '自动装配', desc: '按 classpath 依赖自动配好 Bean，约定大于配置', tag: '条件装配' },
				{ label: 'Starter', desc: '一组依赖 = 一套开箱能力，版本兼容由 BOM 对齐' },
				{ label: '内嵌容器', desc: 'Tomcat 打进 jar，java -jar 直接跑', tag: '告别 war' },
				{ label: 'Actuator', desc: '健康检查、指标、配置等生产运维端点', tag: '/actuator' },
			],
		},
	],
	link: 'Boot 自动装配 Framework 的内核',
	takeaways: ['没有替代关系，而是基于关系', 'IoC / AOP / 扩展点原理在 Boot 时代照样是核心面试题'],
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
			icon: '🔒',
			tone: 'blue',
			cells: [
				{ label: '可变性', desc: 'final byte[]，任何修改都返回新对象' },
				{ label: '线程安全', desc: '状态不可变，天然没有并发问题' },
				{ label: '内存与性能', desc: '常量池复用；JDK 9 紧凑字符串按内容选 byte[]', tag: 'JDK 9' },
				{ label: '场景', desc: '少量不变的串、Map 的 key、跨线程共享' },
			],
		},
		{
			title: 'StringBuilder',
			sub: '可变 · 不加锁',
			icon: '⚡',
			tone: 'green',
			cells: [
				{ label: '可变性', desc: '内部数组原地追加，容量约翻倍扩容' },
				{ label: '线程安全', desc: '方法没加锁，多线程各自用各的' },
				{ label: '内存与性能', desc: '拼接一遍成型，没有中间临时对象' },
				{ label: '场景', desc: '单线程拼接首选，循环拼接的唯一正解', tag: '默认选它' },
			],
		},
		{
			title: 'StringBuffer',
			sub: '可变 · 加锁',
			icon: '🛡️',
			tone: 'amber',
			cells: [
				{ label: '可变性', desc: '结构与 StringBuilder 同源' },
				{ label: '线程安全', desc: '方法级 synchronized', tag: '重量级' },
				{ label: '内存与性能', desc: '锁竞争有开销，单线程反而最慢' },
				{ label: '场景', desc: '多线程共享同一个拼接器（现实中罕见）' },
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
			icon: '🏃',
			tone: 'amber',
			cells: [
				{ label: '结构', desc: '数组 + 链表 + 红黑树', tag: '树化阈值 8' },
				{ label: '并发写', desc: '不安全：丢更新；JDK 7 头插法还会成环死循环' },
				{ label: '读', desc: '无锁，但也没有跨线程可见性保证' },
				{ label: 'null', desc: 'key / value 都允许' },
				{ label: '扩容', desc: '容量 2 的幂；1.7 头插 → 1.8 尾插' },
			],
		},
		{
			title: 'ConcurrentHashMap',
			sub: '并发首选',
			icon: '🤝',
			tone: 'teal',
			cells: [
				{ label: '结构', desc: '同 HashMap（JDK 8 起）' },
				{ label: '并发写', desc: '空桶 CAS；非空锁桶头节点 + double check', tag: '桶级锁' },
				{ label: '读', desc: 'volatile 无锁；扩容期间经 find 转发到新表' },
				{ label: 'null', desc: '一律不许：并发下无法区分「不存在」' },
				{ label: '扩容', desc: '多线程协助迁移，读写全程不阻塞', tag: 'helpTransfer' },
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
			icon: '🔒',
			tone: 'blue',
			cells: [
				{ label: '层面', desc: '关键字 + monitor：对象头 Mark Word 指向监视器' },
				{ label: '释放', desc: '退出 / 异常自动释放，永远不会忘', tag: '省心' },
				{ label: '公平性', desc: '只有非公平' },
				{ label: '条件队列', desc: '一个：wait / notify' },
				{ label: '进阶能力', desc: '无超时、不可中断' },
			],
		},
		{
			title: 'ReentrantLock',
			sub: 'JDK 类库（AQS）',
			icon: '🔑',
			tone: 'violet',
			cells: [
				{ label: '层面', desc: 'AQS 队列同步器，state + CLH 等待队列' },
				{ label: '释放', desc: '必须 finally 手动 unlock，漏了就死锁', tag: '责任自负' },
				{ label: '公平性', desc: '可选公平 / 非公平' },
				{ label: '条件队列', desc: '多个 Condition，分队列精准唤醒' },
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
			icon: '🧵',
			tone: 'blue',
			cells: [
				{ label: '程序计数器', desc: '字节码行号，恢复执行位置', tag: '唯一不 OOM' },
				{ label: '虚拟机栈', desc: '栈帧：局部变量表 / 操作数栈；递归过深就 SOE', tag: '-Xss' },
				{ label: '本地方法栈', desc: '服务 native 方法，HotSpot 与虚拟机栈合一' },
			],
		},
		{
			title: '线程共享',
			sub: 'GC 主战场',
			icon: '🌍',
			tone: 'green',
			cells: [
				{ label: '堆', desc: '对象实例与数组，分新生代 / 老年代', tag: '-Xms / -Xmx' },
				{ label: '元空间', desc: '类信息，用本地内存；动态生成类易溢出', tag: 'Metaspace' },
				{ label: '运行时常量池', desc: '类常量：字面量 + 符号引用' },
				{ label: '字符串常量池', desc: 'JDK 7 起从方法区移入堆', tag: 'JDK 7' },
			],
		},
		{
			title: '堆外',
			sub: '不受 -Xmx 管',
			icon: '🛰️',
			tone: 'slate',
			cells: [
				{ label: '直接内存', desc: 'NIO / Netty 的堆外缓冲', tag: 'MaxDirectMemorySize' },
				{ label: '排查提醒', desc: '它报 OOM 没有 heap space 字样——别漏了这个大分项' },
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
			icon: '📋',
			tone: 'blue',
			cells: [
				{ label: 'ArrayList', desc: '数组实现，随机访问快，查多改少首选', tag: '查询 O(1)' },
				{ label: 'LinkedList', desc: '双向链表，可当 Deque 用，随机访问慢', tag: '头尾 O(1)' },
				{ label: 'CopyOnWriteArrayList', desc: '写时复制，读多写极少的并发场景', tag: '并发' },
			],
		},
		{
			title: 'Set',
			sub: '不重复',
			icon: '💠',
			tone: 'green',
			cells: [
				{ label: 'HashSet', desc: '哈希表，查重 O(1)，无序' },
				{ label: 'LinkedHashSet', desc: '哈希 + 双向链表，保留插入顺序' },
				{ label: 'TreeSet', desc: '红黑树，按 key 排序' },
			],
		},
		{
			title: 'Queue',
			sub: '队列语义',
			icon: '⏳',
			tone: 'amber',
			cells: [
				{ label: 'ArrayDeque', desc: '双端队列首选，也可当栈用' },
				{ label: 'PriorityQueue', desc: '堆，按优先级出队' },
				{ label: 'ArrayBlockingQueue', desc: '有界阻塞队列，生产者消费者', tag: '并发' },
			],
		},
		{
			title: 'Map',
			sub: '键值对（不属 Collection）',
			icon: '🗝️',
			tone: 'violet',
			cells: [
				{ label: 'HashMap', desc: '数组 + 链表 + 红黑树', tag: '主力' },
				{ label: 'LinkedHashMap', desc: '插入序 / 访问序，LRU 缓存的底座', tag: 'LRU' },
				{ label: 'ConcurrentHashMap', desc: '并发场景，桶级锁', tag: '并发' },
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
			icon: '💥',
			tone: 'rose',
			cells: [
				{ label: '典型', desc: 'OutOfMemoryError / StackOverflowError', tag: '别 catch' },
				{ label: '语义', desc: 'JVM 层面坏了，应用无法恢复' },
				{ label: '处置', desc: '不该 catch——接住也没救' },
			],
		},
		{
			title: '受检异常 Checked',
			sub: 'Exception · 编译器强制处理',
			icon: '🧾',
			tone: 'blue',
			cells: [
				{ label: '典型', desc: 'IOException / SQLException', tag: '必须处理' },
				{ label: '语义', desc: '外部问题，调用方有能力恢复' },
				{ label: '处置', desc: '强制 try/catch 或向上抛' },
			],
		},
		{
			title: 'RuntimeException',
			sub: 'Exception · 编译器不管',
			icon: '🐛',
			tone: 'amber',
			cells: [
				{ label: '典型', desc: 'NPE / 数组越界 / 类型转换', tag: '该修代码' },
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
			icon: '🐢',
			tone: 'slate',
			cells: [
				{ label: '等数据', desc: '线程干等，不让出 CPU' },
				{ label: '搬数据', desc: '内核 → 用户空间，自己读' },
				{ label: '支撑模型', desc: '一连接一线程', tag: '连接 ≈ 线程' },
				{ label: '现状', desc: '长连接场景撑不住' },
			],
		},
		{
			title: 'NIO',
			sub: '同步非阻塞',
			icon: '📡',
			tone: 'green',
			cells: [
				{ label: '等数据', desc: 'read 不死等，Selector 管一片连接' },
				{ label: '搬数据', desc: '还是自己读（Reactor）' },
				{ label: '支撑模型', desc: '多路复用，Linux 底座 epoll', tag: '就绪 O(1)' },
				{ label: '现状', desc: '实战主流，Netty 与 Tomcat 8+ 的基座' },
			],
		},
		{
			title: 'AIO',
			sub: '异步',
			icon: '📬',
			tone: 'teal',
			cells: [
				{ label: '等数据', desc: '发起后直接返回' },
				{ label: '搬数据', desc: '内核搬好再通知（Proactor）' },
				{ label: '支撑模型', desc: '回调 / CompletionHandler' },
				{ label: '现状', desc: '生态弱，Netty 已移除', tag: '理论美' },
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
			sub: '首次把停顿降到毫秒级',
			icon: '🕰️',
			tone: 'amber',
			cells: [
				{ label: '停顿', desc: '并发标记清除，只有两个短 STW 阶段' },
				{ label: '核心技术', desc: '标记与清除阶段和业务线程并发跑' },
				{ label: '代价', desc: '标记-清除碎片；并发失败退化 Serial Old 全停' },
				{ label: '现状', desc: 'JDK 14 移除，并发收集的思想仍在', tag: '谢幕' },
			],
		},
		{
			title: 'G1',
			sub: 'JDK 9 起默认',
			icon: '🗂️',
			tone: 'blue',
			cells: [
				{ label: '停顿', desc: '软目标预测 -XX:MaxGCPauseMillis', tag: '默认 200ms' },
				{ label: '核心技术', desc: 'Region 化堆，按回收收益排序（标记-复制无碎片）' },
				{ label: '代价', desc: 'Remembered Set 堆外维护成本' },
				{ label: '现状', desc: '通用大堆的默认选择，JDK 11+ 不用犹豫' },
			],
		},
		{
			title: 'ZGC',
			sub: 'JDK 15 转正',
			icon: '🚄',
			tone: 'violet',
			cells: [
				{ label: '停顿', desc: '< 1ms 且与堆大小无关，TB 级堆依旧', tag: '亚毫秒' },
				{ label: '核心技术', desc: '染色指针 + 读屏障，标记转移几乎全并发' },
				{ label: '代价', desc: '吞吐略让，内存占用稍高' },
				{ label: '现状', desc: '堆 > 8G 且对延迟极端敏感再上' },
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
			icon: '📞',
			tone: 'blue',
			cells: [
				{ label: '连接', desc: '三次握手建立，一对一' },
				{ label: '可靠有序', desc: '确认 + 重传，不丢不重按序交付' },
				{ label: '数据形态', desc: '字节流，无消息边界 → 粘拆包' },
				{ label: '开销与控制', desc: '头 20~60 字节，有拥塞控制' },
				{ label: '主场', desc: 'HTTP/1.x、HTTP/2、SSH、数据库连接', tag: '要正确' },
			],
		},
		{
			title: 'UDP',
			sub: '无连接',
			icon: '📢',
			tone: 'teal',
			cells: [
				{ label: '连接', desc: '拿起就发，支持广播 / 组播' },
				{ label: '可靠有序', desc: '尽力而为，可能丢 / 重 / 乱' },
				{ label: '数据形态', desc: '数据报，一次一发天然有边界', tag: '不粘包' },
				{ label: '开销与控制', desc: '头固定 8 字节，无拥塞控制' },
				{ label: '主场', desc: 'DNS、DHCP、音视频流；QUIC 在其上自建可靠层', tag: '要快' },
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
			icon: '📸',
			tone: 'blue',
			cells: [
				{ label: '记录什么', desc: '某时刻全量数据的二进制快照', tag: 'bgsave' },
				{ label: '文件', desc: '紧凑、恢复快' },
				{ label: '丢失窗口', desc: '两次快照之间的数据', tag: '窗口大' },
				{ label: '代价', desc: 'fork 瞬间开销，靠写时复制保一致性' },
				{ label: '适合', desc: '冷备、快速恢复、主从全量同步' },
			],
		},
		{
			title: 'AOF',
			sub: '命令追加路线',
			icon: '📜',
			tone: 'green',
			cells: [
				{ label: '记录什么', desc: '每条写命令的文本追加' },
				{ label: '文件', desc: '体积大、恢复慢（逐条重放）；重写压缩体积' },
				{ label: '丢失窗口', desc: '最多 1 秒', tag: 'everysec' },
				{ label: '代价', desc: '持续小幅写入' },
				{ label: '适合', desc: '丢数据敏感的业务；金融级上 always', tag: '丢得少' },
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
