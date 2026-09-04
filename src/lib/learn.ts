// ===== 学习状态客户端存储（纯浏览器，无 React 依赖） =====
// 状态：0 未学 / 1 学习中 / 2 已掌握，循环切换，localStorage 持久化。
// 同页多处圆点通过自定义事件同步。

export type LearnStatus = 0 | 1 | 2;

export const STATUS_LABELS = ['未学', '学习中', '已掌握'] as const;

const STATUS_KEY = 'ascension-learn-status-v1';
const LAST_KEY = 'ascension-learn-last-v1';
const CHANGE_EVENT = 'ascension:learn-status-change';

export interface LastVisit {
  id: string;
  ts: number;
}

function isSSR(): boolean {
  return typeof window === 'undefined';
}

export function getAllStatus(): Record<string, LearnStatus> {
  if (isSSR()) return {};
  try {
    return JSON.parse(localStorage.getItem(STATUS_KEY) ?? '{}') as Record<string, LearnStatus>;
  } catch {
    return {};
  }
}

export function getStatus(id: string): LearnStatus {
  const value = getAllStatus()[id];
  return value === 1 || value === 2 ? value : 0;
}

export function setStatus(id: string, status: LearnStatus): void {
  if (isSSR()) return;
  const all = getAllStatus();
  if (status === 0) delete all[id];
  else all[id] = status;
  try {
    localStorage.setItem(STATUS_KEY, JSON.stringify(all));
  } catch {
    /* 隐私模式等场景静默降级为会话内状态 */
  }
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}

/** 循环：未学 → 学习中 → 已掌握 → 未学 */
export function cycleStatus(id: string): LearnStatus {
  const next = ((getStatus(id) + 1) % 3) as LearnStatus;
  setStatus(id, next);
  return next;
}

/** 订阅状态变化（返回取消函数） */
export function subscribeStatus(callback: () => void): () => void {
  if (isSSR()) return () => {};
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}

export function markLastVisit(id: string): void {
  if (isSSR()) return;
  try {
    localStorage.setItem(LAST_KEY, JSON.stringify({ id, ts: Date.now() } satisfies LastVisit));
  } catch {
    /* 同上，静默降级 */
  }
}

export function getLastVisit(): LastVisit | null {
  if (isSSR()) return null;
  try {
    const raw = localStorage.getItem(LAST_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LastVisit;
    return typeof parsed?.id === 'string' && typeof parsed?.ts === 'number' ? parsed : null;
  } catch {
    return null;
  }
}

/** 站点部署在子路径（/ascension/），站内链接需拼接 base */
export function withBase(href: string): string {
  if (!href.startsWith('/')) return href;
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}${href}`;
}
