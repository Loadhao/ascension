import { useEffect, useState } from 'react';
import { markLastVisit } from '../../lib/learn';
import {
  addDwell,
  formatDuration,
  getReadEntry,
  recordVisit,
  saveScroll,
  type ReadEntry,
} from '../../lib/history';
import LearnDot from './LearnDot';

/** 笔记页底部标记（F7 第二入口）：
 * - 挂载即记录最近访问（learn.ts 单槽）与阅读历史（history.ts：次数/时长/滚动位置）；
 * - 阅读中节流保存滚动位置、可见时段累计时长；
 * - 内联脚本（Footer.astro）已恢复上次滚动位置时，提供「回到顶部」出口与累计数据。 */
export default function ProgressMark({ noteId }: { noteId: string }) {
  const [read, setRead] = useState<ReadEntry | null>(null);
  const [restoredPct, setRestoredPct] = useState<number | null>(null);

  useEffect(() => {
    recordVisit(noteId);
    markLastVisit(noteId);
    setRead(getReadEntry(noteId));

    const maxScroll = () => document.documentElement.scrollHeight - window.innerHeight;
    const saveNow = () => {
      const max = maxScroll();
      if (max > 0) saveScroll(noteId, window.scrollY / max);
    };

    // 滚动位置：500ms 节流写穿
    let scrollTimer: number | undefined;
    const onScroll = () => {
      if (scrollTimer !== undefined) return;
      scrollTimer = window.setTimeout(() => {
        scrollTimer = undefined;
        saveNow();
      }, 500);
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    // 阅读时长：只累计页面可见时段；每 60s 落盘，隐藏/离开时补尾巴
    let visible = document.visibilityState === 'visible';
    let markedAt = Date.now();
    const settle = () => {
      const seconds = Math.round((Date.now() - markedAt) / 1000);
      markedAt = Date.now();
      if (visible && seconds >= 1) addDwell(noteId, Math.min(seconds, 3600));
    };
    const dwellTimer = window.setInterval(settle, 60_000);
    const onVisibility = () => {
      settle();
      visible = document.visibilityState === 'visible';
      if (visible) setRead(getReadEntry(noteId));
    };
    const onPageHide = () => {
      settle();
      saveNow();
    };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', onPageHide);

    // 内联脚本已在本次加载恢复过位置时读取百分比标记
    const restored = Number(document.documentElement.dataset.readRestored);
    if (Number.isFinite(restored) && restored > 0) setRestoredPct(restored);

    return () => {
      if (scrollTimer !== undefined) window.clearTimeout(scrollTimer);
      window.clearInterval(dwellTimer);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', onPageHide);
    };
  }, [noteId]);

  function backToTop() {
    // 瞬时滚顶：平滑滚动途经的中间位置会被节流保存覆盖掉 scroll=0 的意图
    window.scrollTo(0, 0);
    saveScroll(noteId, 0);
    setRestoredPct(null);
  }

  const showStat = read !== null && (read.count > 1 || read.seconds >= 60);

  return (
    <div className="learn-page-mark">
      <LearnDot noteId={noteId} />
      <span>这篇笔记你掌握了吗？点击左侧圆点标记（未学 → 学习中 → 已掌握）。</span>
      {(restoredPct !== null || showStat) && (
        <span className="learn-read-meta">
          {restoredPct !== null && (
            <button type="button" className="learn-read-resume" onClick={backToTop}>
              已回到上次位置（{restoredPct}%）· 回到顶部
            </button>
          )}
          {showStat && read && (
            <span className="learn-read-stat">
              第 {read.count} 次阅读
              {read.seconds >= 60 ? ` · 累计 ${formatDuration(read.seconds)}` : ''}
            </span>
          )}
        </span>
      )}
    </div>
  );
}
