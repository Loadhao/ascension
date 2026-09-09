import { useMemo } from 'react';
import { VizShell } from './player';

/**
 * 架构 / 流程步进动画画法：固定布局的节点（组件/存储/日志）+ 曲线连线，
 * 每帧控制节点状态、高亮连线与沿线行进的数据包，讲述「一个请求走过哪些路」。
 * 播放控制（播放/单步/速率/进度条）由 VizShell 提供。
 */

export type FlowShape = 'rect' | 'cylinder' | 'doc';
/** 数据包语气：req 请求/指令，resp 响应/回执，data 数据/日志内容 */
export type FlowTone = 'req' | 'resp' | 'data';

export interface FlowNode {
	id: string;
	label: string;
	/** 节点内的第二行小字 */
	sub?: string;
	/** 0~1 归一化中心坐标 */
	x: number;
	y: number;
	/** viewBox 单位的半宽半高（缺省 62 × 24） */
	hw?: number;
	hh?: number;
	shape?: FlowShape;
}

export interface FlowEdge {
	id: string;
	from: string;
	to: string;
	/** 连线中点旁的说明文字 */
	label?: string;
	/** 说明文字沿线的位置（0~1，默认 0.5），避开数据包或节点时用 */
	labelAt?: number;
	/** 控制点垂直偏移：同两点画双向两条弧线时用，正值向行进方向左侧拱起 */
	bend?: number;
	/** 两端都画箭头 */
	both?: boolean;
	/** 虚线（异步 / 后台动作） */
	dashed?: boolean;
}

/** 一帧中沿线行进的数据包：at 为沿边 0~1 的位置（1 → 0 即反向行进） */
export interface FlowPacket {
	edge: string;
	at: number;
	tone?: FlowTone;
	/** 包上携带的短文字（如 FIN / ACK / prepare） */
	label?: string;
}

export interface FlowFrame {
	/** 当前动作的节点（琥珀高亮） */
	active?: string[];
	/** 已完成的节点（暗色就位） */
	done?: string[];
	/** 淡出弱化的节点 */
	dim?: string[];
	/** 本步有数据流动的连线（流动虚线动画） */
	hotEdges?: string[];
	/** 本步在连线上的数据包 */
	packets?: FlowPacket[];
	/** 节点下方的状态徽标（如 FIN_WAIT_1 / commit） */
	badges?: Record<string, string>;
	note: string;
}

export interface FlowVizConfig {
	title: string;
	nodes: FlowNode[];
	edges: FlowEdge[];
	frames: FlowFrame[];
	/** 绘图区 viewBox 高度，宽固定 1000，缺省 420 */
	height?: number;
}

const W = 1000;
const PAD_X = 86;
const PAD_Y = 62;
const GAP = 9;

interface NodeGeom {
	cx: number;
	cy: number;
	hw: number;
	hh: number;
}

/** 由标题派生稳定的 uid：同页多个实例互不冲突，且 SSR / 客户端渲染一致 */
function uidOf(title: string): string {
	let h = 0;
	for (let i = 0; i < title.length; i++) h = (h * 31 + title.charCodeAt(i)) >>> 0;
	return `flow-${h.toString(36)}`;
}

/** 沿中心连线求节点框边上的锚点（各留 GAP 给箭头），带弧度时用控制点画二次贝塞尔 */
function edgeGeom(g: Map<string, NodeGeom>, from: string, to: string, bend = 0) {
	const a = g.get(from)!;
	const b = g.get(to)!;
	const dx = b.cx - a.cx;
	const dy = b.cy - a.cy;
	const len = Math.hypot(dx, dy) || 1;
	const ux = dx / len;
	const uy = dy / len;
	const exit = (n: NodeGeom, dir: number) => {
		const tx = ux !== 0 ? n.hw / Math.abs(ux) : Infinity;
		const ty = uy !== 0 ? n.hh / Math.abs(uy) : Infinity;
		const t = Math.min(tx, ty);
		return { x: n.cx + dir * ux * (t + GAP), y: n.cy + dir * uy * (t + GAP) };
	};
	const p1 = exit(a, 1);
	const p2 = exit(b, -1);
	const cx = (p1.x + p2.x) / 2 + -uy * bend;
	const cy = (p1.y + p2.y) / 2 + ux * bend;
	return { p1, p2, cx, cy };
}

type Geom = ReturnType<typeof edgeGeom>;

