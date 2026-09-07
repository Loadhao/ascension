import { useMemo } from 'react';
import { VizShell } from './player';

/** 单个元素：id 为原始身份（跨帧稳定，交换时跟随元素移动），value 决定柱高 */
export interface VizItem {
	id: number;
	value: number;
}

/** 一帧：数组快照 + 高亮/就位下标 + 命名指针 + 本步说明 */
export interface VizFrame {
	items: VizItem[];
	/** 本步操作涉及的下标（比较 / 交换 / 命中） */
	active?: number[];
	/** 已在最终位置的下标 */
	locked?: number[];
	/** 命名指针（如 j、low、mid、基准）指向的下标 */
	pointers?: Record<string, number>;
	note: string;
}

export interface VizConfig {
	title: string;
	frames: VizFrame[];
}

/** 算法步骤动画播放器：柱状数组 + 指针芯片 + 逐帧说明；进入视口自动播放并循环 */
export default function AlgorithmViz({ title, frames }: VizConfig) {
	const max = useMemo(() => Math.max(...frames[0]!.items.map((it) => it.value)), [frames]);

	// 指针按下标分槽，同一位置的多个指针并排进一个芯片
	function renderPlot(frame: VizFrame | undefined) {
		const n = frame?.items.length ?? 0;
		const posOf = (i: number) => `${((i + 0.5) / n) * 100}%`;
		const activeSet = new Set(frame?.active ?? []);
		const lockedSet = new Set(frame?.locked ?? []);
		const slots: { index: number; names: string[] }[] = [];
		for (const [name, index] of Object.entries(frame?.pointers ?? {})) {
			let slot = slots.find((s) => s.index === index);
			if (!slot) {
				slot = { index, names: [] };
				slots.push(slot);
			}
			slot.names.push(name);
		}
		slots.sort((a, b) => a.index - b.index);
		return (
			<>
				<div className="algo-viz-plot">
					{frame?.items.map((it, i) => (
						<div
							key={it.id}
							className={
								'algo-viz-bar' +
								(lockedSet.has(i) ? ' algo-viz-bar--locked' : '') +
								(activeSet.has(i) ? ' algo-viz-bar--active' : '')
							}
							style={{
								left: posOf(i),
								width: `${(100 / n) * 0.6}%`,
								height: `${Math.max((it.value / max) * 100, 9)}%`,
							}}
						>
							<span className="algo-viz-value">{it.value}</span>
						</div>
					))}
				</div>

				<div className="algo-viz-axis">
					{slots.map((slot) => (
						<div key={slot.index} className="algo-viz-chip" style={{ left: posOf(slot.index) }}>
							{slot.names.map((name) => (
								<span key={name}>{name}</span>
							))}
						</div>
					))}
				</div>
			</>
		);
	}

	return (
		<VizShell title={title} frames={frames}>
			{(player) => renderPlot(player.frame)}
		</VizShell>
	);
}
