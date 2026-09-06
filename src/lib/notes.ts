import { getCollection } from 'astro:content';

// ===== 进阶轴常量 =====

export const LEVEL_KEYS = ['basic', 'intermediate', 'advanced'] as const;
export type Level = (typeof LEVEL_KEYS)[number];

export const LEVEL_LABELS: Record<Level, string> = {
  basic: '基础',
  intermediate: '中级',
  advanced: '高级',
};

/** 仪表盘方向展示顺序（未知方向按字典序追加） */
const DIRECTION_ORDER = ['linux', 'nginx', 'java', 'js', 'mysql', 'postgresql', 'redis', 'mongodb', 'elasticsearch', 'distributed', 'zookeeper', 'etcd', 'seata', 'middleware', 'kafka', 'rocketmq', 'mqtt', 'rabbitmq', 'python', 'ai', 'docker', 'git', 'tools'];

function isLevel(seg: string): seg is Level {
  return (LEVEL_KEYS as readonly string[]).includes(seg);
}

// ===== 数据模型（全部可序列化，可直接传给 React 岛屿） =====

export interface NoteMeta {
  /** 稳定键 = 内容集合 entry id（如 java/advanced/jvm/memory），localStorage 以此为键 */
  id: string;
  href: string;
  title: string;
  description: string;
  core: boolean;
}

export interface CategoryMeta {
  /** 形如 java/advanced/jvm 的分类路径键 */
  id: string;
  href: string;
  title: string;
  description: string;
  level: Level;
  notes: NoteMeta[];
}

export interface LevelMeta {
  key: Level;
  label: string;
  categories: CategoryMeta[];
}

export interface DirectionMeta {
  id: string;
  href: string;
  title: string;
  description: string;
  levels: LevelMeta[];
}

export interface SiteData {
  directions: DirectionMeta[];
}

interface DirectionBucket {
  title: string;
  description: string;
  /** level -> (categoryId -> CategoryMeta) */
  levels: Map<Level, Map<string, CategoryMeta>>;
}

function hrefOf(id: string): string {
  return `/${id}/`;
}

function ensureDirection(
  buckets: Map<string, DirectionBucket>,
  slug: string,
  title: string | null,
  description: string,
): DirectionBucket {
  let bucket = buckets.get(slug);
  if (!bucket) {
    const levels = new Map<Level, Map<string, CategoryMeta>>();
    for (const key of LEVEL_KEYS) levels.set(key, new Map());
    bucket = { title: title ?? slug, description, levels };
    buckets.set(slug, bucket);
  } else if (title !== null) {
    // 方向首页为权威来源：覆盖笔记路径兜底创建时的 slug 标题
    bucket.title = title;
    bucket.description = description;
  }
  return bucket;
}

/**
 * 构建期聚合全站笔记结构。
 * 注意：内容集合 loader 将 index 文件的 id 规范化为目录路径，故：
 * - <方向>                        方向首页（路线图）
 * - <方向>/<等级>/<分类>          分类目录页（index 规范化后无尾段）
 * - <方向>/<等级>/<分类>/<笔记>   知识点
 * 其余路径（guide、根 index、404 等）不参与聚合。
 */
export async function getSiteData(): Promise<SiteData> {
  const entries = await getCollection('docs');
  const buckets = new Map<string, DirectionBucket>();

  for (const entry of entries) {
    const segs = entry.id.split('/');
    const data = entry.data as {
      title: string;
      description: string;
      core?: boolean;
    };

    // 方向首页：<dir>（index 规范化）
    if (segs.length === 1 && entry.id !== 'index' && entry.id !== '404') {
      ensureDirection(buckets, segs[0]!, data.title, data.description);
      continue;
    }

    if (segs.length < 3 || !isLevel(segs[1]!)) continue;
    const direction = ensureDirection(buckets, segs[0]!, null, '');
    const level = segs[1]!;
    const categoryMap = direction.levels.get(level)!;
    const categoryId = `${segs[0]}/${level}/${segs[2]}`;

    if (segs.length === 3) {
      // 分类目录页：<dir>/<level>/<cat>（index 规范化）。
      // 笔记可能先于分类页处理（兜底创建），此处覆盖元数据但保留已收集的笔记。
      const existing = categoryMap.get(categoryId);
      categoryMap.set(categoryId, {
        id: categoryId,
        href: hrefOf(categoryId),
        title: data.title,
        description: data.description,
        level,
        notes: existing?.notes ?? [],
      });
    } else {
      // 知识点笔记：<dir>/<level>/<cat>/<note>
      let category = categoryMap.get(categoryId);
      if (!category) {
        // 分类页缺失时兜底（标题用路径段，保证聚合结果完整）
        category = {
          id: categoryId,
          href: hrefOf(categoryId),
          title: segs[2]!,
          description: '',
          level,
          notes: [],
        };
        categoryMap.set(categoryId, category);
      }
      category.notes.push({
        id: entry.id,
        href: hrefOf(entry.id),
        title: data.title,
        description: data.description,
        core: data.core === true,
      });
    }
  }

  const directions: DirectionMeta[] = [...buckets.entries()].map(([slug, bucket]) => ({
    id: slug,
    href: hrefOf(slug),
    title: bucket.title,
    description: bucket.description,
    levels: LEVEL_KEYS.map((key) => {
      const categoryMap = bucket.levels.get(key)!;
      const categories = [...categoryMap.values()]
        .sort((a, b) => a.id.localeCompare(b.id))
        .map((cat) => ({ ...cat, notes: cat.notes.sort((a, b) => a.id.localeCompare(b.id)) }));
      return { key, label: LEVEL_LABELS[key], categories };
    }),
  }));

  directions.sort(
    (a, b) =>
      rank(a.id) - rank(b.id) || a.id.localeCompare(b.id),
  );

  return { directions };

  function rank(id: string): number {
    const index = DIRECTION_ORDER.indexOf(id);
    return index === -1 ? DIRECTION_ORDER.length : index;
  }
}

/** 按 id 取单个分类（分类目录页用）；不存在时返回 null */
export async function getCategory(categoryId: string): Promise<CategoryMeta | null> {
  const site = await getSiteData();
  for (const direction of site.directions) {
    for (const level of direction.levels) {
      const found = level.categories.find((category) => category.id === categoryId);
      if (found) return found;
    }
  }
  return null;
}

// ===== 岛屿精简载荷 =====
// 路线图/仪表盘只需 id、href、title；岛屿 props 会整体内联进 HTML，
// 去掉 description/core 等长文本字段可显著缩小页面体积。

export interface NavNote {
  id: string;
  href: string;
  title: string;
}

export interface NavCategory {
  id: string;
  href: string;
  title: string;
  notes: NavNote[];
}

export interface NavLevel {
  key: Level;
  label: string;
  categories: NavCategory[];
}

export interface NavDirection {
  id: string;
  href: string;
  title: string;
  levels: NavLevel[];
}

export interface NavSiteData {
  directions: NavDirection[];
}

export function toNavDirection(direction: DirectionMeta): NavDirection {
  return {
    id: direction.id,
    href: direction.href,
    title: direction.title,
    levels: direction.levels.map((level) => ({
      key: level.key,
      label: level.label,
      categories: level.categories.map((category) => ({
        id: category.id,
        href: category.href,
        title: category.title,
        notes: category.notes.map(({ id, href, title }) => ({ id, href, title })),
      })),
    })),
  };
}

export function toNavSiteData(site: SiteData): NavSiteData {
  return { directions: site.directions.map(toNavDirection) };
}
