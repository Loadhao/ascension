import type { NavDirection, Level } from '../../lib/notes';
import { withBase, type LearnStatus } from '../../lib/learn';
import LearnDot, { useStatusSnapshot } from './LearnDot';

/** 等级标记（spec §4）：基础 ◇ / 中级 ◈ / 高级 ★，细线 SVG */
const LEVEL_ICONS: Record<Level, JSX.Element> = {
  basic: (
    <svg width="13" height="13" viewBox="0 0 12 12" aria-hidden="true">
      <path d="M6 1 L11 6 L6 11 L1 6 Z" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  ),
  intermediate: (
    <svg width="13" height="13" viewBox="0 0 12 12" aria-hidden="true">
      <path
        d="M6 1 L11 6 L6 11 L1 6 Z M6 1 L6 11 M1 6 L11 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      />
    </svg>
  ),
  advanced: (
    <svg width="13" height="13" viewBox="0 0 12 12" aria-hidden="true">
      <path
        d="M6 1 L7.3 4.4 L11 4.4 L8 6.6 L9.2 10 L6 8 L2.8 10 L4 6.6 L1 4.4 L4.7 4.4 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      />
    </svg>
  ),
};

interface LevelCounts {
  total: number;
  mastered: number;
}

function countLevel(
  level: { categories: { notes: { id: string }[] }[] },
  snapshot: Record<string, LearnStatus>,
): LevelCounts {
  let total = 0;
  let mastered = 0;
  for (const category of level.categories)
    for (const note of category.notes) {
      total++;
      if (snapshot[note.id] === 2) mastered++;
    }
  return { total, mastered };
}

/** 方向首页路线图（F6）：等级分段 + 分类目录入口 + 段头完成计数 */
export default function Roadmap({ direction }: { direction: NavDirection }) {
  const snapshot = useStatusSnapshot();

  const totalNotes = direction.levels.reduce(
    (sum, level) => sum + level.categories.reduce((s, c) => s + c.notes.length, 0),
    0,
  );

  if (totalNotes === 0) {
    return (
      <div className="learn-empty">
        该方向的知识点正在整理中，按「基础 → 中级 → 高级」逐步补充。
      </div>
    );
  }

  return (
    <div>
      {direction.levels.map((level) => {
        const { total, mastered } = countLevel(level, snapshot);
        return (
          <section
            className="learn-level"
            key={level.key}
            aria-labelledby={`level-${direction.id}-${level.key}`}
          >
            <div className="learn-level-head" id={`level-${direction.id}-${level.key}`}>
              {LEVEL_ICONS[level.key]}
              {level.label}
              <span className="learn-level-rule" />
              <span className="learn-level-cnt">
                {mastered} / {total}
              </span>
            </div>
            {level.categories.map((category) => (
              <div className="learn-cat" key={category.id}>
                <a className="learn-cat-link" href={withBase(category.href)}>
                  {category.title}
                  <span className="learn-cat-n">{category.notes.length} 个知识点</span>
                  <span className="learn-cat-go" aria-hidden="true">
                    →
                  </span>
                </a>
                {category.notes.length > 0 && (
                  <ul className="learn-item-list">
                    {category.notes.map((note) => (
                      <li key={note.id}>
                        <a className="learn-item-link" href={withBase(note.href)}>
                          {note.title}
                        </a>
                        <LearnDot noteId={note.id} />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
            {level.categories.length === 0 && (
              <div className="learn-empty">这一级的知识点整理中。</div>
            )}
          </section>
        );
      })}
    </div>
  );
}
