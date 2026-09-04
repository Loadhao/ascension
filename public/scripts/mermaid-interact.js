// Mermaid 图表交互增强：
// 1) 悬停高亮：hover 节点 / 子图 / 连线 → 高亮关联链路并淡出其余，点击固定
// 2) 全屏缩放：图表右上角按钮（或双击）进入全屏，滚轮/双指缩放、拖拽平移、Esc 退出
// 图表本体仍是构建时渲染的 SVG，本脚本只做 DOM 交互增强（module 自动 defer）。
(() => {
  const ON = 'mmd-on';
  const FOCUS = 'mmd-focus';
  const PICKER = 'g.node, g.cluster, path.flowchart-link';

  // —— 全屏查看器常量（须在下方立即执行的循环之前声明，避免暂时性死区） ——
  const MIN_SCALE = 0.15;
  const MAX_SCALE = 8;
  const ICON = {
    expand:
      '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>',
    minus:
      '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14"/></svg>',
    plus:
      '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>',
    fit:
      '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>',
    close:
      '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>',
  };
  let viewer = null; // { close } 单例

  for (const svg of document.querySelectorAll('svg.flowchart[id^="mermaid-"]')) {
    try {
      enhance(svg);
    } catch {
      /* 交互增强失败不影响静态图展示 */
    }
    try {
      mountZoom(svg);
    } catch {
      /* 同上 */
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

  // ==================== 全屏缩放查看器 ====================

  function naturalSize(svg) {
    const vb = svg.viewBox?.baseVal;
    if (vb && vb.width) return { w: vb.width, h: vb.height };
    const r = svg.getBoundingClientRect();
    return { w: r.width || 1, h: r.height || 1 };
  }

  // 每张图：包一层定位容器 + 右上角全屏按钮；双击图表也可进入
  function mountZoom(svg) {
    const wrap = document.createElement('div');
    wrap.className = 'mmd-zoom-wrap';
    svg.replaceWith(wrap);
    wrap.appendChild(svg);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'mmd-fullscreen-btn';
    btn.title = '全屏查看';
    btn.setAttribute('aria-label', '全屏查看图表');
    btn.innerHTML = ICON.expand;
    btn.addEventListener('click', () => openViewer(svg, btn, wrap));
    wrap.appendChild(btn);

    svg.addEventListener('dblclick', (e) => {
      if (viewer) return; // 查看器内的双击用于缩放切换
      e.preventDefault();
      openViewer(svg, btn, wrap);
    });
  }

  function openViewer(svg, trigger, home) {
    if (viewer) return;
    const ac = new AbortController();
    const sig = { signal: ac.signal };
    const ns = naturalSize(svg);

    // —— 覆盖层骨架 ——
    const ov = document.createElement('div');
    ov.className = 'mmd-viewer';
    ov.setAttribute('role', 'dialog');
    ov.setAttribute('aria-modal', 'true');
    ov.setAttribute('aria-label', '图表全屏查看');

    const bar = document.createElement('div');
    bar.className = 'mmd-viewer-bar';

    const stageWrap = document.createElement('div');
    stageWrap.className = 'mmd-viewer-stage-wrap';

    const stage = document.createElement('div');
    stage.className = 'mmd-viewer-stage';
    stageWrap.appendChild(stage);

    const pct = document.createElement('span');
    pct.className = 'mmd-vpct';
    pct.setAttribute('aria-live', 'off');

    const mkBtn = (label, html, fn) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'mmd-vbtn';
      b.title = label;
      b.setAttribute('aria-label', label);
      b.innerHTML = html;
      b.addEventListener('click', fn);
      return b;
    };
    const grpMain = document.createElement('div');
    grpMain.className = 'mmd-vgrp';
    const grpFit = document.createElement('div');
    grpFit.className = 'mmd-vgrp';
    const grpClose = document.createElement('div');
    grpClose.className = 'mmd-vgrp';
    const closeBtn = mkBtn('关闭 (Esc)', ICON.close, () => close());
    grpMain.append(mkBtn('缩小', ICON.minus, () => zoomCenter(1 / 1.3)), pct, mkBtn('放大', ICON.plus, () => zoomCenter(1.3)));
    grpFit.append(mkBtn('适屏', ICON.fit, () => fit()));
    grpClose.append(closeBtn);
    bar.append(grpMain, grpFit, grpClose);
    ov.append(bar, stageWrap);
    document.body.appendChild(ov);

    // —— 移入图表，记录原状以便还原 ——
    const prev = {
      width: svg.getAttribute('width'),
      height: svg.getAttribute('height'),
      style: svg.getAttribute('style'),
    };
    const marker = new Comment('mmd-viewer placeholder');
    svg.replaceWith(marker);
    stage.appendChild(svg);
    svg.setAttribute('width', String(ns.w));
    svg.setAttribute('height', String(ns.h));
    svg.style.maxWidth = 'none';
    document.documentElement.classList.add('mmd-viewer-open');

    // —— 变换状态：stage 以左上为原点 translate + scale ——
    let scale = 1;
    let tx = 0;
    let ty = 0;
    const apply = () => {
      stage.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
      pct.textContent = Math.round(scale * 100) + '%';
    };
    const rectOf = () => stageWrap.getBoundingClientRect();

    function fit() {
      const r = rectOf();
      scale = Math.min((r.width - 48) / ns.w, (r.height - 24) / ns.h, 1);
      if (scale < MIN_SCALE) scale = MIN_SCALE;
      tx = (r.width - ns.w * scale) / 2;
      ty = (r.height - ns.h * scale) / 2;
      apply();
    }

    // 以 stageWrap 内坐标 (px, py) 为锚点缩放：锚点在视口中的位置保持不变
    function zoomAt(px, py, factor) {
      const s = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale * factor));
      if (s === scale) return;
      tx = px - (px - tx) * (s / scale);
      ty = py - (py - ty) * (s / scale);
      scale = s;
      apply();
    }

    const zoomCenter = (factor) => {
      const r = rectOf();
      zoomAt(r.width / 2, r.height / 2, factor);
    };

    // —— 滚轮缩放 ——
    stageWrap.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();
        const r = rectOf();
        zoomAt(e.clientX - r.left, e.clientY - r.top, Math.exp(-e.deltaY * 0.0016));
      },
      { ...sig, passive: false }
    );

    // —— 指针：单指拖拽平移，双指捏合缩放 ——
    const pointers = new Map();
    let lastDist = 0;
    let lastMid = null;
    let dragged = false;

    const pinchDist = () => {
      const [a, b] = [...pointers.values()];
      return Math.hypot(a.x - b.x, a.y - b.y);
    };
    const pinchMid = () => {
      const [a, b] = [...pointers.values()];
      return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    };

    stageWrap.addEventListener(
      'pointerdown',
      (e) => {
        pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        try {
          stageWrap.setPointerCapture(e.pointerId);
        } catch {
          /* 合成事件/非激活指针时忽略 */
        }
        stageWrap.classList.add('panning');
        if (pointers.size === 2) {
          lastDist = pinchDist();
          lastMid = pinchMid();
        }
      },
      sig
    );

    stageWrap.addEventListener(
      'pointermove',
      (e) => {
        const p = pointers.get(e.pointerId);
        if (!p) return;
        const dx = e.clientX - p.x;
        const dy = e.clientY - p.y;
        pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (Math.abs(dx) + Math.abs(dy) > 2) dragged = true;
        if (pointers.size === 1) {
          tx += dx;
          ty += dy;
          apply();
        } else if (pointers.size >= 2) {
          const d = pinchDist();
          const m = pinchMid();
          const r = rectOf();
          if (lastDist > 0 && d > 0) zoomAt(m.x - r.left, m.y - r.top, d / lastDist);
          if (lastMid) {
            tx += m.x - lastMid.x;
            ty += m.y - lastMid.y;
          }
          lastDist = d;
          lastMid = m;
          apply();
        }
      },
      sig
    );

    const endPointer = (e) => {
      pointers.delete(e.pointerId);
      if (pointers.size < 2) {
        lastDist = 0;
        lastMid = null;
      }
      if (!pointers.size) stageWrap.classList.remove('panning');
    };
    stageWrap.addEventListener('pointerup', endPointer, sig);
    stageWrap.addEventListener('pointercancel', endPointer, sig);

    // —— 双击：放大 ↔ 适屏 ——
    stageWrap.addEventListener('dblclick', (e) => {
      const r = rectOf();
      if (scale >= 2) fit();
      else zoomAt(e.clientX - r.left, e.clientY - r.top, 2 / scale);
    });

    // —— 点击空白关闭（拖拽后的 click 不算） ——
    stageWrap.addEventListener('click', (e) => {
      if (dragged) {
        dragged = false;
        return;
      }
      if (e.target === stageWrap) close();
    });

    // —— 键盘 ——
    document.addEventListener(
      'keydown',
      (e) => {
        if (e.key === 'Escape') close();
        else if (e.key === '+' || e.key === '=') zoomCenter(1.3);
        else if (e.key === '-' || e.key === '_') zoomCenter(1 / 1.3);
        else if (e.key === '0') fit();
      },
      sig
    );

    // —— 关闭：还原属性与 DOM 位置，交还焦点 ——
    function close() {
      ac.abort();
      document.documentElement.classList.remove('mmd-viewer-open');
      if (prev.width == null) svg.removeAttribute('width');
      else svg.setAttribute('width', prev.width);
      if (prev.height == null) svg.removeAttribute('height');
      else svg.setAttribute('height', prev.height);
      if (prev.style == null) svg.removeAttribute('style');
      else svg.setAttribute('style', prev.style);
      marker.replaceWith(svg);
      ov.remove();
      viewer = null;
      trigger.focus();
    }

    viewer = { close };
    window.addEventListener('beforeprint', close, sig);
    fit();
    closeBtn.focus();
  }
})();
