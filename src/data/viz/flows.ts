import type { FlowFrame, FlowVizConfig } from '../../components/viz/FlowViz';

/** MySQL 一条 UPDATE 的旅程与两阶段提交：Server 层调度 + InnoDB 落日志 */
function mysqlTwoPhaseCommit(): FlowVizConfig {
	const frames: FlowFrame[] = [];

	frames.push({
		note: "以 UPDATE users SET name = 'xxx' WHERE id = 1 为例，看一条更新语句在 MySQL 内部的完整旅程——以及著名的「两阶段提交」发生在哪一步。",
	});
	frames.push({
		active: ['executor'],
		hotEdges: ['req'],
		packets: [{ edge: 'req', at: 0.32, tone: 'req', label: 'UPDATE' }],
		note: '语句先到 Server 层：连接器负责建连与鉴权，分析器解析 SQL，优化器决定走 id 主键索引，最后由执行器发起真正的取数与写回。',
	});
	frames.push({
		active: ['executor', 'bp'],
		hotEdges: ['eng'],
		packets: [{ edge: 'eng', at: 0.4, tone: 'req', label: '引擎接口' }],
		note: '执行器通过引擎接口调用 InnoDB：按主键 id = 1 定位这行数据所在的数据页。',
	});
	frames.push({
		active: ['bp'],
		done: ['executor'],
		note: '数据页装在 Buffer Pool（内存）里：命中就直接改，未命中会先从磁盘读入内存。找到 id = 1 的行，在内存中把 name 改成新值——这一页成了「脏页」，但事务还不能提交，得先把日志写妥。',
	});
	frames.push({
		active: ['redo'],
		done: ['executor'],
		hotEdges: ['wr'],
		packets: [{ edge: 'wr', at: 0.68, tone: 'data', label: 'redo' }],
		badges: { redo: 'prepare' },
		note: '第一步：InnoDB 写 redo log，记下「哪个数据页哪个偏移改成了什么」，并置为 prepare 状态——崩溃重启后凭它能把这次修改重放出来。',
	});
	frames.push({
		active: ['binlog'],
		done: ['executor'],
		hotEdges: ['wb'],
		packets: [{ edge: 'wb', at: 0.68, tone: 'data', label: 'binlog' }],
		badges: { redo: 'prepare', binlog: '已写入' },
		note: '第二步：回到 Server 层写 binlog，记录这条逻辑操作——主从复制与时点恢复都依赖它。',
	});
	frames.push({
		active: ['redo'],
		done: ['executor'],
		badges: { redo: 'commit', binlog: '已写入' },
		note: '最后一步：redo log 置为 commit。prepare 与 commit 之间夹着 binlog，崩溃恢复时以 binlog 是否完整写入来决定提交还是回滚——两套日志由此绑成一个原子单元，这就是两阶段提交。',
	});
	frames.push({
		active: ['executor'],
		done: ['bp', 'redo', 'binlog'],
		hotEdges: ['req'],
		packets: [{ edge: 'req', at: 0.35, tone: 'resp', label: 'OK' }],
		badges: { redo: 'commit', binlog: '已写入' },
		note: '全部就绪，向客户端返回执行成功。注意此刻 name 的最新值可能还在 Buffer Pool 里，并没有落盘。',
	});
	frames.push({
		active: ['disk'],
		dim: ['executor'],
		hotEdges: ['flush'],
		packets: [{ edge: 'flush', at: 0.62, tone: 'data', label: '脏页' }],
		badges: { redo: 'commit', binlog: '已写入' },
		note: '后台 IO 线程择机把脏页刷回磁盘。就算刷盘前宕机也不怕：重启后 redo 重放，binlog 完整则提交——数据不丢。',
	});
	frames.push({
		done: ['client', 'executor', 'bp', 'disk', 'redo', 'binlog'],
		badges: { redo: 'commit', binlog: '已写入' },
		note: '复盘：一条 UPDATE = Server 层调度 + InnoDB 落日志。redo（物理日志）保崩溃安全，binlog（逻辑日志）保复制与归档，两阶段提交让两者保持一致。',
	});

	return {
		title: '一条 UPDATE 的旅程 · MySQL 两阶段提交',
		height: 440,
		nodes: [
			{ id: 'client', label: '客户端', x: 0.06, y: 0.2 },
			{ id: 'executor', label: '执行器', sub: 'Server 层', x: 0.3, y: 0.2 },
			{ id: 'bp', label: 'Buffer Pool', sub: '内存数据页', x: 0.62, y: 0.2 },
			{ id: 'disk', label: '磁盘', sub: '.ibd 数据页', x: 0.9, y: 0.2, shape: 'cylinder' },
			{ id: 'binlog', label: 'binlog', sub: 'Server 层日志', x: 0.4, y: 0.82, shape: 'doc' },
			{ id: 'redo', label: 'redo log', sub: 'InnoDB 日志', x: 0.64, y: 0.82, shape: 'doc' },
		],
		edges: [
			{ id: 'req', from: 'client', to: 'executor', both: true },
			{ id: 'eng', from: 'executor', to: 'bp', label: '引擎接口' },
			{ id: 'wr', from: 'bp', to: 'redo', label: '写 redo' },
			{ id: 'wb', from: 'executor', to: 'binlog', label: '写 binlog' },
			{ id: 'flush', from: 'bp', to: 'disk', label: '后台刷盘', dashed: true },
		],
		frames,
	};
}

/** TCP 四次挥手：状态机迁移 + TIME_WAIT 为什么等 2MSL、归谁 */
function tcpClose(): FlowVizConfig {
	const frames: FlowFrame[] = [];

	frames.push({
		badges: { cl: 'ESTABLISHED', sv: 'ESTABLISHED' },
		note: '数据传输完毕，开始断开连接。四次挥手任何一方都可以先发起，这里假设客户端主动关——注意最后 TIME_WAIT 落在谁头上。',
	});
	frames.push({
		active: ['cl'],
		hotEdges: ['cs'],
		packets: [{ edge: 'cs', at: 0.5, tone: 'req', label: 'FIN' }],
		badges: { cl: 'FIN_WAIT_1', sv: 'ESTABLISHED' },
		note: '第一次挥手：客户端发 FIN，进入 FIN_WAIT_1——「我这边的数据发完了」。但此刻它仍能收、服务端仍能发，半关闭就由此而来。',
	});
	frames.push({
		active: ['sv'],
		hotEdges: ['sc'],
		packets: [{ edge: 'sc', at: 0.5, tone: 'resp', label: 'ACK' }],
		badges: { cl: 'FIN_WAIT_2', sv: 'CLOSE_WAIT' },
		note: '第二次挥手：服务端回 ACK，自己进入 CLOSE_WAIT；客户端收到后进入 FIN_WAIT_2。连接只是「关了一半」：客户端 → 服务端方向关闭，反方向还在。',
	});
	frames.push({
		active: ['sv'],
		hotEdges: ['sc'],
		packets: [{ edge: 'sc', at: 0.5, tone: 'data', label: '剩余数据' }],
		badges: { cl: 'FIN_WAIT_2', sv: 'CLOSE_WAIT' },
		note: '服务端把没发完的数据继续发完——这正是半关闭存在的意义：先发起关闭的一方，依然能接收对方的数据。',
	});
	frames.push({
		active: ['sv'],
		hotEdges: ['sc'],
		packets: [{ edge: 'sc', at: 0.5, tone: 'req', label: 'FIN' }],
		badges: { cl: 'FIN_WAIT_2', sv: 'LAST_ACK' },
		note: '第三次挥手：数据发完了，服务端发 FIN，进入 LAST_ACK，请求关闭剩下这个方向。',
	});
	frames.push({
		active: ['cl'],
		hotEdges: ['cs'],
		packets: [{ edge: 'cs', at: 0.5, tone: 'resp', label: 'ACK' }],
		badges: { cl: 'TIME_WAIT', sv: 'LAST_ACK' },
		note: '第四次挥手：客户端回最后一个 ACK，但不马上关闭，而是进入 TIME_WAIT，定时 2MSL（报文最大生存时间的两倍）。',
	});
	frames.push({
		badges: { cl: 'TIME_WAIT · 2MSL', sv: 'CLOSED' },
		note: '为什么等 2MSL？① 最后的 ACK 若丢了，服务端会重传 FIN，处于 TIME_WAIT 的客户端还能重答一次；② 让本连接的旧报文在网络中自然消亡，不串扰之后复用相同四元组的新连接。',
	});
	frames.push({
		done: ['cl', 'sv'],
		badges: { cl: 'CLOSED', sv: 'CLOSED' },
		note: '2MSL 到期，客户端也关闭。TIME_WAIT 固定属于主动关闭方——高并发服务上大量 TIME_WAIT 挂在主动断连的那一侧，就是这个机制的直接后果。',
	});

	return {
		title: 'TCP 四次挥手 · 半关闭与 TIME_WAIT 的归属',
		height: 300,
		nodes: [
			{ id: 'cl', label: '客户端', x: 0.12, y: 0.45 },
			{ id: 'sv', label: '服务端', x: 0.88, y: 0.45 },
		],
		edges: [
			{ id: 'sc', from: 'sv', to: 'cl', bend: 64, label: '服务端 → 客户端' },
			{ id: 'cs', from: 'cl', to: 'sv', bend: 64, label: '客户端 → 服务端' },
		],
		frames,
	};
}

/** ES 一次写入到可搜索：buffer/translog → refresh → flush 的完整路径 */
function esWrite(): FlowVizConfig {
	const frames: FlowFrame[] = [];

	frames.push({
		note: '一次写入在 ES 内部怎么变成「可搜索」？refresh / translog / flush / merge 四个动作逐个登场（merge 是后台段合并，本图聚焦前三步）。',
	});
	frames.push({
		active: ['coord'],
		hotEdges: ['req'],
		packets: [{ edge: 'req', at: 0.32, tone: 'req', label: 'index' }],
		note: '客户端把写文档的请求发给任意一个节点，它就是这次的协调节点，负责算路由、定主分片。',
	});
	frames.push({
		active: ['primary'],
		hotEdges: ['route'],
		packets: [{ edge: 'route', at: 0.5, tone: 'req', label: '路由' }],
		note: '协调节点按文档 _id 哈希算出目标分片（建索引时主分片数定死，路由结果稳定），把请求转发给主分片 P0 所在节点。',
	});
	frames.push({
		active: ['pbuf', 'trans'],
		done: ['coord'],
		hotEdges: ['wb', 'wt'],
		packets: [
			{ edge: 'wb', at: 0.5, tone: 'data', label: 'doc' },
			{ edge: 'wt', at: 0.5, tone: 'data', label: '日志' },
		],
		badges: { pbuf: '不可搜' },
		note: '主分片把文档写进内存 buffer，同时追加一条 translog（预写日志）。此刻数据只在内存——按 search 是搜不到的。',
	});
	frames.push({
		active: ['primary'],
		hotEdges: ['repl'],
		packets: [{ edge: 'repl', at: 0.5, tone: 'data', label: 'doc' }],
		badges: { pbuf: '不可搜' },
		note: '主分片把文档并行复制给所有副本分片（组内同步），副本做同样的 buffer + translog 写入。',
	});
	frames.push({
		active: ['replica'],
		hotEdges: ['repl'],
		packets: [{ edge: 'repl', at: 0.82, tone: 'resp', label: 'ACK' }],
		badges: { pbuf: '不可搜' },
		note: '副本写完后向主分片确认；in-sync 副本组全部到位，写才算成功。',
	});
	frames.push({
		active: ['coord'],
		done: ['primary', 'replica'],
		hotEdges: ['route', 'req'],
		packets: [
			{ edge: 'route', at: 0.4, tone: 'resp', label: 'ACK' },
			{ edge: 'req', at: 0.35, tone: 'resp', label: 'OK' },
		],
		badges: { pbuf: '不可搜' },
		note: '确认逐层返回，客户端收到成功。注意：此时文档依然搜不到——成功只代表已进入 buffer 和 translog。',
	});
	frames.push({
		active: ['seg'],
		hotEdges: ['refresh'],
		packets: [{ edge: 'refresh', at: 0.75, tone: 'data', label: 'segment' }],
		badges: { pbuf: '已清空', seg: '可搜索' },
		note: 'refresh（默认每 1s）：buffer 里的文档生成一段不可变的新 segment，放进 filesystem cache——文档从此可被 search。这就是「近实时」（NRT）的含义：最多差一个 refresh 周期。',
	});
	frames.push({
		active: ['disk'],
		hotEdges: ['flush'],
		packets: [{ edge: 'flush', at: 0.55, tone: 'data', label: 'fsync' }],
		badges: { seg: '可搜索', disk: '已持久' },
		note: '后台 flush：内存里的 segment 真正落到磁盘，translog 清空。到这一步数据才算「持久」——宕机后未刷盘的部分靠重放 translog 恢复。',
	});
	frames.push({
		done: ['client', 'coord', 'primary', 'replica', 'seg', 'disk'],
		badges: { seg: '可搜索', disk: '已持久' },
		note: '复盘：refresh 解决「可搜索」，flush 解决「可持久」，后台 merge 负责合并小段、物理清除已删文档——四个动作各管一件事，别混。',
	});

	return {
		title: '一次写入到可搜索 · refresh / translog / flush',
		height: 440,
		nodes: [
			{ id: 'client', label: '客户端', x: 0.05, y: 0.12 },
			{ id: 'coord', label: '协调节点', sub: '算路由', x: 0.27, y: 0.12 },
			{ id: 'primary', label: '主分片 P0', sub: '写入方', x: 0.56, y: 0.12 },
			{ id: 'replica', label: '副本 R0', sub: '同步副本', x: 0.88, y: 0.12 },
			{ id: 'pbuf', label: 'memory buffer', sub: '内存缓冲', x: 0.56, y: 0.52 },
			{ id: 'trans', label: 'translog', sub: '预写日志', x: 0.82, y: 0.52, shape: 'doc' },
			{ id: 'seg', label: 'FS cache', sub: 'filesystem cache · 内存', x: 0.34, y: 0.85, hw: 78 },
			{ id: 'disk', label: '磁盘', sub: 'segment 落盘', x: 0.66, y: 0.85, shape: 'cylinder' },
		],
		edges: [
			{ id: 'req', from: 'client', to: 'coord', both: true },
			{ id: 'route', from: 'coord', to: 'primary', both: true, label: '路由' },
			{ id: 'repl', from: 'primary', to: 'replica', both: true, label: '并行复制' },
			{ id: 'wb', from: 'primary', to: 'pbuf', label: '写 buffer' },
			{ id: 'wt', from: 'primary', to: 'trans', label: '同时写' },
			{ id: 'refresh', from: 'pbuf', to: 'seg', label: 'refresh' },
			{ id: 'flush', from: 'seg', to: 'disk', label: 'flush 落盘' },
		],
		frames,
	};
}

/** Redisson 看门狗：不指定 leaseTime 时的自动续期循环与宕机兜底 */
function redissonWatchdog(): FlowVizConfig {
	const frames: FlowFrame[] = [];

	frames.push({
		note: '锁 TTL 30s、业务要跑 40s——第 31 秒起互斥就破了。看 Redisson 的看门狗怎么让锁「跟着业务续命」，以及为什么进程崩了也不会死锁。',
	});
	frames.push({
		active: ['thread'],
		hotEdges: ['lockop'],
		packets: [{ edge: 'lockop', at: 0.35, tone: 'req', label: 'lock()' }],
		badges: { lock: 'TTL 30s' },
		note: 'lock() 不传 leaseTime：加锁成功，锁 key 的 TTL 默认 30 秒。正因为你没说「多久过期」，Redisson 才认为需要看门狗来管寿命。',
	});
	frames.push({
		active: ['thread'],
		done: ['lock'],
		badges: { lock: 'TTL 30s' },
		note: '业务开始执行。看门狗是同进程里的后台定时任务：每 1/3 TTL（10 秒）检查一次锁的持有状态。',
	});
	frames.push({
		active: ['thread'],
		badges: { lock: 'TTL 14s' },
		note: '业务跑到第 16 秒还没完，TTL 已烧到 14 秒——再不续，锁就要过期，别的客户端就能 lock() 进来了。',
	});
	frames.push({
		active: ['watchdog', 'lock'],
		hotEdges: ['renew'],
		packets: [{ edge: 'renew', at: 0.5, tone: 'data', label: '续期' }],
		badges: { lock: 'TTL 30s' },
		note: '看门狗检查：锁还被自己这个线程持有 → 把 TTL 重置回 30 秒。业务每快到 2/3 点，就会被续满一次。',
	});
	frames.push({
		active: ['thread'],
		badges: { lock: 'TTL 30s' },
		note: '业务继续跑，看门狗循环续期——锁不会中途被抢，也不会因为写死的 TTL 提前释放，互斥性由「续命」保住。',
	});
	frames.push({
		active: ['thread'],
		hotEdges: ['lockop'],
		packets: [{ edge: 'lockop', at: 0.4, tone: 'resp', label: 'unlock()' }],
		badges: { lock: '已释放' },
		note: 'finally 里 unlock()：锁 key 删除，看门狗随之停止续期。所以 unlock 一定要放在 finally——不释放的话续期不会停。',
	});
	frames.push({
		dim: ['thread', 'watchdog'],
		badges: { lock: 'lock(10, SECONDS)' },
		note: '反面对照：一旦显式指定 leaseTime（如 lock(10, SECONDS)），看门狗就不启动——TTL 钉死 10 秒，业务没跑完锁照样失效。',
	});
	frames.push({
		dim: ['thread', 'watchdog'],
		badges: { lock: '30s 后自动释放' },
		note: '进程宕机：看门狗随进程消失，没人续期，锁最长 30 秒后自动过期——不会死锁；代价是这 30 秒内其他客户端必须等。',
	});

	return {
		title: 'Redisson 看门狗 · 锁的自动续期与兜底',
		height: 380,
		nodes: [
			{ id: 'thread', label: '业务线程', x: 0.13, y: 0.3 },
			{ id: 'lock', label: '锁 key', sub: 'Redis', x: 0.52, y: 0.3, shape: 'cylinder' },
			{ id: 'watchdog', label: '看门狗', sub: '同进程定时任务', x: 0.84, y: 0.74 },
		],
		edges: [
			{ id: 'lockop', from: 'thread', to: 'lock', both: true, label: 'lock() / unlock()' },
			{ id: 'renew', from: 'watchdog', to: 'lock', label: '每 10s 检查续期', labelAt: 0.78 },
		],
		frames,
	};
}

