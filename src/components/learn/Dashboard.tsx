import { useEffect, useState } from 'react';
import type { NavSiteData } from '../../lib/notes';
import { getLastVisit, withBase, type LastVisit } from '../../lib/learn';
import { useStatusSnapshot } from './LearnDot';

interface FlatNote {
  id: string;
  href: string;
  title: string;
  directionTitle: string;
  levelLabel: string;
  categoryTitle: string;
}

function flatten(data: NavSiteData): FlatNote[] {
  const notes: FlatNote[] = [];
  for (const direction of data.directions)
    for (const level of direction.levels)
      for (const category of level.categories)
        for (const note of category.notes)
          notes.push({
            id: note.id,
            href: note.href,
            title: note.title,
            directionTitle: direction.title,
            levelLabel: level.label,
            categoryTitle: category.title,
          });
  return notes;
}

function formatDate(ts: number): string {
  const date = new Date(ts);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

/** 首页学习仪表盘（F5）：继续上次学习 → 方向进度 → 下一步推荐 */
export default function Dashboard({ data }: { data: NavSiteData }) {
  const snapshot = useStatusSnapshot();
  const [lastVisit, setLastVisit] = useState<LastVisit | null>(null);
  useEffect(() => {
    setLastVisit(getLastVisit());
  }, []);

  const flat = flatten(data);

  const flatStatus = (id: string) => snapshot[id] ?? 0;

  // 方向维度统计：仅用于"继续上次学习"卡片顶部的进度条（该方向已完成占比）
  const directionStats = data.directions.map((direction) => {
    let total = 0;
    let mastered = 0;
    for (const level of direction.levels)
      for (const category of level.categories)
        for (const note of category.notes) {
          total++;
          if (snapshot[note.id] === 2) mastered++;
        }
    return { direction, total, mastered };
  });

  // 推荐逻辑：优先正在学习的笔记，其次路线顺序中第一个未学知识点
  let recommended: FlatNote | null = null;
  let hasLearning = false;
  let masteredTotal = 0;
  for (const note of flat) {
    const status = flatStatus(note.id);
    if (status === 2) masteredTotal++;
    if (!hasLearning && status === 1) {
      recommended = note;
      hasLearning = true;
    }
  }
  if (!recommended) {
    for (const note of flat) {
      if (flatStatus(note.id) === 0) {
        recommended = note;
        break;
      }
    }
  }

  const lastNote = lastVisit ? flat.find((note) => note.id === lastVisit.id) : undefined;
  const heroNote = lastNote ?? recommended;

  const statOf = (note: FlatNote) =>
    directionStats.find((s) => s.direction.title === note.directionTitle);
  const heroStat = heroNote ? statOf(heroNote) : undefined;
  const heroPct =
    heroStat && heroStat.total > 0 ? Math.round((heroStat.mastered / heroStat.total) * 100) : 0;

  return (
    <div>
      {/* ① 继续上次学习 */}
      {heroNote ? (
        <div className="learn-hero">
          <div className="learn-hero-kicker">
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
              <circle cx="6" cy="6" r="5" fill="none" stroke="currentColor" strokeWidth="1.2" />
              <path
                d="M6 3.5 L6 6 L8 7"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
            继续上次学习
          </div>
          <h2 className="learn-hero-title">
            <a href={withBase(heroNote.href)}>
              {heroNote.directionTitle} · {heroNote.title}
            </a>
          </h2>
          <div className="learn-progress-track">
            <div className="learn-progress-fill" style={{ width: `${heroPct}%` }} />
          </div>
          <div className="learn-hero-meta">
            <span>{heroPct}%</span>
            <span>·</span>
            <span>
              {lastVisit ? `上次 ${formatDate(lastVisit.ts)}` : '从这里开始'}
            </span>
            <a className="learn-btn" href={withBase(heroNote.href)}>
              继续学习 →
            </a>
          </div>
        </div>
      ) : (
        <div className="learn-empty">知识点整理中，先逛逛各方向的学习路线吧。</div>
      )}

      {/* ② 下一步推荐 */}
      <h2>下一步推荐</h2>
      {recommended ? (
        <div className="learn-next">
          <div>
            <div className="learn-next-title">
              {recommended.directionTitle} {recommended.levelLabel} ·{' '}
              {recommended.categoryTitle} ·{' '}
              <a href={withBase(recommended.href)}>{recommended.title}</a>
            </div>
            <div className="learn-next-why">
              {hasLearning
                ? '正在学习这篇笔记，先完成它再进入下一个知识点。'
                : masteredTotal > 0
                  ? `已完成 ${masteredTotal} 个知识点，按学习路线顺序进入下一个。`
                  : '按学习路线从第一个知识点开始。'}
            </div>
          </div>
          <a className="learn-go" href={withBase(recommended.href)}>
            开始学习 →
          </a>
        </div>
      ) : flat.length > 0 ? (
        <div className="learn-next">
          <div>
            <div className="learn-next-title">路线已全部掌握</div>
            <div className="learn-next-why">随时回头复习，巩固长期记忆。</div>
          </div>
          <a className="learn-go" href={withBase(flat[0]!.href)}>
            复习 →
          </a>
        </div>
      ) : null}

      {/* ③ 全站图谱入口 */}
      <p className="learn-panorama-link">
        想纵览全站？
        <a href={withBase('/panorama/')}>知识全景</a>
        按内容量展示所有方向与分类。
      </p>
    </div>
  );
}
