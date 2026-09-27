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
  /**
   * 标签分级：summary = 汇总层（如方向），任何缩放下都显示标签；
   * detail = 明细层（如分类），缩略时隐藏标签，避免上百个标签互相压成一片。
   */
  tier?: 'summary' | 'detail';
  /** 详情卡副信息行（如「102 个知识点」「Java › 基础」），按顺序显示 */
  detail?: string[];
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

/** 明细层标签的显现门槛：相对首屏基准放大到 1.45 倍才逐级显示。
    绝对阈值在换屏宽、增删内容后都会失准，故以「首屏恰好装下全部」的缩放为基准 */
const DETAIL_LABEL_RATIO = 1.45;

/** 单击聚焦时的目标缩放（基准的倍数），保证聚焦点及其邻域标签可读 */
const REVEAL_ZOOM_RATIO = 1.6;

/** 圆点直径：缺省 10px，权重 1 时再加 34px */
const DOT_MIN = 10;
const DOT_SPAN = 34;

/** 环形分区布局的间距参数（模型像素）：内圈方向占位、外圈分类弧长与环距 */
const HUB_ARC = 46;
const HUB_STAGGER = 34;
const DOT_ARC = 26;
const BAND_FIRST = 80;
const BAND_GAP = 40;

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

function dotSize(ele: cytoscape.SingularElementArgument, scale = 1): number {
  return (DOT_MIN + DOT_SPAN * weightOf(ele)) * scale;
}

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
        width: (ele: cytoscape.SingularElementArgument) => dotSize(ele),
        height: (ele: cytoscape.SingularElementArgument) => dotSize(ele),
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
      // 汇总层（方向）：字号与字重压过明细层，缩略视图下只有它们带标签
      selector: 'node[tier="summary"]',
      style: {
        'font-size': 13,
        'font-weight': 600,
        color: dark ? '#d4d4d4' : '#262626',
        // 标签朝向按节点所在半圈决定，避免上半圈的内向标签与对面撞在一起
        'text-valign': (ele: cytoscape.SingularElementArgument) =>
          (ele as cytoscape.NodeSingular).position('y') < 0 ? 'top' : 'bottom',
      },
    },
    {
      selector: 'node.hl',
      style: {
        width: (ele: cytoscape.SingularElementArgument) => dotSize(ele, 1.3),
        height: (ele: cytoscape.SingularElementArgument) => dotSize(ele, 1.3),
        color: strong,
        'font-weight': 600,
        'text-background-opacity': 0.9,
      },
    },
    { selector: 'node.faded', style: { opacity: 0.15 } },
    { selector: 'node.gfiltered', style: { display: 'none' } },
    {
      // 标签分级：缩略视图下收起明细层文字，只留圆点与连线
      selector: 'node.hide-label',
      style: { 'text-opacity': 0, 'text-background-opacity': 0 },
    },
    {
      // 搜索命中：描边标出，配合邻域高亮定位
      // 规则须排在 hide-label 之后——缩略态下命中的明细节点也要把标签顶出来
      selector: 'node.hit',
      style: {
        'border-width': 2,
        'border-color': dark ? '#f5f5f5' : '#111111',
        color: strong,
        'font-weight': 600,
        'text-opacity': 1,
        'text-background-opacity': 0.9,
      },
    },
    {
      // 当前聚焦（单击选中）节点：持续描边，与搜索命中区分
      selector: 'node.sel',
      style: {
        'border-width': 2.5,
        'border-color': dark ? '#38bdf8' : '#0284c7',
        'text-opacity': 1,
        'text-background-opacity': 0.9,
      },
    },
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

/**
 * 两级星形森林的环形分区布局：方向沿内圈均分，其分类在外侧扇区内逐环排开。
 * 170+ 节点跑力导向会互相穿插成一团、且每次刷新位置都变，读者无法形成稳定
 * 心智地图；按扇区排布后「找方向 = 找扇区」，包围盒也更紧凑（同屏能看清更多）。
 * 数据里没有 summary 层时返回 false，交回力导向布局。
 */