/** Kafka 分区 = segment 文件串：追加、滚动、按 offset 读、整段删除 */
function kafkaSegment(): FlowVizConfig {
	const frames: FlowFrame[] = [];

	frames.push({
		dim: ['seg3'],
		badges: { seg2: 'active' },
		note: '分区在磁盘上是一串按「起始 offset」命名的 segment 文件，只追加、永不改写。看一段消息的生命周期：写入 → 滚动 → 读取 → 过期删除。',
	});
	frames.push({
		hotEdges: ['send'],
		packets: [{ edge: 'send', at: 0.4, tone: 'req', label: 'batch' }],
		dim: ['seg3'],
		badges: { seg2: 'active' },
		note: '生产者把消息批次发进 topic-a 的 0 号分区——分区的磁盘目录就是下面这一排 segment 文件。',
	});
	frames.push({
		active: ['seg2'],
		hotEdges: ['w2'],
		packets: [{ edge: 'w2', at: 0.5, tone: 'data', label: 'append' }],
		dim: ['seg3'],
		badges: { seg2: 'active' },
		note: '写入永远落在 active segment 的文件尾：纯顺序追加。磁盘顺序写接近内存随机写的速度，这是 Kafka 吞吐的物理根基。',
	});
	frames.push({
		active: ['cons', 'idx'],
		hotEdges: ['read'],
		packets: [{ edge: 'read', at: 0.4, tone: 'req', label: 'offset 358000' }],
		dim: ['seg3'],
		badges: { seg2: 'active' },
		note: '消费时按 offset 取：先查稀疏索引——每个 segment 只为少量消息建索引条目，用「找起点 + 顺序扫」定位数据。',
	});
	frames.push({
		active: ['seg1'],
		hotEdges: ['idxb'],
		packets: [{ edge: 'idxb', at: 0.5, tone: 'resp', label: '定位' }],
		dim: ['seg3'],
		badges: { seg2: 'active' },
		note: '稀疏索引答出「offset 358000 在 segment 1 的某个位置附近」，从这里顺序读到目标消息。索引小、查找快，代价只是定位后多扫几条。',
	});
	frames.push({
		active: ['seg3'],
		hotEdges: ['w3'],
		packets: [{ edge: 'w3', at: 0.5, tone: 'data', label: 'append' }],
		done: ['seg2'],
		badges: { seg2: 'sealed', seg3: 'active' },
		note: 'seg2 写满（log.segment.bytes 或滚动时间到）→ 封口变只读，分区滚动出新 active segment，写入换到新尾巴。整段封口，不改动任何旧数据。',
	});
	frames.push({
		dim: ['seg0'],
		done: ['seg2'],
		badges: { seg0: '已删除', seg2: 'sealed', seg3: 'active' },
		note: 'retention 时间到（log.retention.*）：清理线程直接删掉最旧的 segment 0 整个文件——过期清理以「文件」为单位，不做逐条删除，O(1)。',
	});
	frames.push({
		dim: ['seg0', 'seg1'],
		done: ['seg2'],
		badges: { seg0: '已删除', seg1: '已删除', seg2: 'sealed', seg3: 'active' },
		note: 'segment 1 同样整段删除。复盘：顺序追加 + 分段滚动 + 稀疏索引 + 文件级删除，四个机制合起来就是「写得快、读得不慢、清得便宜」。',
	});

	return {
		title: '分区 = segment 文件串 · 写入 / 滚动 / 读取 / 清理',
		height: 400,
		nodes: [
			{ id: 'producer', label: '生产者', x: 0.05, y: 0.16 },
			{ id: 'dir', label: '分区目录', sub: 'topic-a / 0', x: 0.3, y: 0.16 },
			{ id: 'idx', label: '稀疏索引', sub: 'offset → 位置', x: 0.64, y: 0.16, shape: 'doc' },
			{ id: 'cons', label: '消费者', x: 0.95, y: 0.16 },
			{ id: 'seg0', label: 'segment 0', sub: '起始 offset 0', x: 0.16, y: 0.78 },
			{ id: 'seg1', label: 'segment 1', sub: '起始 offset 357', x: 0.38, y: 0.78 },
			{ id: 'seg2', label: 'segment 2', sub: '起始 offset 359', x: 0.6, y: 0.78 },
			{ id: 'seg3', label: 'segment 3', sub: '新滚动段', x: 0.82, y: 0.78 },
		],
		edges: [
			{ id: 'send', from: 'producer', to: 'dir' },
			{ id: 'w2', from: 'dir', to: 'seg2' },
			{ id: 'w3', from: 'dir', to: 'seg3' },
			{ id: 'read', from: 'cons', to: 'idx', label: '按 offset 查', labelAt: 0.5 },
			{ id: 'idxb', from: 'idx', to: 'seg1', label: '定位段与位置', labelAt: 0.78 },
		],
		frames,
	};
}

/** JVM 类加载五阶段：准备期的零值与初始化的加锁是两处反直觉点 */
function javaClassLoading(): FlowVizConfig {
	const frames: FlowFrame[] = [];

	frames.push({
		note: '类从字节码到可用的前五个阶段：加载 → 验证 → 准备 → 解析 → 初始化（使用与卸载在后）。走一遍，重点看两处反直觉：准备期的「零值」与初始化的「加锁」。',
	});
	frames.push({
		active: ['load'],
		hotEdges: ['el'],
		packets: [{ edge: 'el', at: 0.5, tone: 'data', label: '字节流' }],
		note: '加载：ClassLoader 读入字节流（磁盘 class / jar / 网络 / 动态代理生成），在方法区建立类结构，并在堆里生成对应的 Class 对象。',
	});
	frames.push({
		active: ['verify'],
		hotEdges: ['ev'],
		packets: [{ edge: 'ev', at: 0.5, tone: 'data', label: '安检' }],
		done: ['load'],
		note: '验证：格式、语义、字节码、符号引用四道安检——恶意或残缺的字节码在这里被拒之门外，别让一段字节码把 JVM 弄垮。',
	});
	frames.push({
		active: ['prepare'],
		hotEdges: ['ep'],
		packets: [{ edge: 'ep', at: 0.5, tone: 'data', label: '分配' }],
		done: ['load', 'verify'],
		badges: { prepare: 'a = 0' },
		note: '准备：为静态变量分配内存并设零值——`static int a = 1` 此刻 a = 0，真正的 1 要等初始化。final 常量是例外：ConstantValue 属性让它直接赋真值。',
	});
	frames.push({
		active: ['resolve'],
		hotEdges: ['pr'],
		packets: [{ edge: 'pr', at: 0.5, tone: 'data', label: '替换' }],
		done: ['load', 'verify', 'prepare'],
		note: '解析：把常量池里的符号引用换成直接引用。这一步可以推迟到运行期做——多态与动态绑定就靠它留出的弹性。',
	});
	frames.push({
		active: ['init'],
		hotEdges: ['ri'],
		packets: [{ edge: 'ri', at: 0.5, tone: 'data', label: '<clinit>' }],
		done: ['load', 'verify', 'prepare'],
		badges: { init: 'a = 1 · 只跑一次' },
		note: '初始化：执行 <clinit>()——静态变量真正赋值、static 块运行，此刻 a 才变成 1。JVM 对 <clinit> 加锁，天然保证线程安全的懒加载。',
	});
	frames.push({
		done: ['load', 'verify', 'prepare', 'resolve', 'init'],
		badges: { prepare: 'a = 0', init: 'a = 1 · 只跑一次' },
		note: '触发时机是「主动引用」：new、读写非 final 静态成员、反射、初始化子类连带父类等；定义类数组、引用 final 常量这类被动引用不触发。',
	});

	return {
		title: '类加载五阶段 · 零值陷阱与 <clinit> 加锁',
		height: 380,
		nodes: [
			{ id: 'cfile', label: '.class 文件', x: 0.07, y: 0.16, shape: 'doc' },
			{ id: 'load', label: '加载', sub: 'Loading', x: 0.3, y: 0.16 },
			{ id: 'verify', label: '验证', sub: 'Verification', x: 0.53, y: 0.16 },
			{ id: 'prepare', label: '准备', sub: 'Preparation', x: 0.76, y: 0.16 },
			{ id: 'resolve', label: '解析', sub: 'Resolution', x: 0.76, y: 0.76 },
			{ id: 'init', label: '初始化', sub: '<clinit>', x: 0.46, y: 0.76 },
		],
		edges: [
			{ id: 'el', from: 'cfile', to: 'load' },
			{ id: 'ev', from: 'load', to: 'verify' },
			{ id: 'ep', from: 'verify', to: 'prepare' },
			{ id: 'pr', from: 'prepare', to: 'resolve' },
			{ id: 'ri', from: 'resolve', to: 'init' },
		],
		frames,
	};
}

/** Kafka send() 双线程旅程：主线程攒批、Sender 发送、acks 定「谁回了才算数」 */
function kafkaProducerPath(): FlowVizConfig {
	const frames: FlowFrame[] = [];

	frames.push({
		note: 'send() 返回 ≠ 发送成功——主线程只做三件事：序列化、选分区、入内存缓冲；真正的网络发送由 Sender 线程批量做。',
	});
	frames.push({
		active: ['send'],
		note: '主线程：序列化 key/value → 按三规则选分区（指定 partition > hash(key) > 粘性分区），然后 send() 直接返回 Future——全程纯内存，不碰网络。',
	});
	frames.push({
		active: ['acc'],
		hotEdges: ['enq'],
		packets: [{ edge: 'enq', at: 0.5, tone: 'data', label: 'batch' }],
		note: '消息进累加器：每个分区一个双端队列攒批（batch.size 攒满或 linger.ms 到期才发）——这是吞吐与延迟之间最直接的旋钮。',
	});
	frames.push({
		active: ['sender'],
		hotEdges: ['drain'],
		packets: [{ edge: 'drain', at: 0.5, tone: 'data', label: '整批' }],
		done: ['acc'],
		note: 'Sender 线程（IO 线程）把各分区凑好的批一次性取出发走——主线程与网络 IO 彻底解耦，互不拖累。',
	});
	frames.push({
		active: ['leader'],
		hotEdges: ['deliver'],
		packets: [{ edge: 'deliver', at: 0.5, tone: 'data', label: '批发送' }],
		done: ['acc', 'send'],
		note: 'Sender 把批发往分区 Leader，Leader 追加到本地日志。',
	});
	frames.push({
		active: ['isr'],
		hotEdges: ['repl'],
		packets: [{ edge: 'repl', at: 0.5, tone: 'data', label: '同步' }],
		done: ['acc', 'send'],
		note: 'acks = all 时，Leader 等 ISR 里所有副本都拉到这批消息才确认；acks = 0 / 1 / all 决定「谁回了才算数」——也决定了丢数据的窗口。',
	});
	frames.push({
		active: ['send'],
		done: ['acc', 'leader', 'isr'],
		hotEdges: ['repl', 'deliver', 'enq'],
		packets: [
			{ edge: 'repl', at: 0.2, tone: 'resp', label: 'ACK' },
			{ edge: 'deliver', at: 0.3, tone: 'resp', label: 'ACK' },
			{ edge: 'enq', at: 0.3, tone: 'resp', label: 'OK' },
		],
		note: '确认沿路返回，Future 完成、回调触发；失败则按 retries 重试——开幂等（enable.idempotence）后重试不重、不乱序。',
	});
	frames.push({
		done: ['send', 'acc', 'sender', 'leader', 'isr'],
		note: '复盘：双线程 + 按分区攒批 + acks 三档。排障时「消息丢了/重了/乱了」都能沿这条路径定位到具体环节。',
	});

	return {
		title: 'send() 的旅程 · 主线程攒批，Sender 发送',
		height: 400,
		nodes: [
			{ id: 'send', label: 'producer.send()', x: 0.08, y: 0.2, hw: 80 },
			{ id: 'acc', label: '累加器', sub: '按分区攒批', x: 0.38, y: 0.2 },
			{ id: 'sender', label: 'Sender 线程', sub: 'IO 线程', x: 0.66, y: 0.2 },
			{ id: 'leader', label: '分区 Leader', sub: '追加日志', x: 0.5, y: 0.75 },
			{ id: 'isr', label: 'ISR 副本', sub: '同步副本', x: 0.82, y: 0.75 },
		],
		edges: [
			{ id: 'enq', from: 'send', to: 'acc', both: true, label: '入缓冲区' },
			{ id: 'drain', from: 'acc', to: 'sender', label: '批量取出' },
			{ id: 'deliver', from: 'sender', to: 'leader', both: true },
			{ id: 'repl', from: 'leader', to: 'isr', both: true, label: 'acks 同步', labelAt: 0.28 },
		],
		frames,
	};
}

/** Redis 哨兵故障转移：主观/客观下线 → 选 leader → 挑新主 → 收尾 */
function redisSentinel(): FlowVizConfig {
	const frames: FlowFrame[] = [];

	frames.push({
		badges: { master: '在线' },
		note: '主从复制只解决「数据有备份」，主库挂了仍要人工切换。哨兵集群把这件事自动化：监控、裁决、选主——看一次完整的故障转移。',
	});
	frames.push({
		active: ['s2'],
		hotEdges: ['ping'],
		packets: [{ edge: 'ping', at: 0.5, tone: 'req', label: 'PING' }],
		badges: { master: '无响应' },
		note: '每个哨兵每秒 ping 主库与所有从库；超过 down-after-milliseconds 没回应，哨兵 2 把主库标记为「主观下线」——只是它一个人的判断。',
	});
	frames.push({
		active: ['s2'],
		hotEdges: ['ask1', 'ask2'],
		packets: [
			{ edge: 'ask1', at: 0.5, tone: 'req', label: 'SDOWN?' },
			{ edge: 'ask2', at: 0.5, tone: 'req', label: 'SDOWN?' },
		],
		badges: { master: '主观下线' },
		note: '主观下线不算数：它去问其他哨兵「你们也觉得主库挂了？」——避免单个哨兵误判（网络抖动、自身阻塞）。',
	});
	frames.push({
		active: ['s1', 's3'],
		hotEdges: ['ask1', 'ask2'],
		packets: [
			{ edge: 'ask1', at: 0.75, tone: 'resp', label: '同意' },
			{ edge: 'ask2', at: 0.75, tone: 'resp', label: '同意' },
		],
		badges: { master: '客观下线' },
		note: '同意数 ≥ quorum → 「客观下线」成立。注意两个门槛的分工：quorum 只管认定下线；下一步选 leader 必须过半（majority）——所以哨兵要奇数个、至少 3 个。',
	});
	frames.push({
		active: ['s2'],
		badges: { s2: 'leader', master: '客观下线' },
		note: '哨兵之间选 leader 执行切换（Raft 式拉票，过半当选）。哨兵 2 拿到过半票，负责这次故障转移。',
	});
	frames.push({
		active: ['slaveA'],
		hotEdges: ['cmdA'],
		packets: [{ edge: 'cmdA', at: 0.5, tone: 'req', label: '晋升' }],
		badges: { s2: 'leader', master: '客观下线', slaveA: '新主库' },
		note: 'leader 挑新主：先排除断线/延迟大的，再按 replica-priority 优先级 → 复制 offset 最新 → runid 最小排序。从库 A 胜出，晋升为主库。',
	});
	frames.push({
		active: ['slaveB'],
		hotEdges: ['cmdB'],
		packets: [{ edge: 'cmdB', at: 0.5, tone: 'req', label: 'replicaof' }],
		badges: { s2: 'leader', slaveA: '新主库' },
		note: '其余从库改挂新主：从库 B 收到 replicaof 指令，开始向 A 同步；新主地址发布出去，客户端重连。',
	});
	frames.push({
		dim: ['master'],
		badges: { s2: 'leader', slaveA: '新主库', master: '降级为从库' },
		note: '旧主如果只是「卡了」后来恢复，会被降级为从库——分区期间它收到的新写入会被清空重同步，这就是脑裂残留风险（min-replicas-to-write 可收紧窗口）。',
	});
	frames.push({
		done: ['s1', 's2', 's3', 'slaveA', 'slaveB'],
		badges: { slaveA: '新主库', master: '降级为从库' },
		note: '复盘：监控（每秒 ping）→ 裁决（主观 → 客观下线）→ 选主（过半 leader + 四条挑选规则）。quorum 定下线、majority 定 leader，两个数别混。',
	});

	return {
		title: '哨兵故障转移 · 主观/客观下线与选主',
		height: 430,
		nodes: [
			{ id: 's1', label: '哨兵 1', x: 0.07, y: 0.14 },
			{ id: 's2', label: '哨兵 2', x: 0.29, y: 0.14 },
			{ id: 's3', label: '哨兵 3', x: 0.51, y: 0.14 },
			{ id: 'master', label: '主库', sub: 'M1', x: 0.2, y: 0.72, shape: 'cylinder' },
			{ id: 'slaveA', label: '从库 A', sub: 'R1', x: 0.55, y: 0.72, shape: 'cylinder' },
			{ id: 'slaveB', label: '从库 B', sub: 'R2', x: 0.87, y: 0.72, shape: 'cylinder' },
		],
		edges: [
			{ id: 'ping', from: 's2', to: 'master', label: '每秒 ping' },
			{ id: 'ask1', from: 's1', to: 's2', both: true },
			{ id: 'ask2', from: 's1', to: 's3', both: true },
			{ id: 'cmdM', from: 's2', to: 'master', dashed: true },
			{ id: 'cmdA', from: 's2', to: 'slaveA' },
			{ id: 'cmdB', from: 's2', to: 'slaveB' },
			{ id: 'replA', from: 'master', to: 'slaveA', dashed: true, label: '复制' },
			{ id: 'replB', from: 'master', to: 'slaveB', dashed: true, label: '复制' },
		],
		frames,
	};
}

/** MySQL 主从复制：三个线程 + 两份日志，异步与半同步的差别 */
function mysqlReplication(): FlowVizConfig {
	const frames: FlowFrame[] = [];

	frames.push({
		note: '主从复制的骨架是「三个线程 + 两份日志」：主库 dump 推送、从库 IO 接收、SQL 重放。看一条更新怎么传播到从库。',
	});
	frames.push({
		active: ['master'],
		note: '业务写入在主库执行：事务提交时把变更顺序写入 binlog——它是复制的唯一数据源（row 格式记录行变更前后镜像）。',
	});
	frames.push({
		active: ['binlog'],
		hotEdges: ['wb'],
		packets: [{ edge: 'wb', at: 0.5, tone: 'data', label: '事件' }],
		done: ['master'],
		note: 'binlog 落盘后，主库的 dump 线程随时待命，把它推送给每一台从库。',
	});
	frames.push({
		hotEdges: ['dump'],
		packets: [{ edge: 'dump', at: 0.5, tone: 'data', label: 'binlog 流' }],
		done: ['master', 'binlog'],
		note: 'dump 线程持续推送 binlog 事件。断线重连时按 GTID / 位点续传——不重复、不丢失。',
	});
	frames.push({
		active: ['relay'],
		hotEdges: ['io'],
		packets: [{ edge: 'io', at: 0.5, tone: 'data' }],
		done: ['master', 'binlog'],
		note: '从库 IO 线程接收事件，先写入本地 relay log（中继日志）——接收与重放解耦，网络抖动不会阻塞主库。',
	});
	frames.push({
		active: ['slave'],
		hotEdges: ['sql'],
		packets: [{ edge: 'sql', at: 0.5, tone: 'data', label: '重放' }],
		done: ['master', 'binlog', 'relay'],
		note: 'SQL 线程重放 relay log，把变更应用到从库数据——追平后延迟归零，读写分离的读流量才安全。',
	});
	frames.push({
		done: ['master', 'binlog', 'relay'],
		badges: { slave: '延迟 N 秒' },
		note: '默认异步：主库提交即返回、不等从库——主从延迟由此而来。大事务、从库单线程重放慢都是延迟放大器。',
	});
	frames.push({
		done: ['master', 'binlog', 'relay', 'slave'],
		badges: { slave: '已收到' },
		note: '半同步是折中：至少 1 个从库「收到」binlog 主库才返回——吞吐降一点，换主从切换时不丢刚提交的事务。',
	});

	return {
		title: '主从复制 · dump 推送 → IO 接收 → SQL 重放',
		height: 400,
		nodes: [
			{ id: 'master', label: '主库', sub: '业务写入', x: 0.24, y: 0.24, shape: 'cylinder' },
			{ id: 'binlog', label: 'binlog', sub: '主库日志', x: 0.24, y: 0.78, shape: 'doc' },
			{ id: 'slave', label: '从库', sub: '重放写入', x: 0.78, y: 0.24, shape: 'cylinder' },
			{ id: 'relay', label: 'relay log', sub: '中继日志', x: 0.78, y: 0.78, shape: 'doc' },
		],
		edges: [
			{ id: 'wb', from: 'master', to: 'binlog', label: '写 binlog' },
			{ id: 'dump', from: 'binlog', to: 'slave', label: 'Dump 线程推送' },
			{ id: 'io', from: 'slave', to: 'relay', label: 'IO 线程写入', bend: 44, labelAt: 0.3 },
			{ id: 'sql', from: 'relay', to: 'slave', label: 'SQL 线程重放', bend: 44, labelAt: 0.12 },
		],
		frames,
	};
}

