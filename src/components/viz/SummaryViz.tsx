import { Fragment } from 'react';

export type SummaryTone = 'blue' | 'teal' | 'green' | 'amber' | 'rose' | 'violet' | 'slate';

/** 面板/分层里的一条要点：短标题 + 一行补充 */
export interface SummaryCell {
	label: string;
	desc?: string;
}

export interface SummaryPanel {
	title: string;
	/** 面板标题下的小字定位 */
	sub?: string;
	tone: SummaryTone;
	cells: SummaryCell[];
}

export interface SummaryLayer {
	title: string;
	sub?: string;
	tone: SummaryTone;
	cells: SummaryCell[];
}

/**
 * 彩色总结卡：把一篇笔记的结论压缩成一张静态速记图。
 * `panels`（2~3 个对比面板）与 `layers`（自上而下分层）二选一，由数据决定布局。
 */
export interface SummaryVizConfig {
	/** 主标题：一句话结论 */
	title: string;
	/** 标题下的胶囊副标 */
	badge?: string;
	/** compare 布局：2~3 个对比面板 */
	panels?: SummaryPanel[];
	/** compare 两栏中缝的关系说明（仅两栏时展示） */
	link?: string;
	/** layers 布局：自上而下的分层 */
	layers?: SummaryLayer[];
	/** 底部结论胶囊 */
	takeaways?: string[];
	/** 卡片外的一句话总结 */
	caption?: string;
}

const ArrowRight = () => (
	<svg className="sum-link-arrow" viewBox="0 0 48 10" aria-hidden="true">
		<path d="M2 5h40m0 0-7-4m7 4-7 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
	</svg>
);

const ArrowLeft = () => (
	<svg className="sum-link-arrow" viewBox="0 0 48 10" aria-hidden="true">
		<path d="M46 5H6m0 0 7-4m-7 4 7 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
	</svg>
);

const Cells = ({ cells }: { cells: SummaryCell[] }) => (
	<div className="sum-cells">
		{cells.map((cell) => (
			<div key={cell.label} className="sum-cell">
				<span className="sum-cell-label">{cell.label}</span>
				{cell.desc && <span className="sum-cell-desc">{cell.desc}</span>}
			</div>
		))}
	</div>
);

/** 静态组件，不接客户端脚本：由 AlgorithmVizIsland 直接服务端渲染 */
export default function SummaryViz({ title, badge, panels, link, layers, takeaways, caption }: SummaryVizConfig) {
	const linked = !!panels && panels.length === 2 && !!link;
	return (
		<figure className="sum-viz">
			<figcaption className="sum-head">
				<div className="sum-title">{title}</div>
				{badge && <span className="sum-badge">{badge}</span>}
			</figcaption>
			{panels && (
				<div className={`sum-cols sum-cols--${panels.length}${linked ? ' sum-cols--linked' : ''}`}>
					{panels.map((panel, i) => (
						<Fragment key={panel.title}>
							{i === 1 && linked && (
								<div className="sum-link" aria-hidden="true">
									<ArrowRight />
									<span className="sum-link-text">{link}</span>
									<ArrowLeft />
								</div>
							)}
							<section className={`sum-panel sum-panel--${panel.tone}`}>
								<header className="sum-panel-head">
									<span className="sum-panel-title">{panel.title}</span>
									{panel.sub && <span className="sum-panel-sub">{panel.sub}</span>}
								</header>
								<Cells cells={panel.cells} />
							</section>
						</Fragment>
					))}
				</div>
			)}
			{layers && (
				<div className="sum-stack">
					{layers.map((layer) => (
						<section key={layer.title} className={`sum-layer sum-layer--${layer.tone}`}>
							<header className="sum-layer-head">
								<span className="sum-panel-title">{layer.title}</span>
								{layer.sub && <span className="sum-panel-sub">{layer.sub}</span>}
							</header>
							<Cells cells={layer.cells} />
						</section>
					))}
				</div>
			)}
			{takeaways && takeaways.length > 0 && (
				<div className="sum-takeaways">
					{takeaways.map((takeaway) => (
						<span key={takeaway} className="sum-take">{takeaway}</span>
					))}
				</div>
			)}
			{caption && <div className="sum-caption">{caption}</div>}
		</figure>
	);
}
