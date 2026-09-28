// ===== 面试考点卡本地存储（纯浏览器，无 React 依赖，模式仿 quiz-store.ts） =====
// 与自测题库分家：这里管的是「说过一遍没有」，不是「答对没有」，两套状态互不影响。
// seen 已过 / review 待复习 / starred 收藏；scope 记主题分组勾选与难度上限。

export interface InterviewScope {
  /** 勾选的主题分组；null = 从未设置（首访视为全选）；空数组 = 主动全不选 */
  groups: string[] | null;
  /** 只出不高于该难度的卡（1~5） */
  maxDifficulty: number;
}

export interface InterviewPersist {
  /** 展开过参考答话的卡：id -> 最后时间 */
  seen: Record<string, number>;
  /** 待复习本：id -> 累计信息（标记「记住了」即移除） */
  review: Record<string, number>;
  /** 收藏本：id -> 收藏时间 */
  starred: Record<string, number>;
  scope: InterviewScope;
}

const KEY = 'ascension-interview-state-v1';
const CHANGE_EVENT = 'ascension:interview-change';

function isSSR(): boolean {
  return typeof window === 'undefined';
}

export function emptyInterviewState(): InterviewPersist {
  return {
    seen: {},
    review: {},
    starred: {},
    scope: { groups: null, maxDifficulty: 5 },
  };
}

export function loadInterviewState(): InterviewPersist {
  if (isSSR()) return emptyInterviewState();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyInterviewState();
    const parsed = JSON.parse(raw) as Partial<InterviewPersist>;
    const max = typeof parsed.scope?.maxDifficulty === 'number' ? parsed.scope.maxDifficulty : 5;
    return {
      seen: parsed.seen ?? {},
      review: parsed.review ?? {},
      starred: parsed.starred ?? {},
      scope: {
        groups: Array.isArray(parsed.scope?.groups) ? parsed.scope.groups : null,
        maxDifficulty: Math.min(5, Math.max(1, Math.round(max))),
      },
    };
  } catch {
    return emptyInterviewState();
  }
}

export function saveInterviewState(state: InterviewPersist): void {
  if (isSSR()) return;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* 隐私模式等场景静默降级为会话内状态 */
  }
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}

/** 订阅状态变化（同页自定义事件 + 跨标签页 storage 事件，返回取消函数） */
export function subscribeInterviewChange(callback: () => void): () => void {
  if (isSSR()) return () => {};
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}