/** 二次贝塞尔上 t 处的点 */
function qPoint(g: Geom, t: number) {
	const s = 1 - t;
	return {
		x: s * s * g.p1.x + 2 * s * t * g.cx + t * t * g.p2.x,
		y: s * s * g.p1.y + 2 * s * t * g.cy + t * t * g.p2.y,
	};
}

/** 估算文本宽度（CJK 按全宽、其余按 0.56 倍） */
function textW(s: string, fs: number): number {
	return [...s].reduce((acc, ch) => acc + (ch.charCodeAt(0) > 0x2e80 ? fs : fs * 0.56), 0);
}

/** 状态徽标：<rect> 圆角芯片 + 文本，置于节点正下方 */
function Badge({ cx, cy, hh, text }: { cx: number; cy: number; hh: number; text: string }) {
	const w = textW(text, 11) + 16;
	const y = cy + hh + 12;
	return (
		<g className="algo-flow-badge" transform={`translate(${cx}, ${y})`} aria-hidden="true">
			<rect x={-w / 2} y={-10} width={w} height={20} rx={10} />
			<text textAnchor="middle" dy="3.5">
				{text}
			</text>
		</g>
	);
}

function NodeShape({ hw, hh, shape }: { hw: number; hh: number; shape: FlowShape | undefined }) {
	if (shape === 'cylinder') {
		const ry = 9;
		const top = -hh + ry;
		const bot = hh - ry;
		return (
			<>
				<rect x={-hw} y={top} width={hw * 2} height={bot - top} />
				<path d={`M ${-hw} ${top} V ${bot} A ${hw} ${ry} 0 0 0 ${hw} ${bot} V ${top}`} />
				<ellipse cx={0} cy={top} rx={hw} ry={ry} />
			</>
		);
	}
	if (shape === 'doc') {
		const fold = 13;
		return (
			<>
				<path
					d={`M ${-hw} ${-hh} L ${hw - fold} ${-hh} L ${hw} ${-hh + fold} L ${hw} ${hh} L ${-hw} ${hh} Z`}
				/>
				<path className="algo-flow-docfold" d={`M ${hw - fold} ${-hh} V ${-hh + fold} H ${hw}`} />
			</>
		);
	}
	return <rect x={-hw} y={-hh} width={hw * 2} height={hh * 2} rx={11} />;
}

