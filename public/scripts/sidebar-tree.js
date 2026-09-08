// 侧边栏目录树交互增强：点击分组只切自身、子树按钮/工具条批量开合、目录过滤搜索、
// 侧边栏整体收起/展开、localStorage 持久化。
// 设计规格：docs/superpowers/specs/2026-09-06-sidebar-tree-interaction.md
const STORAGE_KEY = 'ascension:sidebar-tree';
const COLLAPSE_KEY = 'ascension:sidebar-collapsed';

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

  // 过滤搜索期间不做持久化，避免临时展开的链路冲掉用户的折叠布局
  let filtering = false;

  // 用 setTimeout 而非 requestAnimationFrame 做去抖：后台标签页会暂停 rAF，导致持久化静默失效
  let saveTimer = 0;
  const save = () => {
    if (filtering) return;
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

  // 点击 summary 只走原生 `<details>` 切换自身，不把后代同步为同一 open。
  // 整棵子树的一键开合只由 `.sl-tree-toggle` 与工具条写入；收起父级时也不清空后代 open，
  // 下次再打开父级时子分组仍保持各自状态。toggle 仅记账（含原生恢复），不做联动。
  root.addEventListener(
    'toggle',
    () => save(),
    true,
  );

  const ICON =
    '<svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="7 5 12 10 17 5"/><polyline points="7 13 12 18 17 13"/></svg>';

  // 每个分组的子树开关：有收起的后代则全部展开，否则全部收起。
  // 叶分组（无后代分组）没有子树可开合，点行即可折叠自身，不注入按钮避免出现点击无效的死控件。
  for (const details of root.querySelectorAll('details')) {
    if (!details.querySelector('details')) continue;
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

  // 工具条：全部展开 = 字面全开；全部收起 = 字面全收（当前页链路由恢复逻辑在换页/清词时重定位）
  for (const btn of root.querySelectorAll('[data-tree-action]')) {
    btn.addEventListener('click', () => {
      const expand = btn.dataset.treeAction === 'expand-all';
      for (const details of root.querySelectorAll('details')) {
        details.open = expand;
      }
      save();
    });
  }

  // 恢复已存状态，并把当前页所在链路强制展开、滚动定位到可见（初始化与清除搜索词时复用）
  const restoreState = () => {
    const open = readState().open ?? {};
    for (const details of root.querySelectorAll('details')) {
      const key = chainKey(details);
      if (key && key in open) details.open = open[key];
    }
    const current = root.querySelector('a[aria-current="page"]');
    const scrollerEl = document.getElementById('starlight__sidebar');
    if (current && scrollerEl) {
      for (
        let el = current.closest('details');
        el && root.contains(el);
        el = el.parentElement?.closest('details')
      ) {
        el.open = true;
      }
      const nr = current.getBoundingClientRect();
      const sr = scrollerEl.getBoundingClientRect();
      if (nr.top < sr.top || nr.bottom > sr.bottom) {
        scrollerEl.scrollTop += nr.top - sr.top - sr.height / 2 + nr.height / 2;
      }
    }
  };
  restoreState();

  // 目录过滤搜索：按笔记/分组标题匹配，命中项保留并展开祖先链，其余隐藏；清词还原
  const searchInput = root.querySelector('.sl-sidebar-search input');
  const searchClear = root.querySelector('.sl-search-clear');
  const searchStatus = root.querySelector('.sl-search-status');
  if (searchInput && searchClear) {
    const lis = [...root.querySelectorAll('li')];
    const setStatus = (q, matches) => {
      if (!searchStatus) return;
      searchStatus.hidden = !q;
      searchStatus.textContent = q ? (matches > 0 ? `${matches} 条匹配` : '无匹配结果') : '';
    };
    const applyFilter = () => {
      const q = searchInput.value.trim().toLowerCase();
      searchClear.hidden = !q;
      filtering = !!q;
      if (!q) {
        for (const li of lis) li.hidden = false;
        setStatus('', 0);
        restoreState();
        return;
      }
      // 先标记叶子链接项，再自底向上（文档序倒序）收拢分组可见性
      for (const li of lis) {
        const a = li.querySelector(':scope > a');
        if (!a) continue;
        li.hidden = !a.textContent.toLowerCase().includes(q);
      }
      for (let i = lis.length - 1; i >= 0; i--) {
        const details = lis[i].querySelector(':scope > details');
        if (!details) continue;
        lis[i].hidden = ![...details.querySelectorAll('li')].some((c) => !c.hidden);
      }
      // 命中项的祖先分组全部展开
      for (const li of lis) {
        if (li.hidden) continue;
        for (
          let el = li.parentElement?.closest('details');
          el && root.contains(el);
          el = el.parentElement?.closest('details')
        ) {
          el.open = true;
        }
      }
      const matches = lis.filter((li) => !li.hidden && li.querySelector(':scope > a')).length;
      setStatus(q, matches);
    };
    let filterTimer = 0;
    searchInput.addEventListener('input', () => {
      clearTimeout(filterTimer);
      filterTimer = setTimeout(applyFilter, 120);
    });
    searchClear.addEventListener('click', () => {
      searchInput.value = '';
      applyFilter();
      searchInput.focus();
    });
    searchInput.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && searchInput.value) {
        searchInput.value = '';
        applyFilter();
      }
    });
  }

  // 侧边栏整体收起/展开（桌面端）：注入页头按钮，状态记在 html 属性上由 CSS 接管布局。
  // 属性的初始应用在 Sidebar.astro 的内联脚本里完成（正文渲染前执行，避免换页闪展）。
  const header = document.querySelector('header.header');
  if (header && !header.querySelector('.sl-sidebar-collapse')) {
    const PANEL_ICON =
      '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><line x1="9" y1="4" x2="9" y2="20"/></svg>';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'sl-sidebar-collapse';
    const syncBtn = () => {
      const collapsed = document.documentElement.dataset.sidebarTree === 'collapsed';
      btn.setAttribute('aria-expanded', String(!collapsed));
      const label = collapsed ? '展开目录' : '收起目录';
      btn.setAttribute('aria-label', label);
      btn.title = label;
    };
    syncBtn();
    btn.innerHTML = PANEL_ICON;
    btn.addEventListener('click', () => {
      const collapse = document.documentElement.dataset.sidebarTree !== 'collapsed';
      if (collapse) document.documentElement.dataset.sidebarTree = 'collapsed';
      else delete document.documentElement.dataset.sidebarTree;
      try {
        localStorage.setItem(COLLAPSE_KEY, collapse ? '1' : '0');
      } catch {}
      syncBtn();
    });
    header.prepend(btn);
  }
}
