import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { withBase } from '../../lib/learn';
import type { NavDirection } from '../../lib/notes';
import {
  emptyQuizState,
  loadQuizState,
  saveQuizState,
  gotoQuizIndex,
  type QuizPersist,
  type RoundKind,
  type RoundState,
} from '../../lib/quiz-store';

// ===== 自测作答岛屿（/guide/quiz）=====
// 出题与判定规则：
// - 新一轮只从选题范围内「未刷过」的题里出（随机打乱不重复 / 按顺序），刷完即止；
// - 错题本 = 还没答对过的错题（任意一轮答对即移出）；收藏本随时 ☆ 切换；
// - 进行中的轮次、刷题进度、错题/收藏全部写穿 localStorage（quiz-store），
//   刷新或下次进入自动恢复，上一题可回看历史作答。

export type QuizType = 'single' | 'multiple' | 'judge';

/** 五档难度：1 概念识别 … 5 深挖原理/边界/生产权衡 */
export type QuizDifficulty = 1 | 2 | 3 | 4 | 5;

export interface QuizQuestion {
  id: string;
  /** 关联笔记的内容集合 entry id，答错后链回完整笔记 */
  noteId: string;
  type: QuizType;
  /** 题目难度 1–5；缺字段时运行时兜底为 3 */
  difficulty?: QuizDifficulty | number;
  q: string;
  options: string[];
  /** 正确选项下标数组（判断题固定两项：正确 / 错误） */
  answer: number[];
  /** 答错时的提示 */
  hint: string;
}

function clampDifficulty(value: unknown): QuizDifficulty {
  const n = typeof value === 'number' && Number.isFinite(value) ? Math.round(value) : 3;
  return Math.min(5, Math.max(1, n)) as QuizDifficulty;
}

function DifficultyChip({ value }: { value: unknown }) {
  const n = clampDifficulty(value);
  return (
    <span className="quiz-chip quiz-diff" title={`难度 ${n}/5`} aria-label={`难度 ${n} 星`}>
      <span className="quiz-diff-stars" aria-hidden="true">
        <span className="quiz-diff-on">{'★'.repeat(n)}</span>
        <span className="quiz-diff-off">{'☆'.repeat(5 - n)}</span>
      </span>
      <span className="quiz-diff-word">难</span>
    </span>
  );
}

export interface QuizBank {
  directionId: string;
  questions: QuizQuestion[];
}

interface Props {
  directions: NavDirection[];
  banks: QuizBank[];
}

const TYPE_LABELS: Record<QuizType, string> = {
  single: '单选',
  multiple: '多选',
  judge: '判断',
};

const ROUND_LABELS: Record<RoundKind, string> = {
  scope: '范围刷题',
  wrong: '错题本',
  starred: '收藏本',
};

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

/** 完成页的轮次摘要（只活在会话内，不持久化） */
interface RoundSummary {
  kind: RoundKind;
  queue: string[];
  wrongQueue: string[];
}

function shuffled<T>(list: T[]): T[] {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}

function sameSet(a: number[], b: number[]): boolean {
  return a.length === b.length && a.every((x) => b.includes(x));
}

function filterKeys<T>(record: Record<string, T>, valid: Set<string>): Record<string, T> {
  const out: Record<string, T> = {};
  for (const [key, value] of Object.entries(record)) if (valid.has(key)) out[key] = value;
  return out;
}