/** ZooKeeper ZAB：Leader 排序广播、过半提交与崩溃恢复选主 */
function zkZab(): FlowVizConfig {
	const frames: FlowFrame[] = [];

	frames.push({
		note: 'ZAB 的写流程一句话：Leader 排序 → 广播 Proposal → 过半 ACK → 提交。注意是「过半」而非全部——少数派挂掉集群照常写。',
	});
	frames.push({
		active: ['leader'],
		hotEdges: ['req'],
		packets: [{ edge: 'req', at: 0.5, tone: 'req', label: '写' }],
		note: '写请求由 Leader 统一处理（客户端连到 Follower 也会被转发过去），Leader 给每个写分配全局唯一递增的 zxid。',
	});
	frames.push({
		active: ['f1', 'f2'],
		hotEdges: ['p1', 'p2'],
		packets: [
			{ edge: 'p1', at: 0.5, tone: 'data', label: 'Proposal' },
			{ edge: 'p2', at: 0.5, tone: 'data', label: 'Proposal' },
		],
		done: [],
		note: 'Leader 把写操作作为 Proposal 按zxid 顺序广播给所有 Follower，各自追加事务日志并落盘。',
	});
	frames.push({
		active: ['f1', 'f2'],
		hotEdges: ['p1', 'p2'],
		packets: [
			{ edge: 'p1', at: 0.2, tone: 'resp', label: 'ACK' },
			{ edge: 'p2', at: 0.2, tone: 'resp', label: 'ACK' },
		],
		note: 'Follower 落盘成功后回 ACK——这一步是「我已持久化」，不是「已对客户端可见」。',
	});
	frames.push({
		active: ['leader'],
		note: '过半 ACK 到齐（3 台里 2 台）→ Leader 先本地提交，再向所有节点广播 COMMIT。',
	});
	frames.push({
		active: ['f1', 'f2'],
		hotEdges: ['p1', 'p2'],
		packets: [
			{ edge: 'p1', at: 0.85, tone: 'req', label: 'COMMIT' },
			{ edge: 'p2', at: 0.85, tone: 'req', label: 'COMMIT' },
		],
		done: ['f1', 'f2'],
		note: 'Follower 应用变更，Leader 响应客户端。所有客户端看到的写顺序一致——顺序一致性由 zxid 全序保证。',
	});
	frames.push({
		dim: ['leader'],
		badges: { f1: '候选 · zxid 最大' },
		note: 'Leader 宕机 → 崩溃恢复：剩余节点投票，zxid 最大（数据最新）者当选新 Leader。已过半提交的写不会丢，未过半的会被丢弃。',
	});
	frames.push({
		done: ['f1', 'f2'],
		badges: { f1: '新 Leader' },
		note: '新 Leader 先同步数据再继续服务。ZAB = 消息广播（过半复制）+ 崩溃恢复（选主同步）两个模式的循环，与 Raft 思想同源。',
	});

	return {
		title: 'ZAB 写流程 · 过半提交与崩溃恢复',
		height: 380,
		nodes: [
			{ id: 'client', label: '客户端', x: 0.06, y: 0.2 },
			{ id: 'leader', label: 'Leader', sub: '排序 + 广播', x: 0.5, y: 0.2 },
			{ id: 'f1', label: 'Follower 1', x: 0.3, y: 0.75 },
			{ id: 'f2', label: 'Follower 2', x: 0.72, y: 0.75 },
		],
		edges: [
			{ id: 'req', from: 'client', to: 'leader', both: true },
			{ id: 'p1', from: 'leader', to: 'f1', both: true },
			{ id: 'p2', from: 'leader', to: 'f2', both: true },
		],
		frames,
	};
}

/** Seata AT 模式：一阶段本地提交 + 全局锁，二阶段异步删日志/反向补偿 */
function seataAt(): FlowVizConfig {
	const frames: FlowFrame[] = [];

	frames.push({
		note: 'Seata AT 的目标：分布式事务写起来像本地事务。三个角色：TM 发起全局事务、TC 记账协调、RM 管分支。关键设计——一阶段就提交本地事务。',
	});
	frames.push({
		active: ['tm'],
		hotEdges: ['begin'],
		packets: [{ edge: 'begin', at: 0.5, tone: 'req', label: 'begin' }],
		note: '@GlobalTransactional 开启全局事务：TM 向 TC 申请，拿到全局唯一的 XID，随调用链向下游传播。',
	});
	frames.push({
		active: ['a'],
		hotEdges: ['call1'],
		packets: [{ edge: 'call1', at: 0.5, tone: 'req', label: 'update' }],
		done: ['tm'],
		note: '调用分支一：RM 代理拦截 SQL，解析出 before / after 镜像，生成 undo log——这是回滚的全部依据。',
	});
	frames.push({
		active: ['a'],
		done: ['tm'],
		badges: { a: '本地已提交' },
		note: '一阶段即提交本地事务：行锁当场释放，只给 TC 留一把「全局锁」防止别的全局事务脏写同一行。AT 的性能优势就在这——不等二阶段。',
	});
	frames.push({
		active: ['b'],
		hotEdges: ['call2'],
		packets: [{ edge: 'call2', at: 0.5, tone: 'req', label: 'update' }],
		badges: { a: '本地已提交' },
		note: '分支二同样处理：undo log + 全局锁 + 本地提交，并向 TC 注册分支、汇报状态。',
	});
	frames.push({
		active: ['tc'],
		hotEdges: ['reg1', 'reg2'],
		packets: [
			{ edge: 'reg1', at: 0.3, tone: 'resp', label: '状态' },
			{ edge: 'reg2', at: 0.3, tone: 'resp', label: '状态' },
		],
		badges: { a: '本地已提交', b: '本地已提交' },
		note: 'TM 告诉 TC：全局提交。二阶段是异步的——各 RM 收到通知后删掉 undo log 即可，几乎零成本。',
	});
	frames.push({
		done: ['tm', 'a', 'b', 'tc'],
		hotEdges: ['reg1', 'reg2'],
		packets: [
			{ edge: 'reg1', at: 0.7, tone: 'req', label: '删日志' },
			{ edge: 'reg2', at: 0.7, tone: 'req', label: '删日志' },
		],
		badges: { a: '已清理', b: '已清理' },
		note: '若任一分支失败：TM 通知 TC 全局回滚，TC 通知各 RM 按 undo log 的 before 镜像反向补偿——前提是那行数据没被绕开全局锁动过（脏写需人工介入）。',
	});
	frames.push({
		done: ['tm', 'a', 'b', 'tc'],
		badges: { a: '已清理', b: '已清理' },
		note: '复盘：一阶段本地提交（性能）+ 全局锁（防脏写）+ 二阶段异步清理/反向补偿（最终一致）。AT 不是 2PC——资源锁在本地提交时就放了。',
	});

	return {
		title: 'Seata AT · 一阶段提交，二阶段补偿',
		height: 390,
		nodes: [
			{ id: 'tm', label: '业务服务', sub: 'TM · 发起方', x: 0.14, y: 0.18 },
			{ id: 'tc', label: 'TC 协调器', sub: '全局事务状态表', x: 0.52, y: 0.18 },
			{ id: 'a', label: '账户服务', sub: 'RM · 分支一', x: 0.3, y: 0.75 },
			{ id: 'b', label: '库存服务', sub: 'RM · 分支二', x: 0.74, y: 0.75 },
		],
		edges: [
			{ id: 'begin', from: 'tm', to: 'tc', label: '开启全局事务' },
			{ id: 'call1', from: 'tm', to: 'a', both: true },
			{ id: 'call2', from: 'tm', to: 'b', both: true },
			{ id: 'reg1', from: 'a', to: 'tc', both: true, label: '注册/汇报' },
			{ id: 'reg2', from: 'b', to: 'tc', both: true, label: '注册/汇报' },
		],
		frames,
	};
}

/** RocketMQ 事务消息：半消息 → 本地事务 → commit/rollback → 回查兜底 */
function rocketmqTx(): FlowVizConfig {
	const frames: FlowFrame[] = [];

	frames.push({
		badges: { broker: '空' },
		note: '本地消息表要建表 + 扫表，RocketMQ 把它内建成协议：半消息 + 本地事务 + 回查。以「下单扣库存」为例看最终一致怎么达成。',
	});
	frames.push({
		active: ['p'],
		hotEdges: ['hb'],
		packets: [{ edge: 'hb', at: 0.35, tone: 'req', label: '半消息' }],
		badges: { broker: '半消息 · 不可见' },
		note: '先发半消息到 Broker：消息已存储但对消费者不可见。拿到「半消息 OK」后，才开始执行本地事务。',
	});
	frames.push({
		active: ['p'],
		badges: { broker: '半消息 · 不可见' },
		note: '执行本地事务：订单落库。半消息把「要不要投递」的悬念锁住——本地事务没定论之前，下游谁也看不见这条消息。',
	});
	frames.push({
		active: ['p'],
		hotEdges: ['hb'],
		packets: [{ edge: 'hb', at: 0.7, tone: 'data', label: 'commit' }],
		badges: { broker: '消息转正' },
		done: ['p'],
		note: '本地事务成功 → 向 Broker 发 commit：半消息转正，消费者可见。「没下单就不扣库存」由此保证。',
	});
	frames.push({
		active: ['consumer'],
		hotEdges: ['deliver'],
		packets: [{ edge: 'deliver', at: 0.5, tone: 'data', label: '扣库存' }],
		badges: { broker: '消息转正' },
		done: ['p', 'broker'],
		note: '消息正常投递，库存服务消费——链路闭合。若本地事务失败则发 rollback，半消息直接删除，消费者永远看不到。',
	});
	frames.push({
		hotEdges: ['check'],
		packets: [{ edge: 'check', at: 0.5, tone: 'req', label: '回查' }],
		badges: { broker: '等待确认' },
		note: '生产者宕机、commit 丢了怎么办？Broker 收不到二次确认时定时「回查」生产者：这笔半消息的本地事务到底成没成？',
	});
	frames.push({
		active: ['p'],
		hotEdges: ['check'],
		packets: [{ edge: 'check', at: 0.25, tone: 'resp', label: 'commit' }],
		badges: { broker: '消息转正' },
		note: '生产者查本地订单表给出答案，Broker 据此转正或删除——回查机制就是事务消息比本地消息表省事的全部秘密。',
	});
	frames.push({
		done: ['p', 'broker', 'consumer'],
		badges: { broker: '消息转正' },
		note: '复盘：半消息（先锁悬念）→ 本地事务（定论）→ commit/rollback（转正/删除）→ 回查（兜底）。强一致留给 Seata，最终一致这类场景交给事务消息。',
	});

	return {
		title: 'RocketMQ 事务消息 · 半消息与回查',
		height: 300,
		nodes: [
			{ id: 'p', label: '生产者', sub: '订单服务 · 本地事务', x: 0.13, y: 0.3 },
			{ id: 'broker', label: 'Broker', sub: '半消息暂存', x: 0.5, y: 0.3, shape: 'cylinder' },
			{ id: 'consumer', label: '消费者', sub: '库存服务', x: 0.88, y: 0.3 },
		],
		edges: [
			{ id: 'hb', from: 'p', to: 'broker', both: true, bend: 42 },
			{ id: 'check', from: 'broker', to: 'p', dashed: true, bend: 42, label: '⑤ 定时回查', labelAt: 0.5 },
			{ id: 'deliver', from: 'broker', to: 'consumer', label: '④ 投递' },
		],
		frames,
	};
}

/** TLS 1.2 握手：交换随机数 → 验证书 → 公钥搬预主密钥 → 对称加密 */
function tlsHandshake(): FlowVizConfig {
	const frames: FlowFrame[] = [];

	frames.push({
		badges: { client: '明文 HTTP', server: '明文 HTTP' },
		note: 'HTTPS = HTTP + TLS：加密防窃听、证书防冒充、校验防篡改。看 TLS 1.2 怎么把一条「裸奔」连接变成加密通道。',
	});
	frames.push({
		active: ['client'],
		hotEdges: ['c2s'],
		packets: [{ edge: 'c2s', at: 0.5, tone: 'req', label: 'ClientHello' }],
		badges: { client: '明文 HTTP', server: '明文 HTTP' },
		note: '客户端问候：带一个随机数 + 支持的密码套件列表（TLS 版本、可用的加密算法组合）。',
	});
	frames.push({
		active: ['server'],
		hotEdges: ['s2c'],
		packets: [{ edge: 's2c', at: 0.5, tone: 'data', label: '证书链' }],
		badges: { client: '明文 HTTP', server: '明文 HTTP' },
		note: '服务端回应：自己的随机数、从套件列表里选定的算法，以及证书——服务器的公钥就放在证书里。',
	});
	frames.push({
		active: ['client'],
		badges: { client: '验签通过', server: '明文 HTTP' },
		note: '验证证书：域名匹配、在有效期内、签发链能追到本机内置的根 CA。中间人递来的假证书过不了这道关。',
	});
	frames.push({
		active: ['client'],
		hotEdges: ['c2s'],
		packets: [{ edge: 'c2s', at: 0.5, tone: 'req', label: '预主密钥' }],
		badges: { client: '验签通过', server: '明文 HTTP' },
		note: '客户端生成预主密钥，用服务器公钥加密后发送——没有私钥解不开，中间人截获到的也只是密文。',
	});
	frames.push({
		badges: { client: '会话密钥 ✓', server: '会话密钥 ✓' },
		note: '双方各自用「两个随机数 + 预主密钥」派生出相同的会话密钥。私钥全程只在握手时用了一次——这就是「混合加密」。',
	});
	frames.push({
		active: ['client', 'server'],
		hotEdges: ['c2s', 's2c'],
		packets: [
			{ edge: 'c2s', at: 0.72, tone: 'req', label: 'Finished' },
			{ edge: 's2c', at: 0.72, tone: 'data', label: 'Finished' },
		],
		badges: { client: '会话密钥 ✓', server: '会话密钥 ✓' },
		note: '互发 Finished：对之前全部握手报文做签名校验——握手过程本身被篡改也会当场识破。',
	});
	frames.push({
		done: ['client', 'server'],
		badges: { client: '对称加密中', server: '对称加密中' },
		note: '之后的应用数据全部走对称加密——非对称只负责握手时搬一次「种子」，安全与性能各取所得。TLS 1.3 的改进方向：把这一来一回砍得更短。',
	});

	return {
		title: 'TLS 1.2 握手 · 从明文到对称加密',
		height: 300,
		nodes: [
			{ id: 'client', label: '客户端', x: 0.12, y: 0.45 },
			{ id: 'server', label: '服务端', x: 0.88, y: 0.45 },
		],
		edges: [
			{ id: 's2c', from: 'server', to: 'client', bend: 64 },
			{ id: 'c2s', from: 'client', to: 'server', bend: 64 },
		],
		frames,
	};
}

/** TCP 三次握手：序号坐标对齐 + 给历史连接留 veto */
function tcpHandshake(): FlowVizConfig {
	const frames: FlowFrame[] = [];

	frames.push({
		badges: { client: 'CLOSED', server: 'LISTEN' },
		note: '服务端先监听（LISTEN），客户端主动建连。为什么恰好三次？看完握手，最后一步揭晓。',
	});
	frames.push({
		active: ['client'],
		hotEdges: ['c2s'],
		packets: [{ edge: 'c2s', at: 0.5, tone: 'req', label: 'SYN seq=x' }],
		badges: { client: 'SYN_SENT', server: 'LISTEN' },
		note: '第一次：客户端发 SYN，携带初始序号 ISN = x，进入 SYN_SENT——「我要建连，我的序号坐标系从 x 开始」。',
	});
	frames.push({
		active: ['server'],
		hotEdges: ['s2c'],
		packets: [{ edge: 's2c', at: 0.5, tone: 'data', label: 'SYN+ACK' }],
		badges: { client: 'SYN_SENT', server: 'SYN_RCVD' },
		note: '第二次：服务端回 SYN+ACK——自己的初始序号 y + 对 x 的确认（ack = x+1），进入 SYN_RCVD。「收到你的 x；我的坐标系从 y 开始」。',
	});
	frames.push({
		active: ['client'],
		hotEdges: ['c2s'],
		packets: [{ edge: 'c2s', at: 0.5, tone: 'resp', label: 'ACK y+1' }],
		badges: { client: 'ESTABLISHED', server: 'SYN_RCVD' },
		note: '第三次：客户端回 ACK（y+1），自己先进入 ESTABLISHED。这第三次正是给「历史连接」准备的否决机会。',
	});
	frames.push({
		active: ['server'],
		done: ['client', 'server'],
		badges: { client: 'ESTABLISHED', server: 'ESTABLISHED' },
		note: '两次为什么不行？一个滞留的旧 SYN 若只握两次，服务端回个 ACK 就当连接建成、分配资源——客户端根本不认。第三次 ACK 让客户端有机会说「我要的不是这个」；三次也是「双方确认收发能力都正常」的最小次数。',
	});
	frames.push({
		done: ['client', 'server'],
		badges: { client: '可传数据', server: '可传数据' },
		note: '双方序号坐标系对齐完毕，开始传数据。断开时的四次挥手与 TIME_WAIT 归属，见下文的挥手动画。',
	});

	return {
		title: 'TCP 三次握手 · 序号对齐与防历史连接',
		height: 300,
		nodes: [
			{ id: 'client', label: '客户端', x: 0.12, y: 0.45 },
			{ id: 'server', label: '服务端', x: 0.88, y: 0.45 },
		],
		edges: [
			{ id: 's2c', from: 'server', to: 'client', bend: 64 },
			{ id: 'c2s', from: 'client', to: 'server', bend: 64 },
		],
		frames,
	};
}

/** JS 事件循环：同步 → 清空微任务 → 一个宏任务 → 再清微任务 */
function jsEventLoop(): FlowVizConfig {
	const frames: FlowFrame[] = [];

	frames.push({
		note: '事件循环的排班表：同步代码跑完 → 清空整个微任务队列 →（渲染）→ 取一个宏任务 → 再清微任务……两条铁律都从这张流程里长出来。',
	});
	frames.push({
		active: ['stack'],
		hotEdges: ['s2macro'],
		packets: [{ edge: 's2macro', at: 0.5, tone: 'data', label: 'setTimeout' }],
		badges: { macro: '1 个任务' },
		note: '执行同步代码：遇到 setTimeout(0)，回调不是「0ms 后执行」，而是登记进宏任务队列——计时器只保证「至少等这么久」。',
	});
	frames.push({
		active: ['stack'],
		hotEdges: ['s2micro'],
		packets: [{ edge: 's2micro', at: 0.5, tone: 'data', label: 'Promise.then' }],
		badges: { micro: '1 个任务', macro: '1 个任务' },
		note: '遇到 Promise.then，回调进微任务队列——它和宏任务不在同一个班次，优先级天差地别。',
	});
	frames.push({
		active: ['stack'],
		badges: { micro: '1 个任务', macro: '1 个任务' },
		note: '同步代码执行完毕，调用栈清空。此刻微任务队列 1 个、宏任务队列 1 个——谁先跑？',
	});
	frames.push({
		active: ['micro'],
		hotEdges: ['s2micro'],
		packets: [{ edge: 's2micro', at: 0.6, tone: 'req', label: 'then 回调' }],
		badges: { micro: '清空中', macro: '1 个任务' },
		note: '先清空整个微任务队列：then 回调立即执行——微任务比 setTimeout(0) 快，因为它插队插在渲染和下一个宏任务之前。',
	});
	frames.push({
		active: ['macro'],
		hotEdges: ['s2macro'],
		packets: [{ edge: 's2macro', at: 0.6, tone: 'req', label: '回调执行' }],
		badges: { micro: '空', macro: '出队中' },
		note: '微队列空了，事件循环才取一个宏任务执行——setTimeout(0) 的回调到这一步才跑，这就是「3 2 1」里 1 排最后的全部原因。',
	});
	frames.push({
		done: ['stack', 'micro', 'macro'],
		badges: { micro: '空', macro: '空' },
		note: '宏任务执行完，又立刻清一遍微任务队列（await 的后续、新注册的 then），然后才轮到渲染——每个宏任务都是一个微任务清空点。',
	});
	frames.push({
		done: ['stack', 'micro', 'macro'],
		badges: { micro: '空', macro: '空' },
		note: '复盘铁律：①每个宏任务之后清空全部微任务；②微任务永远优先于宏任务。输出顺序题在脑子里跑这张图即可；await 的语义就是「把后面的代码包成微任务先让出栈」。',
	});

	return {
		title: '事件循环 · 微任务插队与宏任务排班',
		height: 350,
		nodes: [
			{ id: 'stack', label: '调用栈', sub: '同步执行', x: 0.14, y: 0.4 },
			{ id: 'micro', label: '微任务队列', sub: 'Promise.then', x: 0.55, y: 0.14 },
			{ id: 'macro', label: '宏任务队列', sub: 'setTimeout / IO', x: 0.55, y: 0.66 },
		],
		edges: [
			{ id: 's2micro', from: 'stack', to: 'micro', both: true },
			{ id: 's2macro', from: 'stack', to: 'macro', both: true },
		],
		frames,
	};
}

