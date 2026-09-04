# Agent 开发规范

## 基本原则

- 遵循仓库现有结构、命名和工具链；作用域内有更近层级的 `AGENTS.md` 时，以其规则为准。

- 保留现有文件、用户改动和历史约定；除非任务明确要求，不删除、覆盖或大范围重排。

- 只创建当前任务必需的文件和目录，优先沿用已有位置，不生成空骨架或重复规范。

- 新增顶层目录或源码根前，先确认是否已被现有结构覆盖；未覆盖时先在本文补充说明。

- 行为变化时同步相关测试和已有文档；使用仓库已有方式完成最小充分验证。

## 项目结构约定

| 内容     | 路径                             | 说明                                        |
| ------ | ------------------------------ | ----------------------------------------- |
| 知识内容   | `src/content/docs/<方向>/<等级>/<分类>/` | 五级架构：方向 → 等级（basic/intermediate/advanced）→ 分类 → 知识点 |
| 交互组件   | `src/components/`              | React 岛屿（KnowledgeGraph.tsx、learn/ 学习组件）  |
| 学习数据聚合 | `src/lib/notes.ts`             | 构建期从内容集合聚合方向/等级/分类/笔记结构             |
| 学习状态存储 | `src/lib/learn.ts`             | localStorage 状态圆点存储与事件同步             |
| 图谱数据   | `src/data/graphs/<方向>.json`    | 与方向目录一一对应                                 |
| 全局样式   | `src/styles/custom.css`        | 黑白主题令牌、学习组件样式、Mermaid 与打印样式             |
| 站点配置   | `astro.config.mjs`             | 手动嵌套侧边栏、Footer 覆盖、Mermaid 插件、base 路径    |
| 部署流水线 | `.github/workflows/deploy.yml` | push main 自动构建发布 GitHub Pages            |

## 内容写作约束

- 新笔记使用 Markdown（`.md`），需嵌入 React 组件时才用 `.mdx`；文件名用小写中划线（kebab-case）。

- frontmatter 必填 `title` 与 `description`；笔记可加 `level`（basic/intermediate/advanced，须与目录等级段一致）、`core`（boolean，核心知识点标记）、`status`（planned/learning/mastered，作者整理状态，读者学习状态在浏览器端不入 frontmatter）。

- 五级结构：`<方向>/<等级>/<分类>/<知识点>.md`。分类目录含 `index.mdx` 分类页（正文写分类简介 + `<CategoryNotesIsland categoryId="<方向>/<等级>/<分类>" />`）；方向首页 `index.mdx` 放 `<RoadmapIsland directionId="<方向>" />`；同分类下知识点按文件名字典序排列，学习顺序敏感时用数字前缀（如 `01-thread-life.md`）。

- 内容集合 loader 会把 index 文件的 id 规范化为目录路径（`<分类>/index.mdx` → id `<分类>`），`src/lib/notes.ts` 依赖此规则聚合，勿改动该约定。

- 图表直接在正文写 ` ```mermaid ` 代码块，构建时渲染为 SVG，禁止引入客户端图表脚本。

- 新增分类时三处同步：`<方向>/<等级>/<分类>/index.mdx` 分类页 + `astro.config.mjs` 侧边栏对应等级组内注册（分类项加 `badge: '分类'`）+ 知识点笔记放入该目录（笔记页底部 ProgressMark 由 Footer 覆盖自动注入，无需手写）。

- 新增方向时四处同步：建目录与 `index.mdx` 路线图 + `astro.config.mjs` 侧边栏注册 + `src/data/graphs/` 建图谱数据 + `src/lib/notes.ts` 的 `DIRECTION_ORDER` 追加方向 slug。

- 新笔记关联图谱：在对应方向 JSON 补节点（`href` 填笔记路径，如 `/java/advanced/jvm/memory/`）与关联边。

## 构建与验证

- 包管理器为 pnpm；禁止提交 lockfile 之外的依赖变更说明。

- 本地验证：`pnpm build` 必须通过；涉及组件改动时用 `pnpm preview` 实测交互。

- Mermaid 构建时渲染依赖 chromium，本地首次需 `pnpm exec playwright install chromium`。

- 部署在 push 后由 GitHub Actions 完成，不在本地执行部署命令。

## 文档与落点

| 内容           | 路径                                     | 约定                                                                                          |
| ------------ | -------------------------------------- | ------------------------------------------------------------------------------------------- |
| 内部文档         | `docs/`                                | 沿用现有分类，没有实际内容时不创建占位文件                                                                       |
| 接口文档         | `docs/api/`                            | 一个稳定对外入口一份文档，索引只做导航                                                                         |
| 接口案例         | `docs/api/example-接口文档.md`             | 新接口文档参考其结构，不改写 example                                                                      |
| 设计规格         | `docs/superpowers/specs/`              | 参考 `YYYY-MM-DD-example-<slug>.md` 案例；真实设计用 `YYYY-MM-DD-<slug>.md`                           |
| 实现计划         | `docs/superpowers/plans/`              | 参考成对 `YYYY-MM-DD-example-<slug>.md` 案例；真实计划用 `YYYY-MM-DD-<slug>.md`                         |
| 设计资产（Widget） | `docs/superpowers/specs/<feature-id>/` | L2/L3 界面变更的视觉契约：`manifest.json` + `spec.md` + `matrix.md` + `after/widget.html`；获批前不改生产界面代码 |

真实设计与计划文件不得覆盖 example；同一路径已存在文件时不得覆盖。设计资产结构参考 `docs/superpowers/specs/example-direction-cards/`，其 `manifest.json` 的 `confirmed` 字段为审批依据。
