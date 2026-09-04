# Ascension 学习知识库 · 设计文档

- 日期：2026-09-04

- 状态：已确认（方案 A）

- 仓库：`git@github.com:Loadhao/ascension.git`

## 1. 目标

个人学习知识库：覆盖 Linux、Java、Python、AI、通用工具等多个方向，沉淀知识要点，
支持思维导图、架构图、流程图、时序图、交互式知识图谱等多种可视化形态。

### 核心诉求

1. **写作轻**：内容以 Markdown 为主，图表直接用 Mermaid 语法写在正文里
2. **访问方便**：公网免费托管（GitHub Pages），手机端体验良好
3. **可导出 PDF**：浏览器打印 → 存为 PDF，图表完整呈现
4. **项目轻量**：纯静态站点，无后端、无数据库

## 2. 技术选型（方案 A，已确认）

| 关注点  | 选择                            | 说明                                       |
| ---- | ----------------------------- | ---------------------------------------- |
| 框架   | Astro 5 + Starlight           | 文档站框架，默认零客户端 JS，构建产物纯静态                  |
| 交互组件 | React（@astrojs/react）         | 知识图谱等交互场景用 React 岛屿（client:visible 按需水合） |
| 图表   | rehype-mermaid（构建时渲染）         | Mermaid 代码块在构建时渲染为内联 SVG，移动端零额外 JS       |
| 知识图谱 | cytoscape + cytoscape-fcose   | 交互式力导向图，节点可拖拽，可点击跳转对应笔记                  |
| 搜索   | Starlight 内置 Pagefind         | 中文分词友好，构建时生成索引                           |
| 部署   | GitHub Actions → GitHub Pages | push 到 main 自动构建发布                       |

### 备选方案记录

- **astro-mermaid**（客户端渲染）：零构建依赖、维护最简，但带图表的页面需加载约 300KB 的 mermaid 库。若未来构建链路（playwright/chromium）维护成本过高，可切换到该方案，内容无需改动。

- **MkDocs Material**：纯 Markdown 写作体验最好，但交互式图谱实现生硬，已排除。

- **VitePress**：Vue 生态，中文搜索体验一般，已排除。

## 3. 项目结构

```
ascension/
├── astro.config.mjs            # 站点配置（base、侧边栏、Mermaid 插件）
├── src/
│   ├── content/docs/           # 知识内容主体
│   │   ├── index.mdx           # 首页（splash 模板 + 方向入口卡片）
│   │   ├── guide/              # 写作指南（Mermaid 图表模板等）
│   │   ├── linux/              # 方向目录，index 为方向首页（含交互图谱）
│   │   ├── java/
│   │   ├── python/
│   │   ├── ai/
│   │   └── tools/
│   ├── components/
│   │   └── KnowledgeGraph.tsx  # Cytoscape 力导图 React 组件
│   ├── data/graphs/*.json      # 各方向知识图谱数据
│   ├── styles/custom.css       # 图谱容器样式 + 全局打印样式
│   └── content.config.ts       # Starlight 内容集合
├── public/favicon.svg
└── .github/workflows/deploy.yml
```

## 4. 内容规范

- 每个方向一个目录，方向内自由嵌套子目录（如 `java/jvm/`）

- 方向首页 `index.mdx`：概述 + 交互式知识图谱 + 学习路线

- 每页 frontmatter 必填 `title`、`description`

- 侧边栏按目录自动生成（autogenerate），方向内层级自由

- 图表语法模板集中放在 `guide/diagrams`，写作时直接复制

## 5. 可视化体系

| 类型                          | 方式                                                                                      |
| --------------------------- | --------------------------------------------------------------------------------------- |
| 流程图 / 时序图 / 思维导图 / 类图 / 状态图 | 正文写 ` ```mermaid ` 代码块，构建时渲染为 SVG                                                       |
| 知识图谱（交互力导图）                 | 每方向一份 `src/data/graphs/<方向>.json`，方向首页嵌入 `<KnowledgeGraph client:visible data={...} />` |

### 知识图谱数据格式

```json
{
  "nodes": [{ "id": "jvm-gc", "label": "垃圾回收", "href": "/java/jvm/gc/", "group": "JVM" }],
  "edges": [{ "source": "jvm-gc", "target": "jvm-memory", "label": "依赖" }]
}
```

- `href` 可选，填写后节点带金色描边、点击跳转（组件内自动拼接站点 base 路径）

- `group` 决定节点颜色（同组同色）

- 边的 `label` 可选，标注关联关系

## 6. 移动端与 PDF

- 移动端：Starlight 自带响应式布局（汉堡菜单、自适应目录），无额外开发

- PDF：全局打印样式（`custom.css` 的 `@media print`）——隐藏导航/侧边栏、内容全宽、
  深色主题自动切换为浅色、图表/代码块不跨页截断；任何页面「打印 → 存为 PDF」即可

## 7. 构建与部署

- 包管理：pnpm；Node ≥ 20

- Mermaid 构建时渲染依赖 chromium：本地首次需 `pnpm exec playwright install chromium`，
  CI 中由 workflow 自动安装（含系统依赖）

- 部署：push `main` → GitHub Actions 构建 → 发布 GitHub Pages
  （仓库 Settings → Pages → Source 选择 GitHub Actions，需手动开启一次）

- 访问地址：`https://loadhao.github.io/ascension/`

## 8. 非目标（明确不做）

- 不做评论、用户系统、数据库、后端

- 不做多语言 i18n（内容即中文）

- 不做博客时间线组织（按知识树组织）

- 不做 PWA 离线（后续有需要再加）

