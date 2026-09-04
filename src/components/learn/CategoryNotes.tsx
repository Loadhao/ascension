import type { CategoryMeta } from '../../lib/notes';
import { withBase } from '../../lib/learn';
import LearnDot from './LearnDot';

/** 分类目录页（F6a）：知识点有序列表 = 序号 + 标题 + 一句话简述 + 核心标记 + 状态圆点 */
export default function CategoryNotes({ category }: { category: CategoryMeta }) {
  if (category.notes.length === 0) {
    return <div className="learn-empty">该分类下的知识点整理中。</div>;
  }

  return (
    <ol className="learn-kp-list">
      {category.notes.map((note, index) => (
        <li key={note.id}>
          <a className="learn-kp-link" href={withBase(note.href)}>
            <span className="learn-kp-idx">{String(index + 1).padStart(2, '0')}</span>
            <span className="learn-kp-body">
              <span className="learn-kp-title">
                {note.title}
                {note.core && <b className="learn-kp-core">核心</b>}
              </span>
              {note.description && <span className="learn-kp-desc">{note.description}</span>}
            </span>
          </a>
          <LearnDot noteId={note.id} />
        </li>
      ))}
    </ol>
  );
}