/** RabbitMQ 可靠投递：confirm / 持久化 / 手动 ACK 三段责任链 */
function rabbitmqReliable(): FlowVizConfig {
	const frames: FlowFrame[] = [];

	frames.push({
		note: '「不丢」是三段责任链：生产者 confirm、broker 持久化、消费者手动 ACK——任何一段失守都会丢。看一条持久化消息从发送到删除的完整一生。',
	});
	frames.push({
		active: ['p'],
		hotEdges: ['pub'],
		packets: [{ edge: 'pub', at: 0.4, tone: 'req', label: 'basicPublish' }],
		note: '生产者发布持久化消息（delivery_mode = 2），经交换机路由进队列——但此刻还没有 confirm，消息不能算安全。',
	});
	frames.push({
		active: ['b'],
		done: ['p'],
		note: '消息入队（先在内存），刷盘前都不可靠——confirm 正被门控：broker 还不能回「已收到」。',
	});
	frames.push({
		active: ['d'],
		hotEdges: ['persist'],
		packets: [{ edge: 'persist', at: 0.5, tone: 'data', label: 'fsync' }],
		done: ['p'],
		note: '消息落盘完成（durable 队列 + 持久化消息；镜像集群则同步到 mirror）——这一刻才有资格发 confirm。',
	});
	frames.push({
		active: ['p'],
		hotEdges: ['pub'],
		packets: [{ edge: 'pub', at: 0.3, tone: 'resp', label: 'confirm' }],
		done: ['b', 'd'],
		note: 'broker 回 basicAck（confirm）：生产者收到后才删本地 pending 记录；没收到就超时重发——绝不能「发了就算」。',
	});
	frames.push({
		active: ['c'],
		hotEdges: ['deliver'],
		packets: [{ edge: 'deliver', at: 0.5, tone: 'data', label: '投递' }],
		done: ['b', 'd'],
		note: 'broker 把消息投递给消费者。注意：confirm 只代表 broker 收到了，跟消费成功与否无关——别混。',
	});
	frames.push({
		active: ['c'],
		hotEdges: ['deliver'],
		packets: [{ edge: 'deliver', at: 0.3, tone: 'resp', label: 'basicAck' }],
		done: ['b', 'd', 'c'],
		note: '消费者处理完才回手动 ACK，broker 收到才删除消息；没 ACK 或 channel 断开，消息重新入队再投。',
	});
	frames.push({
		done: ['p', 'b', 'd', 'c'],
		note: '复盘：confirm 与消费 ACK 是两段独立责任链（生产者→broker、消费者→broker），逐段守住才「不丢」；重发带来的重复交给业务幂等。',
	});

	return {
		title: '可靠投递 · confirm / 持久化 / 手动 ACK 三道闸',
		height: 400,
		nodes: [
			{ id: 'p', label: '生产者', x: 0.07, y: 0.22 },
			{ id: 'b', label: 'Broker', sub: '交换机 → 队列', x: 0.4, y: 0.22, shape: 'cylinder' },
			{ id: 'd', label: '磁盘', sub: '持久化队列', x: 0.4, y: 0.75, shape: 'cylinder' },
			{ id: 'c', label: '消费者', x: 0.78, y: 0.22 },
		],
		edges: [
			{ id: 'pub', from: 'p', to: 'b', both: true },
			{ id: 'persist', from: 'b', to: 'd', label: '落盘' },
			{ id: 'deliver', from: 'b', to: 'c', both: true, label: '投递 / ACK' },
		],
		frames,
	};
}

/** MongoDB 复制集选举：心跳发现 → 同僚仲裁 → Elect 投票（30s 选举锁） */
function mongoElection(): FlowVizConfig {
	const frames: FlowFrame[] = [];

	frames.push({
		badges: { p: 'Primary', s2: 'Secondary', s3: 'Secondary' },
		note: '复制集 3 个投票成员，任意两两 2 秒一次心跳，每个节点只维护自己视角（POV）的状态。看 Primary 宕机后怎么选出新主。',
	});
	frames.push({
		active: ['s2'],
		dim: ['p'],
		badges: { s2: '标记 P 失联', s3: 'Secondary' },
		note: 'Primary 宕机。S2 心跳超时，先标记它失联——只是自己 POV；接着自检：能否连通 majority（2/3）、priority > 0、非 Arbiter。',
	});
	frames.push({
		active: ['s2'],
		hotEdges: ['fc'],
		packets: [{ edge: 'fc', at: 0.35, tone: 'req', label: 'FreshnessCheck' }],
		badges: { s2: '自检通过', s3: 'Secondary' },
		note: '同僚仲裁：S2 向 S3 发 FreshnessCheck——发起者的 oplog 必须是存活节点里最新的，旧数据没资格当主。',
	});
	frames.push({
		active: ['s3'],
		hotEdges: ['fc'],
		packets: [{ edge: 'fc', at: 0.8, tone: 'resp', label: '通过' }],
		badges: { s2: '自检通过', s3: 'Secondary' },
		note: 'S3 校验通过：S2 的 oplog 够新，有参选资格。',
	});
	frames.push({
		active: ['s2'],
		hotEdges: ['fc'],
		packets: [{ edge: 'fc', at: 0.55, tone: 'req', label: 'Elect 求票' }],
		badges: { s2: '参选中', s3: 'Secondary' },
		note: 'S2 正式发起选举投票。',
	});
	frames.push({
		active: ['s3'],
		hotEdges: ['fc'],
		packets: [{ edge: 'fc', at: 0.15, tone: 'resp', label: '同意' }],
		badges: { s2: '参选中', s3: '投票 · 选举锁 30s' },
		note: 'S3 投票并持有 30 秒选举锁（类似任期，期间不再投给别人）。S2 拿到 majority（3 台里的 2 票）当选——未过半则随机退避后重试。',
	});
	frames.push({
		active: ['s2'],
		done: ['s3'],
		badges: { s2: '新 Primary', s3: '已投票' },
		note: 'S2 就任新 Primary，driver 感知拓扑变化后自动把写入切过来——应用基本无感。',
	});
	frames.push({
		badges: { s2: '新 Primary', p: '降级 Secondary' },
		dim: ['p'],
		note: '旧主恢复：oplog 分叉的部分要 rollback（落 rollback 文件人工处理），自己降级 Secondary 重新加入。若存活成员不足 majority，复制集整体只读——宁不可写，不出双主。',
	});

	return {
		title: '复制集选举 · 心跳、仲裁与 30s 选举锁',
		height: 350,
		nodes: [
			{ id: 'p', label: 'Primary', sub: 'S1 · 旧主', x: 0.16, y: 0.2, shape: 'cylinder' },
			{ id: 's2', label: 'Secondary', sub: 'S2 · 发起选举', x: 0.5, y: 0.2 },
			{ id: 's3', label: 'Secondary', sub: 'S3 · 投票者', x: 0.84, y: 0.2 },
			{ id: 'client', label: '客户端', sub: 'driver 自动切换', x: 0.5, y: 0.78 },
		],
		edges: [
			{ id: 'hb', from: 's2', to: 'p', both: true, label: '心跳 2s' },
			{ id: 'fc', from: 's2', to: 's3', both: true },
			{ id: 'w', from: 'client', to: 's2' },
		],
		frames,
	};
}

/** PostgreSQL WAL：先记日志再改页，崩溃后从 checkpoint 重放 */
function pgWal(): FlowVizConfig {
	const frames: FlowFrame[] = [];

	frames.push({
		badges: { wal: '空', page: '干净页' },
		note: 'WAL 的契约：修改数据页之前，先把「这一改」的物理描述写进日志——崩溃后数据文件可以从 checkpoint 起重放日志追上来。',
	});
	frames.push({
		active: ['wal'],
		hotEdges: ['w'],
		packets: [{ edge: 'w', at: 0.5, tone: 'data', label: '物理描述' }],
		badges: { page: '干净页' },
		note: '第一步：事务要改某数据页，先把这条修改的物理描述（哪个页哪个字节改成什么）追加进 WAL 并 fsync——synchronous_commit 决定等到哪一步。',
	});
	frames.push({
		active: ['page'],
		hotEdges: ['p'],
		packets: [{ edge: 'p', at: 0.5, tone: 'data', label: '改页' }],
		badges: { page: '脏页' },
		done: ['wal'],
		note: '第二步：修改共享缓冲里的数据页——它成了脏页，内存里对事务可见，但数据文件还没变。',
	});
	frames.push({
		active: ['backend'],
		badges: { page: '脏页', wal: '已持久' },
		done: ['wal', 'page'],
		note: '事务提交：WAL 已落盘，就可以对客户端返回成功——哪怕脏页还没刷盘。这就是「先记日志，再改页」换来的提交速度。',
	});
	frames.push({
		active: ['disk'],
		hotEdges: ['f'],
		packets: [{ edge: 'f', at: 0.5, tone: 'data', label: '脏页刷盘' }],
		dim: ['backend'],
		badges: { page: '脏页' },
		note: '脏页由后台进程择机刷到数据文件——顺序保证：WAL 记录永远先于它描述的数据页落盘。',
	});
	frames.push({
		active: ['wal'],
		badges: { wal: 'checkpoint 起点', page: '已刷盘' },
		done: ['disk'],
		note: 'checkpoint：把当前脏页批量刷盘，并在 WAL 里记一条「到此全部已落盘」——之后崩溃恢复只需重放这个起点之后的日志。',
	});
	frames.push({
		dim: ['backend', 'page', 'disk'],
		badges: { wal: 'checkpoint 起点' },
		note: '崩溃！内存里的脏页全部丢失，数据文件停在旧状态——看似丢了已提交的修改？',
	});
	frames.push({
		active: ['disk'],
		hotEdges: ['f'],
		packets: [{ edge: 'f', at: 0.5, tone: 'resp', label: '重放 WAL' }],
		badges: { wal: '重放完成' },
		done: ['wal'],
		note: '恢复：从最后一个 checkpoint 起重放 WAL，把数据文件补到「已提交事务对应的页状态」。full_page_writes 保证重放不会拼出半页。',
	});
	frames.push({
		done: ['backend', 'wal', 'page', 'disk'],
		badges: { wal: '重放完成' },
		note: '复盘：WAL 同时服务崩溃恢复与物理复制（流复制就是另一名消费者）；checkpoint 不是「刷不刷 WAL」的开关，而是重放起点的标记。',
	});

	return {
		title: 'WAL 与崩溃恢复 · 先记日志，再改数据页',
		height: 400,
		nodes: [
			{ id: 'backend', label: '事务', sub: '提交返回', x: 0.1, y: 0.2 },
			{ id: 'wal', label: 'WAL', sub: '物理日志 · fsync', x: 0.4, y: 0.2, shape: 'doc' },
			{ id: 'page', label: '共享缓冲', sub: '脏页', x: 0.4, y: 0.72 },
			{ id: 'disk', label: '数据文件', sub: '磁盘', x: 0.75, y: 0.72, shape: 'cylinder' },
		],
		edges: [
			{ id: 'w', from: 'backend', to: 'wal', label: '先写 WAL' },
			{ id: 'p', from: 'backend', to: 'page', label: '再改页' },
			{ id: 'f', from: 'page', to: 'disk', dashed: true, label: '稍后刷盘', labelAt: 0.14 },
		],
		frames,
	};
}

/** RabbitMQ 死信与延迟：TTL 到期变死信 → DLX → 业务队列，用等待换延迟 */
function rabbitmqDeadletter(): FlowVizConfig {
	const frames: FlowFrame[] = [];

	frames.push({
		note: 'RabbitMQ 没有原生延迟队列，经典解法是「TTL + 死信」组合拳：消息先在延迟队列里等过期，过期变死信、经死信交换机转投真正的业务队列。看订单 30 分钟超时取消怎么落地。',
	});
	frames.push({
		active: ['p'],
		hotEdges: ['send'],
		packets: [{ edge: 'send', at: 0.4, tone: 'req', label: '订单 · TTL 30min' }],
		note: '生产者发一条订单消息——它不进业务队列，而是进「延迟队列」：只设 x-message-ttl、绑定死信交换机 DLX，并且没有消费者。',
	});
	frames.push({
		active: ['delayq'],
		badges: { delayq: '堆积等待' },
		done: ['p'],
		note: '消息在延迟队列里安静躺着。注意坑：过期只看队头，队头没到期后面全堵——延迟粒度太碎时慎用 TTL 方案（分级队列或官方插件）。',
	});
	frames.push({
		active: ['delayq'],
		badges: { delayq: 'TTL 到期' },
		hotEdges: ['dead'],
		packets: [{ edge: 'dead', at: 0.35, tone: 'data', label: '死信' }],
		note: '30 分钟到，消息过期，成为「死信」——自动转发给队列绑定的死信交换机。被拒绝（requeue=false）和队满（x-max-length）也会走同一条路。',
	});
	frames.push({
		active: ['dlx'],
		hotEdges: ['dead', 'route'],
		packets: [
			{ edge: 'dead', at: 0.85, tone: 'data', label: '死信' },
			{ edge: 'route', at: 0.5, tone: 'data', label: '路由 #' },
		],
		done: ['delayq'],
		note: 'DLX 按绑定规则（这里是 # 通配）把死信投给真正的业务队列——DLX 忘了绑队列，死信就无路可走被丢弃。',
	});
	frames.push({
		active: ['biz'],
		hotEdges: ['deliver'],
		packets: [{ edge: 'deliver', at: 0.5, tone: 'data', label: '超时取消' }],
		done: ['delayq', 'dlx'],
		note: '业务队列的消费者收到消息，执行「订单超时自动取消」——延迟 30 分钟送达，全程没有轮询、没有扫表。',
	});
	frames.push({
		done: ['p', 'delayq', 'dlx', 'biz', 'consumer'],
		badges: { biz: '已消费' },
		note: '复盘：用「等待」换「延迟」。生产优先用官方 Delay Exchange 插件（语义更直白）；重试 + 死信 + 告警的闭环同样靠 DLX 兜底——坏消息不堵业务队列、失败可见可度量。',
	});

	return {
		title: '死信与延迟消息 · TTL 到期转投业务队列',
		height: 380,
		nodes: [
			{ id: 'p', label: '生产者', x: 0.06, y: 0.18 },
			{ id: 'delayq', label: '延迟队列', sub: 'TTL · 无人消费', x: 0.32, y: 0.18, shape: 'cylinder' },
			{ id: 'dlx', label: 'DLX', sub: '死信交换机', x: 0.6, y: 0.18 },
			{ id: 'biz', label: '业务队列', sub: '订单超时', x: 0.87, y: 0.18, shape: 'cylinder' },
			{ id: 'consumer', label: '消费者', x: 0.87, y: 0.78 },
		],
		edges: [
			{ id: 'send', from: 'p', to: 'delayq' },
			{ id: 'dead', from: 'delayq', to: 'dlx' },
			{ id: 'route', from: 'dlx', to: 'biz' },
			{ id: 'deliver', from: 'biz', to: 'consumer' },
		],
		frames,
	};
}

/** Docker 镜像分层与写时复制：容器 = 只读镜像 + 私有可写层 */
function dockerCow(): FlowVizConfig {
	const frames: FlowFrame[] = [];

	frames.push({
		note: '镜像与容器的关系一句话：镜像 = 只读的分层模板，容器 = 镜像 + 一个私有的可写层。理解「写时复制（CoW）」，容器数据为什么易逝就通了。',
	});
	frames.push({
		active: ['image'],
		hotEdges: ['pull'],
		packets: [{ edge: 'pull', at: 0.5, tone: 'data', label: '分层下载' }],
		note: '拉镜像按层下载：本地已有的层直接复用——多个镜像共享底层只读层，这是「镜像很大但拉取很快」的原因。',
	});
	frames.push({
		active: ['rw'],
		hotEdges: ['mount'],
		packets: [{ edge: 'mount', at: 0.45, tone: 'data', label: '联合挂载' }],
		done: ['image'],
		note: 'docker run：只读镜像层作下层，顶部新建一个容器私有的可写层，联合挂载成一个统一视图。',
	});
	frames.push({
		active: ['rw'],
		badges: { rw: '读 · 直读镜像' },
		note: '读文件：自上而下在各层找，找到直接读——不需要任何拷贝。',
	});
	frames.push({
		active: ['rw'],
		badges: { rw: '写 · 先拷贝再改（CoW）' },
		note: '改文件（写时复制）：先把文件从镜像层整个复制到可写层，再在副本上改——镜像层永远不被修改。大文件首次改写有拷贝代价。',
	});
	frames.push({
		active: ['rw'],
		badges: { rw: '删 · 只打标记' },
		note: '删除文件：只是在可写层打一个 whiteout 标记把它「遮住」——镜像层原封不动。',
	});
	frames.push({
		dim: ['rw'],
		badges: { rw: '已丢弃' },
		note: '容器删除：只丢可写层。同一镜像起 10 个容器互不干扰、也不占 10 份磁盘——每个容器只多一份自己的可写层。',
	});
	frames.push({
		active: ['vol'],
		hotEdges: ['vol'],
		packets: [{ edge: 'vol', at: 0.5, tone: 'req', label: '挂载' }],
		dim: ['rw'],
		note: '那数据库数据放哪？挂 volume——写到可写层之外，容器删了数据还在。「容器里改的东西删容器就没」，就是可写层在作怪。',
	});

	return {
		title: '镜像分层与写时复制 · 容器 = 镜像 + 可写层',
		height: 400,
		nodes: [
			{ id: 'reg', label: '镜像仓库', sub: 'Registry', x: 0.07, y: 0.22, shape: 'cylinder' },
			{ id: 'image', label: '镜像只读层', sub: 'base·依赖·应用', x: 0.36, y: 0.22, hw: 72 },
			{ id: 'rw', label: '容器可写层', sub: '容器私有', x: 0.68, y: 0.22, hw: 72 },
			{ id: 'vol', label: '数据卷', sub: 'volume', x: 0.68, y: 0.78, shape: 'cylinder' },
		],
		edges: [
			{ id: 'pull', from: 'reg', to: 'image', label: '按层拉取' },
			{ id: 'mount', from: 'image', to: 'rw', both: true, label: '联合挂载' },
			{ id: 'vol', from: 'rw', to: 'vol', dashed: true },
		],
		frames,
	};
}

