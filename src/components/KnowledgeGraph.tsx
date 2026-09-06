import { useEffect, useRef } from 'react';
import cytoscape from 'cytoscape';
import fcose from 'cytoscape-fcose';

cytoscape.use(fcose);

export interface GraphNode {
  id: string;
  label: string;
  href?: string;
  group?: string;
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

/** 沉稳低饱和配色，浅色/深色主题下均可读 */
const PALETTE = [
  '#0e7490',
  '#b45309',
  '#4d7c0f',
  '#6d28d9',
  '#9d174d',
  '#0369a1',
  '#166534',
  '#b45309',
];

const groupColorCache = new Map<string, string>();

function colorForGroup(group: string | undefined): string {
  if (!group) return '#475569';
  if (!groupColorCache.has(group)) {
    groupColorCache.set(group, PALETTE[groupColorCache.size % PALETTE.length]!);
  }
  return groupColorCache.get(group)!;
}

/** 站点部署在子路径（/ascension/），为站内链接自动拼接 base */
function withBase(href: string): string {
  if (!href.startsWith('/')) return href;
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}${href}`;
}

export default function KnowledgeGraph({
  data,
  height = 560,
}: {
  data: GraphData;
  height?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const elements = [
      ...data.nodes.map((node) => ({
        data: {
          id: node.id,
          label: node.label,
          href: node.href ? withBase(node.href) : undefined,
          backgroundColor: colorForGroup(node.group),
          borderColor: node.href ? '#facc15' : 'rgba(148, 163, 184, 0.35)',
        },
      })),
      ...data.edges.map((edge) => ({
        data: {
          source: edge.source,
          target: edge.target,
          label: edge.label,
        },
      })),
    ];

    const cy = cytoscape({
      container,
      elements,
      wheelSensitivity: 0.25,
      style: [
        {
          selector: 'node',
          style: {
            'background-color': 'data(backgroundColor)',
            label: 'data(label)',
            color: '#ffffff',
            'font-size': 13,
            'font-family':
              'system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif',
            'text-wrap': 'wrap',
            'text-valign': 'center',
            'text-halign': 'center',
            shape: 'round-rectangle',
            width: 'label',
            height: 'label',
            padding: '12px',
            'border-width': (ele: cytoscape.SingularElementArgument) =>
              ele.data('href') ? 2.5 : 1.5,
            'border-color': 'data(borderColor)',
          },
        },
        {
          selector: 'edge',
          style: {
            width: 1.5,
            'line-color': '#94a3b8',
            'target-arrow-shape': 'triangle',
            'arrow-scale': 0.8,
            'curve-style': 'bezier',
            label: 'data(label)',
            'font-size': 10,
            color: '#64748b',
            'text-background-color': '#f8fafc',
            'text-background-opacity': 1,
            'text-background-padding': 3,
            'text-background-shape': 'roundrectangle',
          },
        },
      ],
      layout: {
        name: 'fcose',
        animate: true,
        animationDuration: 600,
        padding: 40,
        nodeSeparation: 160,
        idealEdgeLength: 180,
        randomize: true,
      },
    });

    cy.on('tap', 'node', (event) => {
      const href = event.target.data('href');
      if (href) window.location.assign(href);
    });

    // 中文等字体晚于首次标签测量就绪时，'label' 尺寸被记为 0 且不再重测，
    // 节点会永远不被渲染；字体就绪后强制重算一次样式触发重绘。
    document.fonts?.ready.then(() => {
      if (!cy.destroyed()) cy.style().update();
    });

    return () => {
      cy.destroy();
    };
  }, [data]);

  return (
    <div
      ref={containerRef}
      className="knowledge-graph"
      style={{ width: '100%', height }}
    />
  );
}
