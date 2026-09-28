import { useEffect, useMemo, useState } from 'react';
import { withBase } from '../../lib/learn';
import type { NavDirection } from '../../lib/notes';
import {
  emptyInterviewState,
  loadInterviewState,
  saveInterviewState,
  type InterviewPersist,
} from '../../lib/interview-store';

// ===== 面试考点卡岛屿（/guide/interview）=====
// 一张卡三段逐级展开：题干 →（面试官）为什么这么问 → 参考答话与追问预判。
// 顺序即用法：先自己说一遍，再对照；「已过」以展开过参考答话为准，不做对错判定
// （对错归 /guide/quiz，这里管的是「说得出话没有」）。

export interface InterviewCard {
  id: string;
  /** 内容集合 entry id，用于「查看完整笔记」链接 */
  noteId: string;
  /** 主题分组，取值与速答手册的 ## 标题一致 */
  group: string;
  /** 难度 1–5，沿用题库五档星口径；缺字段时兜底为 3 */
  difficulty?: number;
  /** 面试官原话 */
  q: string;
  /** 为什么这么问：在筛什么、短板在哪、区分度落点 */
  intent: string;
  /** 参考答话（可背） */
  answer: string;
  /** 追问预判 + 应对口径 */
  followup: string;
}

export interface InterviewBank {
  directionId: string;
  cards: InterviewCard[];
}

interface Props {
  directions: NavDirection[];
  banks: InterviewBank[];
}

const DIFFICULTY_WORDS = ['', '识别', '理解', '原理', '边界', '权衡'];

function clampDifficulty(value: unknown): number {
  const n = typeof value === 'number' && Number.isFinite(value) ? Math.round(value) : 3;
  return Math.min(5, Math.max(1, n));
}

function Stars({ n }: { n: number }) {
  return (
    <span className="quiz-diff-stars" aria-hidden="true">
      <span className="quiz-diff-on">{'★'.repeat(n)}</span>
      <span className="quiz-diff-off">{'☆'.repeat(5 - n)}</span>
    </span>
  );
}

