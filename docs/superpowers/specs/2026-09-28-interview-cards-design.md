# 面试考点卡（Interview Cards）设计

日期：2026-09-28 · 状态：**已实现（第 215 轮，用户当场拍板形态 A 并定向「Java 后端 + AI 优先、前端排最后」）** · 决策人：用户（形态选 A：可刷的考点卡岛屿）

## 0. 一句话目标

新增一种面向「说得出话」的内容形态：**每道面试考点卡回答三件事——面试官为什么这么问、
这题该怎么答、答完会被往哪追问**，并可像自测题库一样按主题逐张刷，且无人值守每轮都按车道
补齐、由闸门保证不漏不掺水。

## 1. 与站内既有三层「问答」的分工（不得含糊）

| 形态 | 回答什么 | 读者动作 | 位置 |
| --- | --- | --- | --- |
| 高频追问速答（笔记内小节，119 篇） | 「这个问题答案是什么」 | 篇内查阅 | 各笔记正文尾部 |
| 速答手册（25 主题分组、427 行条目） | 「全站八股的一句话索引在哪」 | 扫读 + 跳笔记 | `/guide/interview-cheatsheet/` |
| 自测题库（694 题 / 33 方向） | 「我记住的是不是对的」 | 选择、判定、错题本 | `/guide/quiz/` |
| **面试考点卡（本次新增）** | **「他为什么这么问、我该怎么说出口、说完会被追问什么」** | **先自述、再对照参考答话、再练追问** | `/guide/interview/` |

与速答手册的硬边界：手册只给**一句话结论**，考点卡给**问答意图 + 可背答话 + 追问预判**三段；
考点卡**不复述手册**，每条都必须写出手册里没有的「为什么这么问」。

## 2. 数据结构

`src/data/interview/<方向>.json`，文件名即方向 slug，与 `src/data/quiz/` 同构、可增量提供，
顶层为 `{ "cards": [ ... ] }`。每条固定七字段（顺序即落盘顺序）：

| 字段 | 含义 | 硬约束 |
| --- | --- | --- |
| `id` | `<方向>-<主题>-ic-<三位序号>`，如 `java-aqs-ic-001` | 全站唯一 |
| `noteId` | 内容集合 entry id（不带等级段之外的猜测） | 必须指向真实 `.md`/`.mdx`（写错只静默 404） |
| `group` | 主题分组名 | 必须命中速答手册的 25 个主题 `## ` 标题之一（中文原样；手册第 26 个 `## 使用建议` 不是主题，脚本按「只取带表格行的分组」或显式排除该标题处理，且解析出的分组数须 ≥20，否则判红——防手册改动后空分组集合假绿） |
| `difficulty` | 1–5 | 整数，沿用题库五档星口径（1 概念识别 … 5 生产权衡） |
| `q` | 面试官原话 | 非空、≤60 字 |
| `intent` | **为什么这么问**：这一问在筛什么、暴露什么短板、区分度在哪 | CJK ≥15 字 |
| `answer` | **参考答话（可背）**：3–5 句成段口语，含结论先行与关键数字 | CJK ≥40 字 |
| `followup` | **追问预判**：他接下来会问什么 + 一句应对口径 | CJK ≥15 字 |

内容红线（对齐 AGENTS.md 与用户「不废话、不潦草」的要求）：

1. 事实一律取自 `noteId` 指向的笔记正文；**正文没写的不进考点卡**（宁可少出，不外推、不编数字）。
2. 字段按纯文本渲染，**不得出现反引号与 `**`**（与题库同一条已实测的渲染口径）。
3. `answer` 必须是「说得出话」的成段口语，不写 bullet 关键词堆砌；每条至少落一个具体机制、
   参数或可查的数字，否则视为潦草。
4. `intent` 不得复述 `q`，不得写成「考的是 X」这类零信息句。
5. 同篇多张卡考点不得重合（闸门按中文最长公共连续段判红，机制与题库第 9 项同款）。

## 3. 页面与组件

- 侧边栏「指南」组新增第 4 项 **「面试考点卡」** → `/guide/interview/`（`astro.config.mjs` 手工注册）。
- `src/content/docs/guide/interview.mdx`：frontmatter（title/description）+ 一句导读 + `<InterviewIsland />`。
- `src/components/interview/InterviewIsland.astro`：构建期 `import.meta.glob('../../data/interview/*.json')`
  聚合为按方向的 banks，并调 `lib/notes.ts` 的 `getSiteData`/`toNavSiteData` 取方向标题与顺序，
  以 `client:load` 传给 `Interview.tsx`。
