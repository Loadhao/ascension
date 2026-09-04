// Mermaid 流程图悬停交互：hover 节点 / 子图 / 连线 → 高亮关联链路并淡出其余；点击固定，再点取消。
// 图表本体仍是构建时渲染的 SVG，本脚本只做 DOM 交互增强（约 2KB，module 自动 defer）。
(() => {
  const ON = 'mmd-on';
  const FOCUS = 'mmd-focus';
  const PICKER = 'g.node, g.cluster, path.flowchart-link';

  for (const svg of document.querySelectorAll('svg.flowchart[id^="mermaid-"]')) {
    try {
      enhance(svg);
    } catch {
      /* 交互增强失败不影响静态图展示 */
    }
  }

  function enhance(svg) {
    // —— 节点索引：DOM id 形如 mermaid-0-flowchart-A-0（末段为全局计数器） ——
    const nameByEl = new WeakMap();
    const nodeByName = new Map();
    for (const el of svg.querySelectorAll('g.node')) {
      const m = /^mermaid-\d+-flowchart-(.*)-\d+$/.exec(el.id);
      if (m && !nodeByName.has(m[1])) {
        nodeByName.set(m[1], el);
        nameByEl.set(el, m[1]);
      }
    }

    // —— 边索引：主路径 + 配套标签按 L_<from>_<to>_<n> 键分组 ——
    const edgeByKey = new Map();
    const keyOf = (el) => el.dataset.id || (/(L_.*)$/.exec(el.id) || [])[1];
    for (const p of svg.querySelectorAll('path.flowchart-link')) {
      const key = keyOf(p);
      if (!key) continue;
      let e = edgeByKey.get(key);
      if (!e) {
        e = { paths: [], labels: [], from: null, to: null };
        edgeByKey.set(key, e);
      }
      e.paths.push(p);
    }
    for (const label of svg.querySelectorAll('g.edgeLabel')) {
      const key = label.querySelector('.label')?.dataset.id;
      const e = key && edgeByKey.get(key);
      if (e) e.labels.push(label);
    }

    // 解析 L_A_B_0 → (A, B)。节点名可能含下划线，用已知节点名做拆分（取最长 from）
    const links = [];
    for (const [key, e] of edgeByKey) {
      const m = /^L_(.*)_\d+$/.exec(key);
      if (!m) continue;
      let best = null;
      for (const a of nodeByName.keys()) {
        if (!m[1].startsWith(a + '_')) continue;
        const b = m[1].slice(a.length + 1);
        if (nodeByName.has(b) && (!best || a.length > best[0].length)) best = [a, b];
      }
      if (best) {
        e.from = best[0];
        e.to = best[1];
        links.push(e);
      }
    }

    // —— 子图内部节点：cluster 与 node 是 DOM 兄弟（视觉包含靠坐标），
    //    用包围盒判断；懒计算避免隐藏 Tab 里的零尺寸问题，几何关系缩放不变可缓存 ——
    const clusterCache = new WeakMap();
    function nodesInCluster(c) {
      if (!clusterCache.has(c)) {
        const cb = c.getBoundingClientRect();
        const set = new Set();
        if (cb.width > 0 || cb.height > 0) {
          for (const n of nodeByName.values()) {
            const nb = n.getBoundingClientRect();
            if (
              nb.left >= cb.left - 1 &&
              nb.right <= cb.right + 1 &&
              nb.top >= cb.top - 1 &&
              nb.bottom <= cb.bottom + 1
            ) {
              set.add(n);
            }
          }
        }
        clusterCache.set(c, set);
      }
      return clusterCache.get(c);
    }

    // —— 交互集合计算 ——
    function setsFor(el) {
      const nodes = new Set();
      const paths = new Set();
      const labels = new Set();
      const take = (e) => {
        e.paths.forEach((p) => paths.add(p));
        e.labels.forEach((l) => labels.add(l));
      };
      if (el.classList.contains('cluster')) {
        for (const n of nodesInCluster(el)) nodes.add(n);
        for (const e of links) {
          if (nodes.has(nodeByName.get(e.from)) && nodes.has(nodeByName.get(e.to))) take(e);
        }
      } else if (el.tagName === 'path') {
        for (const e of links) {
          if (e.paths.includes(el)) {
            nodes.add(nodeByName.get(e.from));
            nodes.add(nodeByName.get(e.to));
            take(e);
          }
        }
      } else {
        const name = nameByEl.get(el);
        nodes.add(el);
        for (const e of links) {
          if (e.from === name || e.to === name) {
            nodes.add(nodeByName.get(e.from));
            nodes.add(nodeByName.get(e.to));
            take(e);
          }
        }
      }
      return { nodes, paths, labels };
    }

    // —— 状态机：mouseover 委托（节点嵌在子图里时按最近的可交互元素算），点击固定 ——
    let current = null;
    let pinned = null;

    function strip() {
      svg.classList.remove(FOCUS);
      for (const el of svg.querySelectorAll('.' + ON)) el.classList.remove(ON);
    }

    function apply(sets) {
      strip();
      svg.classList.add(FOCUS);
      sets.nodes.forEach((el) => el.classList.add(ON));
      sets.paths.forEach((el) => el.classList.add(ON));
      sets.labels.forEach((el) => el.classList.add(ON));
    }

    svg.addEventListener('mouseover', (ev) => {
      if (pinned) return;
      const el = ev.target.closest(PICKER);
      if (el === current) return;
      current = el;
      if (el) apply(setsFor(el));
      else strip();
    });

    svg.addEventListener('click', (ev) => {
      if (ev.target.closest('a')) return; // 节点自带链接时优先跳转
      const el = ev.target.closest(PICKER);
      if (pinned && pinned.el === el) {
        pinned = null;
        current = null;
        strip();
        return;
      }
      if (!el) {
        pinned = null;
        current = null;
        strip();
        return;
      }
      pinned = { el, sets: setsFor(el) };
      current = el;
      apply(pinned.sets);
    });
  }
})();
