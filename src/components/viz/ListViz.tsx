import { useEffect, useRef, useState } from 'react';
import { VizShell } from './player';

/** 链表节点：id 为原始身份（位置固定，箭头随 next 变化），next 指向目标节点 id（可回指成环，null 表示结尾） */
export interface ListNodeItem {
	id: number;
	label: string;
	next: number | null;
}

/** 一帧：节点快照 + 高亮/完成节点 id + 命名指针（值 null 画在左端 NULL 桩）+ 结果链标记 */
export interface ListFrame {
	items: ListNodeItem[];
	/** 本步操作涉及的节点 id */
	active?: number[];
	/** 已完成（链已定）的节点 id */
	locked?: number[];
	/** 指针名 → 节点 id；值为 null 时芯片停在左端 NULL 桩 */
	pointers?: Record<string, number | null>;
	/** 这些节点出发的 next 边按「结果链」样式（金色）绘制，用于合并链表 */
	resultNodes?: number[];
	note: string;
}

export interface ListVizConfig {
	title: string;
	frames: ListFrame[];
}

const BOX_H = 38;
const CY_RATIO = 0.46;

/** 链表步骤动画播放器：一行节点盒 + SVG 箭头（正向画上方、反向/回环画下方弧线）+ 指针芯片 */
export default function ListViz({ title, frames }: ListVizConfig) {
	const plotRef = useRef<HTMLDivElement>(null);
	const [width, setWidth] = useState(0);

	// 节点用百分比定位即可，箭头要像素坐标，监听绘图区宽度
	useEffect(() => {
		const el = plotRef.current;
		if (!el) return;
		const update = () => setWidth(el.clientWidth);
		update();
		const ro = new ResizeObserver(update);
		ro.observe(el);
		return () => ro.disconnect();
	}, []);

	return (
		<VizShell title={title} frames={frames}>
			{(player) => <ListPlot frame={player.frame} plotRef={plotRef} width={width} />}
		</VizShell>
	);
}