- `src/components/interview/Interview.tsx`（React 岛屿，仿 `quiz/Quiz.tsx` 的组织但不共用状态）：
  - 视图只有两个：**setup**（按主题分组勾选 + 难度上限筛选 + 已刷进度读数）与 **card**；
  - 一张卡三段**逐级展开**：默认只露 `q`；点「看问答意图」露 `intent`；点「看参考答话」露
    `answer` 与 `followup`——顺序即「先自述、再对答案」；
  - 卡片底部：`noteId` 链回完整笔记（外链一律 `target=_blank` 不适用，站内链接同页）、「下一张」、
    「标记待复习」、⭐ 收藏；
  - 右侧栏保持默认目录（不改 `starlight/TableOfContents.astro`，不抢 quiz 的导航分支）。
- `src/lib/interview-store.ts`：localStorage key `ascension-interview-state-v1`，存
  `{ seen: Record<id, ts>, starred: Record<id, ts>, review: Record<id, ts>, scope: { groups, maxDifficulty } }`，
  纯 TS、无 React 依赖，写穿并广播 `ascension:interview-change`（模式仿 `lib/quiz-store.ts`）。
- 样式写进 `src/styles/custom.css`，颜色只用既有主题令牌，不新增硬编码色。

## 4. 质量闸门（「不漏」的机制）

新增 `scripts/interview-verify.mjs`，并入 `package.json` 的 `verify:docs` 链（`pnpm verify:docs`
由 26 项增至 **35 项**：一致性 10 + mermaid 语法 + 考点卡 9 + 题库 9 + 影像 7）：

1. 考点卡文件对应真实内容方向（文件名须是 `src/content/docs/` 下的方向目录）；
2. JSON 可解析、`cards` 为数组；
3. `id` 全站唯一；
4. `noteId` 指向真实笔记；
5. `group` 命中速答手册主题分组标题集合（两处主题名不得分叉；集合为空或 <20 即判红）；
6. 七字段齐全 + 三段字数下限（`intent`/`answer`/`followup` 按 CJK 计 ≥15/40/15）、`q` 长度上限、
   `difficulty` 为 1–5 整数；
7. 禁裸露 markdown 记号（字段值里出现反引号或星号加粗即判红——题库已实测这条：字段按纯文本渲染）；
8. 同篇考点不重复（中文最长公共连续段判红，附 `KNOWN` 存量清单与空转守卫）；
9. **覆盖率空转守卫（「不漏」的机制）**：按 `lib/notes.ts` 的方向清单现算「哪些方向零考点卡」，
   缺卡方向逐条打印。**首批 6 张只覆盖 java 与 ai 两个方向，若直接判红会让其他车道每次
   `verify:docs` 都过不了**，故与题库第 9 项同一做法：本轮把缺卡方向清单作为脚本内 `KNOWN`
   存量登记放行，**每轮 E 车道补卡必须同步删项**，清单里的方向本轮已有卡却不删 → 判红
   （防清单静默过期）；待清单清空后收紧为无条件判红。

## 5. 无人值守接入（改配方车道表）

`docs/evolution-recipes.md` §1 车道表由 `mod 5` 改 **`mod 6`**：

| `n mod 6` | 车道 | 本轮产出 | 单轮上限 |
| --- | --- | --- | --- |
| 1、4 | A 新章节 | 1 篇笔记 + 三件套 | ≤4 文件（roadmap 条目 6） |
| 2 | B 影像资产 | 1 条配音视频或图卡 | ≤5 文件、媒体 ≤6 MB |
| 3 | C 题库 | 3 道题 | ≤4 文件 |
| 5 | D 体检与工具 | 1 项真实修复或闸门增强 | ≤4 文件 |
| **0** | **E 面试考点卡** | **2 张考点卡** | **≤4 文件（卡可跨方向文件）** |

- E 车道文件预算（沿用题库车道的记账法）：≤4 个 = 考点卡数据文件 + `coverage-deepening.md`
  的 e 类队列销号/追加；`docs/evolution.md` 轮次记录属台账类、与既有各车道一样**在车道上限之外
  另计 1 个**；若一轮内需要动组件或闸门（少见），按 §3 的 D 车道规则改走 D 轮。

