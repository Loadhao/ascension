import { useEffect, useState } from 'react';
import { loadQuizState, subscribeQuizChange, gotoQuizIndex, type QuizPersist } from '../../lib/quiz-store';
import type { RoundKind } from '../../lib/quiz-store';

// ===== 右侧栏刷题导航器（/guide/quiz 的 TableOfContents 覆盖） =====
// 轮次进行中：题号网格（✓ 答对 / ✗ 答错 / 当前高亮），点题号跳转；
// 无轮次：已刷 / 错题本 / 收藏 概览。状态经 quiz-store 事件与作答组件联动。

const ROUND_LABELS: Record<RoundKind, string> = {
  scope: '范围刷题',
  wrong: '错题本',
  starred: '收藏本',
};

export default function QuizNav({ total }: { total: number }) {
  const [quiz, setQuiz] = useState<QuizPersist>(() => loadQuizState());

  useEffect(() => subscribeQuizChange(() => setQuiz(loadQuizState())), []);

  const round = quiz.round;
  const doneCount = Object.keys(quiz.done).length;

  return (
    <nav className="quiz-rail" aria-label={round ? '题目导航' : '刷题统计'}>
      {round ? (
        <>
          <h2>本轮导航</h2>
          <div className="quiz-rail-round">
            {ROUND_LABELS[round.kind]} · {round.index + 1} / {round.queue.length}
          </div>
          <div className="quiz-rail-grid">
            {round.queue.map((qid, i) => {
              const answer = round.answers[qid];
              const cls =
                i === round.index
                  ? 'is-current'
                  : answer
                    ? answer.correct
                      ? 'is-right'
                      : 'is-wrong'
                    : '';
              return (
                <button
                  type="button"
                  key={qid}
                  className={`quiz-rail-dot ${cls}`}
                  onClick={() => gotoQuizIndex(i)}
                  title={`第 ${i + 1} 题${answer ? (answer.correct ? ' · 答对' : ' · 答错') : ''}`}
                >
                  {answer ? (answer.correct ? '✓' : '✗') : i + 1}
                </button>
              );
            })}
          </div>
          <div className="quiz-rail-legend">
            <span className="is-right">✓ 答对</span>
            <span className="is-wrong">✗ 答错</span>
            <span>○ 未答</span>
          </div>
        </>
      ) : (
        <>
          <h2>刷题统计</h2>
          <ul className="quiz-rail-stats">
            <li>
              <span className="quiz-rail-num">
                {doneCount} / {total}
              </span>
              <span className="quiz-rail-label">已刷</span>
            </li>
            <li>
              <span className="quiz-rail-num">{Object.keys(quiz.wrong).length}</span>
              <span className="quiz-rail-label">错题本</span>
            </li>
            <li>
              <span className="quiz-rail-num">{Object.keys(quiz.starred).length}</span>
              <span className="quiz-rail-label">收藏</span>
            </li>
          </ul>
        </>
      )}
    </nav>
  );
}