/** etcd 一次写入：Raft 过半提交 → MVCC revision → Watch 事件流 */
function etcdWrite(): FlowVizConfig {
	const frames: FlowFrame[] = [];

	frames.push({
		note: 'etcd = Raft 共识 + MVCC 多版本 + Watch 推送。Kubernetes 把全量集群状态存在它上面，controller 靠 Watch 做「声明式收敛」。看一次 put 的完整旅程。',
	});
	frames.push({
		active: ['client'],
		hotEdges: ['put'],
		packets: [{ edge: 'put', at: 0.4, tone: 'req', label: 'PUT' }],
		note: '客户端发起写请求：层级 key + 小 value（etcdctl put /config/app/port 8080）。',
	});
	frames.push({
		active: ['leader', 'follower'],
		hotEdges: ['raft'],
		packets: [{ edge: 'raft', at: 0.5, tone: 'data', label: '日志复制' }],
		done: ['client'],
		note: 'Leader 把写追加为 Raft 日志（term 标记任期），复制给 Follower；过半（3 台里的 2 台）确认后提交——用 Quorum 换强一致。',
	});
	frames.push({
		active: ['mvcc'],
		hotEdges: ['apply'],
		packets: [{ edge: 'apply', at: 0.5, tone: 'data', label: '应用' }],
		done: ['client', 'follower'],
		badges: { mvcc: 'rev +1' },
		note: '提交后应用到 MVCC 状态树：每次写分配全局递增 revision——旧版本不被覆盖，get --prefix 还能按版本回溯历史。',
	});
	frames.push({
		active: ['watcher'],
		hotEdges: ['watch'],
		packets: [{ edge: 'watch', at: 0.5, tone: 'data', label: 'PUT 事件' }],
		done: ['client', 'follower', 'mvcc'],
		note: 'Watch 了 /config 前缀的客户端立刻收到事件流——K8s 的 controller 就靠这个「状态一变就 reconcile」，声明式收敛的地基。',
	});
	frames.push({
		done: ['client', 'leader', 'follower', 'mvcc'],
		note: '读请求默认走节点本地状态（快）；要线性一致可强制走 Raft。Lease 租约给 key 带 TTL，过期自动删除——临时节点的同款语义。',
	});
	frames.push({
		done: ['client', 'leader', 'follower', 'mvcc', 'watcher'],
		badges: { mvcc: 'compaction' },
		note: '历史版本不能无限留：compaction 压缩旧 revision，防止存储与内存膨胀——MVCC 的便利要用压缩来还。',
	});
	frames.push({
		done: ['client', 'leader', 'follower', 'mvcc', 'watcher'],
		badges: { mvcc: 'compaction' },
		note: '复盘：Raft 保「多数派认可才存在」，MVCC 保「变化有版本可溯」，Watch 保「变化即时可见」——三者拼出云原生的协调中枢。',
	});

	return {
		title: 'etcd 一次写入 · Raft → MVCC → Watch',
		height: 380,
		nodes: [
			{ id: 'client', label: '客户端', x: 0.07, y: 0.18 },
			{ id: 'leader', label: 'Leader', sub: '追加日志 · term', x: 0.38, y: 0.18 },
			{ id: 'follower', label: 'Follower', sub: '过半确认', x: 0.72, y: 0.18 },
			{ id: 'mvcc', label: 'MVCC 树', sub: 'revision 递增', x: 0.38, y: 0.76 },
			{ id: 'watcher', label: 'Watch 订阅者', sub: 'K8s controller', x: 0.76, y: 0.76 },
		],
		edges: [
			{ id: 'put', from: 'client', to: 'leader' },
			{ id: 'raft', from: 'leader', to: 'follower', both: true },
			{ id: 'apply', from: 'leader', to: 'mvcc', label: '提交后应用' },
			{ id: 'watch', from: 'mvcc', to: 'watcher', dashed: true, label: '事件流' },
		],
		frames,
	};
}

/** MQTT QoS2 四段握手：接收方按 message id 登记去重，恰好一次 */
function mqttQos2(): FlowVizConfig {
	const frames: FlowFrame[] = [];

	frames.push({
		badges: { pub: 'QoS 2', rec: 'QoS 2' },
		note: 'QoS2 的目标是「恰好一次」：不重也不丢，代价是 4 段报文。关键机制是中间态记账——接收方按 message id 去重。',
	});
	frames.push({
		active: ['pub'],
		hotEdges: ['p2s'],
		packets: [{ edge: 'p2s', at: 0.5, tone: 'req', label: 'PUBLISH id=42' }],
		badges: { pub: 'QoS 2', rec: '未登记' },
		note: '第一次发送：PUBLISH 带上 message id。在收到 PUBREC 之前，发送方随时可能重发这条 PUBLISH。',
	});
	frames.push({
		active: ['rec'],
		hotEdges: ['s2r'],
		packets: [{ edge: 's2r', at: 0.5, tone: 'resp', label: 'PUBREC' }],
		badges: { pub: 'QoS 2', rec: '已登记 id=42' },
		note: '接收方收到 → 登记这个 message id → 回 PUBREC。这一笔登记，就是去重的全部秘密。',
	});
	frames.push({
		active: ['pub'],
		hotEdges: ['s2r'],
		packets: [{ edge: 's2r', at: 0.25, tone: 'req', label: 'PUBREL' }],
		badges: { pub: '不再重发 PUBLISH', rec: '已登记 id=42' },
		note: '发送方收到 PUBREC：知道对方「已收到且已登记」——从此只补确认，不再重发数据本身。',
	});
	frames.push({
		hotEdges: ['p2s'],
		packets: [{ edge: 'p2s', at: 0.5, tone: 'req', label: 'PUBREL' }],
		badges: { pub: '不再重发 PUBLISH', rec: '已登记 id=42' },
		note: '没收到 PUBCOMP 就重发 PUBREL——注意重发的是确认，不是 PUBLISH，数据不会因此重复投递。',
	});
	frames.push({
		active: ['rec'],
		hotEdges: ['s2r'],
		packets: [{ edge: 's2r', at: 0.15, tone: 'resp', label: 'PUBCOMP' }],
		badges: { pub: '不再重发 PUBLISH', rec: '已投递 · 清算完成' },
		note: '接收方收到 PUBREL → 把消息投给应用层（只这一次） → 回 PUBCOMP。双方清算完毕，忘掉这个 id。',
	});
	frames.push({
		done: ['pub', 'rec'],
		badges: { pub: '不再重发 PUBLISH', rec: '已投递 · 清算完成' },
		note: '如果重发窗口内出现了重复的 PUBLISH / PUBREL：接收方查到 id 已登记，不再重复投递、只补 ACK——「恰好一次」就是这样成立的。',
	});
	frames.push({
		done: ['pub', 'rec'],
		badges: { pub: '默认 QoS 1', rec: '默认 QoS 1' },
		note: '复盘：QoS1 两条报文「至少一次」（可能重复），QoS2 四条报文「恰好一次」（开销高少用）。工程默认 QoS1 + 业务幂等，QoS2 留给带宽富余且无法幂等的场景。',
	});

	return {
		title: 'MQTT QoS2 · 四段握手与 message id 去重',
		height: 300,
		nodes: [
			{ id: 'pub', label: '发送方', x: 0.12, y: 0.45 },
			{ id: 'rec', label: '接收方', x: 0.88, y: 0.45 },
		],
		edges: [
			{ id: 's2r', from: 'rec', to: 'pub', bend: 64 },
			{ id: 'p2s', from: 'pub', to: 'rec', bend: 64 },
		],
		frames,
	};
}

/** 输入 URL 到页面显示：八步因果链，排障即倒放 */
function urlToPage(): FlowVizConfig {
	const frames: FlowFrame[] = [];

	frames.push({
		badges: { browser: '输入 URL' },
		note: '「输入 URL 到页面显示」是网络八股的总纲：把 DNS、TCP、TLS、HTTP 串成因果链，也是线上排障的地图。走一遍 https://example.com。',
	});
	frames.push({
		active: ['dns'],
		hotEdges: ['dq'],
		packets: [{ edge: 'dq', at: 0.4, tone: 'req', label: '查 A 记录' }],
		note: 'DNS 解析：浏览器缓存 → hosts → 本地 DNS → 根/顶级/权威，逐级查到 example.com 的 IP（命中缓存则短路）。CDN 就是在这一步把你引到边缘节点。',
	});
	frames.push({
		done: ['dns'],
		hotEdges: ['dq'],
		packets: [{ edge: 'dq', at: 0.8, tone: 'resp', label: 'IP 返回' }],
		note: '拿到 IP。首次访问这一步可能跨多个 RTT，所以各级 DNS 缓存都很关键。',
	});
	frames.push({
		active: ['server'],
		hotEdges: ['main'],
		packets: [{ edge: 'main', at: 0.3, tone: 'req', label: 'TCP 三次握手' }],
		badges: { server: '连接建立' },
		done: ['dns'],
		note: 'TCP 建连：三次握手同步双方初始序号——握手的每一帧在上面的握手动画里。',
	});
	frames.push({
		hotEdges: ['main'],
		packets: [{ edge: 'main', at: 0.5, tone: 'req', label: 'TLS 握手' }],
		badges: { server: '加密通道' },
		done: ['dns'],
		note: 'TLS 握手：验证证书 + 协商会话密钥（1 个 RTT）。https 才有这一步——优化史就是这条链的减 RTT 史。',
	});
	frames.push({
		active: ['browser'],
		hotEdges: ['main'],
		packets: [{ edge: 'main', at: 0.72, tone: 'req', label: 'GET /index.html' }],
		badges: { server: '加密通道', browser: '请求已发出' },
		done: ['dns'],
		note: '发 HTTP 请求：构造请求行/头/体，可能带上 Cookie；经 CDN / 负载均衡进入服务端。',
	});
	frames.push({
		active: ['server'],
		badges: { server: '处理中', browser: '请求已发出' },
		done: ['dns'],
		note: '服务端链路：负载均衡 → 网关鉴权限流 → 业务逻辑 → 缓存/DB。最常见的故障都在这一段：网关 502/504、慢 SQL、线程池打满。',
	});
	frames.push({
		active: ['browser'],
		hotEdges: ['main'],
		packets: [{ edge: 'main', at: 0.35, tone: 'resp', label: 'HTML 200' }],
		badges: { server: '加密通道', browser: '渲染中' },
		done: ['dns', 'server'],
		note: '响应回程：状态码 + 报文。keep-alive 下连接不断，后续请求直接复用——四次挥手要等空闲超时或主动关闭。',
	});
	frames.push({
		done: ['browser', 'dns', 'server'],
		badges: { browser: '首屏 ✓' },
		note: '渲染：解析 HTML 建 DOM/CSSOM → 渲染树 → 排版绘制，JS 阻塞解析。排障时把这条链倒着二分：curl 直接打后端 IP，通不通一测就知道问题在哪一段。',
	});

	return {
		title: '输入 URL 到页面显示 · 八步因果链',
		height: 380,
		nodes: [
			{ id: 'browser', label: '浏览器', x: 0.1, y: 0.2 },
			{ id: 'dns', label: 'DNS 解析', sub: '递归查询', x: 0.38, y: 0.72 },
			{ id: 'server', label: '服务端', sub: 'LB → 网关 → 服务', x: 0.68, y: 0.2 },
		],
		edges: [
			{ id: 'dq', from: 'browser', to: 'dns', both: true },
			{ id: 'main', from: 'browser', to: 'server', both: true },
		],
		frames,
	};
}

/** JVM 三色标记与并发漏标：灰=扫描中、黑=扫完、白=待定，两个条件凑齐就漏标 */
function javaTricolor(): FlowVizConfig {
	const frames: FlowFrame[] = [];

	frames.push({
		note: '并发标记（GC 线程与业务线程同跑）用三色描述：白=没扫到（最终白=垃圾）、灰=自己扫了成员没扫完、黑=全部扫完。图里琥珀=灰、暗色=黑、默认=白。',
	});
	frames.push({
		active: ['root'],
		note: '根扫描：GC Roots 直连的对象先变灰——「我自己扫完了，成员引用还没查」。',
	});
	frames.push({
		active: ['a'],
		done: ['root'],
		hotEdges: ['ra'],
		packets: [{ edge: 'ra', at: 0.5, tone: 'data', label: '扫描' }],
		note: '标记 A：查它的成员引用，把 B、D 变灰，A 自己转黑。',
	});
	frames.push({
		active: ['b'],
		done: ['root', 'a'],
		hotEdges: ['ab'],
		packets: [{ edge: 'ab', at: 0.5, tone: 'data', label: '扫描' }],
		note: '标记 B：同理继续推进——灰色队列清空、所有可达对象变黑时，标记完成。没有并发，故事到这就结束了。',
	});
	frames.push({
		active: ['b'],
		done: ['root', 'a'],
		badges: { b: '灰 · 成员未扫完', c: '白' },
		note: '并发来了。业务线程还在跑，此刻的中间态：A 已黑（不会再扫）、B 还是灰、C 是白——接下来业务线程连续做两个动作。',
	});
	frames.push({
		active: ['b'],
		done: ['root', 'a'],
		badges: { b: '已删除 →C 的引用', c: '白' },
		note: '动作一：B（灰）删除了到 C 的引用——C 失去了唯一一个「本来会扫到它」的来源。',
	});
	frames.push({
		active: ['a'],
		done: ['root', 'a', 'b'],
		badges: { a: '新增 →C 的引用', c: '白' },
		note: '动作二：A（黑）新增引用指向 C——黑色不会再被重扫，这条新边标记器看不见。两个条件同时成立：漏标已成。',
	});
	frames.push({
		done: ['root', 'a', 'b'],
		badges: { c: '漏标 · 被误回收' },
		note: '清理阶段：C 仍是白色 → 被当垃圾回收，但它明明是活对象——这就是并发漏标，致命错误。',
	});
	frames.push({
		done: ['root', 'a', 'b', 'c'],
		badges: { c: '存活' },
		note: '解法两大流派：增量更新（CMS）——黑新增引用时记下来，重新标记时把黑改灰重扫；原始快照 SATB（G1）——灰删白引用时按删前快照重标，宁可多留浮动垃圾下轮再收。',
	});

	return {
		title: '三色标记 · 并发漏标的两个条件',
		height: 420,
		nodes: [
			{ id: 'root', label: 'GC Roots', x: 0.08, y: 0.45 },
			{ id: 'a', label: 'A', sub: '对象', x: 0.36, y: 0.14 },
			{ id: 'b', label: 'B', sub: '对象', x: 0.36, y: 0.76 },
			{ id: 'c', label: 'C', sub: '对象', x: 0.66, y: 0.14 },
			{ id: 'd', label: 'D', sub: '对象', x: 0.66, y: 0.76 },
		],
		edges: [
			{ id: 'ra', from: 'root', to: 'a' },
			{ id: 'ab', from: 'a', to: 'b' },
			{ id: 'bc', from: 'b', to: 'c' },
			{ id: 'ad', from: 'a', to: 'd' },
		],
		frames,
	};
}

/** PostgreSQL MVCC：UPDATE 产生版本链，RC 与 RR 的快照判定分野 */
function pgMvcc(): FlowVizConfig {
	const frames: FlowFrame[] = [];

	frames.push({
		note: 'PG 的 UPDATE 不改原行：旧元组打上 xmax、新元组带新 xmin，新旧版本物理共存于页中。谁能看见哪个版本，全靠快照判定——「插入者对我已成定局，删除者对我尚未定局」。',
	});
	frames.push({
		active: ['v1'],
		badges: { v1: 'xmin=100 · xmax=0' },
		note: '事务 A（xid=100）插入并提交了这行——此刻 v1 是对所有人可见的唯一版本。',
	});
	frames.push({
		active: ['upd'],
		hotEdges: ['bx'],
		packets: [{ edge: 'bx', at: 0.5, tone: 'req', label: 'xmax=200' }],
		badges: { v1: 'xmin=100 · xmax=200' },
		note: '事务 B（xid=200）UPDATE：不原地改，先给 v1 打上 xmax=200——「从 200 号事务起，这行旧了」。',
	});
	frames.push({
		active: ['v2'],
		hotEdges: ['bw'],
		packets: [{ edge: 'bw', at: 0.5, tone: 'data', label: '插入 v2' }],
		badges: { v1: 'xmax=200', v2: 'xmin=200 · xmax=0' },
		note: 'B 同时插入新元组 v2（xmin=200）。v1、v2 物理共存，靠 xmax → xmin 串成版本链——这是和 InnoDB「旧版本进 undo log」的分界。',
	});
	frames.push({
		active: ['reader'],
		badges: { reader: 'RR · 快照不含 200', v1: 'xmax=200', v2: 'xmin=200 · xmax=0' },
		note: 'RR 下事务 A 在 B 提交前就拍了快照：v2 的 xmin=200 对快照太新 → 不可见；v1 的 xmax=200 尚未提交 → 删除未成。口诀生效：A 读到 v1，可重复读。',
	});
	frames.push({
		active: ['reader'],
		badges: { reader: 'RC · 每条语句新快照', v1: 'xmax=200', v2: 'xmin=200 · xmax=0' },
		note: '换成 RC：每条语句重拍快照，B 已提交、200 已成定局 → v2 可见、v1 被删成。同一事务里两次读结果不同——不可重复读由此而来。',
	});
	frames.push({
		done: ['v1', 'v2', 'upd', 'reader'],
		badges: { v1: '死元组 · 待 VACUUM' },
		note: '收尾：旧版本要等 VACUUM 清理，否则表膨胀；事务 ID 32 位会用完回卷，freeze 是比膨胀更硬的墙。可见性判定拿这道题手推一遍就懂了。',
	});

	return {
		title: 'MVCC 快照可见性 · xmin/xmax 与隔离级别',
		height: 400,
		nodes: [
			{ id: 'v1', label: '元组 v1', sub: '旧版本', x: 0.18, y: 0.25, hw: 70 },
			{ id: 'v2', label: '元组 v2', sub: '新版本', x: 0.18, y: 0.75, hw: 70 },
			{ id: 'upd', label: '事务 B', sub: 'UPDATE · xid=200', x: 0.62, y: 0.25 },
			{ id: 'reader', label: '事务 A', sub: '只读 · 持快照', x: 0.62, y: 0.75 },
		],
		edges: [
			{ id: 'bx', from: 'upd', to: 'v1', dashed: true, label: '打 xmax' },
			{ id: 'bw', from: 'upd', to: 'v2', label: '插入新版本' },
			{ id: 'rv', from: 'reader', to: 'v1', both: true, label: '按快照判定', labelAt: 0.24 },
		],
		frames,
	};
}

/** 分布式脑裂：分区出双主，三层防线 quorum / 主自裁 / fencing */
function splitBrain(): FlowVizConfig {
	const frames: FlowFrame[] = [];

	frames.push({
		badges: { old: '主', sentinel: '哨兵多数派', neo: '从 A' },
		note: '故障转移解决「主挂了」；脑裂是「旧主没死透」——网络分区把集群裂成两半，两边的「主」各自为政，数据从此分叉。',
	});
	frames.push({
		active: ['sentinel'],
		hotEdges: ['hb'],
		packets: [{ edge: 'hb', at: 0.5, tone: 'req', label: '心跳超时' }],
		badges: { old: '失联 · 但活着', sentinel: '哨兵多数派', neo: '从 A' },
		note: '机房网络中断：旧主与哨兵多数派失联。注意旧主没有宕机——它自认为还是主，照样接受写入。',
	});
	frames.push({
		active: ['neo'],
		hotEdges: ['promote'],
		packets: [{ edge: 'promote', at: 0.5, tone: 'req', label: '过半同意 · 提升' }],
		badges: { old: '失联 · 但活着', sentinel: '哨兵多数派', neo: '新主' },
		note: '哨兵侧凑出过半（quorum），把从 A 提升为新主。分区另一侧凑不出过半——两个多数派必然相交，谁也别想造出第二个「合法」主，这就是 quorum 的数学。',
	});
	frames.push({
		active: ['clientOld'],
		hotEdges: ['stale'],
		packets: [{ edge: 'stale', at: 0.5, tone: 'req', label: '继续写入' }],
		badges: { old: '仍在接写', neo: '新主' },
		note: '脑裂现场：旧客户端缓存着旧主地址继续写入——两段互斥的历史就此分叉。分区恢复后合并不了，Redis 这类无版本合并的直接丢数据。',
	});
	frames.push({
		badges: { old: '自裁 · 拒绝写', neo: '新主' },
		note: '防线一（主自裁）：min-replicas-to-write=1——主感知不到足够从库同步就拒绝写入，从根上掐掉旧主的写。ES、Kafka 的 min.insync.replicas 同款思想。',
	});
	frames.push({
		badges: { old: 'fencing · epoch 过期', neo: '新主' },
		note: '防线二（fencing）：每任主带单调递增 epoch/term（Raft 的 term、哨兵的 config epoch），存储层只认最新 epoch——旧主漏网的写入被拦在存储端。再粗暴一层是 STONITH 直接电源隔离。',
	});
	frames.push({
		done: ['old', 'sentinel', 'neo'],
		badges: { old: 'fencing · epoch 过期', neo: '新主' },
		note: '三层防线总结：quorum 选新主（管选举）→ 主自裁（管旧主不接写）→ fencing epoch 校验（管旧数据写不进）。灾备双中心同时提升是「人为脑裂」——切换决策只能出自单一仲裁源。',
	});

	return {
		title: '脑裂与防线 · quorum / 主自裁 / fencing',
		height: 400,
		nodes: [
			{ id: 'old', label: '旧主', sub: '被分区隔离', x: 0.16, y: 0.25, shape: 'cylinder' },
			{ id: 'sentinel', label: '哨兵多数派', sub: '另一机房', x: 0.5, y: 0.25 },
			{ id: 'neo', label: '新主', sub: '从 A 晋升', x: 0.84, y: 0.25, shape: 'cylinder' },
			{ id: 'clientOld', label: '旧客户端', sub: '缓存旧主地址', x: 0.16, y: 0.78 },
		],
		edges: [
			{ id: 'hb', from: 'old', to: 'sentinel', dashed: true, label: '心跳断' },
			{ id: 'promote', from: 'sentinel', to: 'neo', label: '提升' },
			{ id: 'stale', from: 'clientOld', to: 'old' },
		],
		frames,
	};
}

