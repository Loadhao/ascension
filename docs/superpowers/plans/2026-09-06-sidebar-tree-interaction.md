# 侧边栏目录树交互增强实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

| 项 | 值 |
|---|---|
| 状态 | 待执行 |
| 日期 | 2026-09-06 |
| 设计规格 | [2026-09-06-sidebar-tree-interaction.md](../specs/2026-09-06-sidebar-tree-interaction.md) |

**Goal:** 侧边栏目录树支持点击分组联动开合整棵子树、顶部「全部展开/全部收起」工具条、每分组子树开合按钮，并用 localStorage 跨标签页/重启持久化展开状态。

**Architecture:** 不改侧边栏数据结构。覆盖 Starlight `Sidebar` 组件渲染工具条（同现有 `Footer.astro` 覆盖模式）；新增一个原生 JS 脚本经 `starlight.head` 注入（同 `mermaid-interact.js` 模式）承担全部交互与持久化；样式进 `custom.css`。

**Tech Stack:** Astro 7 + Starlight 0.42（原生 `<details>/<summary>` 树）、原生 JS（无新依赖）、CSS `--sl-*` 令牌。

## Global Constraints

- 包管理器 pnpm，且不在默认 PATH：命令前 `export PATH="$HOME/.nvm/versions/node/v24.14.0/bin:$PATH"`；本地验证 `pnpm build` 必须通过，交互用 `pnpm preview` 实测。
- **工作区已有未提交的 Tomcat 迁移改动（含已暂存内容）：每个任务提交必须用路径限定 `git commit -- <paths>`，严禁 `git add -A` 或不带路径的 `git commit`。**
- 脚本为原生 JS（无框架、无新依赖），注入 src 用 base 路径 `/ascension/scripts/sidebar-tree.js`。
- 样式只用现有 `--sl-color-*` 令牌与 `custom.css` 已有写法；不改 `astro.config.mjs` 中 `sidebar` 数组数据。
- 不改动 Starlight 原生 `sessionStorage` 持久化行为。

---

### Task 1: Sidebar 覆盖组件（工具条）与注册

**Files:**
- Create: `src/components/starlight/Sidebar.astro`
- Modify: `astro.config.mjs`（`components` 注册，约 105-109 行）

**Interfaces:**
- Produces: DOM 锚点 `<div class="sl-sidebar-tools">` 内含 `[data-tree-action="expand-all"]` 与 `[data-tree-action="collapse-all"]` 两个按钮（Task 3 的脚本按此挂事件）。

- [ ] **Step 1: 创建覆盖组件**

`src/components/starlight/Sidebar.astro`（结构复刻 Starlight 默认 `Sidebar.astro`，仅在树之前插入工具条）：

```astro
---
import MobileMenuFooter from '@astrojs/starlight/components/MobileMenuFooter.astro';
import SidebarPersister from '@astrojs/starlight/components/SidebarPersister.astro';
import SidebarSublist from '@astrojs/starlight/components/SidebarSublist.astro';

const { sidebar } = Astro.locals.starlightRoute;
---

<div class="sl-sidebar-tools">
  <button type="button" data-tree-action="expand-all">全部展开</button>
  <button type="button" data-tree-action="collapse-all">全部收起</button>
</div>

<SidebarPersister>
  <SidebarSublist sublist={sidebar} />
</SidebarPersister>

<div class="md:sl-hidden">
  <MobileMenuFooter />
</div>
```

- [ ] **Step 2: 注册组件**

`astro.config.mjs` 的 `components` 改为：

```js
      components: {
        // 笔记页页脚自动注入学习状态标记（ProgressMark）
        Footer: './src/components/starlight/Footer.astro',
        // 侧边栏目录树工具条（全部展开/收起）
        Sidebar: './src/components/starlight/Sidebar.astro',
      },
```

- [ ] **Step 3: 构建验证**

```bash
export PATH="$HOME/.nvm/versions/node/v24.14.0/bin:$PATH"
pnpm build
grep -c "sl-sidebar-tools" dist/java/index.html
```

Expected: 构建成功；grep 输出 ≥1（工具条已随页面渲染，桌面与移动抽屉共用同一 DOM）。

- [ ] **Step 4: Commit**

```bash
git commit -m "feat(侧边栏): 覆盖 Sidebar 组件渲染目录树工具条" -- src/components/starlight/Sidebar.astro astro.config.mjs
```

---

### Task 2: 核心脚本（子树联动 + localStorage 持久化）与 head 注入

**Files:**
- Create: `public/scripts/sidebar-tree.js`
- Modify: `astro.config.mjs`（`head` 数组追加，约 110-122 行）

**Interfaces:**
- Consumes: Task 1 的 DOM（`#starlight__sidebar` 弹出层内 `.sidebar-content` 包含工具条与 `<details>` 树）。
- Produces: 存储键 `ascension:sidebar-tree`（`{ v: 1, open: { "<祖先链标签>": boolean } }`）；`toggle` 捕获监听（Task 3 在同一脚本扩展）。

- [ ] **Step 1: 编写脚本**

`public/scripts/sidebar-tree.js` 全量内容：

```js
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
```

- [ ] **Step 2: head 注入**

`astro.config.mjs` 的 `head` 数组末尾（Mermaid 项之后）追加：

```js
        {
          // 侧边栏目录树交互（子树联动/批量开合/localStorage 持久化）
          tag: 'script',
          attrs: { type: 'module', src: '/ascension/scripts/sidebar-tree.js' },
        },
```

