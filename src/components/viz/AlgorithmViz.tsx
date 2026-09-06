import { useEffect, useMemo, useState } from 'react';

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

const SPEEDS = [
	{ label: '0.5×', ms: 660 },
	{ label: '1×', ms: 330 },
	{ label: '2×', ms: 165 },
];

/** 算法步骤动画播放器：柱状数组 + 指针芯片 + 逐帧说明，支持播放/单步/跳转/变速 */
export default function AlgorithmViz({ title, frames }: VizConfig) {
	const [step, setStep] = useState(0);
	const [playing, setPlaying] = useState(false);
	const [speedIdx, setSpeedIdx] = useState(1);

	const last = frames.length - 1;
	const frame = frames[Math.min(step, last)];
	const max = useMemo(() => Math.max(...frames[0]!.items.map((it) => it.value)), [frames]);

	useEffect(() => {
		if (!playing) return;
		if (step >= last) {
			setPlaying(false);
			return;
		}
		const timer = setTimeout(() => setStep((s) => s + 1), SPEEDS[speedIdx]!.ms);
		return () => clearTimeout(timer);
	}, [playing, step, speedIdx, last]);

	const seek = (target: number) => {
		setPlaying(false);
		setStep(Math.max(0, Math.min(last, target)));
	};
	const togglePlay = () => {
		if (!playing && step >= last) setStep(0);
		setPlaying((p) => !p);
	};

	const activeSet = useMemo(() => new Set(frame?.active ?? []), [frame]);
	const lockedSet = useMemo(() => new Set(frame?.locked ?? []), [frame]);

	// 指针按下标分槽，同一位置的多个指针并排进一个芯片
	const pointerSlots = useMemo(() => {
		const slots: { index: number; names: string[] }[] = [];
		for (const [name, index] of Object.entries(frame?.pointers ?? {})) {
			let slot = slots.find((s) => s.index === index);
			if (!slot) {
				slot = { index, names: [] };
				slots.push(slot);
			}
			slot.names.push(name);
		}
		return slots.sort((a, b) => a.index - b.index);
	}, [frame]);

	const onKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'ArrowLeft') {
			seek(step - 1);
			e.preventDefault();
		} else if (e.key === 'ArrowRight') {
			seek(step + 1);
			e.preventDefault();
		} else if (e.key === ' ') {
			togglePlay();
			e.preventDefault();
		}
	};

	const onSeekClick = (e: React.MouseEvent<HTMLDivElement>) => {
		const rect = e.currentTarget.getBoundingClientRect();
		seek(Math.round(((e.clientX - rect.left) / rect.width) * last));
	};

	const n = frame?.items.length ?? 0;
	const posOf = (i: number) => `${((i + 0.5) / n) * 100}%`;

	return (
		<figure className="algo-viz" role="group" aria-label={title} tabIndex={0} onKeyDown={onKeyDown}>
			<figcaption className="algo-viz-head">
				<span className="algo-viz-title">{title}</span>
				<span className="algo-viz-step">
					{step + 1} / {frames.length}
				</span>
			</figcaption>

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
				{pointerSlots.map((slot) => (
					<div key={slot.index} className="algo-viz-chip" style={{ left: posOf(slot.index) }}>
						{slot.names.map((name) => (
							<span key={name}>{name}</span>
						))}
					</div>
				))}
			</div>

			<div className="algo-viz-note" aria-live="polite">
				{frame?.note}
			</div>

			<div className="algo-viz-progress" onClick={onSeekClick} role="presentation">
				<div className="algo-viz-progress-fill" style={{ width: `${last === 0 ? 100 : (step / last) * 100}%` }} />
			</div>

			<div className="algo-viz-controls">
				<button type="button" className="algo-viz-btn" onClick={() => seek(0)} disabled={step === 0}>
					重置
				</button>
				<button type="button" className="algo-viz-btn" onClick={() => seek(step - 1)} disabled={step === 0}>
					◀ 上一步
				</button>
				<button type="button" className="algo-viz-btn algo-viz-btn--primary" onClick={togglePlay}>
					{playing ? '⏸ 暂停' : '▶ 播放'}
				</button>
				<button type="button" className="algo-viz-btn" onClick={() => seek(step + 1)} disabled={step >= last}>
					下一步 ▶
				</button>
				<span className="algo-viz-speeds">
					{SPEEDS.map((speed, idx) => (
						<button
							type="button"
							key={speed.label}
							className={'algo-viz-speed' + (idx === speedIdx ? ' algo-viz-speed--on' : '')}
							onClick={() => setSpeedIdx(idx)}
						>
							{speed.label}
						</button>
					))}
				</span>
			</div>
		</figure>
	);
}
