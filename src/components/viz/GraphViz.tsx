import { VizShell } from './player';

/** 图节点：x/y 为 0~1 归一化坐标（演示数据固定布局，跨帧稳定） */
export interface GraphNodeItem {
	id: number;
	label: string;
	x: number;
	y: number;
}

/** 图边：from/to 为节点 id；有向图用箭头呈现 */
export interface GraphEdgeItem {
	from: number;
	to: number;
	label?: string;
}

/** 一帧：图快照 + 访问状态 + 高亮边 + 前沿容器（队列/栈）内容 */
export interface GraphFrame {
	nodes: GraphNodeItem[];
	edges: GraphEdgeItem[];
	/** 当前访问的节点 id */
	active?: number[];
	/** 已访问过的节点 id */
	visited?: number[];
	/** BFS 队列 / DFS 栈 的当前内容（节点 id，队头/栈底在左） */
	frontier?: number[];
	/** 前沿容器的名字，默认「队列」 */
	frontierLabel?: string;
	/** 本步高亮的边（释放入度的边 / 树边 / 松弛边） */
	activeEdges?: Array<[number, number]>;
	note: string;
}

export interface GraphVizConfig {
	title: string;
	frames: GraphFrame[];
}

const W = 1000;
const H = 330;
const PAD_X = 60;
const PAD_Y = 36;
const NODE_R = 24;

/** 图步骤动画播放器：固定布局节点 + 可指向边 + 队列/栈前沿条 */
export default function GraphViz({ title, frames }: GraphVizConfig) {
	return (
		<VizShell title={title} frames={frames}>
			{(player) => <GraphPlot frame={player.frame} />}
		</VizShell>
	);
}

function GraphPlot({ frame }: { frame: GraphFrame | undefined }) {
	const nodes = frame?.nodes ?? [];
	const edges = frame?.edges ?? [];
	const byId = new Map(nodes.map((n) => [n.id, n]));
	const pxOf = (id: number) => PAD_X + (byId.get(id)?.x ?? 0) * (W - PAD_X * 2);
	const pyOf = (id: number) => PAD_Y + (byId.get(id)?.y ?? 0) * (H - PAD_Y * 2);

	const activeSet = new Set(frame?.active ?? []);
	const visitedSet = new Set(frame?.visited ?? []);
	const edgeKey = ([f, t]: [number, number]) => `${f}-${t}`;
	const activeEdgeSet = new Set((frame?.activeEdges ?? []).map(edgeKey));

	const frontier = frame?.frontier ?? [];
	const frontierLabel = frame?.frontierLabel ?? '队列';
	const frontierIds = new Set(frontier);

	const shorten = (x1: number, y1: number, x2: number, y2: number, r: number) => {
		const dx = x2 - x1;
		const dy = y2 - y1;
		const len = Math.hypot(dx, dy) || 1;
		return {
			x1: x1 + (dx / len) * r,
			y1: y1 + (dy / len) * r,
			x2: x2 - (dx / len) * (r + 2),
			y2: y2 - (dy / len) * (r + 2),
		};
	};

	return (
		<>
			<div className="algo-viz-plot algo-graph-plot">
				<svg className="algo-graph-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
					<defs>
						<marker id="algo-graph-arrow" markerWidth="9" markerHeight="9" refX="7.5" refY="4.5" orient="auto">
							<path d="M0,0 L9,4.5 L0,9 z" className="algo-graph-arrowhead" />
						</marker>
						<marker id="algo-graph-arrow-active" markerWidth="9" markerHeight="9" refX="7.5" refY="4.5" orient="auto">
							<path d="M0,0 L9,4.5 L0,9 z" className="algo-graph-arrowhead algo-graph-arrowhead--active" />
						</marker>
					</defs>
					{edges.map((e) => {
						const a = byId.get(e.from);
						const b = byId.get(e.to);
						if (!a || !b) return null;
						const seg = shorten(pxOf(e.from), pyOf(e.from), pxOf(e.to), pyOf(e.to), NODE_R);
						const hot = activeEdgeSet.has(edgeKey([e.from, e.to]));
						const directed = true; // 演示图统一按有向渲染；无向图的边在数据里双向给出
						return (
							<g key={`${e.from}-${e.to}`}>
								<line
									x1={seg.x1}
									y1={seg.y1}
									x2={seg.x2}
									y2={seg.y2}
									className={
										'algo-graph-edge' +
										(hot ? ' algo-graph-edge--active' : '') +
										(directed ? ' algo-graph-edge--directed' : '')
									}
									markerEnd={hot ? 'url(#algo-graph-arrow-active)' : directed ? 'url(#algo-graph-arrow)' : undefined}
								/>
								{e.label && (
									<text x={(seg.x1 + seg.x2) / 2} y={(seg.y1 + seg.y2) / 2 - 6} className="algo-graph-elabel" textAnchor="middle">
										{e.label}
									</text>
								)}
							</g>
						);
					})}
					{nodes.map((n) => {
						const cls =
							'algo-graph-node' +
							(visitedSet.has(n.id) ? ' algo-graph-node--visited' : '') +
							(activeSet.has(n.id) ? ' algo-graph-node--active' : '') +
							(frontierIds.has(n.id) ? ' algo-graph-node--frontier' : '');
						return (
							<g key={n.id} className={cls} transform={`translate(${pxOf(n.id)}, ${pyOf(n.id)})`}>
								<circle r={NODE_R} />
								<text textAnchor="middle" dy="5">
									{n.label}
								</text>
							</g>
						);
					})}
				</svg>
			</div>

			<div className="algo-viz-axis algo-tree-queue">
				<span className="algo-tree-queue-label">{frontierLabel}</span>
				{frontier.length === 0 && <span className="algo-tree-queue-empty">空</span>}
				{frontier.map((id, i) => (
					<span key={`${id}-${i}`} className={i === 0 ? 'algo-tree-qchip algo-tree-qchip--head' : 'algo-tree-qchip'}>
						{byId.get(id)?.label ?? '?'}
					</span>
				))}
			</div>
		</>
	);
}