export default function Interview({ directions, banks }: Props) {
  const [quiz, setQuiz] = useState<InterviewPersist>(() => emptyInterviewState());
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState<'setup' | 'card'>('setup');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [openIntent, setOpenIntent] = useState(false);
  const [openAnswer, setOpenAnswer] = useState(false);

  useEffect(() => {
    setQuiz(loadInterviewState());
    setLoaded(true);
  }, []);

  const update = (next: InterviewPersist) => {
    setQuiz(next);
    saveInterviewState(next);
  };

  const dirTitle = useMemo(() => {
    const m = new Map<string, string>();
    for (const d of directions) m.set(d.id, d.title);
    return m;
  }, [directions]);

  /** 全部卡按「主题分组 → 方向 → 站内顺序」排定，分组顺序取首次出现顺序 */
  const all = useMemo(() => {
    const list: Array<InterviewCard & { directionId: string }> = [];
    for (const bank of banks)
      for (const c of bank.cards) list.push({ ...c, directionId: bank.directionId });
    return list;
  }, [banks]);

  const groups = useMemo(() => {
    const order: string[] = [];
    const map = new Map<string, Array<InterviewCard & { directionId: string }>>();
    for (const c of all) {
      if (!map.has(c.group)) {
        map.set(c.group, []);
        order.push(c.group);
      }
      map.get(c.group)!.push(c);
    }
    return order.map((name) => ({ name, cards: map.get(name)! }));
  }, [all]);

  const scopeGroups = quiz.scope.groups;
  const checkedGroups = useMemo(
    () => new Set(scopeGroups === null ? groups.map((g) => g.name) : scopeGroups),
    [scopeGroups, groups]
  );

  const queue = useMemo(
    () =>
      groups
        .filter((g) => checkedGroups.has(g.name))
        .flatMap((g) => g.cards)
        .filter((c) => clampDifficulty(c.difficulty) <= quiz.scope.maxDifficulty),
    [groups, checkedGroups, quiz.scope.maxDifficulty]
  );

  const seenCount = Object.keys(quiz.seen).length;
  const total = all.length;

  const active = activeId ? all.find((c) => c.id === activeId) ?? null : null;
  const pos = active ? queue.findIndex((c) => c.id === active.id) : -1;

  const openCard = (id: string) => {
    setOpenIntent(false);
    setOpenAnswer(false);
    setActiveId(id);
    setView('card');
  };

  const step = (delta: number) => {
    if (pos < 0 || queue.length === 0) return;
    const next = queue[(pos + delta + queue.length) % queue.length];
    if (next) openCard(next.id);
  };

  const toggleGroup = (name: string) => {
    const base = scopeGroups === null ? groups.map((g) => g.name) : scopeGroups;
    const nextSet = new Set(base);
    if (nextSet.has(name)) nextSet.delete(name);
    else nextSet.add(name);
    update({ ...quiz, scope: { ...quiz.scope, groups: groups.map((g) => g.name).filter((g) => nextSet.has(g)) } });
  };

  const toggleIn = (bucket: 'review' | 'starred', id: string) => {
    const next = { ...quiz[bucket] };
    if (next[id] === undefined) next[id] = Date.now();
    else delete next[id];
    update({ ...quiz, [bucket]: next });
  };

  const markSeen = () => {
    if (!active) return;
    setOpenAnswer(true);
    if (quiz.seen[active.id] === undefined) update({ ...quiz, seen: { ...quiz.seen, [active.id]: Date.now() } });
  };

  if (!loaded) return <div className="ic-app" aria-busy="true" />;

  if (view === 'card' && active) {
    const d = clampDifficulty(active.difficulty);
    const inReview = quiz.review[active.id] !== undefined;
    const starred = quiz.starred[active.id] !== undefined;
    const seen = quiz.seen[active.id] !== undefined;
    return (
      <div className="ic-app not-content">
        <div className="quiz-top">
          <span className="quiz-progress">
            {pos >= 0 ? `${pos + 1} / ${queue.length}` : `— / ${queue.length}`} · 已过 {seenCount} / {total}
          </span>
          <span className="quiz-chip">{active.group}</span>
          <span className="quiz-chip">{dirTitle.get(active.directionId) ?? active.directionId}</span>
          <span className="quiz-chip quiz-diff" title={`难度 ${d}/5`} aria-label={`难度 ${d} 星`}>
            <Stars n={d} />
            <span className="quiz-diff-word">{DIFFICULTY_WORDS[d]}</span>
          </span>
          <button type="button" className="quiz-quiet-btn" onClick={() => setView('setup')}>
            回主题列表
          </button>
        </div>

        <p className="quiz-question">{active.q}</p>

        <div className="ic-actions">
          <button type="button" className="quiz-btn" onClick={() => setOpenIntent((v) => !v)}>
            {openIntent ? '收起这一问在筛什么' : '先看：这一问在筛什么'}
          </button>
          <button type="button" className="quiz-btn quiz-btn-primary" onClick={markSeen}>
            {openAnswer ? '收起参考答话' : '我答完了，看参考答话'}
          </button>
        </div>

        {openIntent && (
          <section className="ic-seg">
            <h2 className="ic-seg-title">面试官为什么这么问</h2>
            <p className="ic-seg-text">{active.intent}</p>
          </section>
        )}

        {openAnswer && (
          <>
            <section className="ic-seg">
              <h2 className="ic-seg-title">参考答话（可背）</h2>
              <p className="ic-seg-text">{active.answer}</p>
            </section>
            <section className="ic-seg">
              <h2 className="ic-seg-title">会被追问到哪、怎么接</h2>
              <p className="ic-seg-text">{active.followup}</p>
            </section>
            <p className="ic-seg-note">
              {seen ? '已计入「已过」，' : ''}答话里的事实都取自底部链接的完整笔记；讲不顺就回去读那一节再来说一遍。
            </p>
          </>
        )}

        <div className="quiz-actions quiz-nav">
          <button type="button" className="quiz-btn" onClick={() => step(-1)} disabled={queue.length < 2}>
            ← 上一张
          </button>
          <button type="button" className="quiz-btn" onClick={() => step(1)} disabled={queue.length < 2}>
            下一张 →
          </button>
          <button
            type="button"
            className={`quiz-flag-btn${inReview ? ' is-on' : ''}`}
            onClick={() => toggleIn('review', active.id)}
            aria-pressed={inReview}
          >
            {inReview ? '★ 待复习' : '☆ 标记待复习'}
          </button>
          <button
            type="button"
            className={`quiz-flag-btn${starred ? ' is-on' : ''}`}
            onClick={() => toggleIn('starred', active.id)}
            aria-pressed={starred}
          >
            {starred ? '⚑ 已收藏' : '⚐ 收藏'}
          </button>
          <a className="quiz-btn" href={withBase(`/${active.noteId}/`)}>
            查看完整笔记
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="ic-app not-content">
      <div className="quiz-setup">
        <div className="quiz-setup-head">
          <h2 className="quiz-setup-title">面试考点卡</h2>
          <div className="quiz-setup-ops">
            <label className="quiz-shuffle">
              难度上限
              <select
                value={quiz.scope.maxDifficulty}
                onChange={(e) => update({ ...quiz, scope: { ...quiz.scope, maxDifficulty: Number(e.target.value) } })}
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n} 星（{DIFFICULTY_WORDS[n]}）以内
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <ul className="quiz-dir-list">
          {groups.map((g) => {
            const on = checkedGroups.has(g.name);
            const visible = on ? g.cards.filter((c) => clampDifficulty(c.difficulty) <= quiz.scope.maxDifficulty) : [];
            const done = g.cards.filter((c) => quiz.seen[c.id] !== undefined).length;
            const label = !on
              ? '已排除'
              : visible.length === g.cards.length
                ? `${done} / ${g.cards.length}`
                : `本难度 ${visible.length} / ${g.cards.length} 张`;
            return (
              <li key={g.name}>
                <label className="quiz-dir-row">
                  <input type="checkbox" checked={on} onChange={() => toggleGroup(g.name)} />
                  <span className="quiz-dir-name">{g.name}</span>
                  <span className="quiz-dir-count">{label}</span>
                </label>
                {visible.length > 0 && (
                  <ul className="ic-card-list">
                    {visible.map((c) => (
                      <li key={c.id}>
                        <button type="button" className="ic-card-link" onClick={() => openCard(c.id)}>
                          <span className="ic-card-q">{c.q}</span>
                          <span className="ic-card-meta">
                            {quiz.starred[c.id] !== undefined ? '⚑ ' : ''}
                            {quiz.seen[c.id] !== undefined ? '已过' : '未过'} · {clampDifficulty(c.difficulty)}★
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>

        <div className="quiz-setup-foot">
          <p className="quiz-setup-sum">
            已选 {checkedGroups.size} 个主题 · 本次可刷 {queue.length} / {total} 张，已过 {seenCount} 张
          </p>
          <button
            type="button"
            className="quiz-btn quiz-btn-primary"
            disabled={queue.length === 0}
            onClick={() => openCard(queue[0]!.id)}
          >
            开始过卡
          </button>
        </div>
      </div>
    </div>
  );
}