/** nginx 平滑 reload：新 worker 接管监听，旧 worker 跑完存量退出 */
function nginxReload(): FlowVizConfig {
	const frames: FlowFrame[] = [];

	frames.push({
		badges: { master: 'v1 配置', wold: '处理连接中', client: '已建立连接' },
		note: '线上改 nginx 配置基本零抖动，靠的是 reload 的平滑替换：worker 新旧交替、连接不断。看一次 nginx -s reload 内部发生了什么。',
	});
	frames.push({
		active: ['master'],
		badges: { master: '收到 SIGHUP', wold: '处理连接中', client: '已建立连接' },
		note: 'master 收到 reload 信号：先做配置语法检查（习惯：先 nginx -t）——失败就当无事发生，线上不受影响。',
	});
	frames.push({
		active: ['wnew'],
		hotEdges: ['fork'],
		packets: [{ edge: 'fork', at: 0.5, tone: 'req', label: 'fork' }],
		badges: { master: 'v2 配置', wold: '处理连接中', wnew: '新配置 · 接管监听' },
		note: 'master 用新配置 fork 出新 worker：新 worker 打开监听端口，接手所有新连接。',
	});
	frames.push({
		badges: { master: 'v2 配置', wold: '停止接新连接 · 存量照跑', wnew: '接新连接' },
		note: '旧 worker 收到通知：关闭监听套接字——不再接新连接，但已建立的长连接和正在处理的请求原样跑完。',
	});
	frames.push({
		active: ['wold'],
		hotEdges: ['conn'],
		packets: [{ edge: 'conn', at: 0.4, tone: 'resp', label: '响应返回' }],
		badges: { client: '无感知', wold: '存量收尾中', wnew: '接新连接' },
		note: '进行中的请求在旧 worker 里继续处理完毕——客户端全程无感，这就是「平滑」的含义。',
	});
	frames.push({
		dim: ['wold'],
		badges: { client: '无感知', wold: '已退出', wnew: '独占监听' },
		note: '存量连接全部结束，旧 worker 进程退出——替换完成，全程没有「重启」的瞬间。',
	});
	frames.push({
		done: ['master', 'wnew', 'client'],
		badges: { client: '长连接复用中' },
		note: '备忘：热升级二进制用 USR2（新旧 master 共存再收尾）；worker 之间不共享内存——跨请求状态一律放上游（Redis/DB），别指望 worker 内存。',
	});

	return {
		title: 'nginx 平滑 reload · worker 新旧交替',
		height: 400,
		nodes: [
			{ id: 'master', label: 'master 进程', sub: '读配置 · 管 worker', x: 0.22, y: 0.18 },
			{ id: 'client', label: '客户端', sub: '长连接', x: 0.8, y: 0.18 },
			{ id: 'wold', label: '旧 worker', x: 0.22, y: 0.72 },
			{ id: 'wnew', label: '新 worker', sub: '新配置生效', x: 0.66, y: 0.72 },
		],
		edges: [
			{ id: 'fork', from: 'master', to: 'wnew' },
			{ id: 'conn', from: 'client', to: 'wold', both: true, label: '存量连接' },
			{ id: 'fresh', from: 'client', to: 'wnew', label: '新连接' },
		],
		frames,
	};
}

/** Kafka 消费组重平衡：JoinGroup 收集 + SyncGroup 下发，Leader 消费者算方案 */
function kafkaRebalance(): FlowVizConfig {
	const frames: FlowFrame[] = [];

	frames.push({
		badges: { c1: '消费 P0-P2', c2: '消费 P3-P5' },
		note: '消费组正常分工。成员增减（扩容、宕机、心跳超时、处理超时）都会触发重平衡——Eager 协议下，全组要先放弃手头分区再进组。',
	});
	frames.push({
		active: ['coord'],
		hotEdges: ['j1', 'j2'],
		packets: [
			{ edge: 'j1', at: 0.4, tone: 'req', label: 'JoinGroup' },
			{ edge: 'j2', at: 0.6, tone: 'req', label: 'JoinGroup' },
		],
		badges: { c1: '已放弃分区', c2: '已放弃分区' },
		note: '第一阶段 JoinGroup：全员向 GroupCoordinator（Broker 端）报到，交出订阅信息，并放弃手头全部分区——这就是「全组停止消费」的起点。',
	});
	frames.push({
		active: ['c1'],
		hotEdges: ['j1'],
		packets: [{ edge: 'j1', at: 0.15, tone: 'resp', label: '你是 Leader' }],
		badges: { c1: '当选 Leader', c2: '等分配结果' },
		note: 'Coordinator 选一个成员当 Leader consumer，把全组成员的订阅信息下发——注意：分配方案由 Leader 消费者算，Coordinator 只管收集与下发。',
	});
	frames.push({
		active: ['c1'],
		badges: { c1: '计算分配方案', c2: '等分配结果' },
		note: 'Leader 按 partition.assignment.strategy（Range / RoundRobin / Sticky / CooperativeSticky）算出新的分配方案。',
	});
	frames.push({
		active: ['c1', 'c2'],
		hotEdges: ['j1', 'j2'],
		packets: [
			{ edge: 'j1', at: 0.5, tone: 'req', label: 'SyncGroup 方案' },
			{ edge: 'j2', at: 0.5, tone: 'req', label: 'SyncGroup' },
		],
		badges: { c1: '提交方案', c2: '等下发' },
		note: '第二阶段 SyncGroup：Leader 把方案经 Coordinator 下发，各成员拿到自己的分区清单。',
	});
	frames.push({
		active: ['parts'],
		hotEdges: ['assign'],
		packets: [{ edge: 'assign', at: 0.5, tone: 'data', label: '重新分工' }],
		badges: { c1: '新分工', c2: '新分工', coord: 'Generation +1' },
		note: 'Generation 代数 +1 生效——旧代提交的 offset 会被拒绝，防止新旧成员同时写。这是「僵尸消费者」的防线。',
	});
	frames.push({
		done: ['c1', 'c2', 'coord', 'parts'],
		badges: { coord: 'Generation +1' },
		note: '复盘：JoinGroup 收集 + SyncGroup 下发，方案由 Leader 消费者算。代价是全组停摆——所以有 heartbeat/session.timeout/max.poll 三个超时陷阱题，以及 CooperativeSticky 的增量协作重平衡。',
	});

	return {
		title: '消费组重平衡 · JoinGroup 与 SyncGroup 两阶段',
		height: 420,
		nodes: [
			{ id: 'c1', label: 'Consumer 1', x: 0.1, y: 0.2 },
			{ id: 'coord', label: 'GroupCoordinator', sub: 'Broker 端', x: 0.45, y: 0.2, hw: 80 },
			{ id: 'c2', label: 'Consumer 2', x: 0.8, y: 0.2 },
			{ id: 'parts', label: '分区 P0-P5', sub: '重新分配', x: 0.45, y: 0.78 },
		],
		edges: [
			{ id: 'j1', from: 'c1', to: 'coord', both: true },
			{ id: 'j2', from: 'c2', to: 'coord', both: true },
			{ id: 'assign', from: 'coord', to: 'parts', dashed: true },
		],
		frames,
	};
}

/** git rebase：feature 提交摘下来在 main 顶端逐个重放，哈希全变 */
function gitRebase(): FlowVizConfig {
	const frames: FlowFrame[] = [];

	frames.push({
		dim: ['r1', 'r2', 'r3'],
		badges: { m3: 'main', f3: 'feature/login' },
		note: '分支 = 指向提交的轻量指针。feature 从 C2 分叉出 F1→F2→F3，main 自己走到了 C3——历史分叉了，直接 merge 会多出一个合并提交。',
	});
	frames.push({
		active: ['f1'],
		dim: ['r1', 'r2', 'r3'],
		badges: { m3: 'main', f3: 'feature/login' },
		note: 'git rebase main：把 feature 上的提交逐个「摘下来」，搬到 main 顶端重新重放。注意是复制——新提交的内容一样、父指针和哈希全变。',
	});
	frames.push({
		active: ['r1'],
		done: ['f1'],
		dim: ['r2', 'r3'],
		badges: { m3: 'main', f3: 'feature/login' },
		note: '第一步：摘下 F1，以 C3 为父重放出 F1′——改动相同，哈希不同。',
	});
	frames.push({
		active: ['r2'],
		done: ['f1', 'f2', 'r1'],
		dim: ['r3'],
		badges: { m3: 'main', f3: 'feature/login' },
		note: '第二步：摘下 F2，父指针接到 F1′ 上，重放出 F2′。有冲突就在这一步解决后 rebase --continue。',
	});
	frames.push({
		active: ['r3'],
		done: ['f1', 'f2', 'f3', 'r1', 'r2'],
		badges: { m3: 'main', f3: 'feature/login' },
		note: '第三步：F3 重放为 F3′。三个新提交串在 C3 后面——历史变成一条直线。',
	});
	frames.push({
		done: ['m1', 'm2', 'm3', 'r1', 'r2', 'r3'],
		dim: ['f1', 'f2', 'f3'],
		badges: { m3: 'main', r3: 'feature/login', f3: '旧提交 · 弃用' },
		note: 'feature 指针移到 F3′，旧 F1-F3 成为无引用的弃用提交（GC 后消失）。此后合回 main 必是 fast-forward——一条干净的直线历史，好读、好 bisect。',
	});
	frames.push({
		done: ['m1', 'm2', 'm3', 'r1', 'r2', 'r3'],
		dim: ['f1', 'f2', 'f3'],
		badges: { m3: 'main', r3: 'feature/login' },
		note: '黄金法则：rebase 会重写提交，已推送到公共分支的提交绝不要 rebase——别人的历史会和你彻底分叉。惯例：自己分支上 rebase，合入 main 用 merge（PR 默认 no-ff）。',
	});

	return {
		title: 'git rebase · 摘下来，在新的基底上重放',
		height: 420,
		nodes: [
			{ id: 'm1', label: 'C1', x: 0.07, y: 0.18 },
			{ id: 'm2', label: 'C2', x: 0.23, y: 0.18 },
			{ id: 'm3', label: 'C3', x: 0.39, y: 0.18 },
			{ id: 'f1', label: 'F1', x: 0.31, y: 0.74 },
			{ id: 'f2', label: 'F2', x: 0.47, y: 0.74 },
			{ id: 'f3', label: 'F3', x: 0.63, y: 0.74 },
			{ id: 'r1', label: "F1'", x: 0.55, y: 0.18 },
			{ id: 'r2', label: "F2'", x: 0.71, y: 0.18 },
			{ id: 'r3', label: "F3'", x: 0.87, y: 0.18 },
		],
		edges: [
			{ id: 'c12', from: 'm1', to: 'm2' },
			{ id: 'c23', from: 'm2', to: 'm3' },
			{ id: 'f12', from: 'f1', to: 'f2' },
			{ id: 'f23', from: 'f2', to: 'f3' },
			{ id: 'fork', from: 'm2', to: 'f1' },
			{ id: 'base1', from: 'm3', to: 'r1' },
			{ id: 'base2', from: 'r1', to: 'r2' },
			{ id: 'base3', from: 'r2', to: 'r3' },
		],
		frames,
	};
}

/** Redis Cluster 槽重定向：MOVED 永久改址、ASK 临时绕行、Gossip 探活 */
function redisSlot(): FlowVizConfig {
	const frames: FlowFrame[] = [];

	frames.push({
		badges: { na: '槽 0~5460', nc: '槽 10923~16383' },
		note: 'Cluster 把键空间切成 16384 个槽：slot = CRC16(key) % 16384，每个主节点负责一段。客户端可以直连任意节点——路由错了有重定向兜着。',
	});
	frames.push({
		active: ['na'],
		hotEdges: ['qa'],
		packets: [{ edge: 'qa', at: 0.4, tone: 'req', label: 'GET user:42' }],
		note: '客户端 GET user:42，随手打到了节点 A。',
	});
	frames.push({
		active: ['na'],
		hotEdges: ['qa'],
		packets: [{ edge: 'qa', at: 0.78, tone: 'resp', label: 'MOVED 9842 → 节点C' }],
		note: 'A 算槽：CRC16(user:42) % 16384 = 9842，不在我这段。返回 MOVED——这是「永久归属」重定向，客户端应记下槽位表，下次直连 C。',
	});
	frames.push({
		active: ['nc'],
		hotEdges: ['qc'],
		packets: [{ edge: 'qc', at: 0.4, tone: 'req', label: 'GET user:42' }],
		badges: { na: '槽 0~5460', nc: '槽 10923~16383' },
		note: '客户端改连节点 C 重发——槽在本地，直接执行。',
	});
	frames.push({
		badges: { na: '9842 迁移中', nc: '9842 导入中' },
		note: '扩缩容要迁槽：迁移期间槽处于 MIGRATING / IMPORTING 状态，新旧节点各持这段槽的一部分 key。',
	});
	frames.push({
		active: ['nc'],
		hotEdges: ['qc'],
		packets: [{ edge: 'qc', at: 0.78, tone: 'resp', label: 'ASK 9842' }],
		badges: { na: '9842 迁移中', nc: '9842 导入中' },
		note: '查到迁移中的 key：返回 ASK——「这条临时去 C 问」。ASK 不改客户端缓存（迁移完就失效），和 MOVED 的本质区别。',
	});
	frames.push({
		active: ['na', 'nc'],
		hotEdges: ['gossip'],
		packets: [{ edge: 'gossip', at: 0.5, tone: 'data', label: 'ping/pong' }],
		badges: { na: '槽 0~5460', nc: '槽 10923~16383' },
		note: '节点间用 Gossip（ping/pong 携带槽位图与拓扑）互相探活；主挂了它的内置从库自动顶上——哨兵的活被 Cluster 内置了。',
	});
	frames.push({
		done: ['client', 'na', 'nc'],
		badges: { na: '槽 0~5460', nc: '槽 10923~16383' },
		note: '复盘：MOVED = 永久改址（缓存），ASK = 临时绕行（不缓存）。16384 个槽是心跳位图 2KB 的工程折中；槽显式分配让扩缩容按槽搬数据，而不是一致性哈希那样全库 rehash。',
	});

	return {
		title: 'Cluster 槽路由 · MOVED / ASK / Gossip',
		height: 400,
		nodes: [
			{ id: 'client', label: '客户端', x: 0.07, y: 0.2 },
			{ id: 'na', label: '节点 A', sub: 'Redis 主', x: 0.38, y: 0.2, shape: 'cylinder' },
			{ id: 'nc', label: '节点 C', sub: 'Redis 主', x: 0.7, y: 0.2, shape: 'cylinder' },
		],
		edges: [
			{ id: 'qa', from: 'client', to: 'na', both: true },
			{ id: 'qc', from: 'client', to: 'nc', both: true, bend: 48 },
			{ id: 'gossip', from: 'na', to: 'nc', dashed: true, label: 'Gossip' },
		],
		frames,
	};
}

/** Seata TCC：Try 预留 → Confirm 实扣 / Cancel 释放，隔离做在数据模型里 */
function seataTcc(): FlowVizConfig {
	const frames: FlowFrame[] = [];

	frames.push({
		badges: { acct: 'available=100 · frozen=0' },
		note: 'TCC 没有 undo_log，它把「这笔事务可能成功」编码进数据模型：Try 预留、Confirm 实扣、Cancel 释放。看一次库存扣减的 TCC 一生。',
	});
	frames.push({
		active: ['tm'],
		hotEdges: ['reg'],
		packets: [{ edge: 'reg', at: 0.4, tone: 'req', label: 'begin' }],
		badges: { acct: 'available=100 · frozen=0' },
		note: 'TM 向 TC 开启全局事务，XID 随调用链传播到参与者。',
	});
	frames.push({
		active: ['inv'],
		hotEdges: ['call', 'w'],
		packets: [
			{ edge: 'call', at: 0.5, tone: 'req', label: 'Try(-2)' },
			{ edge: 'w', at: 0.5, tone: 'data', label: '预留' },
		],
		badges: { acct: 'available=98 · frozen=2' },
		note: 'Try：资源预留——available -= 2、frozen += 2。数据可见、可并发：两笔全局事务争的是 available 的条件更新（WHERE available >= n），不是 TC 全局锁——热点行从 AT 换 TCC 的原因就在这。',
	});
	frames.push({
		active: ['inv'],
		badges: { acct: 'available=98 · frozen=2' },
		done: ['tm'],
		note: '业务动作成功，TM 通知 TC：全局提交。若失败则走 Cancel——frozen 释放回 available，失败立刻了断，不像 AT 要持着全局锁等到事务结束。',
	});
	frames.push({
		active: ['tc'],
		hotEdges: ['cmd'],
		packets: [{ edge: 'cmd', at: 0.5, tone: 'req', label: 'Confirm' }],
		badges: { acct: 'available=98 · frozen=2' },
		done: ['tm'],
		note: '二阶段：TC 通知 RM 执行 Confirm——frozen -= 2，冻结转实扣。Confirm 必须幂等：TC 会重试驱动直到成功。',
	});
	frames.push({
		done: ['tm', 'tc', 'inv'],
		badges: { acct: 'available=98 · frozen=0' },
		hotEdges: ['w'],
		packets: [{ edge: 'w', at: 0.5, tone: 'data', label: '实扣' }],
		note: '账本落定：可售 98、冻结清零。回滚路径（Cancel）则是 frozen -= 2、available += 2，把预留原样还回去。',
	});
	frames.push({
		done: ['tm', 'tc', 'inv'],
		badges: { acct: 'available=98 · frozen=0' },
		note: '复盘：TCC 的隔离由 Try 的预留模型保证（无全局锁），适合库存/余额这类热点；代价全在纪律——Try 必须真预留、Confirm/Cancel 必须幂等，还要防悬挂与空回滚。',
	});

	return {
		title: 'Seata TCC · Try 预留，Confirm 实扣，Cancel 释放',
		height: 400,
		nodes: [
			{ id: 'tm', label: '业务服务', sub: 'TM · 发起方', x: 0.12, y: 0.2 },
			{ id: 'tc', label: 'TC 协调器', sub: '二阶段指令', x: 0.5, y: 0.2 },
			{ id: 'inv', label: '库存服务', sub: 'RM', x: 0.85, y: 0.2 },
			{ id: 'acct', label: '库存行', sub: 'available / frozen', x: 0.5, y: 0.78, hw: 76 },
		],
		edges: [
			{ id: 'reg', from: 'tm', to: 'tc', both: true },
			{ id: 'call', from: 'tm', to: 'inv', both: true, bend: 40 },
			{ id: 'w', from: 'inv', to: 'acct' },
			{ id: 'cmd', from: 'tc', to: 'inv', dashed: true },
		],
		frames,
	};
}

