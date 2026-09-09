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
		note: '服务端回应：自己的随机数、从套件列表里选定的算法，以及**证书**——服务器的公钥就放在证书里。',
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
};
