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

/** 笔记中可通过 <AlgorithmVizIsland demo="..." /> 引用的架构/流程演示注册表 */
export const flowDemos: Record<string, FlowVizConfig> = {
	'mysql-2pc': mysqlTwoPhaseCommit(),
	'tcp-close': tcpClose(),
};