/** nginx 事件驱动：一个 proxy_pass 请求的生命周期，worker 从不干等 IO */
function nginxLifecycle(): FlowVizConfig {
	const frames: FlowFrame[] = [];

	frames.push({
		note: '「几个 worker 撑住海量连接」的本质：单线程事件循环从不干等 IO。看一个 proxy_pass 请求在 worker 里的完整生命周期。',
	});
	frames.push({
		active: ['worker'],
		hotEdges: ['req'],
		packets: [{ edge: 'req', at: 0.4, tone: 'req', label: '请求到达' }],
		badges: { worker: 'epoll：可读事件' },
		note: '网卡收到请求，epoll_wait 把「可读」事件交给 worker——不是每个连接配一个线程，而是事件来了才有人管。',
	});
	frames.push({
		active: ['worker'],
		badges: { worker: '读头 · 匹配 location' },
		note: 'worker 为连接建 HTTP 状态机：读请求头 → 匹配 server → 匹配 location，决定直接回静态文件还是转发。',
	});
	frames.push({
		active: ['upstream'],
		hotEdges: ['proxy'],
		packets: [{ edge: 'proxy', at: 0.3, tone: 'req', label: '异步连接 upstream' }],
		badges: { worker: '发起后立即返回' },
		note: 'proxy_pass 转发：向 upstream 发起连接——异步，发完立刻返回，worker 不挂在这里等。',
	});
	frames.push({
		active: ['others'],
		hotEdges: ['idle'],
		packets: [{ edge: 'idle', at: 0.5, tone: 'data', label: '继续处理别的连接' }],
		badges: { worker: '去忙别的连接' },
		note: '等 upstream 回包期间 worker 不阻塞，转身处理其他请求——「高并发」的关键就在这：等待的成本趋近于零，对比每连接一线程的模型，等 IO 时线程闲置却占资源。',
	});
	frames.push({
		active: ['worker'],
		hotEdges: ['proxy'],
		packets: [{ edge: 'proxy', at: 0.75, tone: 'resp', label: '回包事件' }],
		badges: { worker: '可写事件 · 写回客户端' },
		done: ['others'],
		note: 'upstream 回包——又是事件触发：epoll 报告可读，worker 把响应异步写给客户端。',
	});
	frames.push({
		done: ['client', 'worker', 'upstream'],
		badges: { worker: '事件循环继续' },
		note: '调优事实两条：worker_processes = CPU 核数（每个 worker 单线程，核数才等于并行度）；worker_connections 是单个 worker 的连接上限——海量长连接先放大 ulimit，否则先撞文件句柄。',
	});

	return {
		title: '请求的生命周期 · epoll 事件循环从不干等 IO',
		height: 400,
		nodes: [
			{ id: 'client', label: '客户端', x: 0.07, y: 0.2 },
			{ id: 'worker', label: 'worker', sub: '单线程事件循环', x: 0.38, y: 0.2 },
			{ id: 'upstream', label: '上游服务', sub: 'proxy_pass 目标', x: 0.74, y: 0.2 },
			{ id: 'others', label: '其他请求', sub: '同时在线的连接', x: 0.38, y: 0.78 },
		],
		edges: [
			{ id: 'req', from: 'client', to: 'worker', both: true },
			{ id: 'proxy', from: 'worker', to: 'upstream', both: true },
			{ id: 'idle', from: 'worker', to: 'others', dashed: true, label: '不阻塞', labelAt: 0.72 },
		],
		frames,
	};
}

/** MySQL 一条 SELECT 的旅程：连接器 → 分析/优化 → 执行器 ↔ 引擎逐行取数 */
function mysqlQuery(): FlowVizConfig {
	const frames: FlowFrame[] = [];

	frames.push({
		note: "一条 SELECT 的旅程比 UPDATE 简单——没有日志与两阶段提交，重点在 Server 层三步与引擎取数。查询缓存 8.0 已移除：命中率极低、任何更新都清缓存，收益为负。",
	});
	frames.push({
		active: ['conn'],
		hotEdges: ['c1'],
		packets: [{ edge: 'c1', at: 0.5, tone: 'req', label: 'SELECT …' }],
		note: '连接器：TCP 握手、账号密码鉴权、拿到权限表快照——改权限只对新连接生效的原因。长连接省下握手，但内存随命令堆积，靠连接池或定期 reset 兜住。',
	});
	frames.push({
		active: ['opt'],
		hotEdges: ['c2'],
		packets: [{ edge: 'c2', at: 0.5, tone: 'data', label: 'AST' }],
		done: ['conn'],
		note: '分析器：词法 + 语法解析出「这是一条查询」（ERROR 1064 这层抛）；优化器：决定用哪个索引、join 什么顺序——执行计划在这定型，explain 看的就是它的决策。',
	});
	frames.push({
		active: ['exec'],
		hotEdges: ['c3'],
		packets: [{ edge: 'c3', at: 0.5, tone: 'req', label: '按计划执行' }],
		done: ['conn', 'opt'],
		note: '执行器：先做表级权限校验（所以存储引擎看不到鉴权逻辑），然后按计划调用 InnoDB 的接口取数。',
	});
	frames.push({
		active: ['innodb'],
		hotEdges: ['c4'],
		packets: [{ edge: 'c4', at: 0.5, tone: 'data', label: '定位数据页' }],
		done: ['conn', 'opt', 'exec'],
		note: 'InnoDB：B+ 树从根到叶定位数据页——命中索引通常只要 3~4 层；按 where 过滤后逐行交还执行器。',
	});
	frames.push({
		active: ['exec'],
		hotEdges: ['c4', 'c3', 'c2', 'c1'],
		packets: [
			{ edge: 'c4', at: 0.25, tone: 'resp', label: '行' },
			{ edge: 'c1', at: 0.35, tone: 'resp', label: '结果集' },
		],
		done: ['conn', 'opt', 'exec', 'innodb'],
		note: '执行器与引擎逐行交互取完数据，结果集写回客户端——读路径不落 redo/binlog，没有提交环节。',
	});
	frames.push({
		done: ['client', 'conn', 'opt', 'exec', 'innodb'],
		note: '复盘：连接器一次付成本，分析/优化每条都走，执行器与引擎逐行交互。慢查询排障沿这条链看：连接数、执行计划（explain）、引擎扫描行数。',
	});

	return {
		title: '一条 SELECT 的旅程 · Server 层与引擎交互',
		height: 380,
		nodes: [
			{ id: 'client', label: '客户端', x: 0.05, y: 0.18 },
			{ id: 'conn', label: '连接器', sub: '鉴权 · 连接管理', x: 0.27, y: 0.18 },
			{ id: 'opt', label: '分析 + 优化器', sub: '解析 · 选执行计划', x: 0.53, y: 0.18, hw: 70 },
			{ id: 'exec', label: '执行器', sub: '调引擎接口', x: 0.79, y: 0.18 },
			{ id: 'innodb', label: 'InnoDB', sub: 'B+ 树取数', x: 0.6, y: 0.78, hw: 66 },
		],
		edges: [
			{ id: 'c1', from: 'client', to: 'conn', both: true },
			{ id: 'c2', from: 'conn', to: 'opt' },
			{ id: 'c3', from: 'opt', to: 'exec' },
			{ id: 'c4', from: 'exec', to: 'innodb', both: true },
		],
		frames,
	};
}

/** DNS 八步缓存链：递归问本地，本地迭代问根/顶级/权威，缓存按 TTL */
function dnsLookup(): FlowVizConfig {
	const frames: FlowFrame[] = [];

	frames.push({
		note: 'DNS 解析 = 两段式：客户端到本地 DNS 是递归（必须给最终答案），本地 DNS 到根/顶级/权威是迭代（一级级问路）。缓存无处不在，按记录的 TTL 过期。',
	});
	frames.push({
		active: ['local'],
		hotEdges: ['rec'],
		packets: [{ edge: 'rec', at: 0.4, tone: 'req', label: '查 api.example.com' }],
		badges: { browser: '缓存 miss' },
		note: '浏览器缓存、hosts 文件都没有 → 问本地 DNS（运营商或 8.8.8.8）——递归开始：你必须给我最终答案。',
	});
	frames.push({
		active: ['root'],
		hotEdges: ['i1'],
		packets: [{ edge: 'i1', at: 0.5, tone: 'req', label: '问根' }],
		badges: { local: '缓存 miss' },
		note: '本地 DNS 也没缓存 → 迭代开始：先问根服务器——「谁管 .com？」',
	});
	frames.push({
		active: ['tld'],
		hotEdges: ['i1', 'i2'],
		packets: [
			{ edge: 'i1', at: 0.8, tone: 'resp', label: '.com 在这' },
			{ edge: 'i2', at: 0.4, tone: 'req', label: '问 com' },
		],
		note: '根服务器答：.com 顶级域的地址在这——本地 DNS 转身去问顶级域。',
	});
	frames.push({
		active: ['auth'],
		hotEdges: ['i2', 'i3'],
		packets: [
			{ edge: 'i2', at: 0.8, tone: 'resp', label: '权威在这' },
			{ edge: 'i3', at: 0.35, tone: 'req', label: '问权威' },
		],
		note: '顶级域答：example.com 的权威 NS 在这——本地 DNS 直接问权威服务器。',
	});
	frames.push({
		active: ['local'],
		hotEdges: ['i3'],
		packets: [{ edge: 'i3', at: 0.85, tone: 'resp', label: 'IP · TTL 300' }],
		badges: { local: '缓存 · TTL 300' },
		note: '权威给出 A 记录 + TTL——本地 DNS 缓存一份。「换 IP 要提前调小 TTL」的原因就在这：缓存要等它自然过期。',
	});
	frames.push({
		done: ['browser', 'local', 'root', 'tld', 'auth'],
		hotEdges: ['rec'],
		packets: [{ edge: 'rec', at: 0.7, tone: 'resp', label: 'IP 返回' }],
		badges: { browser: '也缓存一份' },
		note: '本地 DNS 把答案递归返回浏览器，浏览器再缓存一层——八步缓存链走完，后续请求命中任意一层缓存都会短路。',
	});

	return {
		title: 'DNS 解析 · 递归 + 迭代的八步缓存链',
		height: 380,
		nodes: [
			{ id: 'browser', label: '浏览器', x: 0.07, y: 0.42 },
			{ id: 'local', label: '本地 DNS', sub: '递归解析器', x: 0.34, y: 0.42 },
			{ id: 'root', label: '根服务器', sub: '. ', x: 0.62, y: 0.1 },
			{ id: 'tld', label: '顶级域', sub: 'com', x: 0.88, y: 0.1 },
			{ id: 'auth', label: '权威服务器', sub: 'example.com', x: 0.88, y: 0.74 },
		],
		edges: [
			{ id: 'rec', from: 'browser', to: 'local', both: true },
			{ id: 'i1', from: 'local', to: 'root', both: true },
			{ id: 'i2', from: 'root', to: 'tld', both: true },
			{ id: 'i3', from: 'tld', to: 'auth', both: true },
		],
		frames,
	};
}

/** SpringMVC doDispatch 九步：过滤器 → 前端控制器 → 映射/适配 → 返回值处理 */
function springmvcFlow(): FlowVizConfig {
	const frames: FlowFrame[] = [];

	frames.push({
		note: 'SpringMVC 的核心是一个 Servlet：DispatcherServlet.doDispatch 九步流水线。走一遍，考点最密的两个中间层：HandlerMapping 与 HandlerAdapter。',
	});
	frames.push({
		active: ['filter'],
		hotEdges: ['e1'],
		packets: [{ edge: 'e1', at: 0.4, tone: 'req', label: '请求' }],
		note: '①过滤器链先跑——Filter 是 Servlet 容器规范的，不属于 MVC 体系，编码/鉴权常挂在这。',
	});
	frames.push({
		active: ['ds'],
		hotEdges: ['e2'],
		packets: [{ edge: 'e2', at: 0.5, tone: 'req', label: 'doDispatch' }],
		done: ['filter'],
		note: '②DispatcherServlet.doDispatch 接管——前端控制器的总调度开始。',
	});
	frames.push({
		active: ['hm'],
		hotEdges: ['e3'],
		packets: [{ edge: 'e3', at: 0.5, tone: 'data', label: '查注册表' }],
		done: ['filter', 'ds'],
		note: '③HandlerMapping：按 URL + 方法 + 条件匹配出 HandlerExecutionChain（Handler + 一串拦截器）——@RequestMapping 启动期就注册成了 Map。',
	});
	frames.push({
		active: ['pre'],
		hotEdges: ['e4'],
		packets: [{ edge: 'e4', at: 0.5, tone: 'req', label: 'preHandle' }],
		done: ['filter', 'ds', 'hm'],
		note: '④拦截器 preHandle：登录校验这类前置逻辑，返回 false 直接短路后续所有步骤。',
	});
	frames.push({
		active: ['ctrl'],
		hotEdges: ['e5'],
		packets: [{ edge: 'e5', at: 0.5, tone: 'req', label: '适配调用' }],
		done: ['filter', 'ds', 'hm', 'pre'],
		note: '⑤⑥⑦HandlerAdapter 用统一姿势调用五花八门的处理器（适配器模式的教科书现场），参数解析 / 消息转换后执行 @Controller 方法。',
	});
	frames.push({
		active: ['rv'],
		hotEdges: ['e6'],
		packets: [{ edge: 'e6', at: 0.5, tone: 'data', label: '返回值' }],
		done: ['filter', 'ds', 'hm', 'pre', 'ctrl'],
		note: '⑧返回值处理：@ResponseBody 走 MessageConverter 直接写 JSON；普通返回走 ViewResolver 渲染视图。',
	});
	frames.push({
		done: ['filter', 'ds', 'hm', 'pre', 'ctrl', 'rv', 'post'],
		note: '⑨拦截器 postHandle / afterCompletion 收尾，响应回客户端。链路任何一步抛异常，都会被 @ControllerAdvice 的异常处理器兜住。',
	});

	return {
		title: 'SpringMVC · doDispatch 九步流水线',
		height: 400,
		nodes: [
			{ id: 'filter', label: '过滤器链', sub: '容器层', x: 0.06, y: 0.16 },
			{ id: 'ds', label: 'DispatcherServlet', sub: 'doDispatch', x: 0.31, y: 0.16, hw: 78 },
			{ id: 'hm', label: 'HandlerMapping', sub: 'URL → Handler', x: 0.58, y: 0.16, hw: 72 },
			{ id: 'pre', label: 'preHandle', sub: '拦截器', x: 0.84, y: 0.16 },
			{ id: 'ctrl', label: 'Controller', sub: '@RequestMapping', x: 0.84, y: 0.74 },
			{ id: 'rv', label: '返回值处理', sub: 'JSON / 视图', x: 0.53, y: 0.74 },
			{ id: 'post', label: 'afterCompletion', sub: '拦截器收尾', x: 0.23, y: 0.74, hw: 68 },
		],
		edges: [
			{ id: 'e1', from: 'filter', to: 'ds' },
			{ id: 'e2', from: 'ds', to: 'hm' },
			{ id: 'e3', from: 'hm', to: 'pre' },
			{ id: 'e4', from: 'pre', to: 'ctrl' },
			{ id: 'e5', from: 'ctrl', to: 'rv' },
			{ id: 'e6', from: 'rv', to: 'post' },
		],
		frames,
	};
}

/** Redis 持久化：RDB 的 fork+CoW 快照与 AOF 的追加+重写 */
function redisPersist(): FlowVizConfig {
	const frames: FlowFrame[] = [];

	frames.push({
		note: 'Redis 持久化两条路线：RDB 是某一瞬间的照片（fork + 写时复制），AOF 是每条写命令的日志（追加 + 三档刷盘）。bgsave 和 AOF 重写共享同一套 fork 魔法。',
	});
	frames.push({
		active: ['child'],
		hotEdges: ['fork'],
		packets: [{ edge: 'fork', at: 0.5, tone: 'req', label: 'fork()' }],
		note: 'bgsave：主进程 fork 出子进程——父子共享同一份物理内存页，子进程看到的永远是 fork 瞬间的「照片」，主进程继续服务。',
	});
	frames.push({
		active: ['file'],
		hotEdges: ['persist'],
		packets: [{ edge: 'persist', at: 0.5, tone: 'data', label: '遍历写快照' }],
		done: ['main'],
		note: '子进程遍历内存数据写临时 RDB 文件，写完原子替换旧文件——期间主进程的读写完全不受阻塞。',
	});
	frames.push({
		active: ['main'],
		hotEdges: ['w'],
		packets: [{ edge: 'w', at: 0.5, tone: 'req', label: 'SET k1 v1' }],
		badges: { main: 'CoW：复制该页' },
		note: '主进程这时改数据？操作系统把被改的页复制一份给主进程改——改多少复制多少，快照期间内存可能接近翻倍，部署容量要留这份余量（极端时 OOM 风险）。',
	});
	frames.push({
		active: ['main'],
		hotEdges: ['w', 'append'],
		packets: [
			{ edge: 'w', at: 0.4, tone: 'req', label: '写命令' },
			{ edge: 'append', at: 0.55, tone: 'data', label: '追加' },
		],
		badges: { file: 'AOF 追加中' },
		note: 'AOF 路线：每条写命令先进缓冲再追加文件。刷盘三档：always 最多丢 1 条最慢、everysec（默认）后台线程每秒刷最多丢 1 秒、no 交给 OS 最快最不安全。',
	});
	frames.push({
		active: ['child'],
		hotEdges: ['fork', 'persist'],
		packets: [
			{ edge: 'fork', at: 0.5, tone: 'req', label: 'fork() 重写' },
			{ edge: 'persist', at: 0.5, tone: 'data', label: '最小命令集' },
		],
		badges: { file: 'AOF 重写中' },
		note: '文件太长恢复慢 → bgrewriteaof：同样 fork 子进程，按当前内存状态反向生成最小等价命令集（100 次 incr 合并成一条 set）。期间新写命令进重写缓冲，最后补进新文件。',
	});
	frames.push({
		done: ['main', 'child', 'file'],
		badges: { file: 'RDB + AOF 混合' },
		note: '复盘：4.0+ 推荐混合持久化——RDB 快照打底（恢复快）+ 增量 AOF（丢得少）。两者都靠 fork + COW，大实例都要给快照期间的内存翻倍留余量。',
	});

	return {
		title: 'Redis 持久化 · RDB 快照与 AOF 重写',
		height: 380,
		nodes: [
			{ id: 'main', label: 'Redis 主进程', sub: '继续服务', x: 0.18, y: 0.2 },
			{ id: 'child', label: 'fork 子进程', sub: '写文件不阻塞主', x: 0.52, y: 0.2 },
			{ id: 'file', label: '磁盘文件', sub: 'RDB / AOF', x: 0.84, y: 0.2, shape: 'doc' },
			{ id: 'wreq', label: '客户端写', x: 0.18, y: 0.76 },
		],
		edges: [
			{ id: 'fork', from: 'main', to: 'child' },
			{ id: 'persist', from: 'child', to: 'file' },
			{ id: 'w', from: 'wreq', to: 'main' },
			{ id: 'append', from: 'main', to: 'file', dashed: true },
		],
		frames,
	};
}