function radialLayout(cy: cytoscape.Core, data: GraphData): boolean {
  const hubs = data.nodes.filter((node) => node.tier === 'summary');
  if (hubs.length === 0) return false;

  const kids = new Map<string, string[]>();
  for (const edge of data.edges) {
    const list = kids.get(edge.source);
    if (list) list.push(edge.target);
    else kids.set(edge.source, [edge.target]);
  }

  // 每个方向连同其分类占的「名额」决定扇区宽度，方向多的自然占更大一块
  const slots = hubs.reduce(
    (sum, hub) => sum + (kids.get(hub.id)?.length ?? 0) + 1,
    0,
  );
  const hubRadius = Math.max(150, (hubs.length * HUB_ARC) / (Math.PI * 2));
  // 画布是宽矩形，正圆只能吃到高度、左右各空出一大截；按宽高比横向拉伸成
  // 椭圆填满画布，纵向范围不变（决定首屏缩放），顺带拉开上下两侧方向名的间距
  const stretch =
    cy.height() > 0 ? Math.min(1.6, Math.max(1, cy.width() / cy.height())) : 1;
  const place = (id: string, radius: number, angle: number) => {
    cy.getElementById(id).position({
      x: radius * Math.cos(angle) * stretch,
      y: radius * Math.sin(angle),
    });
  };

  // 数据按内容量降序；大小扇区交替排布，避免小方向连着排时窄扇区里的
  // 方向名在同一个半径上挤成一片。相邻方向再错开一圈半径，标签不同线。
  const ring: GraphNode[] = [];
  for (let i = 0, j = hubs.length - 1; i <= j; i += 1, j -= 1) {
    ring.push(hubs[i]!);
    if (i !== j) ring.push(hubs[j]!);
  }

  let cursor = -Math.PI / 2; // 12 点方向起，顺时针
  ring.forEach((hub, i) => {
    const list = kids.get(hub.id) ?? [];
    const wedge = (Math.PI * 2 * (list.length + 1)) / slots;
    const mid = cursor + wedge / 2;
    place(hub.id, hubRadius + (i % 2 ? HUB_STAGGER : 0), mid);

    let done = 0;
    for (let band = 0; done < list.length; band += 1) {
      const radius = hubRadius + BAND_FIRST + BAND_GAP * band;
      const cap = Math.max(1, Math.floor((wedge * 0.9 * radius) / DOT_ARC));
      const take = Math.min(cap, list.length - done);
      const arc = wedge * 0.9;
      const from = mid - arc / 2;
      const step = take > 1 ? arc / (take - 1) : 0;
      for (let k = 0; k < take; k += 1) {
        place(list[done + k]!, radius, from + step * k);
      }
      done += take;
    }
    cursor += wedge;
  });
  return true;
}

/** 组件内需要命令式调用的画布能力，由 React 事件处理器经 ref 触发 */
interface GraphApi {
  setTerm(term: string): void;
  revealHits(): void;
  frame(): void;
  filter(group: string | null): void;
  zoomBy(factor: number): void;
}

