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

  // 用 setTimeout 而非 requestAnimationFrame 做去抖：后台标签页会暂停 rAF，导致联动与持久化静默失效
  let saveTimer = 0;
  const save = () => {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      const open = {};
      for (const details of root.querySelectorAll('details')) {
        open[chainKey(details)] = details.open;
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: 1, open }));
      } catch {}
    }, 0);
  };

  // 子树联动只由用户点击触发：原生切换完成后把整棵子树同步为该组新状态。
  // 不能挂 toggle——原生 sessionStorage 恢复与我们的 restore 也会触发 toggle，
  // 若在 toggle 上联动，会把新页链路的祖先同步波及整棵子树，冲掉已存的用户意图。
  root.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element) || target.closest('.sl-tree-toggle')) return;
    const summary = target.closest('summary');
    if (!summary || !root.contains(summary)) return;
    const details = summary.parentElement;
    if (!(details instanceof HTMLDetailsElement)) return;
    // summary 的默认切换行为在点击事件结束后生效，延后到下一宏任务再读新状态
    setTimeout(() => {
      for (const d of descendants(details)) d.open = details.open;
      save();
    }, 0);
  });
  // 任何来源的开合变化都如实记账（含原生恢复），写入即当前屏幕状态
  root.addEventListener(
    'toggle',
    () => save(),
    true,
  );

  const ICON =
    '<svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="7 5 12 10 17 5"/><polyline points="7 13 12 18 17 13"/></svg>';

  // 每个分组的子树开关：有收起的后代则全部展开，否则全部收起
  for (const details of root.querySelectorAll('details')) {
    const summary = details.querySelector(':scope > summary');
    const caret = summary?.querySelector('.caret');
    if (!summary || !caret || summary.querySelector('.sl-tree-toggle')) continue;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'sl-tree-toggle';
    btn.setAttribute('aria-label', '展开/收起子目录');
    btn.title = '展开/收起子目录';
    btn.innerHTML = ICON;
    btn.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const target = [...descendants(details)].some((d) => !d.open);
      for (const d of descendants(details)) d.open = target;
      save();
    });
    summary.insertBefore(btn, caret);
  }

  // 工具条：全部展开；全部收起保留当前页所在链路
  for (const btn of root.querySelectorAll('[data-tree-action]')) {
    btn.addEventListener('click', () => {
      const current = root.querySelector('a[aria-current="page"]');
      const expand = btn.dataset.treeAction === 'expand-all';
      for (const details of root.querySelectorAll('details')) {
        details.open = expand || Boolean(current && details.contains(current));
      }
      save();
    });
  }

  // 先恢复再注入：无记录的分组维持 SSR 默认（当前页链路展开）
  const open = readState().open ?? {};
  for (const details of root.querySelectorAll('details')) {
    const key = chainKey(details);
    if (key && key in open) details.open = open[key];
  }
}
