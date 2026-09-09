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

/** 笔记中可通过 <AlgorithmVizIsland demo="..." /> 引用的架构/流程演示注册表 */
export const flowDemos: Record<string, FlowVizConfig> = {
	'mysql-2pc': mysqlTwoPhaseCommit(),
	'tcp-close': tcpClose(),
	'es-write': esWrite(),
	'redisson-watchdog': redissonWatchdog(),
	'kafka-segment': kafkaSegment(),
};
