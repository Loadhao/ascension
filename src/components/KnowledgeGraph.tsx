import { useEffect, useMemo, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import fcose from 'cytoscape-fcose';

cytoscape.use(fcose);

export interface GraphNode {
  id: string;
  label: string;
  href?: string;
  group?: string;
  /** 0–1 归一化权重，映射节点内边距与字号（内容量越多节点越大）；缺省 0 */
  weight?: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  label?: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

const MIN_ZOOM = 0.15;
const MAX_ZOOM = 2.5;
const FIT_PADDING = 48;

/** 分组基色：低饱和，向明暗主题底色混合后仍可区分 */
const PALETTE = [
  '#0e7490',
  '#b45309',
  '#4d7c0f',
  '#7c3aed',
  '#be185d',
  '#0369a1',
  '#15803d',
  '#a16207',
];

const NEUTRAL = '#64748b';

const groupColorCache = new Map<string, string>();

function colorForGroup(group: string | undefined): string {
  if (!group) return NEUTRAL;
  if (!groupColorCache.has(group)) {
    groupColorCache.set(group, PALETTE[groupColorCache.size % PALETTE.length]!);
  }
  return groupColorCache.get(group)!;
}

type Rgb = [number, number, number];

function hexToRgb(hex: string): Rgb {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** base 向 color 混合，weight 越大越接近 color */
function mix(base: Rgb, color: Rgb, weight: number): string {
  const channel = (i: number) =>
    Math.round(base[i]! + (color[i]! - base[i]!) * weight);
  return `rgb(${channel(0)}, ${channel(1)}, ${channel(2)})`;
}

/** 深底配白字、浅底配黑字 */
function contrastText(color: Rgb): string {
  const luma = 0.299 * color[0]! + 0.587 * color[1]! + 0.114 * color[2]!;
  return luma > 150 ? '#111111' : '#ffffff';
}

/** 节点权重 → 内边距/字号增量：大节点 = 内容多，标签始终可读 */
const PAD_BASE = 10;
const PAD_SPAN = 16;
const FONT_BASE = 12.5;
const FONT_SPAN = 2.5;

function weightOf(ele: cytoscape.SingularElementArgument): number {
  const w = ele.data('weight');
  return typeof w === 'number' && Number.isFinite(w)
    ? Math.min(1, Math.max(0, w))
    : 0;
}

function isDarkTheme(): boolean {
  return document.documentElement.dataset.theme !== 'light';
}

/** 画布底色（对应 .knowledge-graph 的 --sl-color-bg：暗纯黑 / 亮纯白） */
const CANVAS_DARK: Rgb = [10, 10, 10];
const CANVAS_LIGHT: Rgb = [255, 255, 255];

/** 分组色的主题化变体：芯片淡彩底 / 描边 / 文字三档浓度 */
function groupTint(
  group: string | undefined,
  dark: boolean,
  weight: number,
): string {
  return mix(
    dark ? CANVAS_DARK : CANVAS_LIGHT,
    hexToRgb(colorForGroup(group)),
    weight,
  );
}

function buildStyles(dark: boolean): cytoscape.Stylesheet[] {
  const strong = dark ? '#f5f5f5' : '#111111';
  return [
    {
      selector: 'node',
      style: {
        shape: 'round-rectangle',
        'corner-radius': 8,
        'background-color': (
          ele: cytoscape.SingularElementArgument,
        ) => groupTint(ele.data('group'), dark, dark ? 0.22 : 0.08),
        'border-color': (ele: cytoscape.SingularElementArgument) =>
          groupTint(ele.data('group'), dark, dark ? 0.55 : 0.5),
        'border-width': 1.25,
        label: 'data(label)',
        color: (ele: cytoscape.SingularElementArgument) =>
          groupTint(ele.data('group'), dark, dark ? 0.82 : 0.85),
        'font-size': (ele: cytoscape.SingularElementArgument) =>
          Math.round(FONT_BASE + FONT_SPAN * weightOf(ele)),
        'font-family':
          'system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif',
        'font-weight': 400,
        'text-wrap': 'wrap',
        'text-valign': 'center',
        'text-halign': 'center',
        width: 'label',
        height: 'label',
        padding: (ele: cytoscape.SingularElementArgument) =>
          `${Math.round(PAD_BASE + PAD_SPAN * weightOf(ele))}px`,
      },
    },
    {
      // 已关联笔记的节点：加重描边与字重，配合 pointer 光标表达可点
      selector: 'node[href]',
      style: {
        'border-width': 2,
        'font-weight': 600,
      },
    },
    {
      selector: 'node.hl',
      style: {
        'background-color': (ele: cytoscape.SingularElementArgument) =>
          colorForGroup(ele.data('group')),
        'border-color': (ele: cytoscape.SingularElementArgument) =>
          colorForGroup(ele.data('group')),
        color: (ele: cytoscape.SingularElementArgument) =>
          contrastText(hexToRgb(colorForGroup(ele.data('group')))),
      },
    },
    { selector: 'node.faded', style: { opacity: 0.16 } },
    { selector: 'node.gfiltered', style: { display: 'none' } },
    {
      selector: 'edge',
      style: {
        width: 1.25,
        'line-color': dark ? '#333333' : '#d4d4d4',
        'target-arrow-color': dark ? '#333333' : '#d4d4d4',
        'target-arrow-shape': 'triangle',
        'arrow-scale': 0.7,
        'curve-style': 'bezier',
        label: 'data(label)',
        'font-size': 10.5,
        'font-family':
          'system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif',
        color: dark ? '#a3a3a3' : '#737373',
        // 边标签默认隐藏，仅在高亮邻域时出现，避免满屏文字噪音
        'text-opacity': 0,
        'text-background-color': dark ? '#0a0a0a' : '#ffffff',
        'text-background-opacity': 0,
        'text-background-padding': 3,
        'text-background-shape': 'roundrectangle',
      },
    },
    {
      selector: 'edge.hl',
      style: {
        width: 2,
        'line-color': strong,
        'target-arrow-color': strong,
        'text-opacity': 1,
        'text-background-opacity': 1,
      },
    },
    { selector: 'edge.faded', style: { opacity: 0.08 } },
  ];
}

const ICON_ZOOM_IN = (
  <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
    <circle cx="6" cy="6" r="4.4" fill="none" stroke="currentColor" strokeWidth="1.2" />
    <path
      d="M9.2 9.2 L12.5 12.5 M6 4.2 V7.8 M4.2 6 H7.8"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
  </svg>
);

const ICON_ZOOM_OUT = (
  <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
    <circle cx="6" cy="6" r="4.4" fill="none" stroke="currentColor" strokeWidth="1.2" />
    <path
      d="M9.2 9.2 L12.5 12.5 M4.2 6 H7.8"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
  </svg>
);

const ICON_FIT = (
  <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
    <path
      d="M1.5 4.5 V1.5 H4.5 M9.5 1.5 H12.5 V4.5 M12.5 9.5 V12.5 H9.5 M4.5 12.5 H1.5 V9.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/** 站点部署在子路径（/ascension/），为站内链接自动拼接 base */
function withBase(href: string): string {
  if (!href.startsWith('/')) return href;
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}${href}`;
}

/** 容器高度随节点数自适应（未显式指定时）：小图维持 560，大图最高 760 */
function autoHeight(nodeCount: number): number {
  return Math.min(760, Math.max(560, 380 + nodeCount * 7));
}

export default function KnowledgeGraph({
  data,
  height,
  groupCounts,
}: {
  data: GraphData;
  height?: number;
  /** 覆盖图例计数的展示口径（如全景图显示知识点数而非节点数）；缺省用分组节点数 */
  groupCounts?: Record<string, number>;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const boxHeight = height ?? autoHeight(data.nodes.length);

  const groups = useMemo(() => {
    const counts = new Map<string, number>();
    for (const node of data.nodes) {
      if (node.group) counts.set(node.group, (counts.get(node.group) ?? 0) + 1);
    }
    return [...counts.entries()];
  }, [data]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reducedMotion = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    const cy = cytoscape({
      container,
      elements: [
        ...data.nodes.map((node) => ({
          data: {
            id: node.id,
            label: node.label,
            href: node.href ? withBase(node.href) : undefined,
            group: node.group,
            weight: node.weight,
          },
        })),
        ...data.edges.map((edge) => ({
          data: {
            source: edge.source,
            target: edge.target,
            label: edge.label,
          },
        })),
      ],
      wheelSensitivity: 0.25,
      minZoom: MIN_ZOOM,
      maxZoom: MAX_ZOOM,
      style: buildStyles(isDarkTheme()),
      layout: {
        name: 'fcose',
        quality: 'proof',
        animate: !reducedMotion,
        animationDuration: 500,
        padding: FIT_PADDING,
        nodeSeparation: 220,
        idealEdgeLength: 220,
        randomize: true,
        // 节点尺寸来自 label，布局需把标签算进去否则节点互相叠压
        nodeDimensionsIncludeLabels: true,
      },
    });
    cyRef.current = cy;

    // 悬停/锁定高亮：焦点节点与邻域实显并显示边标签，其余淡出
    let pinned: cytoscape.NodeSingular | null = null;

    const highlight = (node?: cytoscape.NodeSingular) => {
      cy.batch(() => {
        cy.elements().removeClass('hl faded');
        if (!node) return;
        const neighborhood = node.closedNeighborhood();
        neighborhood.addClass('hl');
        cy.elements().not(neighborhood).addClass('faded');
      });
    };

    cy.on('mouseover', 'node', (event) => {
      if (pinned) return;
      highlight(event.target);
      if (event.target.data('href')) container.style.cursor = 'pointer';
    });
    cy.on('mouseout', 'node', () => {
      container.style.cursor = '';
      if (!pinned) highlight();
    });
    cy.on('tap', 'node', (event) => {
      const href = event.target.data('href');
      if (href) {
        window.location.assign(href);
        return;
      }
      // 无链接节点点按 = 锁定/解锁邻域高亮（触屏没有悬停）
      pinned = pinned === event.target ? null : event.target;
      highlight(pinned ?? undefined);
    });
    cy.on('tap', (event) => {
      if (event.target === cy) {
        pinned = null;
        highlight();
      }
    });

    // 布局落定后整体纳入视野；容器尺寸变化时保持全图可见
    cy.on('layoutstop', () => cy.fit(undefined, FIT_PADDING));
    const resizeObserver = new ResizeObserver(() => {
      if (cy.destroyed()) return;
      cy.resize();
      cy.fit(undefined, FIT_PADDING);
    });
    resizeObserver.observe(container);

    // 明暗主题切换时重算画布配色（canvas 不吃 CSS 变量）
    const themeObserver = new MutationObserver(() => {
      if (!cy.destroyed()) cy.style(buildStyles(isDarkTheme())).update();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    // 中文等字体晚于首次标签测量就绪时，'label' 尺寸被记为 0 且不再重测，
    // 节点会永远不被渲染；字体就绪后强制重算一次样式触发重绘。
    document.fonts?.ready.then(() => {
      if (!cy.destroyed()) cy.style().update();
    });

    return () => {
      resizeObserver.disconnect();
      themeObserver.disconnect();
      cy.destroy();
      cyRef.current = null;
    };
  }, [data]);

  // 图例点选：按分组过滤节点（隐藏节点的边自动消失），并回到全图视野
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.batch(() => {
      cy.nodes().forEach((node) => {
        node.toggleClass(
          'gfiltered',
          activeGroup !== null && node.data('group') !== activeGroup,
        );
      });
    });
    cy.fit(undefined, FIT_PADDING);
  }, [activeGroup]);

  const zoomBy = (factor: number) => {
    const cy = cyRef.current;
    if (!cy) return;
    const level = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, cy.zoom() * factor));
    cy.zoom({
      level,
      renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 },
    });
  };

  return (
    <div className="knowledge-graph" style={{ width: '100%', height: boxHeight }}>
      <div ref={containerRef} className="kg-canvas" />
      <div className="kg-toolbar" role="group" aria-label="图谱视图控制">
        <button
          type="button"
          className="kg-btn"
          title="放大"
          aria-label="放大"
          onClick={() => zoomBy(1.35)}
        >
          {ICON_ZOOM_IN}
        </button>
        <button
          type="button"
          className="kg-btn"
          title="缩小"
          aria-label="缩小"
          onClick={() => zoomBy(1 / 1.35)}
        >
          {ICON_ZOOM_OUT}
        </button>
        <button
          type="button"
          className="kg-btn"
          title="复位视图"
          aria-label="复位视图"
          onClick={() => cyRef.current?.fit(undefined, FIT_PADDING)}
        >
          {ICON_FIT}
        </button>
      </div>
      {groups.length > 0 && (
        <div className="kg-legend" role="group" aria-label="分组图例（点按筛选）">
          {groups.map(([group, count]) => {
            const color = colorForGroup(group);
            const active = activeGroup === group;
            return (
              <button
                key={group}
                type="button"
                className="kg-chip"
                aria-pressed={active}
                style={
                  active
                    ? {
                        backgroundColor: color,
                        borderColor: color,
                        color: contrastText(hexToRgb(color)),
                      }
                    : undefined
                }
                onClick={() => setActiveGroup(active ? null : group)}
              >
                {!active && <span className="kg-dot" style={{ backgroundColor: color }} />}
                <span>{group}</span>
                <span className="kg-count">{groupCounts?.[group] ?? count}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