function ListPlot({
	frame,
	plotRef,
	width,
}: {
	frame: ListFrame | undefined;
	plotRef: React.RefObject<HTMLDivElement | null>;
	width: number;
}) {
	const items = frame?.items ?? [];
	const n = items.length;
	const activeSet = new Set(frame?.active ?? []);
	const lockedSet = new Set(frame?.locked ?? []);
	const resultSet = new Set(frame?.resultNodes ?? []);
	const idToIndex = new Map(items.map((it, i) => [it.id, i]));

	const plotH = plotRef.current?.clientHeight ?? 180;
	const cy = plotH * CY_RATIO;
	const slot = n > 0 ? width / n : 0;
	const boxW = Math.max(30, Math.min(66, slot * 0.62));
	const cxOf = (i: number) => slot * (i + 0.5);
	const nullX = width > 0 ? width - 8 : 0;

	// 箭头：正向相邻走直线，正向远跳/反向/回环走二次曲线（上方/下方让开节点盒）
	const edges: React.ReactNode[] = [];
	if (width > 0 && n > 0) {
		const markerOf = (result: boolean) => `url(#algo-list-arrow${result ? '-result' : ''})`;
		items.forEach((it, i) => {
			if (it.next === null) {
				const sx = cxOf(i) + boxW / 2;
				if (sx < nullX - 4) {
					edges.push(
						<path
							key={`e-${it.id}`}
							className={resultSet.has(it.id) ? 'algo-list-edge algo-list-edge--result' : 'algo-list-edge'}
							d={`M ${sx} ${cy} L ${nullX - 10} ${cy}`}
							markerEnd={markerOf(resultSet.has(it.id))}
						/>,
					);
				}
				return;
			}
			const j = idToIndex.get(it.next);
			if (j === undefined || j === i) return;
			const sx = cxOf(i);
			const tx = cxOf(j);
			const result = resultSet.has(it.id);
			if (j === i + 1) {
				edges.push(
					<path
						key={`e-${it.id}`}
						className={result ? 'algo-list-edge algo-list-edge--result' : 'algo-list-edge'}
						d={`M ${sx + boxW / 2} ${cy - 8} L ${tx - boxW / 2 - 1} ${cy - 8}`}
						markerEnd={markerOf(result)}
					/>,
				);
			} else if (j > i) {
				const peak = Math.max(cy - 78, 14);
				edges.push(
					<path
						key={`e-${it.id}`}
						className={result ? 'algo-list-edge algo-list-edge--result' : 'algo-list-edge'}
						d={`M ${sx} ${cy - BOX_H / 2} Q ${(sx + tx) / 2} ${peak} ${tx} ${cy - BOX_H / 2}`}
						markerEnd={markerOf(result)}
					/>,
				);
			} else {
				const dip = Math.min(cy + 86, plotH - 14);
				edges.push(
					<path
						key={`e-${it.id}`}
						className={result ? 'algo-list-edge algo-list-edge--result' : 'algo-list-edge algo-list-edge--back'}
						d={`M ${sx} ${cy + BOX_H / 2} Q ${(sx + tx) / 2} ${dip} ${tx} ${cy + BOX_H / 2}`}
						markerEnd={markerOf(result)}
					/>,
				);
			}
		});
	}

	// 指针芯片：同一节点的多个指针并排；null 指针停在左端 NULL 桩
	const slots: { key: string; left: number; names: string[] }[] = [];
	for (const [name, target] of Object.entries(frame?.pointers ?? {})) {
		const left = target === null ? 2 : (idToIndex.get(target) ?? -1) >= 0 ? ((idToIndex.get(target)! + 0.5) / n) * 100 : -1;
		if (left < 0) continue;
		let slot = slots.find((s) => Math.abs(s.left - left) < 0.01);
		if (!slot) {
			slot = { key: `s${left}`, left, names: [] };
			slots.push(slot);
		}
		slot.names.push(name);
	}

	return (
		<>
			<div className="algo-viz-plot algo-list-plot" ref={plotRef}>
				<svg className="algo-list-svg" width={width} height={plotH} aria-hidden="true">
					<defs>
						<marker id="algo-list-arrow" markerWidth="7" markerHeight="7" refX="5.5" refY="3.5" orient="auto">
							<path d="M0,0 L7,3.5 L0,7 z" className="algo-list-arrowhead" />
						</marker>
						<marker id="algo-list-arrow-result" markerWidth="7" markerHeight="7" refX="5.5" refY="3.5" orient="auto">
							<path d="M0,0 L7,3.5 L0,7 z" className="algo-list-arrowhead algo-list-arrowhead--result" />
						</marker>
					</defs>
					{edges}
					{n > 0 && (
						<text x={nullX} y={cy + 4} className="algo-list-null" textAnchor="middle">
							∅
						</text>
					)}
				</svg>
				{items.map((it, i) => (
					<div
						key={it.id}
						className={
							'algo-list-node' +
							(lockedSet.has(it.id) ? ' algo-list-node--locked' : '') +
							(activeSet.has(it.id) ? ' algo-list-node--active' : '')
						}
						style={{ left: `${((i + 0.5) / n) * 100}%`, width: `${boxW}px`, top: `${cy - BOX_H / 2}px`, height: `${BOX_H}px` }}
					>
						{it.label}
					</div>
				))}
				<div className="algo-list-nullmark" style={{ left: `${n > 0 ? ((n - 0.05) / n) * 100 : 95}%` }}>
					NULL
				</div>
			</div>

			<div className="algo-viz-axis">
				{slots.map((slot) => (
					<div
						key={slot.key}
						className="algo-viz-chip"
						style={slot.left === 2 ? { left: 2 } : { left: `${slot.left}%` }}
					>
						{slot.names.map((name) => (
							<span key={name}>{name}</span>
						))}
					</div>
				))}
			</div>
		</>
	);
}