- [ ] **Step 3: 构建验证**

```bash
pnpm build
grep -c "sidebar-tree.js" dist/java/index.html
```

Expected: 构建成功；grep 输出 1。

- [ ] **Step 4: 预览实测**

```bash
pnpm preview
```

浏览器打开任一方向页（如 `/ascension/java/`）：点击「Java」分组 → 基础/中级/高级与全部分类一次铺开；再点 → 整棵收起。换页、新开标签页后展开状态保持（localStorage 持久化本任务即已生效）。

- [ ] **Step 5: Commit**

```bash
git commit -m "feat(侧边栏): 目录树子树联动与 localStorage 持久化" -- public/scripts/sidebar-tree.js astro.config.mjs
```

---

### Task 3: 子树按钮、工具条逻辑与样式

**Files:**
- Modify: `public/scripts/sidebar-tree.js`（`if (root) {` 块内、`restore` 循环之前插入两段函数并调用）
- Modify: `src/styles/custom.css`（「目录侧边栏」段之后追加）

**Interfaces:**
- Consumes: Task 1 的 `[data-tree-action]` 按钮；Task 2 的 `save`/`descendants` 函数与 `if (root)` 作用域、`const open = readState().open ?? {};` 插入锚点。

- [ ] **Step 1: 脚本追加子树按钮与工具条事件**

在 `sidebar-tree.js` 的 `const open = readState().open ?? {};` 之前插入：

```js
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
```

- [ ] **Step 2: 追加样式**

`src/styles/custom.css` 在「目录侧边栏字体统一规范」段之后追加：

```css
/* ===== 侧边栏目录树工具条与子树开关 ===== */
.sl-sidebar-tools {
  display: flex;
  gap: 0.25rem;
  padding: 0 0.5rem 0.75rem;
  border-bottom: 1px solid var(--sl-color-hairline-light);
  margin-bottom: 0.5rem;
}
.sl-sidebar-tools button {
  font-size: var(--sl-text-xs);
  color: var(--sl-color-gray-2);
  background: transparent;
  border: 1px solid var(--sl-color-hairline-light);
  border-radius: 0.25rem;
  padding: 0.15rem 0.5rem;
  cursor: pointer;
}
.sl-sidebar-tools button:hover {
  color: var(--sl-color-white);
  border-color: var(--sl-color-gray-3);
}
summary .sl-tree-toggle {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  padding: 0;
  border: none;
  border-radius: 0.25rem;
  background: transparent;
  color: var(--sl-color-gray-3);
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.15s ease;
}
summary:hover .sl-tree-toggle,
summary .sl-tree-toggle:focus-visible {
  opacity: 1;
}
summary .sl-tree-toggle:hover {
  color: var(--sl-color-white);
  background: var(--sl-color-hairline-light);
}
@media (hover: none) {
  summary .sl-tree-toggle {
    opacity: 0.5;
  }
}
```

- [ ] **Step 3: 构建与预览实测**

```bash
pnpm build && pnpm preview
```

逐项核对：hover 分组行出现按钮且点击只影响该子树；「全部展开」树全开；「全部收起」后当前页链路仍在；换页、**新开标签页**、重启浏览器后状态保持（localStorage 生效）；移动宽度下抽屉内工具条与按钮可用。

- [ ] **Step 4: Commit**

```bash
git commit -m "feat(侧边栏): 子树开合按钮、批量工具条逻辑与样式" -- public/scripts/sidebar-tree.js src/styles/custom.css
```

---

### Task 4: 文档同步与验收

**Files:**
- Modify: `AGENTS.md`（项目结构表 `astro.config.mjs` 行）

- [ ] **Step 1: 同步 AGENTS.md**

站点配置行改为：

```markdown
| 站点配置   | `astro.config.mjs`             | 手动嵌套侧边栏、Footer/Sidebar 覆盖、Mermaid 插件、base 路径    |
```

- [ ] **Step 2: 全量验收**

按设计规格「验证」节执行五项：点 Java 子树全开/再点全收；工具条全开/全收（收起保留当前链路）；hover 子树按钮仅作用该组、触屏模拟常显；换页/新标签页/重启浏览器状态保持；移动抽屉可用。`pnpm build` 通过，预览无控制台报错。

- [ ] **Step 3: Commit**

```bash
git commit -m "docs(规范): 同步侧边栏 Sidebar 覆盖说明" -- AGENTS.md
```

## 验收标准

- 点击任意分组标题，其整棵子树联动开/合；分类（叶分组）行为与现状一致
- 工具条「全部展开/全部收起」可用，收起后当前页链路保留
- 每个分组 hover/focus 出现子树开关，触屏常显，点击不触发所在行切换
- 展开状态跨换页、跨标签页、跨浏览器重启保持（localStorage `ascension:sidebar-tree`）
- 无 JS 时回退为 Starlight 原生行为；原生 sessionStorage 持久化未被破坏
- `pnpm build` 通过，浏览器实测无控制台错误

## 依赖与阻塞

| 依赖 | 说明 | 状态 |
|---|---|---|
| Starlight exports | `./components/*` 可导入 `SidebarPersister`/`SidebarSublist` | 已验证 |
| 挂载点 | `Sidebar` 渲染于 `.sidebar-content`（`#starlight__sidebar` 弹出层内） | 已验证 |
| 工作区 Tomcat 迁移改动 | 未提交，任务提交必须路径限定 | 见 Global Constraints |
