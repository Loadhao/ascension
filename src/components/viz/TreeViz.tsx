import { useMemo } from 'react';
import { VizShell } from './player';

export interface TreeNodeItem {
	id: number;
	label: string;
	left: number | null;
	right: number | null;
}

/** 一帧：树快照（结构决定布局：x 按中序序号、y 按深度）+ 当前访问/已访问节点 + 可选队列条 */
export interface TreeFrame {
	items: TreeNodeItem[];
	/** 根节点 id；null 表示空树帧 */
	root: number | null;
	/** 当前访问的节点 id */
	active?: number[];
	/** 已访问过的节点 id */
	visited?: number[];
	/** 层序队列内容（节点 id，队头在左），仅 BFS 演示使用 */
	queue?: number[];
	note: string;
}

export interface TreeVizConfig {
	title: string;
	frames: TreeFrame[];
}

const NODE_W = 34;
const NODE_H = 30;
const PAD_X = 10;
const PAD_Y = 18;

/** 二叉树步骤动画播放器：中序定位的整洁布局 + 连线 + 访问着色 + 队列芯片条 */
export default function TreeViz({ title, frames }: TreeVizConfig) {
	return (
		<VizShell title={title} frames={frames}>
			{(player) => <TreePlot frame={player.frame} />}
		</VizShell>
	);
}

/** 布局：x = 中序序号（兄弟不重叠），y = 深度 */
function layoutTree(items: TreeNodeItem[], root: number | null) {
	const byId = new Map(items.map((it) => [it.id, it]));
	const pos = new Map<number, { x: number; y: number }>();
	let order = 0;
	let maxDepth = 0;
	const visit = (id: number, depth: number) => {
		const node = byId.get(id);
		if (!node) return;
		if (node.left !== null) visit(node.left, depth + 1);
		pos.set(id, { x: order++, y: depth });
		maxDepth = Math.max(maxDepth, depth);
		if (node.right !== null) visit(node.right, depth + 1);
	};
	if (root !== null) visit(root, 0);
	return { pos, total: order, maxDepth, byId };
}

function TreePlot({ frame }: { frame: TreeFrame | undefined }) {
	const items = frame?.items ?? [];
	const { pos, total, maxDepth, byId } = useMemo(() => layoutTree(items, frame?.root ?? null), [items, frame?.root]);
	const activeSet = new Set(frame?.active ?? []);
	const visitedSet = new Set(frame?.visited ?? []);

	const width = 640;
	const height = 216;
	const innerW = width - PAD_X * 2 - NODE_W;
	const innerH = height - PAD_Y * 2 - NODE_H;
	const cxOf = (id: number) => PAD_X + NODE_W / 2 + (pos.get(id)?.x ?? 0) * (total > 1 ? innerW / (total - 1) : 0);
	const cyOf = (id: number) => PAD_Y + NODE_H / 2 + (pos.get(id)?.y ?? 0) * (maxDepth > 0 ? innerH / maxDepth : 0);

	const edges: React.ReactNode[] = [];
	for (const node of items) {
		const from = pos.get(node.id);
		if (!from) continue;
		for (const child of [node.left, node.right]) {
			if (child === null) continue;
			const to = pos.get(child);
			if (!to) continue;
			edges.push(
				<line
					key={`e-${node.id}-${child}`}
					className="algo-tree-edge"
					x1={cxOf(node.id)}
					y1={cyOf(node.id)}
					x2={cxOf(child)}
					y2={cyOf(child)}
				/>,
			);
		}
	}

	const queue = frame?.queue ?? [];
	const queueLabels = queue.map((id) => byId.get(id)?.label ?? '?');

	return (
		<>
			<div className="algo-viz-plot algo-tree-plot">
				<svg className="algo-tree-svg" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" aria-hidden="true">
					{edges}
					{items.map((node) => {
						const p = pos.get(node.id);
						if (!p) return null;
						const cls =
							'algo-tree-node' +
							(visitedSet.has(node.id) ? ' algo-tree-node--visited' : '') +
							(activeSet.has(node.id) ? ' algo-tree-node--active' : '');
						return (
							<g key={node.id} className={cls} transform={`translate(${cxOf(node.id)}, ${cyOf(node.id)})`}>
								<rect x={-NODE_W / 2} y={-NODE_H / 2} width={NODE_W} height={NODE_H} rx="7" />
								<text textAnchor="middle" dy="4.5">
									{node.label}
								</text>
							</g>
						);
					})}
				</svg>
			</div>

			{queue.length > 0 || frame?.queue ? (
				<div className="algo-viz-axis algo-tree-queue">
					<span className="algo-tree-queue-label">队列</span>
					{queueLabels.map((label, i) => (
						<span key={`${label}-${i}`} className={i === 0 ? 'algo-tree-qchip algo-tree-qchip--head' : 'algo-tree-qchip'}>
							{label}
						</span>
					))}
					{queue.length === 0 && <span className="algo-tree-queue-empty">空</span>}
				</div>
			) : null}
		</>
	);
}
