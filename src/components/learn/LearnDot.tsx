import { useEffect, useState } from 'react';
import {
  STATUS_LABELS,
  cycleStatus,
  getAllStatus,
  getStatus,
  subscribeStatus,
  type LearnStatus,
} from '../../lib/learn';

/** 订阅学习状态变化：任意圆点切换后所有订阅组件同步重渲染 */
export function useLearnVersion(): number {
  const [version, setVersion] = useState(0);
  useEffect(() => subscribeStatus(() => setVersion((v) => v + 1)), []);
  return version;
}

/** 挂载后读取学习状态快照，避免 SSR 水合不匹配；任意圆点切换后刷新 */
export function useStatusSnapshot(): Record<string, LearnStatus> {
  const [snapshot, setSnapshot] = useState<Record<string, LearnStatus>>({});
  const version = useLearnVersion();
  useEffect(() => {
    setSnapshot(getAllStatus());
  }, [version]);
  return snapshot;
}

/** 状态圆点（F3/F7）：纯 SVG 图形三态，点击循环 未学 → 学习中 → 已掌握 */
export default function LearnDot({ noteId }: { noteId: string }) {
  const [current, setCurrent] = useState<LearnStatus>(0);

  useEffect(() => {
    const sync = () => setCurrent(getStatus(noteId));
    sync();
    return subscribeStatus(sync);
  }, [noteId]);

  const label = STATUS_LABELS[current];

  function cycle() {
    cycleStatus(noteId);
  }

  function handleClick(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    cycle();
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      cycle();
    }
  }

  return (
    <button
      type="button"
      className={`learn-dot learn-dot--${current}`}
      aria-label={`标记学习状态（当前：${label}）`}
      title={label}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
        {current < 2 && <circle className="dot-ring" cx="6" cy="6" r="5" />}
        {current === 1 && <path className="dot-half" d="M6 1 A5 5 0 0 1 6 11 Z" />}
        {current === 2 && <circle className="dot-full" cx="6" cy="6" r="5" />}
      </svg>
    </button>
  );
}
