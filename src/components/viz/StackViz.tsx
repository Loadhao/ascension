import { VizShell } from './player';

/** 一个栈：items 自底向顶排列；支持 1~2 个栈并列（最小栈 / 双栈队列） */
export interface StackSpec {
	label: string;
	items: Array<{ id: number; label: string }>;
}

/** 一帧：若干栈快照 + 可选输入扫描条（pos 高亮当前字符）+ 本步说明 */
export interface StackFrame {
	stacks: StackSpec[];
	/** 本步变动的元素 id（入栈的新元素 / 即将出栈的栈顶） */
	active?: number[];
	/** 输入串扫描条：pos 为 null 表示未在扫描（或已扫完） */
	scan?: { chars: string[]; pos: number | null };
	note: string;
}

export interface StackVizConfig {
	title: string;
	frames: StackFrame[];
}

/** 栈步骤动画播放器：竖直栈列（顶端朝上）+ 栈名与顶指针 + 可选扫描条 */
export default function StackViz({ title, frames }: StackVizConfig) {
	return (
		<VizShell title={title} frames={frames}>
			{(player) => <StackPlot frame={player.frame} />}
		</VizShell>
	);
}

function StackPlot({ frame }: { frame: StackFrame | undefined }) {
	const stacks = frame?.stacks ?? [];
	const activeSet = new Set(frame?.active ?? []);
	const scan = frame?.scan;

	return (
		<>
			<div className="algo-viz-plot algo-stack-plot">
				{stacks.map((stack) => (
					<div className="algo-stack-col" key={stack.label}>
						<div className="algo-stack-name">{stack.label}</div>
						<div className="algo-stack-tube">
							{stack.items.length === 0 && <div className="algo-stack-empty">空</div>}
							{stack.items.map((it, idx) => (
								<div
									key={it.id}
									className={
										'algo-stack-item' +
										(idx === stack.items.length - 1 ? ' algo-stack-item--top' : '') +
										(activeSet.has(it.id) ? ' algo-stack-item--active' : '')
									}
								>
									{it.label}
								</div>
							))}
						</div>
					</div>
				))}
			</div>

			{scan && (
				<div className="algo-viz-axis algo-stack-scan">
					<span className="algo-tree-queue-label">扫描</span>
					{scan.chars.map((ch, i) => (
						<span key={i} className={i === scan.pos ? 'algo-tree-qchip algo-tree-qchip--head' : 'algo-tree-qchip'}>
							{ch}
						</span>
					))}
					{scan.pos === null && <span className="algo-tree-queue-empty">完成</span>}
				</div>
			)}
		</>
	);
}