/** git reset 三层回退 + reflog 找回 + revert 公共分支正解 */
function gitReset(): FlowVizConfig {
	const frames: FlowFrame[] = [];

	frames.push({
		badges: { wt: '改了', idx: 'add 过', repo: 'C2 已提交' },
		note: '撤销改动的本质是操作「三棵树」：工作区 → 暂存区 → 本地仓库。reset 的三种模式区别只有一件事——回退停在哪一层。',
	});
	frames.push({
		badges: { wt: '改动还在', idx: '改动还在', repo: 'HEAD → C1' },
		note: 'reset --soft HEAD~1：只移动分支指针，暂存区与工作区原封不动——改动全留在暂存区，适合重新组织后再提交。',
	});
	frames.push({
		badges: { wt: '改动还在', idx: '已清空', repo: 'HEAD → C1' },
		note: 'reset --mixed（默认）：指针 + 暂存区一起退——改动从暂存区退回工作区，重新挑选着 add。',
	});
	frames.push({
		dim: ['wt'],
		badges: { wt: '改动消失', idx: '已清空', repo: 'HEAD → C1' },
		note: 'reset --hard：三层全部拉回 C1——工作区未提交的改动直接消失。私有分支慎用；不可恢复？往下看 reflog。',
	});
	frames.push({
		dim: ['wt'],
		badges: { repo: 'reflog · HEAD 轨迹' },
		note: 'reflog 记录了 HEAD 的每一次移动：git reset --hard HEAD@{2} 就能穿越回去，「丢失」的提交依然找得回——最后的救命稻草。',
	});
	frames.push({
		done: ['wt', 'idx', 'repo'],
		badges: { repo: 'revert 反向提交' },
		note: '已 push 到公共分支？别 reset（改历史）——git revert 生成一个「反向提交」抵消旧提交，历史不被改写，是公共分支唯一正解。',
	});
	frames.push({
		done: ['wt', 'idx', 'repo'],
		badges: { repo: 'revert 反向提交' },
		note: '复盘：soft 动一层（仓库）、mixed 动两层（+暂存）、hard 动三层（+工作区）；公共分支用 revert；stash 是第四条路——临时存档，回来再 pop。',
	});

	return {
		title: '撤销三层树 · soft / mixed / hard 与 revert',
		height: 350,
		nodes: [
			{ id: 'wt', label: '工作区', sub: '你的编辑', x: 0.16, y: 0.3 },
			{ id: 'idx', label: '暂存区', sub: '待提交', x: 0.5, y: 0.3 },
			{ id: 'repo', label: '本地仓库', sub: '提交历史', x: 0.84, y: 0.3 },
		],
		edges: [
			{ id: 'add', from: 'wt', to: 'idx', label: 'git add' },
			{ id: 'commit', from: 'idx', to: 'repo', label: 'git commit' },
		],
		frames,
	};
}

/** MQ 可靠性三道闸：生产端确认 / Broker 持久化副本 / 消费端手动 ack */
function mwGates(): FlowVizConfig {
	const frames: FlowFrame[] = [];

	frames.push({
		note: '消息不丢是全链路木桶：生产端、Broker、消费端三段各设一道闸——任何一段失守，消息就可能在那一环蒸发。',
	});
	frames.push({
		active: ['producer'],
		hotEdges: ['send', 'comp'],
		packets: [
			{ edge: 'send', at: 0.4, tone: 'req', label: '同步发送' },
			{ edge: 'comp', at: 0.5, tone: 'data', label: '失败落地补偿' },
		],
		note: '闸一（生产端）：发出去才算数——RabbitMQ confirm、Kafka acks=all、RocketMQ 同步发送；失败重试，仍不行落地本地消息表定时补偿。忌讳：异步发送不关心回执。',
	});
	frames.push({
		active: ['broker'],
		done: ['producer'],
		note: '闸二（Broker）：存下来才可靠——持久化（RabbitMQ 交换机/队列/消息三件套 durable、RocketMQ 同步刷盘）+ 副本（Kafka 3 副本 min.insync.replicas=2、主从同步复制）。刷盘与副本是「性能换可靠」的两个独立旋钮。',
	});
	frames.push({
		active: ['consumer'],
		hotEdges: ['deliver'],
		packets: [{ edge: 'deliver', at: 0.4, tone: 'data', label: '投递' }],
		done: ['producer', 'broker'],
		note: '闸三（消费端）：处理完才确认——手动 ack、关自动提交位移。忌讳「先 ack 再处理」：ack 后进程崩了，这条消息就永久没了。',
	});
	frames.push({
		active: ['dlq'],
		hotEdges: ['dlq'],
		packets: [{ edge: 'dlq', at: 0.5, tone: 'data', label: '重试耗尽 → 死信' }],
		done: ['producer', 'broker'],
		note: '消费失败：重试队列几轮后进死信队列兜底 + 告警——别无限重试堵住正常消费。',
	});
	frames.push({
		note: '光不丢还不够——重试必然带来重复。「不重」靠幂等：唯一业务键、去重表、状态机检查——承认重复，用幂等消灭重复。',
	});
	frames.push({
		done: ['producer', 'broker', 'consumer', 'comp', 'dlq'],
		note: '三问速答：会不会丢？看三道闸。会不会重？看幂等。会不会乱？分区内有序、全局有序是奢侈品——按业务设计排序键，重试乱序靠幂等兜住。',
	});

	return {
		title: '消息可靠性 · 三段各一道闸',
		height: 400,
		nodes: [
			{ id: 'producer', label: '生产端', sub: '确认 + 重试', x: 0.1, y: 0.22 },
			{ id: 'broker', label: 'Broker', sub: '持久化 + 副本', x: 0.5, y: 0.22, shape: 'cylinder' },
			{ id: 'consumer', label: '消费端', sub: '手动 ack', x: 0.9, y: 0.22 },
			{ id: 'comp', label: '本地消息表', sub: '定时补偿', x: 0.1, y: 0.78, shape: 'doc' },
			{ id: 'dlq', label: '死信队列', sub: '兜底 + 告警', x: 0.9, y: 0.78, shape: 'doc' },
		],
		edges: [
			{ id: 'send', from: 'producer', to: 'broker', both: true },
			{ id: 'deliver', from: 'broker', to: 'consumer', both: true },
			{ id: 'comp', from: 'producer', to: 'comp', dashed: true },
			{ id: 'dlq', from: 'broker', to: 'dlq', dashed: true },
		],
		frames,
	};
}

/** AI Agent 循环：拆解计划 → 执行工具 → 观察更新，清单即外部记忆 */
function aiAgentLoop(): FlowVizConfig {
	const frames: FlowFrame[] = [];

	frames.push({
		note: 'Agent 的本质是一个循环：LLM 把目标拆成任务清单，逐个「执行 → 观察 → 更新」，直到清单全绿。看这个循环怎么转。',
	});
	frames.push({
		active: ['llm'],
		hotEdges: ['g'],
		packets: [{ edge: 'g', at: 0.4, tone: 'req', label: '目标' }],
		note: '用户下达目标，LLM 先读上下文，把大目标拆解成有序的小任务——没有计划的 Agent 走哪算哪，长任务必漏项。',
	});
	frames.push({
		active: ['todos'],
		hotEdges: ['plan'],
		packets: [{ edge: 'plan', at: 0.5, tone: 'data', label: 'todo_write' }],
		badges: { todos: '3 项 pending' },
		note: '计划落成任务清单：每项 pending / in_progress / completed 三态——既是对外可见的进度，也是 LLM 的自我提醒。',
	});
	frames.push({
		active: ['tools'],
		hotEdges: ['exec'],
		packets: [{ edge: 'exec', at: 0.4, tone: 'req', label: '调用工具' }],
		badges: { todos: '1 项 in_progress' },
		note: '取第一个任务置为 in_progress，LLM 决定调用哪个工具（bash / 读写文件……）——工具结果返回后成为新的上下文。',
	});
	frames.push({
		active: ['llm'],
		hotEdges: ['exec'],
		packets: [{ edge: 'exec', at: 0.75, tone: 'resp', label: '观察结果' }],
		badges: { todos: '1 completed · 2 pending' },
		note: '观察：符合预期就勾掉当前任务；不符就修正计划——清单允许中途改写，跑偏了能拉回来。',
	});
	frames.push({
		active: ['llm'],
		badges: { todos: '1 completed · 2 pending' },
		note: '循环继续：下一个任务 in_progress → 执行 → 观察。上下文有限，清单同时充当「外部记忆」，长任务不漏项的根基。',
	});
	frames.push({
		done: ['goal', 'llm', 'todos', 'tools'],
		badges: { todos: '全部 completed' },
		note: '清单全绿 → 向用户汇报。计划-执行-观察的闭环，让 LLM 从「一问一答」变成能自主推进的长任务系统。',
	});

	return {
		title: 'AI Agent 循环 · 计划、执行、观察',
		height: 380,
		nodes: [
			{ id: 'goal', label: '用户目标', x: 0.08, y: 0.3 },
			{ id: 'llm', label: 'LLM', sub: '规划 + 决策', x: 0.42, y: 0.3 },
			{ id: 'todos', label: '任务清单', sub: '三态推进', x: 0.8, y: 0.1 },
			{ id: 'tools', label: '工具集', sub: 'bash / 读写文件', x: 0.8, y: 0.62 },
		],
		edges: [
			{ id: 'g', from: 'goal', to: 'llm' },
			{ id: 'plan', from: 'llm', to: 'todos', both: true },
			{ id: 'exec', from: 'llm', to: 'tools', both: true },
		],
		frames,
	};
}

/** LangChain Agent 循环：tool_calls 路由 → ToolNode 执行 → ToolMessage 回传 → 循环闭合 */
function lcAgentLoop(): FlowVizConfig {
	const frames: FlowFrame[] = [];

	frames.push({
		badges: { model: '第 1 轮' },
		note: '订单查询问题进入 messages。Agent 循环每一轮都把完整消息历史 + 工具 schema 发给模型——模型只做决策，不执行工具。',
	});
	frames.push({
		active: ['model'],
		hotEdges: ['tc'],
		packets: [{ edge: 'tc', at: 0.5, tone: 'req', label: 'tool_calls' }],
		badges: { model: '要工具' },
		note: '模型返回 AIMessage(tool_calls)：「我要查 search_order(order_id=…)」。注意它只是发出调用请求，真正执行的是图上的 ToolNode。',
	});
	frames.push({
		active: ['tools'],
		badges: { model: '要工具', tools: '执行中' },
		note: '条件边看到 tool_calls 就把控制权交给 tools 节点：ToolNode 执行 search_order，把结果包装成 ToolMessage（按 tool_call_id 对应）。',
	});
	frames.push({
		active: ['model'],
		hotEdges: ['tr'],
		packets: [{ edge: 'tr', at: 0.6, tone: 'data', label: 'ToolMessage' }],
		badges: { model: '第 2 轮', tools: '已完成' },
		note: 'ToolMessage 追加进 messages，回头边把执行送回 model——循环闭合。第 2 轮模型带着工具结果继续推理。',
	});
	frames.push({
		active: ['model'],
		badges: { model: '收敛', tools: '已完成' },
		note: '证据够了：第 2 轮模型不再请求工具，直接产出最终回答——条件边这次返回 END，循环退出。',
	});
	frames.push({
		active: ['user'],
		hotEdges: ['ans'],
		packets: [{ edge: 'ans', at: 0.6, tone: 'resp', label: '最终回答' }],
		dim: ['tools'],
		badges: { model: 'END', tools: '已完成' },
		note: '回答流出循环。create_agent 就是把这张图开箱化：model 节点 + ToolNode + 条件边，返回的依然是可继续定制的 LangGraph 图。',
	});
	frames.push({
		done: ['user', 'model', 'tools'],
		badges: { model: 'END', tools: '已完成' },
		note: '复盘：循环 = bind_tools 绑定 + 条件边判 tool_calls + ToolNode 回传 + 回头边闭合。生产必配 recursion_limit，防工具死循环烧钱。',
	});

	return {
		title: 'LangGraph Agent 循环 · tool_calls 的去与回',
		height: 380,
		nodes: [
			{ id: 'user', label: '用户', sub: '问题 / 最终回答', x: 0.08, y: 0.3 },
			{ id: 'model', label: 'model 节点', sub: 'bind_tools 决策', x: 0.45, y: 0.3 },
			{ id: 'tools', label: 'ToolNode', sub: '执行 + ToolMessage', x: 0.8, y: 0.68 },
		],
		edges: [
			{ id: 'q', from: 'user', to: 'model', label: 'invoke' },
			{ id: 'ans', from: 'model', to: 'user', dashed: true },
			{ id: 'tc', from: 'model', to: 'tools', label: 'tool_calls' },
			{ id: 'tr', from: 'tools', to: 'model', dashed: true },
		],
		frames,
	};
}

/** Kubernetes 滚动发布：Deployment 驱动新旧 ReplicaSet 副本此消彼长 */
function k8sRollout(): FlowVizConfig {
	const frames: FlowFrame[] = [];

	frames.push({
		badges: { v1: '3 副本', v2: '0 副本' },
		note: '初始状态：ReplicaSet v1 维持 3 个 v1 Pod，Service 只把流量打到 Ready 的 Pod。现在把 Deployment 的镜像改成 v2。',
	});
	frames.push({
		active: ['v2'],
		hotEdges: ['dv2'],
		packets: [{ edge: 'dv2', at: 0.5, tone: 'req', label: '创建新 RS' }],
		badges: { v1: '3 副本', v2: '1 启动中' },
		note: 'Deployment 发现模板变了：不改建成的 v1，而是创建 ReplicaSet v2。maxSurge=1 → v2 先起 1 个新 Pod（总数临时 4）。',
	});
	frames.push({
		active: ['v2'],
		badges: { v1: '3 副本', v2: '1 Ready' },
		note: '新 Pod 通过 readiness 探针成为 Ready——它才开始接流量。探针没过，这里就会一直卡住，直到发布超时。',
	});
	frames.push({
		active: ['v1'],
		hotEdges: ['dv1'],
		packets: [{ edge: 'dv1', at: 0.6, tone: 'req', label: '缩容 1' }],
		badges: { v1: '2 副本', v2: '1 Ready' },
		note: 'maxUnavailable=1 → v1 现在才被砍掉 1 个旧 Pod：先保证可用性下限，再腾位置。新 Pod Ready 与旧 Pod 缩减交替进行。',
	});
	frames.push({
		badges: { v1: '0 副本', v2: '3 Ready' },
		note: '循环往复：v2 扩 1 → 等 Ready → v1 缩 1，直到 v1 归零。Service 全程只把流量给 Ready 的 Pod，业务无感。',
	});
	frames.push({
		done: ['deploy', 'v1', 'v2'],
		badges: { v1: '保留 0 副本', v2: '3 副本' },
		note: '收尾：v1 的 ReplicaSet 不删除（revisionHistoryLimit），副本归零待命。回滚 = 把旧 RS 副本调回来——回滚本身就是又一次滚动发布。',
	});

	return {
		title: '滚动发布 · 新旧 ReplicaSet 此消彼长',
		height: 380,
		nodes: [
			{ id: 'deploy', label: 'Deployment', sub: '管版本与节奏', x: 0.42, y: 0.08 },
			{ id: 'v1', label: 'ReplicaSet v1', sub: '旧模板', x: 0.12, y: 0.66 },
			{ id: 'v2', label: 'ReplicaSet v2', sub: '新模板', x: 0.76, y: 0.66 },
		],
		edges: [
			{ id: 'dv1', from: 'deploy', to: 'v1', label: '副本数' },
			{ id: 'dv2', from: 'deploy', to: 'v2', label: '副本数' },
			{ id: 'sw', from: 'v1', to: 'v2', label: '交替', dashed: true },
		],
		frames,
	};
}

/** MongoDB chunk 迁移：分裂 → balancer → 四步迁移与路由切换 */
function mongoChunk(): FlowVizConfig {
	const frames: FlowFrame[] = [];

	frames.push({
		badges: { cfg: 'chunk 默认 64MB' },
		note: '分片集群里数据按分片键切成 chunk（默认 64MB），路由表在 Config Server，mongos 只是无状态入口。看一个 chunk 怎么在分片间搬家。',
	});
	frames.push({
		active: ['donor'],
		badges: { donor: 'chunk 写满 → split' },
		note: '写入把 chunk 撑大 → 触发分裂一分为二；balancer 巡检发现分片间 chunk 数不均 → 选中一对「源 → 目标」开始迁移。',
	});
	frames.push({
		active: ['recipient'],
		hotEdges: ['mig'],
		packets: [{ edge: 'mig', at: 0.35, tone: 'data', label: 'clone 数据' }],
		badges: { donor: '迁移中', recipient: 'clone + 追增量' },
		note: '迁移①：目标分片把 chunk 数据 clone 过去，随后持续追增量——期间写入仍在源上。',
	});
	frames.push({
		active: ['donor'],
		hotEdges: ['mig'],
		packets: [{ edge: 'mig', at: 0.78, tone: 'req', label: '临界区移交' }],
		badges: { donor: '短暂阻塞写', recipient: '追平增量' },
		note: '迁移②：短暂临界区内阻塞该 chunk 的写入，把最后的增量搬完——这个窗口要尽量短。',
	});
	frames.push({
		active: ['cfg'],
		hotEdges: ['cm'],
		packets: [{ edge: 'cm', at: 0.4, tone: 'req', label: '提交新路由' }],
		badges: { cfg: '路由指向目标' },
		note: '迁移③：Config Server 提交新路由表——chunk 的归属正式变更。',
	});
	frames.push({
		done: ['cfg', 'recipient'],
		dim: ['donor'],
		badges: { donor: '清理残留', recipient: '接管读写' },
		note: '迁移④：目标接管读写，源分片清理残留数据。mongos 元数据定时刷新，完成瞬间的路由重试由 driver 自动兜住。',
	});
	frames.push({
		done: ['mongos', 'cfg', 'donor', 'recipient'],
		badges: { cfg: '路由已更新' },
		note: '运维要点：迁移吃源/目标分片的 IO 与带宽——业务高峰给 balancer 设 activeWindow 时间窗或直接停掉；分片键一次拍板，选错等于重做集群。',
	});

	return {
		title: 'chunk 迁移 · 分裂、balancer 与四步搬家',
		height: 380,
		nodes: [
			{ id: 'mongos', label: 'mongos', sub: '无状态路由入口', x: 0.08, y: 0.2 },
			{ id: 'cfg', label: 'Config Server', sub: '路由表', x: 0.42, y: 0.2, shape: 'cylinder' },
			{ id: 'donor', label: '源分片', sub: '迁出方', x: 0.76, y: 0.2, shape: 'cylinder' },
			{ id: 'recipient', label: '目标分片', sub: '迁入方', x: 0.76, y: 0.76, shape: 'cylinder' },
		],
		edges: [
			{ id: 'q', from: 'mongos', to: 'cfg', both: true },
			{ id: 'mig', from: 'donor', to: 'recipient', both: true },
			{ id: 'cm', from: 'donor', to: 'cfg', dashed: true },
		],
		frames,
	};
}

/** 笔记中可通过 <AlgorithmVizIsland demo="..." /> 引用的架构/流程演示注册表 */
export const flowDemos: Record<string, FlowVizConfig> = {
	'mysql-2pc': mysqlTwoPhaseCommit(),
	'tcp-close': tcpClose(),
	'es-write': esWrite(),
	'redisson-watchdog': redissonWatchdog(),
	'kafka-segment': kafkaSegment(),
	'java-classload': javaClassLoading(),
	'kafka-producer': kafkaProducerPath(),
	'redis-sentinel': redisSentinel(),
	'mysql-replication': mysqlReplication(),
	'zk-zab': zkZab(),
	'seata-at': seataAt(),
	'rocketmq-tx': rocketmqTx(),
	'tls-handshake': tlsHandshake(),
	'tcp-handshake': tcpHandshake(),
	'js-event-loop': jsEventLoop(),
	'rabbitmq-reliable': rabbitmqReliable(),
	'mongo-election': mongoElection(),
	'pg-wal': pgWal(),
	'rabbitmq-dlq': rabbitmqDeadletter(),
	'docker-cow': dockerCow(),
	'etcd-write': etcdWrite(),
	'mqtt-qos2': mqttQos2(),
	'url-to-page': urlToPage(),
	'java-tricolor': javaTricolor(),
	'pg-mvcc': pgMvcc(),
	'split-brain': splitBrain(),
	'nginx-reload': nginxReload(),
	'kafka-rebalance': kafkaRebalance(),
	'git-rebase': gitRebase(),
	'redis-slot': redisSlot(),
	'seata-tcc': seataTcc(),
	'nginx-lifecycle': nginxLifecycle(),
	'mysql-query': mysqlQuery(),
	'dns-lookup': dnsLookup(),
	'springmvc-flow': springmvcFlow(),
	'redis-persist': redisPersist(),
	'git-reset': gitReset(),
	'mw-gates': mwGates(),
	'ai-agent-loop': aiAgentLoop(),
	'lc-agent-loop': lcAgentLoop(),
	'k8s-rollout': k8sRollout(),
	'mongo-chunk': mongoChunk(),
};
