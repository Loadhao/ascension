# 侧边栏目录树交互增强设计规格

| 项 | 值 |
|---|---|
| 状态 | 已确认（用户已批准，2026-09-06） |
| 作者 | haohao.zhang / ZCode |
| 日期 | 2026-09-06 |
| 关联 | 侧边栏扁平化方案 A/B（本轮否决，另议）；`docs/superpowers/specs/site-redesign`（五级信息架构来源） |

## 背景与目标

侧边栏是四层折叠树（领域组 → 方向 → 等级 → 分类 → 笔记），共 145 个 `<details>` 分组、76 个默认折叠。实测交互痛点：

1. 点开一个方向（如 Java）后，还要再点开等级、分类才能看到笔记，层级深；
2. Starlight 0.42 原生虽有侧边栏状态持久化，但基于 `sessionStorage`：新标签页、重启浏览器即清零，移动端抽屉完全不恢复，用户感知为"展开状态不保持"；
3. 缺少批量展开/收起能力，浏览全站目录只能逐组点。

目标：不改变侧边栏信息结构，通过交互增强让"看到某方向全部笔记"一次点击完成，并提供子树级与全局的批量开合。

## 范围

- **包含**：
  - 点击分组标题联动开/合整棵子树；
  - 侧边栏顶部工具条：全部展开 / 全部收起；
  - 每个分组的子树开合按钮（hover/focus 显现，触屏常显）；
  - 持久化升级：`localStorage` 层，跨标签页、跨重启、含移动端抽屉；
- **不包含**：侧边栏结构扁平化（方案 A/B，交互增强落地后另评估）、目录内容重组、命令面板/快速切换器、`astro.config.mjs` 中 `sidebar` 数组的数据结构调整（本设计只新增 `components.Sidebar` 注册与 `head` 脚本注入项）。

## 交互规则

| 操作 | 行为 | 说明 |
|---|---|---|
| 点击分组标题 | 该 `<details>` 原生切换后，**所有后代分组同步为同一状态** | 点开 Java → 基础/中级/高级 + 全部分类一次铺开；再点整棵收起 |
| hover/focus 分组行 | 行内出现子树开合按钮（双箭头图标） | 目标态：子树中存在收起的分组则全部展开，否则全部收起；`preventDefault` + `stopPropagation`，不触发行切换 |
| 触屏（`hover: none`） | 子树按钮常显（降低透明度） | 移动抽屉内同样可用 |
| 工具条「全部展开」 | 侧边栏全部 `<details>.open = true` | — |
| 工具条「全部收起」 | 全部置 false，**保留当前页所在链路** | 与 Starlight"当前页链路始终展开"的默认哲学一致，避免失去位置感 |
| 页面加载 | 按 localStorage 恢复各分组开合状态 | 无记录的分组维持 SSR 默认（当前页链路展开） |

键盘可达：summary 上的 Enter/Space 产生合成 click，子树联动行为一致；子树按钮为 `<button>`，可 Tab 聚焦，`focus-visible` 时显现。

## 技术方案

沿用仓库既有两类模式：**组件覆盖**（同 `Footer.astro`）与 **head 注入运行时脚本**（同 `mermaid-interact.js`）。

| 组件 | 变更 | 职责 |
|---|---|---|
| `src/components/starlight/Sidebar.astro` | 新增覆盖，在 `astro.config.mjs` 的 `components.Sidebar` 注册 | 侧边栏顶部渲染工具条 `<div class="sl-sidebar-tools">`（两按钮），下方沿用默认实现（`SidebarPersister` + `SidebarSublist`，经包导出 `@astrojs/starlight/components/*` 引用，已验证 exports 含 `./components/*`） |
| `public/scripts/sidebar-tree.js` | 新增，经 `starlight.head` 注入 | ① 委托 click 监听 summary 完成子树联动；② 向每个 summary 注入子树按钮；③ 工具条事件；④ localStorage 状态读写与恢复 |
| `src/styles/custom.css` | 追加 | 工具条与子树按钮样式，仅用现有黑白主题令牌（`--sl-color-*`） |
| `astro.config.mjs` | `components.Sidebar` 注册 + `head` 数组追加脚本项 | — |

### 持久化设计

- 存储：`localStorage['ascension:sidebar-tree']`，值为 `{ v: 1, open: { "<祖先链标签>": boolean } }`。
- 键规则：祖先分组标签以 `/` 连接（如 `编程语言/Java/基础/并发编程`），解决「基础」「中级」「Agent」等跨方向/同级重名撞键；侧边栏结构调整后旧键自然失效，残留键无副作用（体积忽略不计）。
- 写入时机：任何分组状态变化（行点击、子树按钮、工具条）后全量写回。
- 与原生层关系：保留 Starlight 原生 `sessionStorage` 持久化不改动。恢复顺序为原生（解析期 custom element）→ 本地（module 脚本，解析完成后执行），键冲突时本地层优先生效；两层意图一致时无感知。

### 行为细节与边界

- 子树联动在原生 toggle 之后执行（读取切换后的 `open` 作为目标态），后代同步为纯 DOM 布尔赋值，145 组全量开合无性能问题。
- 无后代分组的分类（叶分组）点击行为与现状一致，脚本对空子树为无操作。
- 「学习路线」等链接、图谱页/笔记页其余区域不受影响。
- 无 JS 环境完全回退为现状：工具条渲染但点击无操作，原生 `<details>` 行为不变。
- 依赖 Starlight 内部组件的覆盖实现若在未来版本失效，构建期即报错（import 失败），不会静默破坏线上行为。

## 风险与未决项

| 项 | 说明 | 处理建议 |
|---|---|---|
| 覆盖组件拷贝默认实现 | `Sidebar.astro` 覆盖需复刻默认 13 行结构（Persister/Sublist 组合），Starlight 大版本升级可能位移 | 已验证 0.42.0 exports 可达；升级时构建报错即知，按新结构修补 |
| 双持久化层语义 | 原生 sessionStorage 与本地 localStorage 并存 | 本地层后执行优先；原生层保留意味着回退脚本后仍有一定持久化能力 |
| 全部收起的范围 | 是否保留当前页链路 | 已定为保留（见交互规则），实施时以预览实测为准 |

## 验证

1. `pnpm build` 必须通过；
2. `pnpm preview` 手测五项：
   - 点击「Java」子树全部展开，再点全部收起；
   - 工具条全部展开/全部收起（收起后当前页链路仍在）；
   - hover 子树按钮仅作用于该组，触屏模拟下按钮常显；
   - 换页、新开标签页、重启浏览器后展开状态保持；
   - 移动端抽屉内工具条与子树按钮可用。