- E 车道取点源：`docs/coverage-deepening.md` 新增 **e 类：考点卡队列**（记「哪个主题缺、
  拟出哪张、宿主笔记」），每轮销号并按 §4 第 9 项的空转方向追加；
- 配方 §1「每轮必含内容增量」的硬约束不变，E 车道主产出本身就是内容增量；
- 同步改 `AGENTS.md`：结构表加「考点卡数据 / 考点卡存储 / 考点卡闸门」三行、验证条数读数、
  内容写作约束里补一条「考点卡字段纯文本、事实须有笔记出处」；
- **代价（已向用户如实说明并获批）**：A 新章节由每 5 轮 2 篇降为每 6 轮 1 篇，D 由 1/5 降为 1/6。

## 6. 首批种子（本次交付 6 张，Java 后端 + AI 优先，前端不铺）

| 卡 | 宿主笔记 | 主题分组 | 一句话考点 |
| --- | --- | --- | --- |
| `java-aqs-ic-001` | `java/intermediate/concurrent/05-aqs` | Java 并发 | 「说说 AQS 的原理」——筛的是能否讲清 state + 队列两件事与模板方法边界 |
| `java-tl-ic-002` | `java/intermediate/concurrent/06-threadlocal` | Java 并发 | 「ThreadLocal 为什么泄漏、线程池下会怎样」——筛的是是否知道泄漏要两个条件同时成立 |
| `mysql-idx-ic-003` | `mysql/basic/core/04-index-design` | MySQL | 「联合索引 (a,b,c) 怎么定顺序」——筛的是能否报出可查的数字与 sys 视图 |
| `mysql-mvcc-ic-004` | `mysql/intermediate/transaction-lock/01-transaction-mvcc` | MySQL | 「RC 和 RR 到底差在哪」——筛的是 ReadView 生成时机这一句是否说准 |
| `ai-vllm-ic-005` | `ai/intermediate/llm/06-vllm` | AI 与大模型 | 「vLLM 凭什么比直接推理快」——筛的是知不知道瓶颈在显存带宽、两类碎片各是什么 |
| `ai-hallu-ic-006` | `ai/intermediate/llm/12-hallucination` | AI 与大模型 | 「你们线上怎么压幻觉率」——筛的是能否把成因和处置分开讲 |

每张卡的 `intent`/`answer`/`followup` 逐条回正文取证写；写完跑 `pnpm build` →
`pnpm verify:docs`（含新闸门 9 项）→ 本机 Playwright 1440×900 真机过一遍逐级展开、收藏与
待复习落盘、`noteId` 链接 200。

## 7. 验收清单

- [ ] `pnpm build` 通过，新页 200，侧边栏「指南」组含新项且一致性闸门第 2 项不判红；
- [ ] `scripts/interview-verify.mjs` 9 项全绿，并已并入 `pnpm verify:docs`（**35 项**）；
- [ ] 反向验证：注入一条缺 `followup` 的卡、一条 `noteId` 写错的卡、一条 `group` 拼错的卡
      → 闸门逐项判红且退出码非 0；把某条卡的 `answer` 改成含反引号 → 第 7 项判红；
      在 `KNOWN` 缺卡清单里塞一个本轮已有卡的方向 → 第 9 项判红「清单过期」；
- [ ] 真机：6 张卡逐级展开顺序正确（意图与答话默认收起）、答话文本与 JSON 逐字相等、
      收藏/待复习刷新后仍在、`noteId` 链 200、选项区与正文零横向溢出、未播种访问零 JS 错误；
- [ ] 配方 §1 车道表改 `mod 6` 后，`node scripts/evolution-candidates.mjs --round n` 一整圈
      （0–5）打印的车道与配方逐格一致；
- [ ] `docs/evolution.md` 与 `docs/coverage-deepening.md` 登记本形态落地与 e 类队列起点。

## 8. 非目标（本轮明确不做）

- 不做前端（vue/react/typescript/js）方向的种子卡；
- 不与自测题库共用存储或组件；不在 quiz 页加「考点卡」入口（避免一个页面两套状态）；
- 不引入 AI 生成内容、不引第三方依赖、不改 lockfile；
- 不动既有速答手册与笔记小节的内容（只做新增，不重写他人内容）。
