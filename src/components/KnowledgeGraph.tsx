import { useEffect, useMemo, useRef, useState } from 'react';
import cytoscape from 'cytoscape';
import fcose from 'cytoscape-fcose';

cytoscape.use(fcose);

export interface GraphNode {
  id: string;
  label: string;
  href?: string;
  group?: string;
  /** 0–1 归一化权重，映射圆点大小（内容量越多节点越大）；缺省为最小圆点 */
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
const FIT_PADDING = 32;

/** 圆点直径：缺省 10px，权重 1 时再加 34px */
const DOT_MIN = 10;
const DOT_SPAN = 34;

/** 分组基色：低饱和，作圆点填充在明暗主题下均可区分 */
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

/** 圆点填充色：暗色主题略微提亮，亮色主题用原色 */
function dotColor(group: string | undefined, dark: boolean): string {
  const rgb = hexToRgb(colorForGroup(group));
  return dark ? mix(rgb, [255, 255, 255], 0.22) : `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
}

function isDarkTheme(): boolean {
  return document.documentElement.dataset.theme !== 'light';
}

function weightOf(ele: cytoscape.SingularElementArgument): number {
  const w = ele.data('weight');
  return typeof w === 'number' && Number.isFinite(w)
    ? Math.min(1, Math.max(0, w))
    : 0;
}

const FONT_STACK =
  'system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif';

function buildStyles(dark: boolean): cytoscape.Stylesheet[] {
  const canvas = dark ? '#0a0a0a' : '#ffffff';
  const strong = dark ? '#f5f5f5' : '#111111';
  const textMuted = dark ? '#a3a3a3' : '#525252';
  const edgeLine = dark ? '#333333' : '#d4d4d4';
  return [
    {
      // Obsidian 风格：圆点 + 下方悬浮标签
      selector: 'node',
      style: {
        shape: 'ellipse',
        width: (ele: cytoscape.SingularElementArgument) =>
          DOT_MIN + DOT_SPAN * weightOf(ele),
        height: (ele: cytoscape.SingularElementArgument) =>
          DOT_MIN + DOT_SPAN * weightOf(ele),
        'background-color': (ele: cytoscape.SingularElementArgument) =>
          dotColor(ele.data('group'), dark),
        'border-width': 0,
        label: 'data(label)',
        color: textMuted,
        'font-size': 11.5,
        'font-family': FONT_STACK,
        'text-valign': 'bottom',
        'text-halign': 'center',
        'text-margin-y': 7,
        'text-wrap': 'ellipsis',
        'text-max-width': 120,
        // 轻微标签底色，避免与连线交叠时难读
        'text-background-color': canvas,
        'text-background-opacity': 0.6,
        'text-background-padding': 2,
        'text-background-shape': 'roundrectangle',
      },
    },
    {
      selector: 'node.hl',
      style: {
        width: (ele: cytoscape.SingularElementArgument) =>
          (DOT_MIN + DOT_SPAN * weightOf(ele)) * 1.3,
        height: (ele: cytoscape.SingularElementArgument) =>
          (DOT_MIN + DOT_SPAN * weightOf(ele)) * 1.3,
        color: strong,
        'font-weight': 600,
        'text-background-opacity': 0.9,
      },
    },
    { selector: 'node.faded', style: { opacity: 0.15 } },
    { selector: 'node.gfiltered', style: { display: 'none' } },
    {
      // 细直线（haystack），Obsidian 不用箭头
      selector: 'edge',
      style: {
        width: 1,
        'line-color': edgeLine,
        'curve-style': 'haystack',
        'haystack-radius': 0.4,
        label: 'data(label)',
        'font-size': 10,
        'font-family': FONT_STACK,
        color: textMuted,
        // 边标签默认隐藏，仅在高亮邻域时出现
        'text-opacity': 0,
        'text-background-color': canvas,
        'text-background-opacity': 0,
        'text-background-padding': 2,
        'text-background-shape': 'roundrectangle',
      },
    },
    {
      selector: 'edge.hl',
      style: {
        width: 1.5,
        'line-color': dark ? '#8a8a8a' : '#737373',
        'text-opacity': 1,
        'text-background-opacity': 1,
      },
    },
    { selector: 'edge.faded', style: { opacity: 0.06 } },
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
  legendLayout = 'overlay',
  fullBleed = false,
}: {
  data: GraphData;
  /** 容器高度：数字（px）或任意 CSS 高度（如 calc(100vh - 260px)） */
  height?: number | string;
  /** 覆盖图例计数的展示口径（如全景图显示知识点数而非节点数）；缺省用分组节点数 */
  groupCounts?: Record<string, number>;
  /** overlay = 悬浮在画布上（默认，适合少分组）；bar = 画布上方控制条（分组多时不遮节点） */
  legendLayout?: 'overlay' | 'bar';
  /** 全宽展示：容器左右边缘推到视口两侧（Starlight 侧栏布局下按实际偏移计算） */
  fullBleed?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
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
    // 全景（方向→分类树）收紧间距让首屏更大，各方向知识图谱保持舒展
    const isTree = data.edges.length > 0 && data.nodes.length > 40;
    const separation = isTree ? 80 : 220;

    // 不在构造器里自动跑布局：animate:false 时布局同步完成，layoutstop
    // 会先于监听器挂载发出，导致 layoutRunning 永远为 true。先建实例、
    // 挂好监听，再显式 run()。
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
      wheelSensitivity: 0.35,
      minZoom: MIN_ZOOM,
      maxZoom: MAX_ZOOM,
      style: buildStyles(isDarkTheme()),
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

    // 布局进行中的 resize/样式更新会打断 fcose（尤其复合节点动画布局），
    // 全部推迟到 layoutstop 统一处理：补一次 resize + 适配视野
    let layoutRunning = true;
    cy.on('layoutstart', () => {
      layoutRunning = true;
    });
    cy.on('layoutstop', () => {
      layoutRunning = false;
      cy.resize();
      cy.fit(undefined, FIT_PADDING);
    });
    const resizeObserver = new ResizeObserver(() => {
      if (cy.destroyed() || layoutRunning) return;
      cy.resize();
      cy.fit(undefined, FIT_PADDING);
    });
    resizeObserver.observe(container);

    // 明暗主题切换时重算画布配色（canvas 不吃 CSS 变量）
    const themeObserver = new MutationObserver(() => {
      if (!cy.destroyed() && !layoutRunning)
        cy.style(buildStyles(isDarkTheme())).update();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    // 中文等字体晚于首次标签测量就绪时，'label' 尺寸被记为 0 且不再重测，
    // 节点会永远不被渲染；字体就绪后强制重算一次样式触发重绘。
    document.fonts?.ready.then(() => {
      if (!cy.destroyed() && !layoutRunning) cy.style().update();
    });

    // 监听器就位后再跑布局（layoutstop 依赖上面挂载的 handler）
    cy.layout({
      name: 'fcose',
      quality: 'proof',
      animate: !reducedMotion,
      animationDuration: 500,
      padding: FIT_PADDING,
      nodeSeparation: separation,
      idealEdgeLength: separation,
      randomize: true,
      // 节点尺寸来自 label，布局需把标签算进去否则节点互相叠压
      nodeDimensionsIncludeLabels: true,
    }).run();

    return () => {
      resizeObserver.disconnect();
      themeObserver.disconnect();
      cy.destroy();
      cyRef.current = null;
    };
  }, [data]);

    // 全宽：左缘保持正文自然位置（不会压在 fixed 左侧栏下），右缘顶到
    // 视口右边界（main 有 max-width 居中限制，不能以它为界）。
    // 宽度取 clientWidth 差值，天然不含滚动条，不会产生横向滚动。
    useEffect(() => {
      if (!fullBleed) return;
      const card = cardRef.current;
      if (!card) return;
      const stretch = () => {
        card.style.marginLeft = '';
        card.style.width = '';
        const naturalLeft = Math.round(card.getBoundingClientRect().left);
        card.style.marginLeft = '0';
        card.style.width = `${document.documentElement.clientWidth - naturalLeft}px`;
      };
      stretch();
      window.addEventListener('resize', stretch);
      return () => {
        window.removeEventListener('resize', stretch);
        card.style.marginLeft = '';
        card.style.width = '';
      };
    }, [fullBleed]);

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

  const toolbar = (
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
  );

  const legend =
    groups.length > 0 ? (
      <div
        className={`kg-legend${legendLayout === 'bar' ? ' kg-legend--footer' : ''}`}
        role="group"
        aria-label="分组图例（点按筛选）"
      >
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
    ) : null;

  return (
    <div
      ref={cardRef}
      className={`knowledge-graph${fullBleed ? ' kg-fullbleed' : ''}`}
      style={{ width: '100%', height: boxHeight }}
    >
      {legendLayout === 'bar' ? (
        <>
          {toolbar}
          <div ref={containerRef} className="kg-canvas" />
          {legend}
        </>
      ) : (
        <>
          {toolbar}
          {legend}
          <div ref={containerRef} className="kg-canvas" />
        </>
      )}
    </div>
  );
}
