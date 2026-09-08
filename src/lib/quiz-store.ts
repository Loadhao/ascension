// ===== 自测作答本地存储（纯浏览器，无 React 依赖，模式仿 learn.ts） =====
// 持久化四类状态：刷题进度（避免重复出题）、错题本、收藏本、进行中轮次（防进度丢失）。
// 全部可序列化，由组件写穿（改内存副本即整体落盘），读取方负责过滤题库中已不存在的题。

/** 轮次来源：范围刷题 / 错题本 / 收藏本 */
export type RoundKind = 'scope' | 'wrong' | 'starred';

export interface RoundAnswer {
  /** 当时的选择（选项下标） */
  picked: number[];
  correct: boolean;
}

export interface RoundState {
  kind: RoundKind;
  /** scope 轮的方向快照；wrong/starred 轮为空数组 */
  directionIds: string[];
  random: boolean;
  /** 沉浸模式：全屏覆盖 + 键盘作答 */
  immersive: boolean;
  /** 题目 id 的固定顺序（开局生成，恢复时沿用） */
  queue: string[];
  index: number;
  answers: Record<string, RoundAnswer>;
}

export interface WrongEntry {
  /** 最近答错时间 */
  ts: number;
  /** 累计答错次数 */
  count: number;
}

export interface QuizScope {
  /**
   * 勾选的方向 id。null = 从未设置（首访默认全选）；
   * 空数组表示用户主动全不选。
   */
  checked: string[] | null;
  /** true = 随机不重复出题；false = 按方向与笔记顺序 */
  random: boolean;
  /** true = 沉浸模式：全屏覆盖 + 键盘作答 */
  immersive: boolean;
}

export interface QuizPersist {
  /** 刷过的题：id -> 最后作答时间（新一轮出题时排除） */
  done: Record<string, number>;
  /** 错题本：id -> 累计信息（答对任意一次即移除） */
  wrong: Record<string, WrongEntry>;
  /** 收藏本：id -> 收藏时间 */
  starred: Record<string, number>;
  scope: QuizScope;
  /** 进行中的轮次；null = 无（完成或放弃时清空） */
  round: RoundState | null;
}

const KEY = 'ascension-quiz-state-v1';
const CHANGE_EVENT = 'ascension:quiz-change';

function isSSR(): boolean {
  return typeof window === 'undefined';
}

export function emptyQuizState(): QuizPersist {
  return {
    done: {},
    wrong: {},
    starred: {},
    scope: { checked: null, random: true, immersive: false },
    round: null,
  };
}

export function loadQuizState(): QuizPersist {
  if (isSSR()) return emptyQuizState();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyQuizState();
    const parsed = JSON.parse(raw) as Partial<QuizPersist>;
    return {
      done: parsed.done ?? {},
      wrong: parsed.wrong ?? {},
      starred: parsed.starred ?? {},
      scope: {
        checked: Array.isArray(parsed.scope?.checked) ? parsed.scope.checked : null,
        random: parsed.scope?.random !== false,
        immersive: parsed.scope?.immersive === true,
      },
      round: parsed.round
        ? { ...parsed.round, immersive: parsed.round.immersive === true }
        : null,
    };
  } catch {
    return emptyQuizState();
  }
}

export function saveQuizState(state: QuizPersist): void {
  if (isSSR()) return;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* 隐私模式等场景静默降级为会话内状态 */
  }
  // 通知同页订阅方（如右侧栏题目导航器）
  window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
}

/** 订阅作答状态变化（同页自定义事件 + 跨标签页 storage 事件，返回取消函数） */
export function subscribeQuizChange(callback: () => void): () => void {
  if (isSSR()) return () => {};
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}

/** 请求作答组件跳到当前轮次的第 index 题（0 起） */
export function gotoQuizIndex(index: number): void {
  if (isSSR()) return;
  window.dispatchEvent(new CustomEvent('ascension:quiz-goto', { detail: { index } }));
}
