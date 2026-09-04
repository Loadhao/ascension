import { useEffect } from 'react';
import { markLastVisit } from '../../lib/learn';
import LearnDot from './LearnDot';

/** 笔记页底部标记（F7 第二入口）：挂载即记录最近访问，供首页「继续上次学习」使用 */
export default function ProgressMark({ noteId }: { noteId: string }) {
  useEffect(() => {
    markLastVisit(noteId);
  }, [noteId]);

  return (
    <div className="learn-page-mark">
      <LearnDot noteId={noteId} />
      <span>这篇笔记你掌握了吗？点击左侧圆点标记（未学 → 学习中 → 已掌握）。</span>
    </div>
  );
}
