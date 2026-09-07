import { useEffect, useRef, useState } from 'react';

/** 各画法组件（柱状数组 / 链表 / 树 / 栈）共用的步骤播放器内核 */
export const SPEEDS = [
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

export const vizIcons = {
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

export interface VizPlayer<T> {
	step: number;
	last: number;
	frame: T;
	playing: boolean;
	speedIdx: number;
	seek: (target: number) => void;
	/** 重置：跳回首帧但不打断自动播放（与柱状数组版行为一致） */
	reset: () => void;
	togglePlay: () => void;
	changeSpeed: (idx: number) => void;
	onKeyDown: (e: React.KeyboardEvent) => void;
}

/** 步骤状态机：自动循环 + 单步/拖进度暂停 + 速率切换下一帧生效 */
export function useVizPlayer<T>(frames: T[]): VizPlayer<T> {
	const [step, setStep] = useState(0);
	const [playing, setPlaying] = useState(true);
	const [speedIdx, setSpeedIdx] = useState(2);
	// 速率走 ref：切换档位不打断当前帧的计时，从下一帧起生效
	const speedRef = useRef(SPEEDS[2]!.ms);

	const last = frames.length - 1;
	const frame = frames[Math.min(step, last)];

	// 自动循环：末帧多停留几拍让读者看清终态，再回到首帧
	useEffect(() => {
		if (!playing) return;
		const ms = speedRef.current * (step >= last ? 3 : 1);
		const timer = setTimeout(() => setStep((s) => (s >= last ? 0 : s + 1)), ms);
		return () => clearTimeout(timer);
	}, [playing, step, last]);

	/** 手动操作（单步/拖进度）会暂停自动播放，按播放恢复 */
	const seek = (target: number) => {
		setPlaying(false);
		setStep(Math.max(0, Math.min(last, target)));
	};
	const reset = () => setStep(0);
	const togglePlay = () => {
		if (playing) {
			setPlaying(false);
			return;
		}
		if (step >= last) setStep(0);
		setPlaying(true);
	};
	const changeSpeed = (idx: number) => {
		speedRef.current = SPEEDS[idx]!.ms;
		setSpeedIdx(idx);
	};

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

	return { step, last, frame, playing, speedIdx, seek, reset, togglePlay, changeSpeed, onKeyDown };
}

/** 播放器外壳：标题、逐帧说明、进度条与控制条各画法共用，绘图区由 children 提供 */
export function VizShell<T extends { note: string }>({
	title,
	frames,
	children,
}: {
	title: string;
	frames: T[];
	children: (player: VizPlayer<T>) => React.ReactNode;
}) {
	const player = useVizPlayer<T>(frames);
	const { step, last, playing, speedIdx, seek, reset, togglePlay, changeSpeed, onKeyDown } = player;

	const onSeekClick = (e: React.MouseEvent<HTMLDivElement>) => {
		const rect = e.currentTarget.getBoundingClientRect();
		seek(Math.round(((e.clientX - rect.left) / rect.width) * last));
	};

	return (
		<figure className="algo-viz" role="group" aria-label={title} tabIndex={0} onKeyDown={onKeyDown}>
			<figcaption className="algo-viz-head">
				<span className="algo-viz-title">{title}</span>
				<span className="algo-viz-step" title="自动循环播放">
					{playing && <span className="algo-viz-loop">{vizIcons.loop}</span>}
					{step + 1} / {frames.length}
				</span>
			</figcaption>

			{children(player)}

			<div className="algo-viz-note" aria-live="polite">
				{player.frame?.note}
			</div>

			<div className="algo-viz-progress" onClick={onSeekClick} role="presentation">
				<div className="algo-viz-progress-fill" style={{ width: `${last === 0 ? 100 : (step / last) * 100}%` }} />
			</div>

			<div className="algo-viz-controls">
				<button type="button" className="algo-viz-btn" onClick={reset} disabled={step === 0}>
					{vizIcons.reset}
					<span>重置</span>
				</button>
				<button type="button" className="algo-viz-btn" onClick={() => seek(step - 1)} disabled={step === 0}>
					{vizIcons.prev}
					<span>上一步</span>
				</button>
				<button type="button" className="algo-viz-btn algo-viz-btn--primary" onClick={togglePlay}>
					{playing ? vizIcons.pause : vizIcons.play}
					<span>{playing ? '暂停' : '播放'}</span>
				</button>
				<button type="button" className="algo-viz-btn" onClick={() => seek(step + 1)} disabled={step >= last}>
					<span>下一步</span>
					{vizIcons.next}
				</button>
				<span className="algo-viz-speeds">
					{SPEEDS.map((speed, idx) => (
						<button
							type="button"
							key={speed.label}
							className={'algo-viz-speed' + (idx === speedIdx ? ' algo-viz-speed--on' : '')}
							onClick={() => changeSpeed(idx)}
						>
							{speed.label}
						</button>
					))}
				</span>
			</div>
		</figure>
	);
}
