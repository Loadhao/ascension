import { useState } from 'react';
import { withBase } from '../../lib/learn';

// ===== 笔记页「测一下」岛屿（本篇卷）=====
// 与 /guide/quiz 的全局题库分工不同：这里只出「刚读完的这一篇」的题，
// 答后给「答案 + 理由 + 正文依据小节」，末屏只列没答住的小节让人跳回去读。
// 成绩不重要，所以不写 localStorage、不算分、也不接 quiz-store。

export interface PaperQuestion {
  id: string;
  /** recall 小节直考 / diverge 正文内发散 / relate 相关性 / interview 面试口径 */
  kind: 'recall' | 'diverge' | 'relate' | 'interview';
  type: 'single' | 'multiple' | 'judge';
  /** 本篇小节标题原文，用于跳回正文锚点 */
  section: string;
  q: string;
  options: string[];
  answer: number[];
  /** 正文逐字引文（构建期由 paper-verify 校验确实存在） */
  quote: string;
  why: string;
  /** relate 题：相关的那一篇（图谱邻居） */
  neighborId?: string;
  neighborTitle?: string;
}

export interface NotePaper {
  noteId: string;
  title: string;
  questions: PaperQuestion[];
}

interface Props {
  paper: NotePaper;
  /** 小节标题 → 正文锚点 slug，由 Astro 侧从 starlightRoute.headings 现取 */
  slugs: Record<string, string>;
}

const KIND_LABEL: Record<PaperQuestion['kind'], string> = {
  recall: '本篇直考',
  diverge: '发散追问',
  relate: '相关性',
  interview: '面试口径',
};

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