function FlowPlot({
	config,
	frame,
	uid,
}: {
	config: FlowVizConfig;
	frame: FlowFrame | undefined;
	uid: string;
}) {
	const { nodes, edges, height: H = 420 } = config;
	const geom = useMemo(() => {
		const m = new Map<string, NodeGeom>();
		for (const n of nodes) {
			m.set(n.id, {
				cx: PAD_X + n.x * (W - PAD_X * 2),
				cy: PAD_Y + n.y * (H - PAD_Y * 2),
				hw: n.hw ?? 62,
				hh: n.hh ?? 24,
			});
		}
		return m;
	}, [nodes, H]);

	const edgeGeoms = useMemo(
		() => edges.map((e) => ({ e, g: edgeGeom(geom, e.from, e.to, e.bend ?? 0) })),
		[edges, geom],
	);

	const activeSet = new Set(frame?.active ?? []);
	const doneSet = new Set(frame?.done ?? []);
	const dimSet = new Set(frame?.dim ?? []);
	const hotSet = new Set(frame?.hotEdges ?? []);
	const edgeById = new Map(edges.map((e) => [e.id, e]));

	return (
		<>
			<div className="algo-viz-plot algo-flow-plot" style={{ aspectRatio: `${W} / ${H}` }}>
				<svg
					className="algo-flow-svg"
					viewBox={`0 0 ${W} ${H}`}
					preserveAspectRatio="xMidYMid meet"
					role="img"
					aria-label={config.title}
				>
					<defs>
						<marker id={`${uid}-arrow`} markerWidth="9" markerHeight="9" refX="7.5" refY="4.5" orient="auto">
							<path d="M0,0 L9,4.5 L0,9 z" className="algo-flow-arrowhead" />
						</marker>
						<marker
							id={`${uid}-arrow-hot`}
							markerWidth="9"
							markerHeight="9"
							refX="7.5"
							refY="4.5"
							orient="auto"
						>
							<path d="M0,0 L9,4.5 L0,9 z" className="algo-flow-arrowhead algo-flow-arrowhead--hot" />
						</marker>
						<marker
							id={`${uid}-arrow-rev`}
							markerWidth="9"
							markerHeight="9"
							refX="7.5"
							refY="4.5"
							orient="auto-start-reverse"
						>
							<path d="M0,0 L9,4.5 L0,9 z" className="algo-flow-arrowhead" />
						</marker>
					</defs>

					{edgeGeoms.map(({ e, g }) => {
						const hot = hotSet.has(e.id);
						const d = `M ${g.p1.x} ${g.p1.y} Q ${g.cx} ${g.cy} ${g.p2.x} ${g.p2.y}`;
						return (
							<g key={e.id}>
								<path
									d={d}
									className={
										'algo-flow-edge' +
										(hot ? ' algo-flow-edge--hot' : '') +
										(e.dashed ? ' algo-flow-edge--dashed' : '')
									}
									markerEnd={`url(#${uid}-arrow-${hot ? 'hot' : ''})`}
									markerStart={e.both ? `url(#${uid}-arrow-rev)` : undefined}
								/>
								{e.label && (
									<text
										className="algo-flow-elabel"
										x={qPoint(g, e.labelAt ?? 0.5).x}
										y={qPoint(g, e.labelAt ?? 0.5).y - 9}
										textAnchor="middle"
									>
										{e.label}
									</text>
								)}
							</g>
						);
					})}

					{nodes.map((n) => {
						const g = geom.get(n.id)!;
						const hasSub = Boolean(n.sub);
						// 圆柱的顶面椭圆占据节点上部，文字下移避开
						const labelDy = n.shape === 'cylinder' ? (hasSub ? 5 : 11) : hasSub ? -4 : 5;
						const subDy = n.shape === 'cylinder' ? 18 : 14;
						const cls =
							'algo-flow-node' +
							(doneSet.has(n.id) ? ' algo-flow-node--done' : '') +
							(activeSet.has(n.id) ? ' algo-flow-node--active' : '') +
							(dimSet.has(n.id) ? ' algo-flow-node--dim' : '');
						return (
							<g key={n.id} className={cls} transform={`translate(${g.cx}, ${g.cy})`}>
								<NodeShape hw={g.hw} hh={g.hh} shape={n.shape} />
								<text className="algo-flow-label" textAnchor="middle" dy={labelDy}>
									{n.label}
								</text>
								{hasSub && (
									<text className="algo-flow-sub" textAnchor="middle" dy={subDy}>
										{n.sub}
									</text>
								)}
								{frame?.badges?.[n.id] && (
									<Badge cx={0} cy={0} hh={g.hh} text={frame.badges[n.id]!} />
								)}
							</g>
						);
					})}

					{(frame?.packets ?? []).map((p) => {
						const e = edgeById.get(p.edge);
						if (!e) return null;
						const g = edgeGeoms.find((x) => x.e.id === p.edge)!.g;
						const pos = qPoint(g, Math.max(0, Math.min(1, p.at)));
						const tone = p.tone ?? 'req';
						return (
							<g
								key={`${p.edge}:${p.label ?? ''}`}
								className={`algo-flow-packet algo-flow-packet--${tone}`}
								style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
							>
								{p.label ? (
									<>
										<rect x={-(textW(p.label, 11) + 14) / 2} y={-11} width={textW(p.label, 11) + 14} height={22} rx={11} />
										<text textAnchor="middle" dy="3.5">
											{p.label}
										</text>
									</>
								) : (
									<circle r={6} />
								)}
							</g>
						);
					})}
				</svg>
			</div>
			<div className="algo-flow-legend" aria-hidden="true">
				<span className="algo-flow-legend-item">
					<i className="algo-flow-legend-dot algo-flow-legend-dot--req" />
					请求 / 指令
				</span>
				<span className="algo-flow-legend-item">
					<i className="algo-flow-legend-dot algo-flow-legend-dot--resp" />
					响应 / 回执
				</span>
				<span className="algo-flow-legend-item">
					<i className="algo-flow-legend-dot algo-flow-legend-dot--data" />
					数据 / 日志
				</span>
			</div>
		</>
	);
}

/** 架构 / 流程步进动画：进入视口自动循环播放，与算法动画共用播放器外壳 */
export default function FlowViz(config: FlowVizConfig) {
	const uid = useMemo(() => uidOf(config.title), [config.title]);
	return (
		<VizShell title={config.title} frames={config.frames}>
			{(player) => <FlowPlot config={config} frame={player.frame} uid={uid} />}
		</VizShell>
	);
}
