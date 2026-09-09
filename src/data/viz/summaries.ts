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

/** 笔记中可通过 <AlgorithmVizIsland demo="..." /> 引用的总结卡注册表 */
export const summaryDemos: Record<string, SummaryVizConfig> = {
	'spring-vs-boot': springVsBoot,
	'string-family': stringFamily,
	'hashmap-vs-chm': hashmapVsChm,
	'sync-vs-lock': syncVsLock,
	'jvm-memory-areas': jvmMemoryAreas,
};