export default function NotePaper({ paper, slugs }: Props) {
  const [view, setView] = useState<'idle' | 'run' | 'end'>('idle');
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number[]>([]);
  const [verdict, setVerdict] = useState<'ok' | 'no' | null>(null);
  const [missed, setMissed] = useState<string[]>([]);

  const qs = paper.questions;
  const q = qs[Math.min(index, qs.length - 1)]!;
  const isLast = index === qs.length - 1;

  const sectionHref = (name: string) => {
    // 与包装层同口径：先按原样找，再按「去强调/反引号与空白」找——
    // Starlight 的 headings[].text 会剥掉行内 code 标记，正文标题里带 `x` 时两者不同形
    const alt = name.replace(/[*`]/g, '').replace(/[\s　]/g, '');
    const slug = slugs[name] ?? slugs[alt];
    return slug ? withBase(`/${paper.noteId}/`) + `#${slug}` : null;
  };

  const grade = (chosen: number[]) => {
    const right =
      chosen.length === q.answer.length && q.answer.every((i) => chosen.includes(i));
    setVerdict(right ? 'ok' : 'no');
    if (!right && !missed.includes(q.section)) setMissed([...missed, q.section]);
    return right;
  };

  const submit = () => {
    if (verdict) return;
    grade(picked);
  };

  const next = () => {
    if (isLast) {
      setView('end');
      return;
    }
    setIndex(index + 1);
    setPicked([]);
    setVerdict(null);
  };

  const restart = () => {
    setView('run');
    setIndex(0);
    setPicked([]);
    setVerdict(null);
    setMissed([]);
  };

  /** 收起即复位：否则再点开会停在已揭示答案的最后一题上 */
  const collapse = () => {
    setView('idle');
    setIndex(0);
    setPicked([]);
    setVerdict(null);
    setMissed([]);
  };

  if (view === 'idle') {
    return (
      <section className="np-bar">
        <div className="np-bar-text">
          <strong>测一下</strong>
          <span>
            这一篇的 {qs.length} 道题 —— {KIND_LABEL.recall}、{KIND_LABEL.diverge}、
            {KIND_LABEL.relate}、{KIND_LABEL.interview} 混出，答完告诉你哪几节要回读。
          </span>
        </div>
        <button type="button" className="quiz-btn quiz-btn-primary" onClick={() => setView('run')}>
          开始
        </button>
      </section>
    );
  }

  if (view === 'end') {
    const rows = [...new Set(missed)];
    return (
      <section className="np-end">
        <h2 className="np-end-title">
          {rows.length === 0 ? '这一篇都答住了' : '这几节需要回读'}
        </h2>
        {rows.length === 0 ? (
          <p className="np-muted">
            {qs.length} 道题的依据都在正文里，可以直接读下一篇；想再过一遍就点下面的重做。
          </p>
        ) : (
          <ul className="np-links">
            {rows.map((s) => {
              const href = sectionHref(s);
              return (
                <li key={s}>
                  {href ? <a href={href}>{s}</a> : <span>{s}</span>}
                  <span className="np-muted">这一节有题没答住</span>
                </li>
              );
            })}
          </ul>
        )}
        <div className="quiz-actions">
          <button type="button" className="quiz-btn" onClick={restart}>
            再来一轮
          </button>
          <button type="button" className="quiz-quiet-btn" onClick={collapse}>
            收起
          </button>
        </div>
      </section>
    );
  }

  const answered = verdict !== null;

  return (
    <section className="np-run">
      <div className="quiz-top">
        <span className="quiz-progress">
          {index + 1} / {qs.length}
        </span>
        <span className="quiz-chip">{KIND_LABEL[q.kind]}</span>
        <span className="quiz-chip">{q.type === 'multiple' ? '多选' : q.type === 'judge' ? '判断' : '单选'}</span>
        <span className="np-section-chip">{q.section}</span>
      </div>

      <h2 className="quiz-question">{q.q}</h2>

      <div className="quiz-opts" role="group" aria-label="选项">
        {q.options.map((text, i) => {
          const correct = q.answer.includes(i);
          const chosen = picked.includes(i);
          const cls = !answered
            ? chosen
              ? 'quiz-opt is-selected'
              : 'quiz-opt'
            : correct
              ? 'quiz-opt is-correct'
              : chosen
                ? 'quiz-opt is-wrong'
                : 'quiz-opt is-dim';
          const mark = q.type === 'judge' ? '' : (OPTION_LETTERS[i] ?? '');
          return (
            <button
              key={i}
              type="button"
              className={cls}
              disabled={answered}
              onClick={() => {
                if (answered) return;
                if (q.type === 'multiple') {
                  setPicked(chosen ? picked.filter((x) => x !== i) : [...picked, i]);
                  return;
                }
                setPicked([i]);
                grade([i]);
              }}
            >
              {mark && <span className="quiz-opt-mark">{mark}</span>}
              <span>{text}</span>
            </button>
          );
        })}
      </div>

      {!answered && q.type === 'multiple' && (
        <button
          type="button"
          className="quiz-btn quiz-btn-primary"
          disabled={picked.length === 0}
          onClick={submit}
        >
          确认作答
        </button>
      )}

      {answered && (
        <div className={`np-verify ${verdict === 'ok' ? 'is-ok' : 'is-no'}`} aria-live="polite">
          <p className="quiz-verdict-lead">
            {verdict === 'ok' ? '答对了。' : '没答住。'}
            <span className="np-ans">
              正确答案：
              {q.answer
                .map((i) => (q.type === 'judge' ? q.options[i] : `${OPTION_LETTERS[i]} ${q.options[i]}`))
                .join('、')}
            </span>
          </p>
          <p>{q.why}</p>
          <p className="np-source">
            依据 · {q.section}
            {sectionHref(q.section) && (
              <>
                {' —— '}
                <a href={sectionHref(q.section) ?? '#'}>跳过去读</a>
              </>
            )}
          </p>
          <blockquote className="np-quote">{q.quote}</blockquote>
          {q.kind === 'relate' && q.neighborId && (
            <p className="np-source">
              相关 ·{' '}
              <a href={withBase(`/${q.neighborId}/`)}>{q.neighborTitle ?? q.neighborId}</a>
            </p>
          )}
        </div>
      )}

      {answered && (
        <div className="quiz-actions">
          <button type="button" className="quiz-btn quiz-btn-primary" onClick={next}>
            {isLast ? '看结果' : '下一题'}
          </button>
          <button type="button" className="quiz-quiet-btn" onClick={collapse}>
            收起
          </button>
        </div>
      )}
    </section>
  );
}