export default function Quiz({ directions, banks }: Props) {
  const [quiz, setQuiz] = useState<QuizPersist>(emptyQuizState);
  const [view, setView] = useState<'setup' | 'quiz'>('setup');
  const [summary, setSummary] = useState<RoundSummary | null>(null);
  // 当前题未确认的临时勾选（多选）
  const [picked, setPicked] = useState<number[]>([]);

  // 方向顺序与标题以 notes.ts 聚合为准（= 侧边栏顺序）；没有题库的方向不出现
  const orderedBanks = useMemo(() => {
    const rank = new Map(directions.map((d, i) => [d.id, i]));
    return [...banks].sort(
      (a, b) =>
        (rank.get(a.directionId) ?? directions.length) - (rank.get(b.directionId) ?? directions.length) ||
        a.directionId.localeCompare(b.directionId),
    );
  }, [directions, banks]);

  const allQuestions = useMemo(() => orderedBanks.flatMap((b) => b.questions), [orderedBanks]);
  const questionById = useMemo(
    () => new Map(allQuestions.map((q) => [q.id, q])),
    [allQuestions],
  );
  const directionOfQuestion = useMemo(() => {
    const map = new Map<string, string>();
    for (const bank of banks) for (const q of bank.questions) map.set(q.id, bank.directionId);
    return map;
  }, [banks]);
  const titleOf = useMemo(() => {
    const titles = new Map(directions.map((d) => [d.id, d.title]));
    return (id: string) => titles.get(id) ?? id;
  }, [directions]);

  // 挂载后恢复本地状态：过滤题库中已不存在的题，有进行中轮次则直接回到作答
  useEffect(() => {
    const validIds = new Set(allQuestions.map((q) => q.id));
    const loaded = loadQuizState();
    let round = loaded.round;
    if (round) {
      const queue = round.queue.filter((id) => validIds.has(id));
      if (queue.length === 0) {
        round = null;
      } else {
        const validQueue = new Set(queue);
        round = {
          ...round,
          queue,
          answers: filterKeys(round.answers, validQueue),
          index: Math.min(Math.max(round.index, 0), queue.length - 1),
        };
      }
    }
    setQuiz({ ...loaded, round });
    if (round) setView('quiz');
  }, [allQuestions]);

  function update(next: QuizPersist): void {
    setQuiz(next);
    saveQuizState(next);
  }

  // ===== 选题范围（scope.checked 为 null 时视为全选） =====
  const scopeIds = useMemo(() => {
    const all = new Set(orderedBanks.map((b) => b.directionId));
    if (quiz.scope.checked === null) return all;
    return new Set(quiz.scope.checked.filter((id) => all.has(id)));
  }, [orderedBanks, quiz.scope.checked]);

  const scopeQuestions = useMemo(
    () => orderedBanks.filter((b) => scopeIds.has(b.directionId)).flatMap((b) => b.questions),
    [orderedBanks, scopeIds],
  );
  const scopeRemaining = useMemo(
    () => scopeQuestions.filter((q) => quiz.done[q.id] === undefined),
    [scopeQuestions, quiz.done],
  );

  function toggleDirection(id: string): void {
    const next = new Set(scopeIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    update({ ...quiz, scope: { ...quiz.scope, checked: [...next] } });
  }

  function setAllDirections(value: boolean): void {
    const next = value ? new Set(orderedBanks.map((b) => b.directionId)) : new Set<string>();
    update({ ...quiz, scope: { ...quiz.scope, checked: [...next] } });
  }

  function toggleRandom(): void {
    update({ ...quiz, scope: { ...quiz.scope, random: !quiz.scope.random } });
  }

  function toggleImmersive(): void {
    update({ ...quiz, scope: { ...quiz.scope, immersive: !quiz.scope.immersive } });
  }

  // ===== 轮次 =====
  function startQueueRound(kind: RoundKind, pool: QuizQuestion[], random: boolean, immersive: boolean): void {
    if (pool.length === 0) return;
    const round: RoundState = {
      kind,
      directionIds: kind === 'scope' ? [...scopeIds] : [],
      random,
      immersive,
      queue: (random ? shuffled(pool) : pool).map((q) => q.id),
      index: 0,
      answers: {},
    };
    setPicked([]);
    setSummary(null);
    update({ ...quiz, round });
    setView('quiz');
  }

  function startScopeRound(resetDone: boolean): void {
    const immersive = quiz.scope.immersive;
    const done = { ...quiz.done };
    // 沉浸模式 = 全量池，所选方向的所有题完整过一遍；普通模式只出未刷题
    const pool = immersive
      ? scopeQuestions
      : scopeQuestions.filter((q) => {
          if (resetDone) delete done[q.id];
          return done[q.id] === undefined;
        });
    const round: RoundState = {
      kind: 'scope',
      directionIds: [...scopeIds],
      random: quiz.scope.random,
      immersive,
      queue: (quiz.scope.random ? shuffled(pool) : pool).map((q) => q.id),
      index: 0,
      answers: {},
    };
    setPicked([]);
    setSummary(null);
    update({ ...quiz, done, round });
    setView('quiz');
  }

  function vaultQuestions(kind: 'wrong' | 'starred'): QuizQuestion[] {
    const source = kind === 'wrong' ? quiz.wrong : quiz.starred;
    return allQuestions.filter((q) => source[q.id] !== undefined);
  }

  function submitAnswer(pickedNow: number[]): void {
    const round = quiz.round;
    if (!round) return;
    const q = questionById.get(round.queue[round.index]!);
    if (!q || round.answers[q.id]) return;
    const correct = sameSet(pickedNow, q.answer);
    const wrong = { ...quiz.wrong };
    if (correct) delete wrong[q.id];
    else {
      const prev = wrong[q.id];
      wrong[q.id] = { ts: Date.now(), count: (prev?.count ?? 0) + 1 };
    }
    setPicked([]);
    update({
      ...quiz,
      done: { ...quiz.done, [q.id]: Date.now() },
      wrong,
      round: {
        ...round,
        answers: { ...round.answers, [q.id]: { picked: pickedNow, correct } },
      },
    });
  }

  function pickOption(i: number): void {
    const round = quiz.round;
    if (!round) return;
    const q = questionById.get(round.queue[round.index]!);
    if (!q || round.answers[q.id]) return;
    if (q.type === 'multiple') {
      setPicked((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]));
    } else {
      submitAnswer([i]);
    }
  }

  function toggleStar(qid: string): void {
    const starred = { ...quiz.starred };
    if (starred[qid] !== undefined) delete starred[qid];
    else starred[qid] = Date.now();
    update({ ...quiz, starred });
  }

  function go(delta: number): void {
    const round = quiz.round;
    if (!round) return;
    const index = Math.min(Math.max(round.index + delta, 0), round.queue.length - 1);
    if (index === round.index) return;
    setPicked([]);
    update({ ...quiz, round: { ...round, index } });
  }

  // 右侧栏导航器点题号跳转（经 update 落盘并发变更事件，导航网格随动刷新）
  const quizRef = quiz;
  useEffect(() => {
    const handler = (event: Event) => {
      const index = (event as CustomEvent<{ index?: number }>).detail?.index;
      if (typeof index !== 'number' || !quizRef.round) return;
      const clamped = Math.min(Math.max(index, 0), quizRef.round.queue.length - 1);
      setPicked([]);
      setSummary(null);
      setView('quiz');
      update({ ...quizRef, round: { ...quizRef.round, index: clamped } });
    };
    window.addEventListener('ascension:quiz-goto', handler);
    return () => window.removeEventListener('ascension:quiz-goto', handler);
  }, [quizRef]);

  // 沉浸模式键盘流：数字键选择、Enter 确认/下一题、← 回看、Esc 收起（每次渲染重挂，闭包常新）
  useEffect(() => {
    if (view !== 'quiz' || summary !== null || quiz.round?.immersive !== true) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const round = quiz.round!;
      const q = questionById.get(round.queue[round.index]!);
      if (!q) return;
      const answered = round.answers[q.id] !== undefined;
      if (e.key === 'Escape') {
        e.preventDefault();
        update({ ...quiz, round: { ...round, immersive: false } });
      } else if (e.key === 'ArrowLeft') {
        if (round.index > 0) {
          e.preventDefault();
          go(-1);
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (answered) {
          round.index + 1 >= round.queue.length ? finishRound() : go(1);
        } else if (q.type === 'multiple' && picked.length > 0) {
          submitAnswer(picked);
        }
      } else if (/^[1-9]$/.test(e.key) && !answered) {
        const i = Number(e.key) - 1;
        if (i < q.options.length) pickOption(i);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // 沉浸模式锁定页面背景滚动
  useEffect(() => {
    const immersive = view === 'quiz' && summary === null && quiz.round?.immersive === true;
    document.body.style.overflow = immersive ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  });

  function finishRound(): void {
    const round = quiz.round;
    if (!round) return;
    const wrongQueue = round.queue.filter((id) => round.answers[id]?.correct === false);
    setSummary({ kind: round.kind, queue: round.queue, wrongQueue });
    update({ ...quiz, round: null });
  }

  function abandonRound(): void {
    setSummary(null);
    update({ ...quiz, round: null });
  }

  function clearVault(kind: 'wrong' | 'starred'): void {
    const label = kind === 'wrong' ? '错题本' : '收藏本';
    if (!window.confirm(`确定清空${label}吗？`)) return;
    if (kind === 'wrong') update({ ...quiz, wrong: {} });
    else update({ ...quiz, starred: {} });
  }

  function resetProgress(): void {
    if (!window.confirm('重置会清空全部刷题进度（错题本与收藏保留），所有题重新可刷。确定？')) return;
    update({ ...quiz, done: {} });
  }

  if (banks.length === 0) {
    return <div className="learn-empty">题库整理中，先到各方向学习路线页看笔记。</div>;
  }

  const round = quiz.round;
  const showDone = summary !== null;
  const showQuiz = summary === null && view === 'quiz' && round !== null;

  // ===== 完成页 =====
  if (showDone && summary) {
    const total = summary.queue.length;
    const wrongCount = summary.wrongQueue.length;
    const kindLabel = ROUND_LABELS[summary.kind];
    return (
      <div className="quiz-app not-content">
        <div className="quiz-done">
          <div className="quiz-done-title">本轮完成 · {kindLabel}</div>
          <p className="quiz-done-sum">
            共作答 {total} 题，答错 {wrongCount} 题
            {wrongCount > 0 ? '，错题已记入错题本，可立即重刷。' : '，全部答对。'}
          </p>
          <div className="quiz-actions">
            {wrongCount > 0 && (
              <button
                type="button"
                className="quiz-btn quiz-btn-primary"
                onClick={() =>
                  startQueueRound(
                    'wrong',
                    summary.wrongQueue
                      .map((id) => questionById.get(id))
                      .filter((q): q is QuizQuestion => q !== undefined),
                    false,
                    false,
                  )
                }
              >
                只重刷本轮错题（{wrongCount} 题）
              </button>
            )}
            <button
              type="button"
              className="quiz-btn"
              onClick={() =>
                startQueueRound(
                  summary.kind,
                  summary.queue
                    .map((id) => questionById.get(id))
                    .filter((q): q is QuizQuestion => q !== undefined),
                  false,
                  false,
                )
              }
            >
              再刷一遍本轮
            </button>
            <button type="button" className="quiz-btn" onClick={() => setSummary(null)}>
              回到选题
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ===== 作答页（含上一题历史回看） =====
  if (showQuiz && round) {
    const q = questionById.get(round.queue[round.index]!);
    if (!q) {
      return (
        <div className="quiz-app not-content">
          <div className="learn-empty">题目数据缺失，请退出本轮重新开始。</div>
        </div>
      );
    }
    const answered = round.answers[q.id];
    const ok = answered?.correct === true;
    const isLast = round.index + 1 >= round.queue.length;
    const starred = quiz.starred[q.id] !== undefined;

    const card = (
      <>
        <div className="quiz-top">
          <span className="quiz-progress">
            {round.index + 1} / {round.queue.length}
          </span>
          <span className="quiz-chip">{titleOf(directionOfQuestion.get(q.id) ?? '')}</span>
          <span className="quiz-chip">{TYPE_LABELS[q.type]}</span>
          <DifficultyChip value={q.difficulty} />
          <button
            type="button"
            className={`quiz-star-btn ${starred ? 'is-on' : ''}`}
            onClick={() => toggleStar(q.id)}
            title={starred ? '取消收藏' : '收藏本题'}
          >
            {starred ? '★ 已收藏' : '☆ 收藏'}
          </button>
          <button type="button" className="quiz-quiet-btn" onClick={() => setView('setup')}>
            退出
          </button>
        </div>
        <div className="quiz-question">{q.q}</div>
        <div className="quiz-opts">
          {q.options.map((opt, i) => {
            let state = '';
            let mark = q.type === 'judge' ? '' : (OPTION_LETTERS[i] ?? '');
            if (answered) {
              if (q.answer.includes(i)) {
                state = 'is-correct';
                mark = '✓';
              } else if (answered.picked.includes(i)) {
                state = 'is-wrong';
                mark = '✗';
              } else {
                state = 'is-dim';
              }
            } else if (picked.includes(i)) {
              state = 'is-selected';
            }
            return (
              <button
                type="button"
                key={i}
                className={`quiz-opt ${state}`}
                disabled={answered !== undefined}
                onClick={() => pickOption(i)}
              >
                <span className="quiz-opt-mark">{mark}</span>
                <span className="quiz-opt-text">{opt}</span>
              </button>
            );
          })}
        </div>
        {!answered && q.type === 'multiple' && (
          <div className="quiz-actions">
            <button
              type="button"
              className="quiz-btn quiz-btn-primary"
              disabled={picked.length === 0}
              onClick={() => submitAnswer(picked)}
            >
              确认作答
            </button>
          </div>
        )}
        {answered && (
          <>
            <div className={`quiz-verdict ${ok ? 'is-ok' : 'is-no'}`}>
              <span>{ok ? '✓ 回答正确' : '✗ 回答错误'}</span>
              {!ok && <span className="quiz-hint">{q.hint}</span>}
            </div>
            <div className="quiz-actions quiz-nav">
              {round.index > 0 && (
                <button type="button" className="quiz-btn" onClick={() => go(-1)}>
                  ← 上一题
                </button>
              )}
              <a className="quiz-btn" href={withBase(`/${q.noteId}/`)}>
                查看完整笔记
              </a>
              {isLast ? (
                <button type="button" className="quiz-btn quiz-btn-primary" onClick={finishRound}>
                  完成
                </button>
              ) : (
                <button type="button" className="quiz-btn quiz-btn-primary" onClick={() => go(1)}>
                  下一题 →
                </button>
              )}
            </div>
          </>
        )}
        {!answered && round.index > 0 && (
          <div className="quiz-actions quiz-nav">
            <button type="button" className="quiz-btn" onClick={() => go(-1)}>
              ← 上一题
            </button>
          </div>
        )}
      </>
    );
    if (round.immersive) {
      const progress = Math.round(((round.index + (answered ? 1 : 0)) / round.queue.length) * 100);
      // Portal 挂到 body：跳出 main-pane 的 isolation 层叠上下文，才能真正盖住页头与侧栏
      return createPortal(
        <div className="quiz-immersive">
          <div className="quiz-immersive-bar" aria-hidden="true">
            <div className="quiz-immersive-bar-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="quiz-immersive-body">{card}</div>
          <div className="quiz-immersive-foot">数字键选择 · Enter 确认 / 下一题 · ← 上一题 · Esc 收起沉浸</div>
        </div>,
        document.body,
      );
    }
    return <div className="quiz-app not-content">{card}</div>;
  }

  // ===== 选题页 =====
  const allScopeDone = scopeQuestions.length > 0 && scopeRemaining.length === 0;
  const wrongPool = vaultQuestions('wrong');
  const starredPool = vaultQuestions('starred');

  return (
    <div className="quiz-app not-content">
      {round && (
        <div className="quiz-continue">
          <span className="quiz-continue-text">
            上次作答未完成：{ROUND_LABELS[round.kind]} · 第 {round.index + 1} / {round.queue.length} 题
          </span>
          <span className="quiz-continue-ops">
            <button type="button" className="quiz-btn quiz-btn-primary" onClick={() => setView('quiz')}>
              继续作答
            </button>
            <button type="button" className="quiz-quiet-btn" onClick={abandonRound}>
              放弃本轮
            </button>
          </span>
        </div>
      )}
      <div className="quiz-setup">
        <div className="quiz-setup-head">
          <span className="quiz-setup-title">选择作答范围</span>
          <span className="quiz-setup-ops">
            <button type="button" className="quiz-quiet-btn" onClick={() => setAllDirections(true)}>
              全选
            </button>
            <button type="button" className="quiz-quiet-btn" onClick={() => setAllDirections(false)}>
              全不选
            </button>
          </span>
        </div>
        <ul className="quiz-dir-list">
          {orderedBanks.map((b) => (
            <li key={b.directionId}>
              <label className="quiz-dir-row">
                <input
                  type="checkbox"
                  checked={scopeIds.has(b.directionId)}
                  onChange={() => toggleDirection(b.directionId)}
                />
                <span className="quiz-dir-name">{titleOf(b.directionId)}</span>
                <span className="quiz-dir-count">{b.questions.length} 题</span>
              </label>
            </li>
          ))}
        </ul>
        <div className="quiz-setup-foot">
          <label className="quiz-shuffle">
            <input type="checkbox" checked={quiz.scope.random} onChange={toggleRandom} />
            随机不重复出题
          </label>
          <label className="quiz-shuffle">
            <input type="checkbox" checked={quiz.scope.immersive} onChange={toggleImmersive} />
            沉浸模式
          </label>
          <span className="quiz-setup-sum">
            已选 {scopeIds.size} 个方向 · 未刷 {scopeRemaining.length} / {scopeQuestions.length} 题
            {allScopeDone
              ? '，本范围已全部刷完，可整范围重刷'
              : quiz.scope.random
                ? '，随机打乱逐题作答'
                : '，按方向与笔记顺序逐题推进'}
          </span>
          <button
            type="button"
            className="quiz-btn quiz-btn-primary"
            disabled={scopeQuestions.length === 0}
            onClick={() => startScopeRound(allScopeDone)}
          >
            {quiz.scope.immersive
              ? `沉浸刷一遍 · ${scopeQuestions.length} 题`
              : allScopeDone
                ? '重刷本范围'
                : '开始新一轮'}
          </button>
        </div>
      </div>
      <div className="quiz-vaults">
        <div className="quiz-vault-row">
          <span className="quiz-vault-name">错题本</span>
          <span className="quiz-vault-count">
            {wrongPool.length > 0 ? `${wrongPool.length} 题（答对任意一次自动移出）` : '暂无错题'}
          </span>
          <button
            type="button"
            className="quiz-btn"
            disabled={wrongPool.length === 0}
            onClick={() => startQueueRound('wrong', wrongPool, quiz.scope.random, quiz.scope.immersive)}
          >
            去刷错题
          </button>
          <button
            type="button"
            className="quiz-quiet-btn"
            disabled={wrongPool.length === 0}
            onClick={() => clearVault('wrong')}
          >
            清空
          </button>
        </div>
        <div className="quiz-vault-row">
          <span className="quiz-vault-name">收藏本</span>
          <span className="quiz-vault-count">
            {starredPool.length > 0 ? `${starredPool.length} 题` : '暂无收藏，作答时点 ☆ 收藏'}
          </span>
          <button
            type="button"
            className="quiz-btn"
            disabled={starredPool.length === 0}
            onClick={() => startQueueRound('starred', starredPool, quiz.scope.random, quiz.scope.immersive)}
          >
            去刷收藏
          </button>
          <button
            type="button"
            className="quiz-quiet-btn"
            disabled={starredPool.length === 0}
            onClick={() => clearVault('starred')}
          >
            清空
          </button>
        </div>
      </div>
      <div className="quiz-foot-links">
        <button type="button" className="quiz-quiet-btn" onClick={resetProgress}>
          重置刷题进度
        </button>
        <a className="quiz-more-link" href={withBase('/guide/interview-cheatsheet/')}>
          想先过一遍答案？去看速答手册 →
        </a>
      </div>
    </div>
  );
}
