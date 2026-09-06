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
	{ label: '0.25×', ms: 2800 },
	{ label: '0.5×', ms: 1400 },
	{ label: '1×', ms: 700 },
	{ label: '1.5×', ms: 470 },
	{ label: '2×', ms: 350 },
];

/** 线性 SVG 图标（currentColor 跟随主题），替代 Unicode 字符避免被渲染成彩色 emoji */
function Icon({ path, fill }: { path: React.ReactNode; fill?: boolean }) {
	return (
		<svg
			width="11"
			height="11"
			viewBox="0 0 24 24"
			fill={fill ? 'currentColor' : 'none'}
			stroke={fill ? 'none' : 'currentColor'}
			strokeWidth="2.2"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			{path}
		</svg>
	);
}

const icons = {
	reset: (
		<Icon
			path={
				<>
					<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
					<path d="M3 3v5h5" />
				</>
			}
		/>
	),
	prev: (
		<Icon
			path={
				<>
					<polygon points="19 20 9 12 19 4" fill="currentColor" stroke="none" />
					<line x1="5" y1="5" x2="5" y2="19" />
				</>
			}
		/>
	),
	next: (
		<Icon
			path={
				<>
					<polygon points="5 4 15 12 5 20" fill="currentColor" stroke="none" />
					<line x1="19" y1="5" x2="19" y2="19" />
				</>
			}
		/>
	),
	play: <Icon path={<polygon points="6 3 20 12 6 21" />} fill />,
	pause: (
		<Icon
			path={
				<>
					<rect x="5" y="4" width="4.5" height="16" rx="1.2" stroke="none" />
					<rect x="14.5" y="4" width="4.5" height="16" rx="1.2" stroke="none" />
				</>
			}
			fill
		/>
	),
	loop: (
		<Icon
			path={
				<>
					<path d="m17 2 4 4-4 4" />
					<path d="M3 11v-1a4 4 0 0 1 4-4h14" />
					<path d="m7 22-4-4 4-4" />
					<path d="M21 13v1a4 4 0 0 1-4 4H3" />
				</>
			}
		/>
	),
};

/** 算法步骤动画播放器：柱状数组 + 指针芯片 + 逐帧说明；进入视口自动播放并循环 */
export default function AlgorithmViz({ title, frames }: VizConfig) {
	const [step, setStep] = useState(0);
	const [playing, setPlaying] = useState(true);
	const [speedIdx, setSpeedIdx] = useState(2);

	const last = frames.length - 1;
	const frame = frames[Math.min(step, last)];
	const max = useMemo(() => Math.max(...frames[0]!.items.map((it) => it.value)), [frames]);

	// 自动循环：末帧多停留几拍让读者看清终态，再回到首帧
	useEffect(() => {
		if (!playing) return;
		const ms = SPEEDS[speedIdx]!.ms * (step >= last ? 3 : 1);
		const timer = setTimeout(() => setStep((s) => (s >= last ? 0 : s + 1)), ms);
		return () => clearTimeout(timer);
	}, [playing, step, speedIdx, last]);

	/** 手动操作（单步/拖进度）会暂停自动播放，按播放恢复 */
	const seek = (target: number) => {
		setPlaying(false);
		setStep(Math.max(0, Math.min(last, target)));
	};
	const togglePlay = () => {
		if (playing) {
			setPlaying(false);
			return;
		}
		if (step >= last) setStep(0);
		setPlaying(true);
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
				<span className="algo-viz-step" title="自动循环播放">
					{playing && <span className="algo-viz-loop">{icons.loop}</span>}
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
				<button type="button" className="algo-viz-btn" onClick={() => setStep(0)} disabled={step === 0}>
					{icons.reset}
					<span>重置</span>
				</button>
				<button type="button" className="algo-viz-btn" onClick={() => seek(step - 1)} disabled={step === 0}>
					{icons.prev}
					<span>上一步</span>
				</button>
				<button type="button" className="algo-viz-btn algo-viz-btn--primary" onClick={togglePlay}>
					{playing ? icons.pause : icons.play}
					<span>{playing ? '暂停' : '播放'}</span>
				</button>
				<button type="button" className="algo-viz-btn" onClick={() => seek(step + 1)} disabled={step >= last}>
					<span>下一步</span>
					{icons.next}
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