export default function KnowledgeGraph({
  data,
  height,
  groupCounts,
  legendLayout = 'overlay',
  fullBleed = false,
  searchable = false,
  tapAction = 'navigate',
  layout = 'force',
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
  /** 工具栏显示搜索定位框（节点多到肉眼扫不动的大图） */
  searchable?: boolean;
  /**
   * 单击语义：navigate = 直接进页面（方向内笔记图，跳转即主用途）；
   * focus = 居中放大并锁定邻域高亮，双击才进页面（全站全景，误点代价高）。
   */
  tapAction?: 'navigate' | 'focus';
  /**
   * 排布方式：force = fcose 力导向（方向内笔记图的网状关联）；
   * radial = 环形扇区分区（全站全景的两级星形森林，需节点带 tier）。
   */
  layout?: 'force' | 'radial';
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<GraphApi | null>(null);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [term, setTerm] = useState('');
  const [hitCount, setHitCount] = useState(0);
  const [panel, setPanel] = useState<{ node: GraphNode; pinned: boolean } | null>(
    null,
  );
  const boxHeight = height ?? autoHeight(data.nodes.length);

  const nodeById = useMemo(
    () => new Map(data.nodes.map((node) => [node.id, node])),
    [data],
  );

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
            tier: node.tier,
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
      minZoom: MIN_ZOOM,
      maxZoom: MAX_ZOOM,
      style: buildStyles(isDarkTheme()),
    });

    // 强调态优先级：搜索命中 > 悬停 > 单击锁定，三处共用一次重算
    let selected: cytoscape.NodeSingular | null = null;
    let hovered: cytoscape.NodeSingular | null = null;
    let query = '';

    const hitsOf = () => {
      if (!query) return cy.collection();
      return cy.nodes().filter(
        (node) =>
          !node.hasClass('gfiltered') &&
          String(node.data('label') ?? '').toLowerCase().includes(query),
      );
    };

    const syncPanel = () => {
      const ele = hovered ?? selected;
      const node = ele ? nodeById.get(ele.id()) : undefined;
      setPanel(node ? { node, pinned: !!ele && ele === selected } : null);
    };

    const emphasis = () => {
      cy.batch(() => {
        cy.elements().removeClass('hl faded hit');
        if (query) {
          const hits = hitsOf();
          setHitCount(hits.length);
          if (hits.empty()) return;
          const keep = hits.union(hits.closedNeighborhood());
          hits.addClass('hit');
          cy.elements().not(keep).addClass('faded');
          return;
        }
        setHitCount(0);
        const focus = hovered ?? selected;
        if (!focus) return;
        const neighborhood = focus.closedNeighborhood();
        neighborhood.addClass('hl');
        cy.elements().not(neighborhood).addClass('faded');
      });
    };

    // 居中保持的缩放：cy.zoom(数字) 不改 pan（等于绕画布左上角放大，内容会
    // 整体偏移出视野），必须显式给出缩放原点才谈得上「居中」。
    const zoomAroundCenter = (level: number) => {
      cy.zoom({
        level: Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, level)),
        renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 },
      });
    };

    // 全图包围盒：布局完成时量一次即恒定（筛选只隐藏节点、不改变位置），
    // 用它换算「装下全部」的缩放作为标签分级的参照，换屏宽也不会失准
    let fullBox: { w: number; h: number } | null = null;
    let labelsHidden: boolean | null = null;
    const fitAllZoom = () => {
      if (!fullBox) return 0;
      const w = cy.width() - FIT_PADDING * 2;
      const h = cy.height() - FIT_PADDING * 2;
      if (w <= 0 || h <= 0) return 0;
      return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.min(w / fullBox.w, h / fullBox.h)));
    };
    const syncLabels = () => {
      const floor = fitAllZoom();
      if (!floor) return;
      const hide = cy.zoom() < floor * DETAIL_LABEL_RATIO;
      if (hide === labelsHidden) return;
      labelsHidden = hide;
      cy.batch(() => {
        cy.nodes('[tier="detail"]').toggleClass('hide-label', hide);
      });
    };

    /** 适配视野：把当前可见节点恰好装下并居中 */
    const frame = () => {
      cy.resize();
      cy.fit(undefined, FIT_PADDING);
      syncLabels();
    };

    /** 把目标滚到视野中心，必要时放大到 minZoom 让标签可读 */
    const reveal = (eles: cytoscape.CollectionArgument, minZoom?: number) => {
      const level = Math.min(MAX_ZOOM, Math.max(cy.zoom(), minZoom ?? 0));
      cy.stop();
      cy.animate({
        center: { eles },
        zoom: level,
        duration: reducedMotion ? 0 : 320,
      });
    };

    /** 聚焦/搜索定位的缩放下限：能装下全图时再放大若干倍，才够看清单点标签 */
    const revealFloor = () => fitAllZoom() * REVEAL_ZOOM_RATIO;

    cy.on('mouseover', 'node', (event) => {
      hovered = event.target;
      emphasis();
      syncPanel();
      if (event.target.data('href')) container.style.cursor = 'pointer';
    });
    cy.on('mouseout', 'node', () => {
      container.style.cursor = '';
      hovered = null;
      emphasis();
      syncPanel();
    });
    cy.on('tap', 'node', (event) => {
      const node = event.target;
      const href = node.data('href');
      if (tapAction === 'navigate' && href) {
        window.location.assign(href);
        return;
      }
      selected = selected === node ? null : node;
      cy.nodes().removeClass('sel');
      if (selected) {
        selected.addClass('sel');
        reveal(selected, revealFloor());
      }
      emphasis();
      syncPanel();
    });
    // 单击已改为聚焦，进页面交给双击（方向图谱到不了这里：单击即跳转）
    cy.on('dbltap', 'node', (event) => {
      const href = event.target.data('href');
      if (href) window.location.assign(href);
    });
    cy.on('tap', (event) => {
      if (event.target !== cy) return;
      selected = null;
      cy.nodes().removeClass('sel');
      emphasis();
      syncPanel();
    });
    cy.on('zoom', syncLabels);

    // 滚轮缩放自己实现：cytoscape 会采样最近几滚的 deltaY 公约数来判断触控板，
    // Windows 鼠标一格固定是 120，恰好被当成「不精确设备」并整除约掉，实测每格
    // 只缩放 1%，等于滚不动。关掉它的，按「一格一档」处理（含 Chrome 双指捏合
    // 发来的 ctrl+wheel）。
    cy.userZoomingEnabled(false);
    const onWheel = (event: WheelEvent) => {
      if (!event.deltaY) return;
      event.preventDefault();
      const unit = event.deltaMode === 1 ? 40 : event.deltaMode === 2 ? 400 : 1;
      const notches = Math.max(-4, Math.min(4, (event.deltaY * unit) / 120));
      const level = Math.min(
        MAX_ZOOM,
        Math.max(MIN_ZOOM, cy.zoom() * Math.pow(1.35, -notches)),
      );
      const rect = container.getBoundingClientRect();
      cy.zoom({
        level,
        renderedPosition: {
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        },
      });
    };
    container.addEventListener('wheel', onWheel, { passive: false });

    // 布局进行中的 resize/样式更新会打断 fcose（尤其复合节点动画布局），
    // 统一推迟到 settle：量取全图包围盒 + 适配视野
    let layoutRunning = true;
    const settle = () => {
      layoutRunning = false;
      fullBox = cy.elements().boundingBox();
      frame();
    };
    cy.on('layoutstart', () => {
      layoutRunning = true;
    });
    cy.on('layoutstop', settle);
    // 环形布局的横向拉伸取自画布宽高比，转屏/窄屏后必须按新比例重排，
    // 否则圆环仍按桌面的扁椭圆铺开，窄屏下上下留白、左右被裁
    const placeRadial = () => {
      if (radialLayout(cy, data)) {
        // 标签朝向按节点所在半圈决定，坐标落定后重算一次样式
        cy.style().update();
        return true;
      }
      return false;
    };

    const resizeObserver = new ResizeObserver(() => {
      if (cy.destroyed() || layoutRunning) return;
      // 重排后节点位置变了，全图包围盒要重新量
      if (layout === 'radial' && placeRadial()) settle();
      else frame();
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

    apiRef.current = {
      setTerm(next: string) {
        query = next.trim().toLowerCase();
        emphasis();
        syncPanel();
      },
      revealHits() {
        const hits = hitsOf();
        if (!hits.empty()) reveal(hits, revealFloor());
      },
      frame: () => frame(),
      zoomBy(factor: number) {
        cy.stop();
        zoomAroundCenter(cy.zoom() * factor);
        syncLabels();
      },
      filter(group: string | null) {
        cy.batch(() => {
          cy.nodes().forEach((node) => {
            node.toggleClass(
              'gfiltered',
              group !== null && node.data('group') !== group,
            );
          });
        });
        // 筛选改变了可见节点集，标签分级阈值按新视野重判
        labelsHidden = null;
        frame();
      },
    };

    // 监听器就位后再排布：radial 直接写死坐标（无布局事件，手动 settle），
    // force 跑 fcose（layoutstop 依赖上面挂载的 handler）
    if (layout === 'radial' && placeRadial()) {
      settle();
    } else {
      cy.layout({
        name: 'fcose',
        quality: 'proof',
        animate: !reducedMotion,
        animationDuration: 500,
        padding: FIT_PADDING,
        nodeSeparation: separation,
        idealEdgeLength: separation,
        // 固定初值：每次打开位置一致，读者才能形成稳定心智地图
        randomize: false,
        // 节点尺寸来自 label，布局需把标签算进去否则节点互相叠压
        nodeDimensionsIncludeLabels: true,
      }).run();
    }

    return () => {
      apiRef.current = null;
      container.removeEventListener('wheel', onWheel);
      resizeObserver.disconnect();
      themeObserver.disconnect();
      cy.destroy();
    };
  }, [data, nodeById, tapAction, layout]);

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
      card.style.height = '';
      const naturalLeft = Math.round(card.getBoundingClientRect().left);
      card.style.marginLeft = '0';
      card.style.width = `${document.documentElement.clientWidth - naturalLeft}px`;
      // 高度同样撑满：视口高 - 卡片顶部偏移 - 页面底部留白
      const top = card.getBoundingClientRect().top;
      card.style.height = `${Math.max(420, window.innerHeight - Math.round(top) - 16)}px`;
      // 撑满后画布尺寸变了，重新适配一次视野保持居中
      apiRef.current?.frame();
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
    apiRef.current?.filter(activeGroup);
  }, [activeGroup]);

  const zoomBy = (factor: number) => {
    apiRef.current?.zoomBy(factor);
  };

  const search = searchable ? (
    <div className="kg-search">
      <input
        type="search"
        className="kg-input"
        value={term}
        placeholder="搜索方向或分类"
        aria-label="在图谱中搜索节点"
        onChange={(event) => {
          const next = event.target.value;
          setTerm(next);
          apiRef.current?.setTerm(next);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') apiRef.current?.revealHits();
          if (event.key === 'Escape') {
            setTerm('');
            apiRef.current?.setTerm('');
          }
        }}
      />
      {term && (
        <span className="kg-hits" aria-live="polite">
          {hitCount ? `${hitCount} 处匹配` : '无匹配'}
        </span>
      )}
    </div>
  ) : null;

  const toolbar = (
    <div className="kg-toolbar" role="group" aria-label="图谱视图控制">
      {search}
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
        onClick={() => apiRef.current?.frame()}
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
        <button
          type="button"
          className="kg-chip kg-chip--all"
          aria-pressed={activeGroup === null}
          onClick={() => setActiveGroup(null)}
        >
          <span>全部</span>
        </button>
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
      {toolbar}
      {panel && (
        <div
          className={`kg-card${panel.pinned ? ' kg-card--pinned' : ''}`}
          role="status"
        >
          <div className="kg-card-title">{panel.node.label}</div>
          {panel.node.detail?.map((line) => (
            <div key={line} className="kg-card-line">
              {line}
            </div>
          ))}
          {panel.pinned && panel.node.href && (
            <a className="kg-card-open" href={withBase(panel.node.href)}>
              打开该页 · 或双击圆点
            </a>
          )}
        </div>
      )}
      {legendLayout === 'bar' ? (
        <>
          <div ref={containerRef} className="kg-canvas" />
          {legend}
        </>
      ) : (
        <>
          {legend}
          <div ref={containerRef} className="kg-canvas" />
        </>
      )}
    </div>
  );
}
