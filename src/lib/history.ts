// ===== 阅读历史客户端存储（纯浏览器，无 React 依赖，模式仿 learn.ts）=====
// 每篇笔记记录四类信息：最近阅读时间、累计次数、累计可见时长、上次滚动位置，
// 供笔记页「回到上次阅读位置」与仪表盘「最近阅读 / 继续上次学习」使用。
// 全部可序列化，写穿 localStorage；容量按最近阅读时间淘汰，控制体积。

export interface ReadEntry {
  /** 最近一次阅读时间（ms 时间戳） */
  ts: number;
  /** 累计阅读次数（页面挂载一次记一次） */
  count: number;
  /** 累计阅读秒数（仅统计页面可见时段） */
  seconds: number;
  /** 上次离开时的滚动进度（0–1，相对可滚动高度）；0 = 顶部/未记录 */
  scroll: number;
}

export type ReadHistory = Record<string, ReadEntry>;

export const HISTORY_KEY = 'ascension-read-history-v1';

/** 滚动进度低于该值不触发续读定位（视为从头阅读） */
export const RESTORE_MIN_RATIO = 0.05;

/** 容量上限：超出按最近阅读时间淘汰最旧（覆盖全站知识点并留余量） */
const MAX_ENTRIES = 300;

function isSSR(): boolean {
  return typeof window === 'undefined';
}

export function getReadHistory(): ReadHistory {
  if (isSSR()) return {};
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '{}') as ReadHistory;
  } catch {
    return {};
  }
}

export function getReadEntry(id: string): ReadEntry | null {
  const entry = getReadHistory()[id];
  return entry && typeof entry.ts === 'number' ? entry : null;
}

function putEntry(id: string, patch: (prev: ReadEntry) => ReadEntry): void {
  if (isSSR()) return;
  const all = getReadHistory();
  const next = patch(all[id] ?? { ts: 0, count: 0, seconds: 0, scroll: 0 });
  all[id] = next;
  const ids = Object.keys(all);
  if (ids.length > MAX_ENTRIES) {
    ids.sort((a, b) => (all[a]!.ts ?? 0) - (all[b]!.ts ?? 0));
    for (const stale of ids.slice(0, ids.length - MAX_ENTRIES)) delete all[stale];
  }
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(all));
  } catch {
    /* 隐私模式等场景静默降级为会话内状态 */
  }
}

/** 记录一次阅读（笔记页挂载时调用）：次数 +1、最近时间刷新；滚动位置保留不动 */
export function recordVisit(id: string): void {
  putEntry(id, (prev) => ({ ...prev, ts: Date.now(), count: prev.count + 1 }));
}

/** 保存滚动进度（0–1），由笔记页滚动节流回调与离开页面时调用 */
export function saveScroll(id: string, ratio: number): void {
  const clamped = Math.min(1, Math.max(0, ratio));
  if (!Number.isFinite(clamped)) return;
  putEntry(id, (prev) => ({ ...prev, scroll: clamped }));
}

/** 累计阅读秒数（增量），由笔记页时长结算回调调用 */
export function addDwell(id: string, seconds: number): void {
  if (!(seconds > 0)) return;
  putEntry(id, (prev) => ({ ...prev, seconds: prev.seconds + seconds }));
}

/** 清空阅读历史 */
export function clearReadHistory(): void {
  if (isSSR()) return;
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch {
    /* 静默降级 */
  }
}

// ===== 展示辅助（ProgressMark 与 Dashboard 共用的轻量格式化） =====

/** 秒数 → 「X 分钟 / X 小时 Y 分钟」，不足 1 分钟不计 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return '不足 1 分钟';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} 分钟`;
  return `${Math.floor(minutes / 60)} 小时 ${minutes % 60} 分钟`;
}

/** 时间戳 → 「今天 HH:mm / 昨天 / N 天前 / M月D日」 */
export function formatWhen(ts: number): string {
  const date = new Date(ts);
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((startOfDay(new Date()) - startOfDay(date)) / 86_400_000);
  const pad = (n: number) => String(n).padStart(2, '0');
  if (days <= 0) return `今天 ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  if (days === 1) return '昨天';
  if (days < 7) return `${days} 天前`;
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}
