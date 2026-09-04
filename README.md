# Ascension

个人学习知识库：多方向（Linux、Java、Python、AI、工具等）、多技能知识储备，
支持思维导图、架构图、流程图、时序图与交互式知识图谱。

## 技术栈

- [Astro 7](https://astro.build) + [Starlight](https://starlight.astro.build) — 文档站框架，构建产物纯静态
- [React](https://react.dev) 岛屿 — 交互式知识图谱（[Cytoscape](https://js.cytoscape.org) 力导图）
- [rehype-mermaid](https://github.com/remcohaszing/rehype-mermaid) — Mermaid 图表构建时渲染为 SVG
- Pagefind — 中文友好的全文搜索
- pnpm + GitHub Actions — 自动部署到 GitHub Pages

## 快速开始

```bash
pnpm install                              # 安装依赖
pnpm exec playwright install chromium    # Mermaid 构建时渲染依赖（首次）
pnpm dev                                  # 本地开发 http://localhost:4321/ascension/
pnpm build                                # 构建静态站点到 dist/
pnpm preview                              # 本地预览构建产物
```

## 写笔记

1. 在 `src/content/docs/<方向>/` 下新建 `.md` 文件，frontmatter 写 `title` 与 `description`
2. 图表直接写 ` ```mermaid ` 代码块，语法模板见站内「指南 → 图表写作指南」
3. 需要交互组件时用 `.mdx`
4. 更新方向知识图谱：编辑 `src/data/graphs/<方向>.json`，`href` 指向笔记路径的节点可点击跳转
5. 提交 push 后自动部署

## 目录结构

```
src/
├── content/docs/    # 知识内容（按方向分目录）
├── components/      # React 交互组件
├── data/graphs/     # 各方向知识图谱数据
└── styles/          # 自定义样式与打印优化
```

## 文档

- [设计文档](docs/superpowers/specs/2026-09-04-ascension-design.md)
- [Agent 开发规范](AGENTS.md)
- [接口文档索引](docs/api/README.md)

## 部署

push 到 `main` 触发 GitHub Actions 自动构建发布。
访问地址：`https://loadhao.github.io/ascension/`（需在仓库 Settings → Pages 开启 GitHub Actions 来源）。
