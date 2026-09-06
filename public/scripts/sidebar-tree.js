// 侧边栏目录树交互增强：点击分组联动开合整棵子树、批量工具条、localStorage 持久化。
// 设计规格：docs/superpowers/specs/2026-09-06-sidebar-tree-interaction.md
const STORAGE_KEY = 'ascension:sidebar-tree';

const scroller = document.getElementById('starlight__sidebar');
const root = scroller?.querySelector('.sidebar-content');
if (root) {
  const descendants = (details) => details.querySelectorAll('details');
  const labelOf = (details) =>
    details.querySelector(':scope > summary .group-label')?.textContent.trim() ?? '';

  // 键 = 祖先分组标签链，规避「基础」「中级」等跨方向重名
  const chainKey = (details) => {
    const labels = [];
    for (let el = details; el; el = el.parentElement?.closest('details')) {
      labels.unshift(labelOf(el));
    }
    return labels.join('/');
  };

  const readState = () => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    } catch {
      return {};
    }
  };

  let raf = 0;
  const save = () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const open = {};
      for (const details of root.querySelectorAll('details')) {
        open[chainKey(details)] = details.open;
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: 1, open }));
      } catch {}
    });
  };

  // toggle 不冒泡，捕获监听可拦截子树内所有开合：联动把后代同步为触发组的新状态
  root.addEventListener(
    'toggle',
    (event) => {
      const details = event.target;
      if (!(details instanceof HTMLDetailsElement)) return;
      for (const d of descendants(details)) d.open = details.open;
      save();
    },
    true,
  );

  // 先恢复再注入：无记录的分组维持 SSR 默认（当前页链路展开）
  const open = readState().open ?? {};
  for (const details of root.querySelectorAll('details')) {
    const key = chainKey(details);
    if (key && key in open) details.open = open[key];
  }
}
