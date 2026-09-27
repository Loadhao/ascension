# 项目演进状态

> 由 apex-project-evolution 维护，人可随时修改；技能每轮读写，手改内容视为最新事实。

## 当前阶段目标

- 阶段：内容体系充实 + 教学形态升级（「可用版本」已达成：构建通过且已部署 GitHub Pages；尚无真实用户数据，无法进入「验证有人需要」）
- 目标描述：让站点成为结构自洽、核心技术方向内容成体系的知识库——每轮在补内容、修问题、改善体验中按证据选择一项最小改进，保持全站一致性体检全绿；自 2026-09-23 起并把教学形态从「看图文」扩到「可看可听」（配音视频 / 导出图卡），每轮按配方车道轮转推进。
- 自 2026-09-25 起（用户指令）再加一条硬约束：每轮必含一项面向读者的内容增量（新章节 / 考题 / 速答手册新行 / 新图），不允许只加影像或只改工具脚本；车道表已把 B 的一格还给 A（配方 §1）。
- **内容优先级真源＝`docs/content-roadmap.md`**（用户 2026-09-25 定向：Java 为主方向要补更多 +
  高级工程师必备知识；三条轴广度/均衡/深度全选）。本文件此前所述「若用户另有人工规划（如
  内容路线图），人工修改本文件即视为最新事实」现在有了落点：**A 车道（新章节）选题以 roadmap
  §2 当前批次为第一优先**，本文件「候选项」表与 `evolution-candidates.mjs` 退为兜底池；
  下方候选项 1 的薄弱方向判断以 roadmap §1/§4 为准，不在本处重复维护清单。
- 每轮作业规范：`docs/evolution-recipes.md`（车道与游标、尺寸上限、降级阶梯、停止条件）。定时任务「知识库无人值守演进」（id `automation-4de032f7-1d5d-4d08-9ae5-6d0597df30bc`，每天 03/09/15/21 点 17 分，自动提交推送；2026-09-27 由用户重建，替代旧记录中的 `98552cee-4538-44d5-9ad0-78915438976e`，Automations 面板可查、到期需续）每次触发只推进一轮，本文件的「轮次记录」是唯一全局编号真源；要暂停去 Automations 面板 disable 本任务。
- 完成标志（全部可自动验证）：
  1. `pnpm build` 通过；
  2. 一致性体检通过：侧边栏 link 零死链、已提交笔记全部注册进侧边栏（guide 元文档除外）、图谱 href 零死链、方向目录与图谱 JSON 一一对应、图表与可视化数据零硬编码颜色；
  3. Mermaid 全站双主题对比度审计 0 处低于 4.5:1（运行 `node scripts/mermaid-contrast-verify.mjs`）；
  4. 题库与影像资产体检全绿（`pnpm verify:docs` 含 `quiz-verify` 8 项与 `media-verify` 7 项）：题目字段自洽、noteId 可达、媒体文件已登记且不超体积闸门；
  5. 出现必须由真实用户数据裁决的方向性决策时，本阶段视为到达边界，转入待用户决策。

> ⚠️ 首次运行说明（2026-09-08，无人值守）：以上阶段目标由演进技能基于仓库证据自行确定，**待用户确认**。依据见下方事实表；若用户另有人工规划（如内容路线图），人工修改本文件即视为最新事实。

## 项目事实与证据

| 事实 | 来源 | 置信度 | 采集时间 |
| --- | --- | --- | --- |
| 项目为 Astro+Starlight 面试八股知识库，27 个内容方向目录、330 篇已提交笔记、侧边栏 453 个 link | 代码扫描脚本 | 高 | 2026-09-08 |
| `pnpm build` 基线通过（exit 0） | 构建结果 | 高 | 2026-09-08 |
| 一致性体检全绿：侧边栏零死链、图谱零死链、方向-图谱一一对应；仅 guide/diagrams 与 guide/resources 两个元文档不在侧边栏（属写作指南/资源页，判定为有意设计） | 代码扫描脚本 | 高 | 2026-09-08 |
| 无 `status: planned` 占位笔记，无 <15 行骨架笔记 | grep + find 扫描 | 高 | 2026-09-08 |
| 近 15 条提交全部为内容补充类（feat），主工作面是内容扩张 | Git 历史 | 高 | 2026-09-08 |
| 存在并行会话未提交改动：astro.config.mjs（注册「网络」方向+mysql online-ddl 条目）、graphs/js.json、graphs/mysql.json、graphs/redis.json、java/js/mysql/redis 下 11 篇未提交笔记——本轮起一律绕开，仅提交自身文件 | git status + git diff | 高 | 2026-09-08 |
| 无未推送提交 | git log origin/main..HEAD | 高 | 2026-09-08 |

## 假设

- 假设：guide/diagrams、guide/resources 不进侧边栏是有意设计（元文档，面向作者而非读者）。（验证方式：待用户确认；低风险不阻塞）
- 假设：部分已提交笔记未在对应方向图谱中有节点指向（图谱覆盖度 <100%）。（验证方式：脚本比对 git ls-files 与各图谱 JSON 的 href；第 1 轮量化）
- 假设：站点主要价值在内容本身，读者为准备面试的开发者。（验证方式：需真实用户数据，当前无法验证，相关决策记入待用户决策）

## 候选项

排序依据：目标贡献（1–5）× 证据置信度（0–1）÷ 成本与风险（1–5）；阻塞项置顶。

> 2026-09-08 第六次启动末重置：第一版候选表（第 1 轮建）所列事项已全部落地或退场，按现状重置如下。

| 候选项 | 类型 | 贡献 | 置信 | 成本/风险 | 得分 | 状态 |
| --- | --- | --- | --- | --- | --- | --- |
| 1. **（2026-09-25 更新：本行的薄弱方向判断改由 `docs/content-roadmap.md` §1 能力地图与 §2 当前批次接管，下列文字保留作历史沿革与证据）**按大纲勘察继续补薄弱方向内容（候选池：**react 方向最薄**（第 171 轮实测仅 3 篇、无 intermediate 层，本轮 +1 篇至 4 篇，续篇候选见轮次记录）、**mysql 方向 13 篇但索引主题第 175 轮前仅 1 篇总览——用户 2026-09-25 显式定向该主题「篇章太少、考题太简单」，第 175 轮已补「怎么用」1 篇，仍缺「设计实战」篇**、ai/python 内部分类、linux/git/tools 工程向；rabbitmq/docker/etcd/mqtt/nginx/middleware 均已勘察为覆盖扎实） | 补功能 | 4 | 0.9 | 2.5 | 1.44 | 待办（宁缺毋滥） |
| 2. core 星标全站策略：36 个分类核心占比过高（星标失去区分度）——是否降标属内容判断，涉及各会话既有意图 | 修问题 | 3 | 0.3 | 2 | 0.45 | **待用户决策**（见待决策区） |
| 3. 移动端/打印样式实测（需 preview 实测，sidebar 组件常被并行会话占用） | 改善体验 | 2 | 0.4 | 3 | 0.27 | 待办 |
| 4. 需求验证类动作（SEO/分享卡片/统计埋点） | 验证需求 | — | — | — | — | 暂不开发：需真实用户数据支持决策，阶段边界条件 |
| 5. 体检工具脚本化收尾：`pnpm verify:docs` 已串起 consistency + mermaid-syntax + quiz + media 四脚本（第 170 轮实测 25 项打勾：一致性 10 + 题库 8 + 影像 7，另 mermaid 531 块）；剩 `mermaid-contrast-verify` 因依赖 preview 在跑仍单独执行——是否并入一键入口待裁决 | 改善体验 | 2 | 0.8 | 2 | 0.8 | 部分完成 |
| 6. 代码块「每行 ≤80 视觉列」纸面约束：第 176 轮**已修完按此规则判出的全部 4 行**（86/86/83/82 列，复扫 0 行、真机 4 页零溢出）；但同轮量出**规则常数本身偏松**——代码块实际 14.4px、ASCII 字宽 8.656px、容器可用 674px ⇒ 上限是 **77.9 列**，故全站仍有 **70 处代码块 / 57 页**需横向滚动（最宽行 682~724px）而它们按 ≤80 判为合格。**第 179 轮三路复验为真**（`overflow-x: auto` 计算样式 + 按 `div.ec-line` 逐行量宽 + 截图留证）；第 178 轮记录的「重扫全站得 0 行真溢出」**不采信**——它自述的基线陷阱正是假阴性成因（拿被内容撑开的 `<code>` rect 当可用宽度） | 修问题 | 3 | 0.98 | 2.5 | 1.18 | 部分完成（4 处已修；余 57 页待用户裁决路线） |
| 7. CI 只跑 `pnpm build`，不跑 `pnpm verify:docs`（`.github/workflows/deploy.yml` 第 170 轮核验无体检步骤）——25 项静态闸门全部依赖本地纪律，并行会话漏跑即静默入库；接进流水线属对外 CI 改动。**第 189 轮把这条从「会漏跑」升为「实测漏过」**：并行会话 `1e5abec` 的提交信息自述「verify:docs 25 项全绿」，但该提交自身引入的死链（`07-redisson.md:151` 等级段写成 `intermediate`）使本会话开工实测为 **exit=1、一致性第 5 项判红**，而流水线照常构建发布 GitHub Pages——即「自述已跑绿」与「入库态绿」可以不一致，且当前无任何机制能发现这种不一致（只能靠下一个会话开工复跑） | 修问题 | 4 | 1.0 | 2 | 2.0 | **待用户决策**（见待决策区） |
| 8. ~~`media-encode` 回填行打印 730 因 `probe` 未限定流选择器~~ 第 176 轮复跑未能复现（单次观察归因不成立），不改脚本；留作观察项：影像成片尺寸与登记不符时以 `ffprobe -select_streams v:0` 或浏览器 `videoWidth/videoHeight` 实测为准 | 修问题 | 1 | 0.2 | 1 | 0.2 | 已降级（未复现，不再占 D 队列） |
| 11. 缩进写法的 mermaid 围栏被两道静态闸门整块漏检：`consistency-verify` 第 10 项与 `mermaid-syntax-verify` 用行首锚定正则 `^```mermaid`，列表项内缩进书写的围栏不匹配。实测严格锚定 **538 块 / 411 篇**、容忍 `^[ \t]*` 缩进 **559 块 / 412 篇**，差 **21 块**分布在 **2 个文件**（`guide/diagrams.mdx` 20 块示例、`tools/basic/cli/03-jq.md` 1 块正文图示）。这些围栏**确实会渲染成读者看到的 SVG**（`dist/tools/basic/cli/03-jq/index.html` 含 `id="mermaid-`，而源文件按严格正则算「无围栏」——第 181 轮 dist 比对时暴露为唯一「有图无围栏」页），后果是该块既不过语法校验也不进硬编码颜色审计。改法：两处正则统一放宽为 `^[ \t]*`，预期块数 538 → 559，落地前先确认那 21 块无 `fill:`/`%%{init}` 且语法可 parse | 修问题 | 3 | 0.95 | 1.5 | 1.9 | 待办（D 队列，第 181 轮实测入队） |
| 12. 站内已有动画的媒体派生队列：候选由 `node scripts/evolution-candidates.mjs --top 20` 每轮现算；第 182/187/192 轮已完成 `redisson-watchdog`/`kafka-segment`/`es-write`，每片 ≤60 秒 / ≤4 MB。B 轮口径（第 192 轮实证）：10 帧级动画可直接开做，逐帧文稿去空白 ≤30 字、以中文为主、含英文标识时逐句实测语速，「须先精简帧说明正文」的前置已作废 | 改善体验 | 3 | 0.9 | 2 | 1.35 | 进行中（已完成 3 项，队列余 **37** 支，头部 `java-classload`、`kafka-producer`、`redis-sentinel`；**第 197 轮游标二次落到 B 仍因本机管线阻断未产出**，见第 15 行与「待用户决策」） |
| 13. `media-encode` 封面不带 PNG 压缩参数会撞 `media-verify` 的 150 KiB 上限（第 187 轮 kafka-segment 首跑 154,031 B 实证），同轮登记判红文案 `0.15MB > 0.15MB` 读不出超限量级的缺陷——封面命令补 `-pred mixed -compression_level 12`（无损，256 色量化属有损不取）、判红改按字节打印，第 189 轮已落地并对 6 张在仓封面双跑回归（解 raw 后 md5 一致、像素零改动） | 修问题 | 3 | 0.95 | 1 | 2.85 | **已完成（第 189 轮）** |

| 14. `scripts/evolution-candidates.mjs` 车道游标建档即 off-by-one（余数 4 打成 B、余数 0 打印为空；git 逐字节取证自建档 `dbf9468` 未改过，非回归，D 轮此前靠会话按配方自行解读）——第 195 轮改为按余数显式建表 `LANES`（0→D、1/4→A、2→B、3→C，键即 `n mod 5`，与配方 §1 逐格同构；位置数组会随改表静默错位故不取）并补 `--round n` 覆盖参数（覆盖时明示「未读台账」、非整数 `exit 2`），一整圈余数回归与配方 §1 逐格一致 | 修问题 | 3 | 1.0 | 1 | 3.0 | **已完成（第 195 轮）** |
| 15. **Windows 机器迁移残留（第 196 轮现场勘察）**：本仓 2026-09-27 起出现第一个 Windows 会话（用户级 `core.autocrlf=true`、无 `.gitattributes`，`git ls-files --eol` 读数 `i/lf w/crlf`）。本轮已修 `verify:docs` 侧 4 处（`consistency-verify.mjs` 两处按 `\n` 锚定的读入加行尾归一、`mermaid-syntax-verify.mjs` 同、`media-verify.mjs` 与 `evolution-candidates.mjs` 的 Windows 绝对路径动态 import 改走 `pathToFileURL`）→ 25 项绿、565 块真读数。**未修的四处残留**：① `media-encode.mjs:45` 同型绝对路径 import，B 车道产法工具在 Windows 一跑即崩（修法照本轮）；② `mermaid-contrast-verify.mjs:30` 围栏正则仍 `\n` 锚定——CRLF 检出下会读 0 块并打印「0 处低于 4.5:1」的**假绿**，动图表的轮次用该审计前必须先修（修法=本轮同款读入归一，POSIX LF 行为不变）；③ 本机无 ffprobe（ffmpeg），`media-verify` 第 4 项音轨/时长核验空转（本轮实测 ⚠「未找到 ffprobe，跳过」），属环境动作非改码；④ B 车道配音依赖 macOS `say`，本管线在 Windows 整体不可用——已提请「待用户决策」。①②各 1 文件、修法明确，为 D 队列首选。**第 197 轮①二次复现**：`node scripts/media-encode.mjs --demo mysql-2pc-video` 实跑仍崩 `ERR_UNSUPPORTED_ESM_URL_SCHEME ... Received protocol 'd:'`，同轮实测本机 `ffmpeg`/`ffprobe`/`say` 三者皆缺 ⇒ 第 ④ 项由推断升为实测，B 车道在本机连续两轮（197 游标 2）无合格候选 | 修问题 | 4 | 1.0 | 1.5 | 2.67 | 待办（D 队列，第 196 轮实测入队；①经第 197 轮二次复现） |

历史已完成项存档：图谱覆盖度补全（第 1 轮，100%）、Mermaid 对比度审计（第 2 轮，零违规）、frontmatter/内链/分类页导读/图谱结构体检（第 3/4/6/19 轮，均全绿并固化为 scripts/consistency-verify.mjs）、方向内容补全（第 5/7/8/9/10/11/12/14/15/17/20 轮，16 篇 + 5 分类）、工具固化（第 16 轮）、状态文件整理（第 18 轮）。

## 轮次记录

> 2026-09-27 体量压缩：第 190 轮及更早记录压缩为每轮单行（保留轮次号/日期/车道与真实性标注/一句核心结论；
> 第 1–100 轮的一句事实按压缩前时点的 git 历史 `4a36479` 补回）。完整详录与过程细节见本次压缩前的 git 历史，
> 不恢复；最近 5 轮（191–195）保留详录；「候选项」「经验与判断沉淀」「待用户决策」三区块未压缩。
> **2026-09-27 第 197 轮增量压缩**：本轮记录追加后端面 156,632 字节（152.96 KiB）越过 §7 的 150KB 闸门，按同一红线把第 191、192 两轮压为单行（记录头一字未改），上一行所述「最近 5 轮（191–195）保留详录」自本次起失效，最近 5 轮＝193–197；详情见 git 历史。

### 第 197 轮（2026-09-27，车道 C 题库｜游标本为 B，B 在本机无合格候选按 §3 降级 B→C 并如实登记｜题库深化第 72 轮）：推理参数 / Token 成本 / 工具集设计三篇第二题——把第 190 轮的三条首题考点往「输出边界与生产口径」再推一层

- 取号与车道：开工 `git pull --ff-only` → `Already up to date`（当时 HEAD `4a0bee2`，与 `origin/main` 同 sha、无未推送提交）；开工 `git status --porcelain` 两项 dirty，全是他人未提交改动（`docs/evolution.md` 的「体量压缩」、`docs/evolution-recipes.md` 新增 §7），本轮起对这两个文件不 stage 对方任何字节。基线 `pnpm verify:docs` **exit 0、25 项全绿**（一致性 10 + mermaid 语法 565 块 + 题库 8 项 673 题 + 影像 7 项 8 资产；影像第 4 项按脚本既有设计打印 ⚠「未找到 ffprobe，跳过」），不触发 §0.3 的强制 D。台账最大号实读 **196**（`grep -c "^### 第"` 口径），本轮取 **197**；`node scripts/evolution-candidates.mjs --top 8` 打印「下一轮 = 第 197 轮，197 mod 5 = 2 → 车道 **B 影像资产**」，与配方 §1 逐格一致。
- 退位原因（B 无合格候选，四条实测非推测）：① 本机 `command -v ffmpeg` / `ffprobe` / `say` **三者皆缺失**；② `node scripts/media-encode.mjs --demo mysql-2pc-video` 实跑崩在 `media-encode.mjs:45` 的绝对路径动态 import，报 `ERR_UNSUPPORTED_ESM_URL_SCHEME ... Received protocol 'd:'`——即候选表第 15 行①自第 196 轮登记后**二次复现**；③ 配方 §2 的 B 产法明写「`media-capture` → `media-encode` → 回填真实尺寸时长」，第二环在本平台断链即整条断链；④ 曾认真评估改走 §1 允许的另一产出「导出图卡」（不需要配音与 ffmpeg），读 `scripts/media-capture.mjs` 全文后**主动放弃**——该脚本只导逐帧序列（`NNN.png` + manifest）供 encode 消费，全站唯一图卡 `mysql-2pc-card` 系其源动画末帧的派生物（`git log --diff-filter=A -- public/images/mysql-2pc-card.png` 实读为管线建档提交 `4f904be` 同批入库），本轮若出图卡只能自创一条配方里没有的手工产法，且「图卡只在这张图要出现在站外的文档里时才导」这一选型前提无任何出站需求证据支撑，按 §3「凑数的低质内容不是产出」不予采纳。**主车道为 B 时，A→B→C→D 的下一个有证据车道 = C**（A 是上一格而非下一格）。
- 定界（**本轮出现形态变化，如实登记**）：作业中途并行会话把上述两处 dirty 自行收口并提交推送——`716a869`（只含 `src/styles/custom.css`）与 `4baf289`（`docs/evolution.md` 297KB→138KB 压缩 + `docs/evolution-recipes.md` §7），HEAD 由 `4a0bee2` 移到 `4baf289`、`origin/main` 同步。核对这两次提交**均未触及**本轮自有路径（`git show --name-only` 实读），台账因此转为干净可提交，**第 196 轮的 index 重建路线本轮不再需要**、按普通 pathspec 提交。同时新曝出三项对方在途改动（`src/components/GlobalGraphIsland.astro`、`src/components/KnowledgeGraph.tsx`、`src/styles/custom.css`），本轮一律不碰、不 stage。`git diff --numstat` 复核自有两文件全程纯净：`src/data/quiz/ai.json` **60 增 / 0 删**、`docs/coverage-deepening.md` **5 增 / 3 删**。两文件工作区行尾为 CRLF（`i/lf w/crlf`），写回沿用 CRLF 以免行尾噪声进 diff。
- 选题证据（配方 §2：C 候选一律现算，不手工维护清单）：勘察脚本实读「笔记 562 篇｜题库 **472** 篇有题｜动画 44 支｜影像 8 个」，A 兜底双缺池 **22**、纯文字无图 89、有图但零题 68、B 队列 37、**C 队列 25**；取 C 队列头部三条。逐条核实为真缺口：按 `noteId` 统计实读三篇**各仅 1 题**（`ai-infparams-046` / `ai-tokencost-047` / `ai-tooldesign-048`，均 multiple、difficulty 4，首题由第 190 轮补齐），首题考点分别是「temperature 动分布形状 vs top_k/top_p 裁候选集的分工 + 两旋钮不该同时猛调」「输入量大 vs 输出单价高谁是大头 + O(n²) 根源 + 提示缓存固定前缀条件」「四原则做法配对（拆分判据、何时不用、错误分类）」，与队列指定的第二题角度无一重合；三篇均 `core: true`、`level: intermediate` 与目录一致，宿主路径逐一比对 `src/content/docs/` 实存 `.md` 文件确认非笔误。
- 内容要点（`src/data/quiz/ai.json` 纯追加三题，键序沿用文件尾部既有形态 `id|noteId|type|q|options|answer|hint|difficulty`）：**`ai-infparams-052`** 考「解码方式与输出控制旋钮」——正确项落「贪心每步取最大概率 token、稳定可复现只是它的倾向、代价是车轱辘话，采样多样性正来自那份随机性」「max_tokens 与 stop 序列与 temperature、top_k/top_p 不同类：不改分布形状也不裁候选集，只划硬性输出边界，属防跑飞必配」「重复惩罚给已出现 token 降概率、调过头误伤专有名词」；错项取正文明确反对的说法——把抽取/分类/结构化/代码放进 0.8~1.2 高温档（速查表配的是 0~0.3 尖锐档）、把「线上第一诉求」说成文采（正文：稳定可预期不是文采，生产默认低温）。**`ai-tokencost-053`** 考「降本四招各自落点与 token 估算口径」——正确项落系统提示的乘法结构（几千 token × 每天百万次调用才是真实量级，故能表格化的压成表、能外置的走工具按需取）、限制输出因输出单价高而立竿见影、裁历史压摘要且不得反过来把窗口用满（O(n²) + lost in the middle）；错项取「粗估口径已够写预算」（正文：不同分词器有偏差，精确要用官方 tokenizer 计数器、做预算必须实测）与「分级路由按输入长度分流」（正文判据是任务复杂度）。**`ai-tooldesign-054`** 考「能量化、能重试、能接第三方」——正确项落评测集「任务 + 应选工具」一致率并改描述前后跑对比、读类天然幂等而写类必须做成同参数重复执行结果不变（重试机制的前提）、MCP 生态参差要先审描述与错误行为再包一层暴露；错项取「内部试用两周没选错就说明描述够用、评测集是厂商的事」与「写类幂等交给模型重试前先查一次兜底」。**三题 fact 全部取自各篇正文与「高频追问速答」，无新增事实**；答案下标与 hint 的人类序号逐条对账（052 = 第 1/2/5 项、053 = 第 2/3/5 项、054 = 第 1/2/4 项），三题正确项下标互不相同以免形态泄漏。
- 一处与首题 hint 的撞车自查（如实登记，不掩盖）：写题前逐条比对过三支首题的 **hint 文本**，发现 `ai-infparams-046` 的 hint 已把「重复惩罚调过头误伤专有名词」「temperature=0 只是近似贪心、严格复现要固定 seed 并接受近似确定」讲过一遍，`ai-tooldesign-048` 的 hint 也带过「写类工具要幂等是重试前提」「描述变更要跑评测集回归」——队列指定的第二题角度有一部分**已在首题的答错讲解里露出**。处置：保留这些角度（它们确属该篇正文、且首题的**考点**未覆盖），但 052 的正确项措辞改为考「机制与代价的配对」而非复述结论，并在 052 的 hint 里主动钉死「倾向 ≠ 保证」，防止它的第 1 项被读成与 046 第 4 项错答互相矛盾；未为回避撞车而另选更弱的角度。**留给用户/后续判断**：若这类撞车成为常态，「新题红线」宜补一条「考点须与该笔记既有题的 hint 亦不重叠」——属配方/队列规则变更，本轮不自行改规。
- 尺寸（如实记账）：内容 **2 文件**（`src/data/quiz/ai.json` + `docs/coverage-deepening.md`）≤ C 车道 ≤4；加台账 `docs/evolution.md` 共 3 个，与第 190/193 轮同形态，未越限。
- 验证数字：`pnpm build` **743 页 / 45.78s**（pagefind 743 HTML，与第 195/196 轮同页数——本轮只加题目不改页面）；`pnpm verify:docs` **exit 0、25 项全绿**（一致性 10 项：侧边栏 740 条 link 零死链、已提交笔记 559 篇全部注册、图谱死链 0 / 覆盖率 100%、178 个 index 页无空壳、mermaid 565 块 + viz 数据 5 份硬编码颜色 0 处；mermaid 语法 565 块全部有效；题库 8 项 **676 题**（自有 +3：id 全局唯一 / noteId 可达 / difficulty 1~5 整数 / 选项 2~5 项 / 答案下标与题型自洽 / 每题有 hint）；影像 7 项 8 资产、public 媒体 6.36MB / 上限 60MB，第 4 项仍因本机无 ffprobe 打印 ⚠ 跳过、不伪装成全验）；构建产物核验：三条新题 id 各命中 `dist/guide/quiz/index.html` **1** 处（未被静默丢弃）。开工前查并发：本机 `Win32_Process` 只读到一条 `astro.mjs preview`（4321 在跑、按请求读 dist）、**无并发 build**，故本轮构建独占 dist。本轮未改任何图表、动画与媒体，按 §4.1 不触发双主题对比度审计（该审计在本平台另有第 15 行②的 CRLF 假绿盲区，修前读数不可信）。⚠ 如实登记：**未做作答页真机端到端**，与第 196 轮同一判——三题与第 190/193 轮同组件、同数据结构，题库 8 项绿 + dist 命中为其下限证据。
- 台账体量（配方 §7 于本轮首次触发，两阶段读数如实报）：开工 HEAD `4baf289`（对方刚把台账 297KB→**141,305 字节**压完）；本轮记录追加后涨到 **156,632 字节（152.96 KiB）**，越过 §7 的「约 150KB」闸门，故同轮执行**增量压缩**——第 191、192 两轮详录压为单行（记录头一字未改、轮次号未动），压缩后端面 **137140 字节（133.93 KiB）**，闸门回落至安全区。「轮次记录」标题下按 §7 补了一行增量压缩说明，并显式声明对方那行「最近 5 轮（191–195）保留详录」自此失效。**下一轮开工照旧先复测字节数**，越线即按 §7 执行（红线：不改轮次号、不给缺号轮次虚构补齐，「候选项」「经验与判断沉淀」「待用户决策」三区块不参与压缩；已压缩过的单行不再扩写）。
- 候选项表本轮状态：第 **12** 行（B 队列）追加「游标二次落 B 仍因本机管线阻断未产出」的读数；第 **15** 行① 追加本轮二次复现的崩溃原文，并把第 ④ 项「B 管线在 Windows 不可用」由推断升为实测；「待用户决策」新增一条——B 车道游标已二次落到本机不可执行的产法，请裁决三条路线（装 ffmpeg + 换可插拔 TTS 凭据 / 授权图卡走手工产法并补选型前提 / 在配方 §1 给 B 加平台前提使余数 2 直接并入 C），推荐第三条。第 **11** 行（缩进围栏漏检）与第 6/7 行本轮未触及。
- 队列销号与追加（`docs/coverage-deepening.md`，5 增 / 3 删）：a 类头部三条销号；追加 3 条第二题角度——`java/intermediate/concurrent/06-threadlocal`、`java/basic/collection/03-concurrenthashmap`、`java/intermediate/concurrent/05-aqs`。选点口径现算（临时脚本跑完即删，口径可复算）：**`core: true` ∩ 全站题数恰为 1 ∩ 不在队列** 共 **161** 条，其中 java 方向 **33** 条（用户 2026-09-25 定向 Java 为主方向，故优先取它），三角度取自各篇未被首题触及的章节（ThreadLocal：弱引用是止血带而非泄漏成因 / InheritableThreadLocal 为何在线程池失灵 / 开放寻址 + 0x61c88647；CHM：get 不加锁的两处 volatile / 禁 null 键值的二义性 / size() 弱一致与 CounterCell 分摊 / ForwardingNode 对 put 与 get 的分流；AQS：置 SIGNAL 防丢失唤醒 / 被唤醒≠拿到锁 / selfInterrupt 与不可中断模式 / 公平只差一个 `hasQueuedPredecessors` / 同一块 state 在四把工具类的不同解释）。销追后 a 类余 **10** 条（4 第一题 + 6 第二题）、队列总条目维持 **25**（a 10 / b 2 / c 1 / d 12），「已完成记录」补「第七十二轮（第 197 轮｜车道 C｜题库深化第 72 轮）」对齐两套编号。
- 下一轮入口：**第 198 轮，198 mod 5 = 3 → 车道 C 题库**（连续两轮 C：197 是 B 退位而来、198 是真 C，游标与实做首次一致）。① 取点已被本轮角度占好——照队列写 java 三篇第二题即可，三篇正文本轮已通读、角度已核对不与各篇首题重叠，无需重勘。② **不构成退位理由**：C 队列有 25 条，§3 只在主车道取不到合格候选时才退位，别再从 C 退到 D。③ 台账体量闸门（§7）每轮开工先复测字节数。④ 第 194 轮留账仍未清：`react/index.mdx` 方向首页写着「当前覆盖基础 · 核心概念」，未提中级层与 `intermediate/state` 分类——A 车道落点时顺手一行改掉。⑤ D 队列首选第 **15** 行①②（各 1 文件、修法照第 196 轮的读入归一 + `pathToFileURL`）、次选第 **11** 行（围栏正则放宽 `^[ 	]*`，538 → 559 块口径在 CRLF 下要复测）；A 兜底池双缺 22 条（头部 `ai/intermediate/llm/12-hallucination`）、纯文字无图 89、有图但零题 68；B 队列 37 支原地不动（等用户对第 15 行④与本轮新增待决策条裁决）。⑥ **开工纪律（Windows 版）**：`git pull --ff-only` → `git status --porcelain` 定界（当前对方在途工作面是 `src/components/GlobalGraphIsland.astro`、`src/components/KnowledgeGraph.tsx`、`src/styles/custom.css`，以及可能再起的台账压缩）→ pnpm 不在 PATH 时先看 `~/AppData/Roaming/npm` → `pnpm verify:docs` 基线 → `node scripts/evolution-candidates.mjs --top 8` → 复算台账最大号 +1 → 查 `Win32_Process` 有无并发 `astro.mjs build`；commit 前最后一刻再核 `git diff --cached`，若 `docs/evolution.md` 又被他人未提交持有就回到第 196 轮的 index 重建路线。

### 第 196 轮（2026-09-27，车道 D 体检与工具｜游标本为 A，基线不绿按配方 §0.3 强制走 D）：本仓第一个 Windows 会话——修掉三道闸门「本机假红/假绿/崩溃」（4 文件），`verify:docs` 从 exit=1 回到 25 项全绿；附双缺池头部篇首题

- 取号与车道：`git pull --ff-only` → `Already up to date`（HEAD `af06292`）；开工 `pnpm verify:docs` 首跑**不绿**——`consistency-verify` 第 6 项 frontmatter **假红 559 篇**（逐篇抽查 title/description 全在）、第 10 项打印「mermaid **0 块**」假绿（上轮真读数 565），`mermaid-syntax-verify` 与 `media-verify` 直接崩溃 `ERR_UNSUPPORTED_ESM_URL_SCHEME ... Received protocol 'd:'`，仅 `quiz-verify` 8 项 672 题绿。台账最大号实读 195，本轮取 **196**；196 mod 5 = 1 → 游标本为 **A**，但 §0.3「不绿 → 本轮直接算 D 车道（修基线优先于一切新产出）」，实做 **D**、勘察脚本打印的「196 → A 新章节」仅游标参考。开工环境三缺（均属本机首跑，环境动作不入库）：无 pnpm → `npm i -g pnpm@11.18.0`（对齐 `packageManager`）；无 node_modules → `pnpm install --frozen-lockfile`；无 Playwright chromium → `pnpm exec playwright install chromium`（mermaid-syntax 首跑即因 `Executable doesn't exist ... ms-playwright` 崩，装后真跑 565 块）。
- 根因归因（实测非推测，两类缺陷分开修）：**行尾类**——`git config core.autocrlf` 读数 `true`、仓根无 `.gitattributes`、`git ls-files --eol` 抽样读数 `i/lf w/crlf`（索引 LF、工作区 CRLF），闸门脚本按 LF 锚定：`consistency-verify.mjs:88` `/^---\n…\n---/` 整类失配 → frontmatter 假红（第 7 项 level 校验同被连坐空置），同文件 `:141` 与 `mermaid-syntax-verify.mjs:27` 的 `` /^```mermaid\n/ `` → 0 块假绿。**平台类**——ESM `import()` 在 Windows 拒收反斜杠绝对路径（`media-verify.mjs:18/19`、`evolution-candidates.mjs:35/36`），与行尾无关、POSIX 一直没事。改法：行尾类**读入即归一**（`.replace(/\r\n/g,'\n')`，两种检出都判真、LF 环境行为逐字节不变），平台类**绝对路径过 `pathToFileURL(...).href`**。
- 定界（并行会话全程在场，形态与既往不同）：收尾写台账时发现对方会话**当日对 `docs/evolution.md` 做了未提交的「体量压缩」**（190 轮及更早记录压成单行，-613 行；候选表第 14 行也被压成摘要版——与其自述「候选项区块未压缩」不符，如实登记、不替对方改）。本轮对该文件**一字不动、不 stage 其任何字节**：台账入库走第 189 轮固化的 **index 重建**路线——`git show HEAD:` 取基线 → 对基线施加本轮三处插入（锚点取两版本共有的子串，逐处断言命中 1 次、断言待入库 blob 不含对方「体量压缩」标记 0 次）→ `hash-object -w` → `update-index` → 普通 commit 只吃 index；工作树保持对方版本原样，对方压缩留待其自行收口。**提醒**：对方下次收口压缩提交前必须 `git pull` 重放，否则会整体回退本轮台账增量。**本轮其余自有路径 5 个**（4 脚本 + `src/data/quiz/ai.json`），开工与收尾两次 `git status --porcelain` 的 dirty 面恰为本轮 6 项、无他人文件。
- 选题证据（体检输出即候选池，配方 §2）：修好四道后全绿，另登记 4 处本机实测残留为候选表新行 **15**（`media-encode.mjs:45` 同型 import 崩溃、`mermaid-contrast-verify.mjs:30` 的 CRLF 假绿盲区、ffprobe 缺失致音轨核验空转、B 车道 `say` 依赖 macOS 不可用——第 ④ 项提请待用户决策）。勘察命令（其 import 崩溃即本轮修复对象，修后本平台首跑成功）`node scripts/evolution-candidates.mjs --top 8` 实读：「笔记 562 篇｜题库 471 篇有题｜动画 44 支｜影像 8 个」，双缺池 **23**（头部 `ai/basic/agent/05-guardrails`）/ 纯文字无图 89 / 有图零题 68 / B 队列 37 / C 队列 25。
- 内容增量（配方 §1 硬约束，D 车道附 1 道考题）：`src/data/quiz/ai.json` 纯追加 **`ai-guardrails-051`**（multiple、`difficulty: 3`，`git diff --numstat` 复核 **20 增 / 0 删**），宿主取双缺池头部 `ai/basic/agent/05-guardrails`（`core: true`，补前 `grep -c guardrails src/data/quiz/ai.json` 实跑 **0** 命中）——首题考机制主线：三个正确项落「注入根源=模型分不清数据与命令，间接注入（藏在读取内容里）比直接注入更危险」「护栏第一性原理=最小化授权+分层设防+失控可终止，攻击面的根源是权限」「删除/支付/对外发送须人工确认+全量工具调用留痕可回放」；两个错项取正文明确反对的说法——「给外部内容先做分类标注就能根除注入、无需多层防线」（速答：目前不能彻底解决、没有银弹）与「循环终止交给模型自判，迭代/预算/超时硬上限限制能力、可选装」（正文：上限是护栏不是体验优化，没刹车等于没有）。hint 补「读过外部内容自动升权是设计红线」、死循环/上下文滚雪球两类失控形态、写权限组合拳（worktree+白名单+dry-run+人工确认）与异常模式告警。**fact 全部取自该篇正文与速答，无新增事实**；basic 层首题按「3=原理理解」定档，未与 intermediate/advanced 篇齐平 4/5；`answer: [0,2,4]` 与 hint 人类序号逐条复核自洽。
- 尺寸（如实记账）：内容/工具 **5 文件**（4 脚本 + 题库）= D 车道 ≤4 上限 + 配方 §1 允许附加 1 题的 +1 余量，刚好用满；第 15 行的 ①② 两处 1 文件小修本轮**忍住未做**（不为凑产出越尺寸），留给下一个 D 轮。多出的 1 个仍是台账类（本文件），与第 173/179/187/189/190/191/193/194/195 轮记录的是同一处规范冲突，未自行改配方。
- 验证数字：`pnpm build` **743 页 / 4m42s**（本平台首跑通过；CRLF 工作区未伤及渲染——dist 实含 `id="mermaid-` SVG 的页面 **436**，与第 194/195 轮「dist 渲染出图 436」同数；pagefind 743 HTML）；`pnpm verify:docs` **exit 0、25 项全绿**（一致性 10 项：侧边栏 740 条 link 零死链、已提交笔记 559 篇全部注册、图谱死链 0 / 覆盖率 100%、178 个 index 页无空壳、**mermaid 565 块** + viz 数据 5 份硬编码颜色 0 处——第 10 项「0 块」假绿已恢复真读数；mermaid 语法 565 块全部有效（565 块×chromium 实跑，非 0 块空过）；题库 8 项 **673 题**（自有 +1，id 全局唯一 / noteId 可达 / difficulty 1~5 / 选项 2~5 / 答案下标自洽 / 每题有 hint）；影像 7 项 8 资产、public 媒体 6.36MB / 上限 60MB；第 4 项因本机无 ffprobe 按脚本既有设计打印 ⚠ 跳过并如实登记，不伪装成全验）。构建产物核验：新题 id 命中 `dist/guide/quiz/index.html` **1 处**。⚠ 如实登记：本轮**未做浏览器真机端到端**——本平台 4321 无在跑 preview、chromium 首装后真机链路未验证；新题的出题/判分红利依赖与第 193/195 轮同一组件同一数据结构（题库 8 项绿 + dist 命中为其下限证据），首个动作答页的轮次建议补真机读数。本轮未改任何图表与媒体，按 §4.1 不触发对比度审计（该审计在本平台还有第 15 行②的假绿盲区，修前读数不可信，双保险都不跑）。
- 候选项表本轮状态：新增第 **15** 行（Windows 迁移残留 4 处，①②为 D 队列首选、③环境动作、④转待用户决策）；第 11 行（缩进围栏漏检）未触及——注意它与第 15 行②是**两道不同闸门的同类正则盲区**；第 6/7 行仍待用户裁决。本轮有新增判红证据（开工基线 exit=1），已当场收口。
- 下一轮入口：**第 197 轮，197 mod 5 = 2 → 车道 B 影像资产，但 B 在本机管线受阻**（`media-encode.mjs:45` 绝对路径 import 必崩、`say` 不存在、无 ffmpeg——见第 15 行与「待用户决策」新增条目）。若届时无用户裁决，B 在本平台**无合格候选**，按 §3 降级阶梯（A→B→C→D）取 **C 车道**执行：C 队列头部三条（现算）`ai/intermediate/llm/04-inference-params` 第二题、`ai/intermediate/llm/05-token-cost` 第二题、`ai/intermediate/agent/16-tool-design` 第二题（a 类 10 + d 类 12 + b 类 2 + c 类 1 = 25 条）。D 队列首选第 **15** 行①②（各 1 文件、修法已写），次选第 **11** 行（围栏正则放宽 `^[ \t]*`，538→559 块口径在 CRLF 下同样要复测）。A 兜底池双缺入库后为 **22** 条（23−1，`05-guardrails` 补题出局，头部变 `ai/intermediate/llm/12-hallucination`）、纯文字无图 89、有图零题 68；`react/index.mdx` 首页「当前覆盖基础 · 核心概念」一行留账（第 194 轮②）仍未清。**开工纪律（Windows 会话版）**：`git pull --ff-only` → `git status --porcelain` 定界（重点盯 `docs/evolution.md` 是否又被并行压缩在途）→ 若 pnpm 不在 PATH 先看 `~/AppData/Roaming/npm`（npm 全局装，shell 不自动带）→ `pnpm verify:docs` 基线 → `node scripts/evolution-candidates.mjs`（本平台已可用）→ 复算台账最大号 +1；commit 前最后一刻再核 `git diff --cached`，遇 `evolution.md` 被他人未提交内容持有就走本轮的 index 重建路线，不走 pathspec 提交。

### 第 195 轮（2026-09-26，车道 D 体检与工具｜游标一致，未越车道）：修掉勘察脚本的车道游标（余数 0 从未打印出 D、余数 4 打成 B），并把五格回归做成可核对；附第 194 轮新篇首题

- 取号与车道：开工 `git pull --ff-only` → `Already up to date`（HEAD `7ee5605`）、`git status --porcelain` **干净**（无他人未提交改动需绕开）；`pgrep -fl "astro.mjs build"` 开工与收尾各实跑一次**均为空**（构建前未再单独复核，如实记口径）、作业全程 HEAD 未移动（收尾复算仍 `7ee5605`）；基线 `pnpm verify:docs` **25 项全绿**（一致性 10 + mermaid 565 块 + 题库 8 项 671 题 + 影像 7 项 8 资产），非「修基线」路径；勘察 `node scripts/evolution-candidates.mjs --top 8` 打印「笔记 562 篇｜题库 470 篇有题｜动画 44 支｜影像 8 个」、双缺池 23 / 纯文字无图 89 / 有图零题 69 / B 队列 37 / C 队列 25，并打印「**下一轮 = 第 195 轮，195 mod 5 = 0 → 车道 （空白）**」——这一行空白正是候选表第 14 行登记的第二处后果在本会话的**首次现场复现**（第 194 轮是在收尾复算时读到的）。台账最大号实读 194，本轮取 **195**，游标（`195 mod 5 = 0 → D`）与实做一致、**未越车道**；commit 前复算台账仍为 194（HEAD 未移动）。
- 定界：自有路径 3 个（`scripts/evolution-candidates.mjs` + `src/data/quiz/react.json` + 本文件）。开工 `git status --porcelain` 只有前两项（本文件在写记录时才 dirty），收尾复跑同样只有这三项；`astro.config.mjs`、`graphs/*.json`、`docs/coverage-deepening.md`、`docs/content-roadmap.md`、`guide/interview-cheatsheet.md` 本轮一律未碰（D 车道不改这五处）。端口 4321 上是并行会话 08:16 起的 `astro preview`（PID 38594、cwd 即本仓、按请求读 `dist/`），本轮**复用它**跑对比度审计与真机核验，未新起端口、未动他人进程。
- 选题证据（第 14 行由本轮两次实读支撑，非推测）：D 车道候选池按配方 §2「体检输出即候选池」——四道闸门开工即全绿，故落候选表里带证据的待办项，得分最高（3.0）且有本轮现场复现的是第 14 行。**溯源复跑**：`git log -L 48,48:scripts/evolution-candidates.mjs` 只有一条命中，即建档提交 `dbf9468`（`git log --diff-filter=A` 同一条），该行自建档一字未改 ⇒ 建档即错、非回归；`--round` 覆盖游标读到建档那版数组的行为可复算：余数 0 取 index 0 得 `''`（打印成「车道 （空）」）、余数 4 取 index 4 得 `'B 影像资产'`（与配方 §1 的 `1、4 → A` 冲突）、index 5 的 `'D 体检与工具'` 因 `% 5` 恒小于 5 而**永远取不到**。
- 修复要点（1 文件）：**未按第 14 行原写的「1 行数组」改法做**——位置数组本身就是这个 bug 的成因（下标与余数的对应关系全靠人肉数，配方 §1 改表时数组会静默错位，且 index 0 允许留空而无人报警）。改为按余数显式建表：`const LANES = { 0: 'D 体检与工具', 1: 'A 新章节', 2: 'B 影像资产', 3: 'C 题库', 4: 'A 新章节' }`，键即 `n mod 5`，与配方 §1 车道表逐格同构、一眼可对。真机打印改前的 `\n>>> 下一轮 = ...` 拆成 `${argRound === -1 ? '下一轮' : '游标核对（--round 覆盖，未读台账）'}`，`>>>` 前缀保留不动（历史记录多以该前缀引用此读数）。
- 附带把「回归」做成可执行（同文件，+6 行）：第 14 行要求的五格回归（191→A…195→D）需要脚本按指定轮次读数，而它的轮次号取自 `evolution.md` 的最大值——**为一个打印去改共享台账不可接受**，故加 `--round n`：仅覆盖游标读数、不动其它池子，并在打印行明示「未读台账」以免被当成真号；入参非整数直接 `exit 2`（这是 CLI 边界，不做静默兜底）。**回归实跑读数**：190→D、191→A、192→B、193→C、194→A、195→D、196→A、197→B、198→C、199→A、200→D（一整圈五个余数全覆盖，且 194→A 与第 194 轮「按配方取 A」的事后判断互相印证）；不带 `--round` 的真实调用打印「下一轮 = 第 195 轮，195 mod 5 = 0 → 车道 **D 体检与工具**」；`--round abc` → `--round 需要一个正整数轮次号` + `exit=2`。
- 内容增量（配方 §1 硬约束，D 车道附 1 道考题）：`src/data/quiz/react.json` 纯追加 **`react-layer-008`**（`multiple`、`difficulty: 4`），宿主为第 194 轮新建的 `react/intermediate/state/01-context-vs-store`——补前**全站零题**（`grep -rn "01-context-vs-store" src/data/quiz/` 实跑 0 命中，该文件 7 题无一指向它），且它随第 194 轮入库即落入脚本「有图但零题」池（69 → 本轮补题后复跑为 **68**）。考点取该篇机制的四条主线，与既有 `react-memo-007`（考 memo 与引用稳定性）**不重叠加错项**：三个正确项分别落「服务端状态判据是能否由请求地址 + 参数唯一确定，故缓存/去重/后台刷新/失效判断该给缓存层而非全局 store」「Context 定义的主语是父组件，值仍由上层用 `useState`/`useReducer` 持有 ⇒ 它解决送达路径、不解决所有权」「`dispatch` 引用永久稳定，故单独拆一个 Context 后只提交动作的组件不随 state 醒」；两个错项取正文明确反对的说法——「`getSnapshot` 每次返回字段相同的新对象即可、React 按值比较快照」（官方硬约束是未变化时重复调用必须返回同一个值）与「不同 `createContext` 会互相覆盖，所以要合进一个 `value`」（官方 *different React contexts don't override each other*，这恰是拆多个 Context 成立的前提）。hint 补撕裂的官方处置（Transition 期间 store 被改 → 应用 DOM 前第二次调 `getSnapshot`，不一致则整次更新以 blocking 重跑）与 selector 记忆化/浅比较的因果。**fact 全部取自该篇正文，无新增事实**。
- 一次自我纠正（如实登记，不掩盖）：追加考题的第一次 Edit 因 `old_string` 取的是相邻条目 `react-memo-007` 的 hint 段，我在 `new_string` 里把它的措辞顺手改写了一遍（原文「官方定性 memo 是「性能优化，不是保证」」被我写成「官方定性 memo 是「性能保证」吗？不是，它是「性能优化，不是保证」」）——**这是对他人内容的静默改写，违反 AGENTS.md 第一条**。发现后立即按原文回改，并以 `git diff --numstat -- src/data/quiz/react.json` 复核为 **20 增 / 0 删**（纯追加）作为收口证据。**教训**：向数组尾部追加时，锚点应当只含「文件末尾的结构行」，把他人条目的正文整段搬进 `new_string` 等于给自己制造改写机会。
- 尺寸（如实记账）：内容/工具 **2 文件**（脚本 + 题库）≤ D 车道 ≤4 上限，附加的 1 题在配方 §1 给的 +1 余量之内；多出的 1 个仍是台账类（本文件），与第 173/179/187/189/190/191/193/194 轮记录的是同一处规范冲突，未自行改配方。
- 验证数字：`pnpm build` **743 页 / 21.49s**（pagefind 743 HTML，与第 194 轮同页数——本轮不加页面只加题目与工具）；`pnpm verify:docs` **exit 0、25 项全绿**（一致性 10 项：侧边栏 740 条 link 零死链、已提交笔记 **559** 篇全部注册、图谱死链 0 / 覆盖率 100%、178 个 index 页无空壳、mermaid 565 块 + viz 数据 5 份硬编码颜色 0 处；mermaid 语法 565 块有效；题库 8 项 **672 题**（自有 +1，id 全局唯一 / noteId 可达 / difficulty 1~5 / 选项 2~5 项 / 答案下标自洽 / 每题有 hint）；影像 7 项 8 资产、public 媒体 6.36MB / 上限 60MB）；构建期核验：新题 id 命中 `dist/guide/quiz/index.html` **1 处**（未被静默丢弃）。本轮未改任何图表与媒体，按配方 §4.1 不触发双主题对比度审计；因属 D（体检）车道仍复跑一次作健康度读数 → **410 页 × 2 主题 0 处低于 4.5:1**、读数自检「内容树带图笔记 436 / dist 渲染出图 436」两数相等（无第 190 轮那种假阴性），脚本另打印的 26 页「序列图/饼图选择器不覆盖」仍是候选表第 11 行的既有盲区。**真机端到端**（本机 Playwright 1440×900，非 600px MCP 视口，对 4321 上的新鲜 dist）：播种 `ascension-quiz-state-v1`（react 库其余 7 题标已刷、scope 只勾 `react`、关随机）后设置页如实打印「**已选 1 个方向 · 未刷 1 / 8 题**」，开一轮后题面与数据**逐字相等**、选项 **5** 项、徽标 `React / 多选`、难度星 **★★★★** 与 `difficulty: 4` 对应；只勾下标 3 提交判「**✗ 回答错误**」并渲染 **554 字** `.quiz-hint`、选项态如实标 `0/1/2:is-correct`、`3:is-wrong`、`4:is-dim`；重开勾 `0,1,2` 判「**✓ 回答正确**」且两个错项转 `is-dim`；「查看完整笔记」实测 `href=/ascension/react/intermediate/state/01-context-vs-store/` 且 `curl` **200**（分类页与作答页同 200）；`documentElement.scrollWidth` **1440** = 视口宽、`main pre` 横向溢出 **0** 处。⚠️ 如实登记：播种路径 2 次各触发 1 次 React #418（SSR 文本 vs 客户端首帧），与第 190/192/193 轮同因同判——**未播种访问实测 0 处 JS 错误**、设置页如实打印「已选 33 个方向 · 未刷 672 / 672 题」，属测试手段副作用、非本轮产品缺陷。临时核验脚本 `evolution-195-verify.mjs` 跑完即删，未入库。**入库态复跑自证**（第 189 轮记下的「自述已跑绿 ≠ 入库态绿」缺口，与第 194 轮同一处置）：`f6c8379` 推送后工作树干净，原样再跑 `pnpm verify:docs` → **exit=0、25 项打勾、题库 672 题**，与提交前读数逐项一致；复算游标实跑「下一轮 = 第 196 轮，196 mod 5 = 1 → 车道 **A 新章节**」，与配方 §1 逐格一致（本行即本轮修复的入库后首次真读数）。
- 候选项表本轮状态：第 **14** 行收口为「已完成（第 195 轮）」，并写明**落点与原改法不同**（余数显式建表 + `--round` 回归入口，理由如上）。第 11 行（缩进围栏 21 块漏检）本轮未触及，自本轮起是 D 队列首选；第 6 行（代码块宽度路线）、第 7 行（CI 不跑 `verify:docs`）仍是待用户裁决；本轮无新增判红证据（开工基线即全绿）。
- 下一轮入口：**第 196 轮，196 mod 5 = 1 → 车道 A 新章节**（本轮已修游标，脚本现打印与该判据一致；未来任意轮次可用 `node scripts/evolution-candidates.mjs --round n` 在不改台账的前提下核对游标）。①A 取点源：roadmap B1 十二条全 `done`、§3 复评明确 B2 不自动展开、§5 三项待裁决需用户拍板 ⇒ 退回兜底池，本轮复核实测「既无图又零题」**23 条**（头部 `ai/basic/agent/05-guardrails`、`ai/intermediate/llm/12-hallucination`，分布式 case-studies 若干属 §4 已饱和不写）、「纯文字无图」89、「有图但零题」**68**（+1 即本篇补题后从 69 降下来）。②第 194 轮留账未清：`react/index.mdx` 方向首页仍写「当前覆盖**基础 · 核心概念**」，未提中级层与 `intermediate/state` 分类——A 车道任何 react 落点请顺手一行改掉。③C 队列 a 类余 **10** 条（头部 `ai/intermediate/llm/04-inference-params` 第二题）、d 类 **12** 条；**`react/intermediate/state/01-context-vs-store` 的首题已由本轮补掉，故它没有登记在 d 类的第二题角度**——C 轮若续它，可取「拆 Context 的切分依据（变更频率 × 消费者集合）」「服务端状态判据的反例」「Vue 依赖收集与 React 把细粒度订阅外包给 store 层的范式分工」。④B 队列余 **37** 支，头部 `java-classload`、`kafka-producer`、`redis-sentinel`。⑤D 队列首选第 **11** 行（两道闸门的行首锚定正则 `^```mermaid` 放宽为 `^[ \t]*`，预期 538 → 559 块，落地前先确认那 21 块无 `fill:`/`%%{init}` 且可 parse）。⑥`astro.config.mjs`、`guide/interview-cheatsheet.md`、`docs/coverage-deepening.md`、`docs/content-roadmap.md`、`quiz/{ai,linux,distributed}.json` 本轮未碰，仍是对方高频工作面。**每轮开工照旧**：`git pull --ff-only` → 定界（含 `pgrep` 查并发 build）→ `pnpm verify:docs` 基线 → 勘察命令 → 复算台账最大号；**车道以配方 §1 表为准**（脚本游标本轮起已与其对齐，但台账被并行会话推进时读数仍会随对方走）；commit 前最后一刻再核 `git diff --cached`。

### 第 194 轮（2026-09-26，车道 A 新章节｜**勘察脚本打印为 B、配方 §1 判为 A，按配方执行并如实登记差异**）：新建 `react/intermediate/state` 分类与「状态管理与 Context」专篇——把「这份状态放哪一层」补成专篇

- 取号与车道：开工 `git pull --ff-only` → `Already up to date`（HEAD `b0e7a28`）、`git status --porcelain` **干净**（无他人未提交改动需绕开）；基线 `pnpm verify:docs` **25 项全绿**（一致性 10 + mermaid 563 块 + 题库 8 项 671 题 + 影像 7 项 8 资产），非「修基线」路径；勘察 `node scripts/evolution-candidates.mjs --top 8` 打印「笔记 561 篇｜题库 470 篇有题｜动画 44 支｜影像 8 个」、双缺池 23 条 / 纯文字无图 89 / 有图零题 68 / B 队列 37 支 / C 队列 25 条，并打印「**下一轮 = 第 194 轮，194 mod 5 = 4 → 车道 B 影像资产**」。**这一行与配方 §1 车道表冲突**：表已于 2026-09-25 把 B 的一格还给 A（`1、4 → A`），脚本第 48 行的游标数组仍是旧表。按「配方是每轮唯一作业规范、人工修改即视为最新事实」取 **车道 A** 执行，差异入候选表新增第 14 行待 D 轮收口；台账最大号实读 193，本轮取 **194**，commit 前复算仍为 194（HEAD 未移动、`pgrep -fl "astro.mjs build"` 开工与构建前各一次均空）。
- 定界：自有路径 5 个（新篇 + 新分类页 + `astro.config.mjs` + `graphs/react.json` + 本文件）。开工与收尾两次 `git status --porcelain` 都只有这 5 项；`docs/coverage-deepening.md`、`docs/content-roadmap.md`、`guide/interview-cheatsheet.md`、`src/data/quiz/*.json` 本轮一律未碰（A 车道不改这四类）。`astro.config.mjs` 是第 191 轮被并行会话整轮持有的高危面，本轮开工即干净、编辑前后各复核一次，全程无人在途。
- 选题证据（现算 + 独立复核，未手工维护清单）：A 车道第一优先源 `content-roadmap.md` §2 已清空（B1 十二条全 `done`），§3 复评明确「B2 不自动展开、§5 三项待裁决需用户拍板，在此之前 A 车道退回脚本候选池」——本轮照此退回兜底池，并按第 171 轮确立的口径使用它（那三条 A 清单列的是**已存在**的无图/零题笔记，与「1 篇笔记 + 三件套」的车道定义不重合，故只当**薄弱面线索**用，其自身补图补题归后续 A/C 轮，**未销号**）。双缺池 23 条里 `distributed/intermediate/case-studies/*` 6 条落在 roadmap §4 已饱和清单（系统设计案例群），不写；余下按「方向 × 层级」实测 `git ls-files`：**react 仅 4 篇且全部在 `basic/core`，intermediate 与 advanced 均为 0**，是前端主力方向里最薄的一面（对照 js 42 篇、typescript 7 篇）；grep 全站 `useContext|状态管理|Zustand|Redux|useRef|prop drilling` 命中 26 个文件**无一在 `src/content/docs/react/` 下**，即面试出场率最高的「状态该放哪一层 / Context 为什么带崩子树」零专篇。落点与第 171 轮「下一轮入口」留账 ③（react 仍无 intermediate 层，候选含「状态管理与 Context」）逐字吻合，属复核而非新造。
- 内容要点：新建分类 `react/intermediate/state`（分类页 + `01-context-vs-store.md`，344 行，`level: intermediate`、**不带 `core` 星标**——延续第 171/175/178 轮口径，以免加重候选项 2 的星标失真）。主线是「**四级台阶 + 每级欠下的账**」：①先划界——接口数据是**服务端状态**，其归属权四条官方原文（*persisted remotely…* / *shared ownership and can be changed by other people* / *can potentially become "out of date"*）决定了问题是缓存、去重、后台刷新、失效判断这一套，该给缓存层而非全局 store，判据落成「能否由请求地址 + 参数唯一确定」；②台阶图 + 代价表（就地 state → 提升 → Context → 外部 store，逐级写清「解决什么 / 新欠什么 / 该上的现场信号」）；③状态提升一级把官方五条 state 结构规则收到「存什么」两条上（能渲染时算的别存、*Keep ID or index in state instead of the object itself*），并用 ✕/✓ 对照码演示冗余 state；④**Context 是送达通道不是状态容器**——定义原文主语是 *the parent component*，据此点破「用 Context 管状态」在机制上不准确（它解决路径不解决所有权），并补最近 Provider 覆盖、不同 context 互不覆盖、值变则全员更新三条语义；⑤性能账：`value` 每次渲染都是新对象 + **`useContext` 没有 selector**，`memo` 拦不住（官方警示原文 *Skipping re-renders with `memo` does not prevent the children receiving fresh context values.*），与 04 篇「四类现场」第 3 类互认不复述；解法给稳住引用、拆多个 Context 的对照图，再往下一档写 `useReducer` 配 Context 且把 **dispatch 单独拆一个 Context**（依据官方 *The `dispatch` function has a stable identity*——只提交动作的组件不随 state 醒）；⑥外部 store 补的两块（精确订阅、React 之外可读写）+ Redux/Zustand/Jotai 三家**官方自我定位原文**选型表与 Redux 三原则原文；⑦`useSyncExternalStore` 讲清「为什么不手写 `useState`+`useEffect` 订阅」：撕裂的成因与官方处置原文（Transition 期间 store 被改则第二次调 `getSnapshot`、不一致就整次更新以 blocking 重跑），并把 *repeated calls to `getSnapshot` must return the same value* 落成读者能用的约束——selector 要记忆化、比较要浅比较；⑧配手写最小 store 代码、面试答法 5 问、要点备忘 8 条。2 张 mermaid（台阶主图 + 单/拆 Context 传播对照）、2 张表、5 段代码；侧边栏新增「中级 › 状态与数据流」组 2 条、图谱 `r-state` 节点 + 3 条边（`root`/`r-hooks`/`r-perf`）。
- 事实核验（不凭印象写，取得到原文才落笔）：9 处引文逐页 WebFetch 取回——react.dev `passing-data-deeply-with-context`、`reference/react/useContext`、`learn/choosing-the-state-structure`、`reference/react/useReducer`、`reference/react/useSyncExternalStore`、redux.js.org `introduction/getting-started`、Zustand 与 Jotai 的 GitHub README、TanStack Query overview。**两处主动不写**：(a)「Redux/Zustand 的订阅 hook 内部走 `useSyncExternalStore`」——两次核验请求被本机网络代理打成 403/404，取不到原文就不写，改为只讲该约束对读者自写 hook 意味着什么；(b) `useSyncExternalStore` 的**引入版本号与旧版 shim**——参考页摘录里没有版本行，正文只写「React 为订阅外部数据源提供的 hook」。延伸阅读 8 条链接全部为本轮实际取回成功的 URL（第 171 轮「凭印象写 URL 实测 404」、第 178 轮「官方源自相矛盾故不引数字」两条红线在本轮的执行形态）。
- 尺寸（如实记账）：内容 **4 文件**（新篇 + 分类页 + `astro.config.mjs` + `graphs/react.json`）正好用满 A 车道 ≤4 上限——本轮走兜底池，**不享**配方 §2 给 roadmap 条目的 6 文件例外；多出的 1 个仍是台账类（本文件），与第 173/179/187/189/190/191/193 轮记录的是同一处规范冲突，未自行改配方。**留账**：`react/index.mdx` 方向首页仍写「当前覆盖**基础 · 核心概念**」，未提中级层与新分类（该句自第 171 轮起就已漏记 04 篇，本轮又漏一篇），受 ≤4 上限本轮未动，留给后续同方向轮次一行文案改掉。
- 验证数字：`pnpm build` **743 页**（+2：新篇 + 新分类页）/ 23.21s；`pnpm verify:docs` **exit 0、25 项全绿**（一致性 10 项：侧边栏 link **740** 条 +2 且零死链、已提交笔记 **559** 篇全部注册、图谱死链 0 / 覆盖率 **100%**、**178** 个 index 页无空壳（+1 即新分类页，其带导读正文故过关）、mermaid **565** 块 + viz 数据 5 份硬编码颜色 **0** 处；mermaid 语法 565 块全有效（+2 即本轮两张）；题库 8 项 671 题持平（A 车道未加题，符合上限约束）；影像 7 项 8 资产、public 媒体 6.36MB / 上限 60MB）——**其中「559 篇 / 178 个 index 页」是入库后的复跑读数**：提交前同一条命令读 558 / 177，因该项按 `git ls-files` 取数、新文件未入库不计，故 commit 之后原样再跑一遍确认入库态同样 25 项全绿（第 189 轮记下的「自述已跑绿 ≠ 入库态绿」缺口，本轮以复跑自证）；本轮动过图表，按配方 §4.1 加跑 `node scripts/mermaid-contrast-verify.mjs` → **410 页 × 2 主题 0 处低于 4.5:1**（上轮 409，新增即本页；自检读数「内容树带图笔记 436 / dist 渲染出图 436」两数相等，无第 190 轮那种假阴性），脚本另打印的 26 页「序列图/饼图选择器不覆盖」是候选表第 11 行的既有盲区，非本轮新增。**新篇代码块按 East Asian Width 逐行量过：7 个围栏、超 80 视觉列 0 行**（mermaid 行不计——它们渲染为 SVG，全站既有 272 行 >80）。**真机端到端**（本机 Playwright 1440×900，非 600px MCP 视口；复用 4321 上已在跑的 `astro preview` PID 38594，cwd 即本仓、按请求读 `dist/`，实测新页 200，未新起端口、未动他人进程）：新篇与分类页、方向首页、作答页 `curl` 均 **200**；页内实渲 **2 个** mermaid SVG（**512×626** 与 **626×725**）、`Parse error` **0**、`[object Object]` **0**、`<table>` **2** 张、`main pre` **5** 段且横向溢出 **0** 处、`document.documentElement.scrollWidth` **1440** = 视口宽、`main h2` **10** 节；暗色主题下取两张图节点文字计算色 `rgb(232,221,203)` / `rgb(201,174,135)`（配色确由主题令牌接管，非硬编码）；分类页指向本篇 **4** 个锚点、方向首页含新节点标题；**未播种访问 0 处 JS 错误**（本轮未碰题库与影像，无播种路径测试）。
- 候选项表本轮状态：新增第 **14** 行（勘察脚本第 48 行车道数组自建档 `dbf9468` 起一字未改、**建档即 off-by-one**：`n mod 5 == 4` 打印成 B 与配方 §1 冲突，`n mod 5 == 0` 打印成**空**——D 轮从来没被这条 print 正确报出来过，此前记录里「输出 …→ 车道 D」是会话按配方的自行解读。两处证据都出自本轮实跑：开工打印「194 mod 5 = 4 → 车道 B」，收尾复算打印「195 mod 5 = 0 → 车道（空）」）；第 11 行（缩进围栏 21 块漏检）、第 6 行（代码块宽度路线）、第 7 行（CI 不跑 `verify:docs`）本轮未触及，无新增判红证据（开工基线即全绿）。
- 下一轮入口：**第 195 轮，195 mod 5 = 0 → 车道 D 体检与工具**。①最便宜且有本轮两次实测证据的是**候选表新增第 14 行**：把 `scripts/evolution-candidates.mjs` 第 48 行改为 `const lane = ['D 体检与工具', 'A 新章节', 'B 影像资产', 'C 题库', 'A 新章节'][next % 5];`（1 文件），并回归 191→A、192→B、193→C、194→A、195→D——不修则 `n mod 5 == 4` 的轮次照旧打印错车道、D 轮照旧打印空白；②第 11 行缩进围栏（两道闸门正则放宽为 `^[ \t]*`）仍是第二便宜的 D 活；③第 6 行宽度路线待用户裁决。④C 队列 a 类余 **10** 条（头部 `ai/intermediate/llm/04-inference-params` 第二题）、d 类 **12** 条；**本篇自身进入「零题」池**，d 类可入「Context 无 selector 与两条官方解法 / dispatch 引用为何稳定 / `getSnapshot` 必须返回同值」考点（A 车道受 ≤4 上限未碰 `coverage-deepening.md`，留给 C 轮现算入队）。⑤A 车道续点：roadmap 仍不可取点（§5 三项待裁决），兜底池双缺池**仍是 23 条**——本轮新建的篇带图，不落双缺；勘察脚本按 `git ls-files` 取数，入库后实跑为「笔记 562 篇」（+1 即本篇，分类页不计），本篇进入「有图但零题」池（68 → 69）——头部 `ai/basic/agent/05-guardrails`、`ai/intermediate/llm/12-hallucination`、`js/intermediate/node/*` 4 条、`typescript/*` 2 条等，分布式 case-studies 系列属 §4 已饱和不写；react 方向仍缺 intermediate 续篇与 `react/index.mdx` 首页文案一行。⑥B 队列余 **37** 支，头部 `java-classload`、`kafka-producer`、`redis-sentinel`。⑦`astro.config.mjs`、`graphs/react.json` 本轮已写入，`quiz/{ai,linux,distributed}.json` 与 `coverage-deepening.md` 仍是对方高频工作面。**每轮开工照旧**：`git pull --ff-only` → 定界（含 `pgrep` 查并发 build）→ `pnpm verify:docs` 基线 → 勘察命令 → 复算台账最大号；**车道以配方 §1 表为准，脚本打印仅作参考**（本轮差异即由此发现）；commit 前最后一刻再核 `git diff --cached`。

### 第 193 轮（2026-09-26，车道 C 题库｜游标一致，未越车道｜题库深化第 71 轮）：vLLM 吞吐 / Linux 四象限 / 布隆过滤器——a 类头部三篇首题补缺

- 取号与车道：开工 `git pull --ff-only` → `Already up to date`（HEAD `2162f65`）、`git status --porcelain` **干净**（无他人未提交改动需绕开）；基线 `pnpm verify:docs` **25 项全绿**（一致性 10 + mermaid 563 块 + 题库 8 项 668 题 + 影像 7 项 8 资产），非「修基线」路径；勘察 `node scripts/evolution-candidates.mjs` 打印「笔记 561 篇｜题库 467 篇有题｜动画 44 支｜影像 8 个」「**下一轮 = 第 193 轮，193 mod 5 = 3 → 车道 C 题库**」、C 队列 25 条（a 类 10 + d 类 12 + b 类 2 + c 类 1）；台账最大号实读 192，本轮取 **193**，游标与实做一致、**未越车道**。作业期间 HEAD 未移动（收尾复算仍 `2162f65`），开工 `pgrep -fl "astro.mjs build"` 为空、无并发构建。
- 定界：自有路径 5 个（`src/data/quiz/{ai,linux,distributed}.json` + `docs/coverage-deepening.md` + 本文件）。开工与收尾两次 `git status --porcelain` 都只有这 5 项，`astro.config.mjs`、`graphs/*.json`、`guide/interview-cheatsheet.md`、`docs/content-roadmap.md` 本轮一律未碰（C 车道不改这四类）；三个题库文件与 `coverage-deepening.md` 虽是对方高频工作面，本轮开工即干净且全程无人在途。
- 选题证据（现算，未手工维护清单）：取 C 队列 a 类头部三条 `ai/intermediate/llm/06-vllm`、`linux/intermediate/system/05-performance`、`distributed/intermediate/case-studies/31-bloom-filter`，**考点一律照队列指定角度、未自行换题**。入队前逐篇核实为真缺口：三篇 frontmatter 均 `core: true`，脚本遍历三个方向题库的 `noteId` 实测**各 0 命中**（ai 49 题 / linux 18 题 / distributed 43 题里无一条指向它们）。
- 内容要点（3 道 `multiple`，难度分别 4 / 3 / 4——linux 那题以工具姿势与流程判别为主，按「1~2 概念识别、3 原理理解、4 边界/易错点」的锚点定 3，不与另两篇齐平）：① **`ai-vllm-050`** 正确项落「PagedAttention 切固定块（16 token/块）、逻辑连续物理离散由块表映射，浪费从 60%~80%→4% 以下才是同卡塞更多并发的根源」「静态批处理的空转是短请求陪跑，迭代级调度让完成者退出、新请求补位」「批越大吞吐越高但单请求时延随之上升，故用 TTFT/TPOT 约束、在延迟上限内推 batch」；两个错项取正文明确反对的说法——把 continuous batching 说回「按整批为调度单位、期间不许插入」（正文的差别恰恰是按迭代），以及「瓶颈是算力不足、PagedAttention 靠减少矩阵运算量提速」（正文：瓶颈是**显存带宽**，且 TensorRT-LLM/SGLang/llama.cpp 核心思想趋同）。hint 补 Copy-on-Write 并行采样共享前缀 KV、「能跑≠能服务」与前缀缓存是提示缓存的服务端版。② **`linux-perf-016`** 正确项落「load = R + D 进程数、不等于 CPU 使用率，负载高 CPU 低大概率是 D 状态排队（NFS 卡死 / 磁盘打满）」「先 `vmstat 1` 看 b 列与 wa 列再转 IO 排查，经验判据是 load 持续超过核数」「IO 路径 `iostat -x 1` 看 %util 与 await → `pidstat -d 1` 定位进程 → `lsof -p` 看在写什么」；错项就是该篇开头点名的那道经典错题答「CPU 空闲说明系统层没问题，重启应用或回滚即可」。hint 补齐 available 而非 free、buff/cache 可回收、OOM Killer 用 `dmesg` 取 oom_score、CPU 四步（`top` → `top -Hp` → `printf '%x'` 按 nid 对 jstack → `perf top -p`）与「CPU 症状常是内存问题的影子」。③ **`dist-bloom-044`** 正确项落「k 个位置全 1 只是可能存在、任一为 0 一定不存在（这个位从没被置过）」「不能删除是结构性限制、Counting 用计数器数组换回删除但空间 ×4~8」「m/n 从 10 提到 16 时最优 k 从 7 到 11、误判率 ~0.8%→~0.04%」；两个错项分别是「k 越大越好且能让『不存在』更可靠」（正文给了最优 k=(m/n)·ln2，且不存在一侧本来就绝对可靠）与「几十万条也该换布隆、它的『存在』结论同样精确」（正文：数据量小于百万用 Set，是内存预算决定选型）。hint 补 RedisBloom 的 BF/CF 命令与定期重建。**三题事实全部取自各篇正文与「高频追问速答」，无新增事实**；hint 里「第 N 项」人类序号与 `answer` 下标逐条机器复核自洽（050 错项 1-based 2/5、016 错项 3、044 错项 2/5）。
- 队列账（`coverage-deepening.md`）：a 类**销 3 条、追加 3 条**——新入的三条是同三篇的**第二题角度**（050 的 Copy-on-Write/前缀缓存/三家选型趋同；016 的 available 与 buff/cache、OOM 取证、`lsof | grep deleted`；044 的 RedisBloom 与三种删除方案取舍、公式里 n 是实际元素数故超量写入会偏离设计误判率），角度取自各篇正文其余章节，与本轮首题考点不重叠。a 类实余 **10** 条（7 条第一题补缺 + 本轮 3 条第二题）、d 类 **12** 条，二级序号「题库深化第 71 轮」。三条均 multiple，延续 b 类「multiple 占比偏低优先补多选」——实测补前 ai 49 题 10 道、**linux 18 题仅 4 道（全站最低配比方向之一）**、distributed 43 题 11 道，补后为 50/11、19/5、44/12。
- 尺寸（如实记账）：内容文件 3 个（三个题库）≤ C 车道 ≤4 上限；多出的 2 个仍是台账类（`coverage-deepening.md` + 本文件），与第 173/179/187/189/190/191 轮记录的是同一处规范冲突，未自行改配方。
- 验证数字：`pnpm build` **741 页 / 18.76s**（pagefind 741 HTML，与第 192 轮同页数——本轮只加题目不加页面）；`pnpm verify:docs` **exit 0、25 项全绿**（一致性 10 项：侧边栏 738 条 link 零死链、已提交笔记 558 篇全部注册、图谱死链 0 / 覆盖率 100%、177 个 index 页无空壳、mermaid 563 块 + viz 数据 5 份硬编码颜色 0 处；mermaid 语法 563 块有效；题库 8 项 **671 题**（自有 +3，id 全局唯一 / noteId 可达 / difficulty 1~5 / 选项 2~5 项 / 答案下标自洽 / 每题有 hint）；影像 7 项 8 个资产、public 媒体 6.36MB / 上限 60MB）。构建期核验：三道新题 id 各命中 `dist/guide/quiz/index.html` **1 处**（未被静默丢弃）。**真机端到端**（本机 Playwright 1440×900，非 600px MCP 视口，复用 4321 上并行会话起的 `astro preview`——它按请求读 `dist/`，实测响应体已含本轮 3 个新题 id，未新起端口、未动他人进程）：三篇宿主笔记页 `curl` 均 **200**（noteId 非静默 404）；逐题播种 `ascension-quiz-state-v1`（同方向其余题标已刷、scope 只勾该方向、关随机）后设置页如实打印「**已选 1 个方向 · 未刷 1 / 50｜19｜44 题**」，开一轮后题面与正文**逐字相等**、选项数 5/4/5 与数据一致、方向与「多选」徽标、难度星 **★★★★ / ★★★ / ★★★★** 与 difficulty 4/3/4 对应；勾正确项提交判「**回答正确**」（选项态 `is-correct`/`is-dim`），只勾一个错项判「**回答错误**」并渲染 `.quiz-hint` **465 / 518 / 423 字**讲解；「查看完整笔记」链接实测指向 `/ascension/<noteId>/` 三条均正确；页面 `scrollWidth` 未超视口。⚠️ 如实登记：播种路径 6 次（三题×两 mode）各触发 1 次 React #418（SSR 文本 vs 客户端首帧），与第 190/192 轮同因同判——**未播种访问实测 0 处 JS 错误**且设置页如实打印「已选 33 个方向 · 未刷 671 / 671 题」，属测试手段副作用、非本轮产品缺陷。本轮未改任何图表与媒体，按配方 §4.1 不触发双主题对比度与影像附加闸门。
- 候选项表本轮状态：**无行变更**（C 车道不动工具与图表）。第 11 行（缩进围栏 21 块漏检）、第 6 行（代码块宽度路线）、第 7 行（CI 不跑 `verify:docs`）本轮未触及；本轮无新增判红证据（开工基线即全绿）。
- 下一轮入口：**第 194 轮，194 mod 5 = 4 → 车道 A 新章节**。①A 车道取点源仍是 `evolution-candidates.mjs` 兜底池（roadmap B1 十二条全 `done`、§3 复评明确 B2 不自动展开、§5 三项待裁决需用户拍板）：本轮实测「既无图又零题」**23 条**（头部 `ai/basic/agent/05-guardrails`、`ai/intermediate/llm/12-hallucination`、`distributed/intermediate/case-studies/09-sign-in`/`11-likes`/`12-search-suggest`/`14-cart`），**注意双缺池由 24 减到 23 是本会话造成的**——`linux/intermediate/system/05-performance` 无图、补题后不再双缺，属正常前移不是数据漂移；A 轮取点前先看目标分类 `index.mdx` 大纲并避开 roadmap §4 已饱和清单。②A 车道任何落点都要改 `astro.config.mjs` 注册侧边栏，该文件是第 191 轮被并行会话整轮持有的高危面，开工与收尾各 `git status --porcelain` 一次；若被在途持有，按配方 §3 退位（B 或 C），不要抢。③C 队列 a 类余 **10** 条（头部 `ai/intermediate/llm/04-inference-params` 第二题）、d 类 **12** 条；`quiz/{ai,linux,distributed}.json` 与 `docs/coverage-deepening.md` 本轮已写入，仍是对方高频工作面。④B 队列余 **37** 支，头部 `java-classload`、`kafka-producer`、`redis-sentinel`；第 192 轮已证 10 帧级动画逐句写 ≤30 字即可，无需先改动画正文。⑤D 队列：候选表第 11 行缩进围栏（两道闸门行首锚定正则放宽为 `^[ \t]*`）最便宜，第 6 行宽度路线待裁决。⑥台账漏号纪律延续（详见「待用户决策」首条）：本会话不代写对方条目。**每轮开工照旧**：`git pull --ff-only` → 定界（含 `pgrep` 查并发 build）→ `pnpm verify:docs` 基线 → 勘察命令 → 复算台账最大号；commit 前最后一刻再核 `git diff --cached`。

### 第 192 轮（2026-09-26，车道 B 影像资产｜游标一致，未越车道）：ES「一次写入到可搜索」· 配音短片（10 帧派生，`flows.ts` 正文零改动）+ RAG 混合检索首题

### 第 191 轮（2026-09-26，车道 C 题库｜游标本为 A，按 §3 降级 A→B→C 并如实登记｜题库深化第 69 轮）：crypto / 枚举与 as const / 消息推送——三篇首题补缺，并新建 typescript 方向题库

### 第 190 轮（2026-09-26，车道 C 题库｜游标本为 D，按第 189 轮入口让号执行 C 并如实登记｜题库深化第 68 轮）：推理参数/Token 成本/工具集设计三篇首题（quiz/ai.json +3、难度全 4）；沉淀共享文件提交判据——「diff 新增行是否 100% 属于自己」

### 第 189 轮（2026-09-26，车道 D 体检与工具｜游标本为 A，因基线判红按配方 §0.3 走 D｜题库深化第 67 轮）：修 RD-01 新篇死链 + 封面无损压缩参数固化进 media-encode、verify 判红改按字节；6 张在仓封面对照像素零改动、无一变大，附领券中心首题（658 题 +1）

### 第 188 轮（2026-09-25 入库，车道 A 新章节｜游标本为 C，越车道并如实登记｜由第 189 轮会话按 git 证据代记）：roadmap B1 第三批——MySQL 备份 PITR、锁等待取证、Redisson 锁之外一族三篇（13 文件 +740 行、3 题）；自述全绿实带死链，由 189 轮修复

### 第 187 轮（2026-09-25，车道 B 影像资产｜游标一致，未越车道｜题库深化第 66 轮）：Kafka segment 的一生配音短片（8 帧 52.6s、语速 4.5 字/秒）+ 大文件上传首题；封面 154,031B 超限无损重压缩救回（md5 不变）；判红文案四舍五入读不出超限（候选第 13 行）

### 第 186 轮（2026-09-25，车道 A 新章节｜游标一致，未越车道）：spring-ai 三篇（model/observability/evaluation，542 行）+ 上轮标题级事实回填成因果进已发笔记；纠错：观测开关是 log-prompt 非 include-prompt；方向 11 篇 12 题

### 第 185 轮（2026-09-25，用户定向续做 A 类产出｜游标本为 D，越车道执行并如实登记）：spring-ai 补工具调用/向量库 ETL/两档 RAG Advisor/MCP 四篇（12 文件，方向 8 篇 1512 行 8 题）；以 2.0.x 源码复核三处文档不可靠点、官方源矛盾不引数字

### 第 184 轮（2026-09-25，车道 C 题库｜越车道执行并如实登记｜题库深化第 65 轮）：抽奖权重区间与防超发/对账体系/量化位宽账三篇首题（639 题）；首次量化多选占比——distributed 15.8%、ai 13.6%；「core 且 0 题」池余 71 篇；台账脏文件禁 pathspec

### 第 183 轮（2026-09-25，用户定向｜新方向落地 spring-ai｜游标本为 C，越车道执行并如实登记）：Spring AI 立为第 33 个方向，4 篇按官方 2.0.1 取证；不迁移 Spring 四分类（读者进度会清零）；MCP SDK 版本两页矛盾不引数字；pathspec 误带他人 7 行、留痕不重写历史

### 第 182 轮（2026-09-25，车道 B 影像资产）：Redisson 看门狗配音短片（9 帧，初稿 66.3s 超限，压缩逐帧文稿后重录 51.9s / 0.76MB）+ 显式租期令看门狗不启动考题 redis-watchdog-018

### 第 181 轮（2026-09-25，车道 D 体检与工具｜游标本为 A，越车道执行并如实登记｜题库深化第 64 轮）：给对比度审计闸门装读数可信性自校验（期望/实扫 412 严格 1:1、dist 被改写即判红、跳过页不算通过）；反向验证暴露并纠正脚本自身恒绿 bug；并行 180 轮验证阻塞整轮回退、让号取 181

### 第 179 轮（2026-09-25，车道 C 题库｜越车道执行并如实登记｜题库深化第 63 轮）：swap 水位/Agent 应用层评估/Mongo 读偏好三篇首题（+3 至 630 题）；再撞号顺延取号；以 pre.clientWidth 基线推翻第 178 轮「0 行真溢出」——实测 70 处/57 页仍需横滚

### 第 178 轮（2026-09-25，车道 A 新章节｜游标本为 C，越车道执行并如实登记）：索引设计实战（mysql/basic/core/04-index-design，301 行）——区分度三口径/前缀取长/主键宽度乘数/冗余≠闲置；官方页取证、矛盾不引数字；探测器拿 code 元素 rect 当基线恒不报警

### 第 177 轮（2026-09-25，车道 C 题库 + 速答增量｜用户指令改道并如实登记｜题库深化第 62 轮）：WebSocket/Mongo 安全/隐式转换三篇首题 + 速答手册补 3 行入口（626 题 +3）；按用户「不能光生成视频」改道，配方车道表 B 格还给 A、新增「每轮必含内容增量」硬约束

### 第 176 轮（2026-09-25，车道 D 体检与工具｜越车道执行并如实登记）：修 4 处真溢出代码行 + 量出「≤80 视觉列」常数本来就错——实际字号 14.4px，1280 视口仅容 77.9 列，70 处/57 页仍需横向滚，A/B/C 三路线待裁决；复核候选表第 8 行疑点，根因不成立

### 第 175 轮（2026-09-25，车道 A 新章节｜用户定向）：联合索引与最左前缀（mysql/basic/core/03-index-leftmost，200 行），MySQL 索引由 1 篇扩到 2 篇；5 个官方链接逐个 WebFetch 取证；实测对比度审计静默漏页（首跑 66 vs 真实 385）

### 第 174 轮（2026-09-25，车道 B 影像资产）：TCP 三次握手配音短片（6 帧，1280×732 / 41.6s / 0.57MB），与上轮挥手短片同页成对；弃取队列头部 es-write（10 帧、帧说明 60~114 字压不进口播预算）；发现 media-encode 回填打印 730 与实测 732 不符

### 第 173 轮（2026-09-24，车道 C 题库，题库深化第 61 轮）：红包拆分 / MongoDB 事务 / 结构化输出三篇 0 题核心笔记补首题，题库 620→623 题；C 队列销 3 追加 4 余 10 条

### 第 172 轮（2026-09-24，车道 B 影像资产）：TCP 四次挥手出配音短片（tcp-close 8 帧，1280×690 / 48.1s）；新经验：say 读英文缩写比 3.9 字/秒公式快，定稿前逐句实测时长、不照公式砍稿

### 第 171 轮（2026-09-24，车道 A 新章节）：新写 react/basic/core/04-rerender-perf：重渲染传播与 memo 三件套（react 方向仅 3 篇的最薄弱面）；官方引文逐条对 react.dev 核验，凭记忆的 URL 实测 404 后只留可达链接

### 第 170 轮（2026-09-24，车道 D 体检与工具）：一致性体检新增第 10 项「图表与可视化数据硬编码颜色」：扫 531 块 mermaid 围栏与 viz 数据、五条判红规则，注入违规样本验证能判红；另发现 4 处代码块超 80 视觉列已登记候选表待修

### 第 169 轮（2026-09-24，车道 B 影像资产）：《从输入 URL 到页面显示》出配音短片（9 帧 / 56.9s）；首版 251 字合成 69.7s 超上限，精简至 200 字重录，沉淀 Tingting 语速 3.9 字/秒+每帧 0.35s 呼吸的文稿预算公式

### 第 168 轮（2026-09-18，内容补充模式）：js/intermediate/engineering 第 5 篇：前端环境变量与多环境构建——Vite .env 分层与 VITE_ 白名单、构建期烙死 vs 运行时注入两解法，工程化线 5 篇成线

### 第 167 轮（2026-09-18，内容补充模式）：js/intermediate/engineering 第 4 篇：代码规范工具链 Lint 与 Format——正交分工表、三道闸设计（编辑器→Husky+lint-staged→CI 兜底，--no-verify 绕不过 CI）

### 第 166 轮（2026-09-18，内容补充模式）：js/intermediate/engineering 第 3 篇：Monorepo 与工作区管理——pnpm workspace 与 workspace:* 协议、任务编排两层（--filter + Turborepo/Nx 增量缓存）、CI 只构建变更包

### 第 165 轮（2026-09-18，内容补充模式）：js/intermediate/engineering 第 2 篇：npm、pnpm 与依赖管理——node_modules 两代结构、幽灵依赖成因、pnpm 内容寻址 store+硬链接省空间、lockfile 可复现必须提交

### 第 164 轮（2026-09-18，内容补充模式）：js/intermediate/engineering 第 1 篇：打包器从 Webpack 到 Vite（新建分类）——Vite 双引擎、tree-shaking 靠 ESM 静态结构与 sideEffects 声明

### 第 163 轮（2026-09-18，内容补充模式）：elasticsearch/advanced/architecture 第 2 篇：索引生命周期 rollover 与冷热分层——ILM 四阶段 hot→warm→cold→delete 与节点打标、rollover 三条件与单 shard 20-50GB 锚点

### 第 162 轮（2026-09-18，内容补充模式）：elasticsearch/advanced/architecture 第 1 篇（新建高级分类）：ES 与 MySQL 分工与数据同步——真源与投影分野、同步三方案（binlog 订阅为主流）、最终一致两层兜底、delete 事件必须订阅

### 第 161 轮（2026-09-18，内容补充模式）：netty/intermediate/core 第 4 篇：Netty 的 Future 与 Promise——writeAndFlush 凭证语义陷阱、addListener 正道 vs EventLoop 内 sync 死锁、Promise 可写 Future 可读

### 第 160 轮（2026-09-18，内容补充模式）：js/intermediate/web 第 12 篇：浏览器内存泄漏场景与排查——判定「不该可达却可达」、五大场景对照（全局/定时器/闭包/脱管 DOM/监听器）、堆快照三照对比与 Retainers 找引用链

### 第 159 轮（2026-09-18，内容补充模式）：js/basic/core 第 15 篇：深浅拷贝与手写深拷贝——JSON 法四大缺陷、structuredClone 边界、手写四层拆解（递归出口/类型分派/WeakMap 防循环先 set 再递归）

### 第 158 轮（2026-09-18，内容补充模式）：js/basic/core 第 14 篇：属性描述符与冻结三兄弟——数据属性四开关与存取器互斥（configurable 单行道）、存取器是 Vue2 响应式根基、freeze 浅冻结非严格静默失败

### 第 157 轮（2026-09-18，内容补充模式）：nginx/basic/config 第 3 篇：rewrite、try_files 与文件解析——root 拼接 vs alias 替换、try_files 短路查找与 SPA fallback、rewrite 四 flag 与 last/break、改写循环 10 次上限

### 第 156 轮（2026-09-18，内容补充模式）：js/intermediate/web 第 11 篇（web 线收口）：前端错误监控与上报——四类来源四个捕获入口、Script error. 跨域打码与 crossorigin+CORS、sourcemap 只进平台不上线、上报三板斧（聚合/采样/sendBeacon）

### 第 155 轮（2026-09-18，内容补充模式）：js/intermediate/web 第 10 篇：Web 性能指标与采集——Core Web Vitals 阈值速记（2.5s/200ms/0.1）、INP 取代 FID、CLS 与 hadRecentInput、PerformanceObserver+buffered 补采

### 第 154 轮（2026-09-18，内容补充模式）：js/intermediate/web 第 9 篇：Service Worker 与离线缓存——三阶段生命周期与 skipWaiting 接管、缓存三策略（Cache First/Network First/Stale-While-Revalidate）、res.clone 必踩坑

### 第 153 轮（2026-09-18，内容补充模式）：typescript/basic/core 第 5 篇：类型声明与 .d.ts——ambient 只登记不生成代码、类型三来源按序命中（包 types→@types→手写 declare module）、给无类型库补声明三要点

### 第 152 轮（2026-09-18，内容补充模式）：js/intermediate/web 第 8 篇：请求的取消与超时——race 假取消 vs AbortController 真取消、AbortError 按 e.name 分流、AbortSignal.timeout/any、abort 旧请求防重复提交

### 第 151 轮（2026-09-18，内容补充模式）：typescript/intermediate/typing 第 2 篇：模板字面量类型——类型层字符串拼接与联合笛卡尔积、infer 拆字符串、路由路径推导参数对象实战（框架类型安全地基）

### 第 150 轮（2026-09-17，内容补充模式）：typescript/basic/core 第 4 篇（basic 线收口）：枚举、字面量类型与 as const——enum 是 TS 少数不擦除的构造且 tree-shaking 不友好、选型共识 as const/字面量联合为主，enum 留给双向映射

### 第 149 轮（2026-09-17，内容补充模式）：netty/intermediate/core 第 3 篇：Netty 中的 WebSocket 握手与帧——四件套 handler 链各司一职（升级处理器 101 换道）、帧六类型分流、协议层 Ping/Pong vs 应用层心跳两层分工

### 第 148 轮（2026-09-17，内容补充模式）：kubernetes/intermediate/ops 第 4 篇：弹性伸缩与 HPA——比例算法 ceil+多指标取最大、Utilization 分母是 requests 的高频坑、缩容稳定窗口 5 分钟、HPA/VPA/CA 三层分工与 KEDA

### 第 147 轮（2026-09-17，内容补充模式）：kubernetes/intermediate/ops 第 3 篇：声明式 API 与 List-Watch——kubectl apply 完整旅程（API Server 唯一写入口）、List 全量+Watch 增量与 resourceVersion 续传、Informer 三件套与幂等调谐

### 第 146 轮（2026-09-17，内容补充模式）：typescript/intermediate/typing 第 1 篇（新建分类）：类型编程入门——映射类型手写 Partial、分布式条件类型（裸联合分发/[T] 关闭/never 吸收）、infer 手写 ReturnType、可读性税：两层以上封装成命名工具类型

### 第 145 轮（2026-09-17，内容补充模式）：typescript/basic/core 第 3 篇：严格模式与工程配置——noImplicitAny 堵静默失效、strictNullChecks 把空值搬进编译期、?. ?? 正牌 vs !/as 逃逸纪律、路径别名 tsc 不重写 import 必踩坑

### 第 144 轮（2026-09-17，内容补充模式）：typescript/basic/core 第 2 篇：interface、type 与泛型入门——interface 声明合并 vs type 独占联合/映射/条件、泛型第一性「类型参数化表达关联」、有关联才写泛型

### 第 143 轮（2026-09-17，内容补充模式）：新建 TypeScript 方向（四处同步）+ 首篇类型系统第一性——类型擦除与 tsc 管线、结构化类型、any/unknown/never/void 辨析、never 穷尽检查与收窄四法

### 第 142 轮（2026-09-17，内容补充模式）：elasticsearch/intermediate/usage 第 5 篇：映射与分词器（term 为什么查不到 text）——「term 对 keyword，match 对 text」口诀、分词器三段流水线与 _analyze 调试、中文 IK 双配置（索引 max_word/搜索 smart）

### 第 141 轮（2026-09-17，内容补充模式）：elasticsearch/intermediate/usage 第 4 篇：相关性打分与 BM25——TF-IDF 两因子两偏差（无饱和/无长度归一）、k1/b 参数直觉、filter 不算分可缓存、boost/function_score 三条干预路与 _explain

### 第 140 轮（2026-09-17，内容补充模式）：js/intermediate/node 第 10 篇（Node 主线收口）：事件循环与浏览器差异——libuv 六相位与 poll 枢纽、nextTick 特权 vs Promise 微任务、setImmediate vs setTimeout(0) 竞态、六维对比（逐个 vs 分组）

### 第 139 轮（2026-09-17，内容补充模式）：js/intermediate/web 第 7 篇：前端路由与 History API——hash 路由 hashchange 全自动、history 路由 pushState 不触发 popstate 需手动渲染、刷新 404 与 Nginx try_files fallback

### 第 138 轮（2026-09-17，内容补充模式）：js/intermediate/web 第 6 篇（六篇成体系收口）：Web Worker 与多线程逃生门——结构化克隆与 Transferable 零拷贝、能力边界（DOM/Web Storage 禁用）、50ms 判据与 SharedWorker/Service Worker 划界

### 第 137 轮（2026-09-17，内容补充模式）：js/intermediate/web 第 5 篇：浏览器存储全家桶——四代存储横向对比（容量/生命周期/随请求发送/API）、Cookie 四属性、storage 事件跨标签页通信、token 存放 XSS vs CSRF 权衡

### 第 136 轮（2026-09-17，内容补充模式）：js/intermediate/web 第 4 篇：渲染管线与重绘回流——关键渲染路径五步、CSS/JS 阻塞与 defer/async 对比、回流>重绘>合成三档开销、transform/opacity 走合成线程、布局抖动读写交错与批量读再写修复

- **状态文件压缩说明（第 137 轮）**：第 130-134 轮详细记录在并行会话的多次 reset/rebase 中丢失，代码提交均在 git 历史可查（Proxy/Reflect 3c6be5a、Promise 组合器 60e4a35、Node 安全 28a9cd4 等）。不恢复旧记录——当前状态足以恢复现场。
- **状态文件压缩说明（第 135 轮）**：第 130-134 轮的详细记录被并行会话的状态文件压缩操作删除（单行摘要替代详述），内容对应的代码提交均在 git 历史中（3c6be5a/5f717d4/b8a2107/60e4a35/28a9cd4），git log 可追溯。接受并行会话的压缩行为，不恢复——旧记录的详情通过 git log -- docs/evolution.md 可查。

### 第 135 轮（2026-09-08，第五十一次启动，内容补充模式）：Node 安全最佳实践（js/intermediate/node 第 8 篇）——供应链攻击、命令注入与原型污染、helmet 安全头、最小权限运行；Node 主线 8 篇全闭环。

### 第 134 轮（2026-09-08，第五十二次启动）：Promise 组合器篇 level 笔误修正（intermediate→basic），提交 b8a2107 已推送。

### 第 133 轮（2026-09-08，第五十二次启动，环境恢复+内容补充）：nvm PATH 显式化恢复、distributed.json 冲突解决、CDC 篇重新入库，提交 60e4a35 已推送。

### 第 132 轮（2026-09-08，第五十一次启动，状态文件维护）：130/131 轮补记后的轮次记录重排与去重，提交 3d99396 已推送。

### 第 131 轮（2026-09-08，第五十一次启动）：Promise 组合器与并发控制（js/basic/core 第 11 篇）——四组合器、race 超时控制、手写并发限制器；后被并行会话 reset 移除，60e4a35 重新入库。

### 第 130 轮（2026-09-08，第五十一次启动，内容补充模式）：Proxy 与 Reflect（js/basic/core 第 10 篇）——Vue 3 换代理由、13 种拦截陷阱、Reflect receiver、与 defineProperty 对比。

### 第 129 轮（2026-09-08，第五十次启动，内容补充模式）：迭代器与生成器（js/basic/core 第 9 篇）——Symbol.iterator 协议、function*/yield 暂停执行、惰性求值；五连验证全绿。

### 第 128 轮（2026-09-08，第五十次启动，内容补充模式）：错误处理（js/basic/core 第 8 篇）——Error 体系、try/catch/finally 行为细节、全局捕获三入口、自定义 Error 类。

### 第 127 轮（2026-09-08，第五十次启动，内容补充模式）：Map/Set 与 Symbol（js/basic/core 第 7 篇）——Map vs Object 选型、Set 集合运算、WeakMap 弱引用、Symbol 三大用途。

### 第 126 轮（2026-09-08，第四十九次启动，状态文件维护）：修复 124/125 轮编号错乱（布隆过滤器篇被重复编号），125 轮记录补状态同步与下一轮入口。

### 第 125 轮（2026-09-08，第四十九次启动，状态文件维护）：第 124 轮记录被重复写入两份，脚本去重保留单份。

### 第 124 轮（2026-09-08，第四十九次启动，内容补充模式）：布隆过滤器（case-studies 第 31 篇）——位数组+k 哈希原理、误判率参数、Counting/cuckoo 变体、Set 选型对照。

### 第 123 轮（2026-09-08，第四十八次启动，内容补充模式）：环境变量与配置管理（js/intermediate/node 第 7 篇）——process.env 陷阱、.env 不入库、配置分层、fail-fast 校验；Node 主线 7 篇完整。

### 第 122 轮（2026-09-08，第四十七次启动，内容补充模式）：cluster 与 worker_threads（js/intermediate/node 第 6 篇）——单线程准确含义、多进程 vs 多线程选型、CPU 密集解法。

### 第 121 轮（2026-09-08，第四十六次启动，内容补充模式）：中间件模型（js/intermediate/node 第 5 篇）——Express 回调 vs Koa 洋葱圈、compose 手写、错误中间件四参数陷阱。

### 第 120 轮（2026-09-08，第四十五次启动，内容补充模式）：Stream 流处理（js/intermediate/node 第 4 篇）——四种流类型、背压调节、pipeline 错误传播、内存 O(1)；Node 4 篇闭环。

### 第 119 轮（2026-09-08，第四十四次启动，内容补充模式）：EventEmitter 发布订阅（js/intermediate/node 第 3 篇）——Map 事件表手写、once 包装、error 事件特殊地位、监听器泄漏。

### 第 118 轮（2026-09-08，第四十三次启动，内容补充模式）：防抖与节流（js/basic/core 第 6 篇）——防抖最后一次说了算 vs 节流固定频率、闭包 timer 手写实现、场景选择矩阵。

### 第 117 轮（2026-09-08，第四十五次启动，内容补充模式）：Node 模块系统（js/intermediate/node 第 2 篇）——CJS 循环引用、ESM 静态分析与活绑定、互操作三坑。

### 第 116 轮（2026-09-08，第四十四次启动，内容补充模式）：敏感数据（case-studies 第 30 篇）——字段加密 AES-GCM、盲索引 HMAC 等值查询、脱敏分级、密钥分离；提交 fdffcdb 已推送。

### 第 115 轮（2026-09-08，第四十五次启动，内容补充模式）：排行榜方案矩阵（case-studies 第 29 篇）——DB 排序/zset/预计算分桶、同分决胜编码时间戳、周期榜切分；场景题池见底转方向补全。

### 第 114 轮（2026-09-08，第四十四次启动，内容补充模式）：售后退款（case-studies 第 28 篇）——退款状态机与可退余额、钱货券三线回退对账、退款发货撞车 CAS；电商正逆向双链闭环。

### 第 113 轮（2026-09-08，第四十三次启动，内容补充模式）：安全认证与角色（mongodb/usage 第 11 篇）——默认无认证坑、SCRAM 挑战响应、内置角色最小权限、bindIp 与 TLS；usage 11 篇成对。

### 第 112 轮（2026-09-08，第四十二次启动，内容补充模式）：备份与恢复（mongodb/usage 第 10 篇）——mongodump/快照/云快照三方式、oplog PITR 时间点恢复、RTO/RPO/3-2-1 备份验证纪律。

### 第 111 轮（2026-09-08，第四十一次启动，内容补充模式）：多键索引（mongodb/usage 第 9 篇）——数组自动多键化、复合索引至多一数组边界、$elemMatch 同元素匹配防假匹配。

### 第 110 轮（2026-09-08，第四十次启动，内容补充模式）：索引进阶（mongodb/usage 第 8 篇）——部分索引、稀疏与部分关系、通配符索引、唯一+稀疏组合；提交 5288823 已推送。

### 第 109 轮（2026-09-08，第三十九次启动，内容补充模式）：Schema 设计模式（mongodb/usage 第 7 篇）——子集/扩展引用/桶模式/Outlier 兜底建模套路；提交 82ba210 已推送。

### 第 108 轮（2026-09-08，第三十九次启动）：Change Streams（mongodb/usage 第 6 篇）——oplog 结构化订阅、resume token 断点续听、与外部 CDC 选型对比；usage 6 篇成对。

### 第 107 轮（2026-09-08，第三十九次启动）：语义缓存（ai/intermediate/llm 第 13 篇）——向量相似当缓存键、与提示缓存分层、阈值两难；ai.json 被重排 740 行 diff，内容等价虚惊排除。

### 第 106 轮（2026-09-08，第三十九次启动，内容补充模式）：多文档事务（mongodb/usage 第 5 篇）——4.0/4.2 演进、session 三步、snapshot+majority 前提、限制表与单文档原子优先；usage 5 篇成对。

### 第 105 轮（2026-09-08，第三十八次启动，内容补充模式）：读偏好与读写关注（mongodb/usage 第 4 篇）——readPreference 五档、writeConcern/readConcern 权衡、资金类 majority 组合矩阵。

### 第 104 轮（2026-09-08，第三十七次启动，内容补充模式）：TTL 索引与数据过期（mongodb/usage 第 3 篇）——60 秒删除周期、日期类型静默失效坑、大批量过期性能与三层治理对照。

### 第 103 轮（2026-09-08，第三十六次启动）：分页与游标（mongodb/usage 第 2 篇）——$skip 性能悬崖、复合游标（sortKey,_id）、$sample 随机分页；提交 4b50cf8 已推送。

### 第 102 轮（2026-09-08，第三十六次启动，内容补充模式）：聚合管道（mongodb 新建 usage 分类第 1 篇）——管道顺序决定性能、$lookup 建模警报、100MB 内存限制、与 ES 分工。

### 第 101 轮（2026-09-08，第三十五次启动，内容补充模式）：工具集设计（ai/intermediate/agent 第 16 篇）——粒度一工具一事、描述含何时不用、错误返回可行动等四原则；agent 16 篇主线闭环。

### 第 100 轮（2026-09-08，第三十五次启动，内容补充模式，第 100 轮里程碑）：风控系统（case-studies 第 27 篇）——三层布防、名单+设备指纹+关联分析、规则引擎选型、误杀分级；站点 632 页。

### 第 99 轮（2026-09-08，第三十四次启动，内容补充模式）：多租户架构（case-studies 第 26 篇）——三种隔离方案光谱、强制租户过滤、tenant_id 索引纪律、噪声邻居治理。

### 第 98 轮（2026-09-08，第三十四次启动，内容补充模式）：大促保障（distributed/advanced/availability 第 7 篇）——三阶段保障日历、全链路压测容量水位、预案四要素、值守与复盘闭环。

### 第 97 轮（2026-09-08，第三十四次启动，内容补充模式）：数据订阅与 CDC（case-studies 第 25 篇）——binlog 解析原理、至少一次+下游幂等、Canal vs Debezium；nvm PATH 消失等环境故障按预案处置。

### 第 96 轮（2026-09-08，第三十三次启动）：数据归档冷热分离（case-studies 第 24 篇）——冷热架构与查询路由、分批删除幂等、与分库分表正交；95/96 记录重复写入已去重。

### 第 95 轮（2026-09-08，第三十三次启动，内容补充模式）：时区处理（case-studies 第 23 篇）——存储/传输/展示三层分离、DATETIME vs timestamptz、夏令时坑、差 8 小时排查清单。

### 第 94 轮（2026-09-08，第三十二次启动，内容补充模式）：幻觉治理（ai/intermediate/llm 第 12 篇）——三层根源、治理矩阵四层布防、RAG 压低不消除的边界。

### 第 93 轮（2026-09-08，第三十一次启动）：Tokenizer（ai/basic/foundation 第 8 篇）——BPE 直觉、字符级任务翻车根源、词表权衡；顺带修重复边并为体检第 9 项增补重复边检测。

### 第 92 轮（2026-09-08，第三十一次启动）：企业知识库 RAG 落地全流程（ai/intermediate/agent 第 15 篇）——端到端架构、检索层强制权限过滤、增量同步、评测运营闭环。

### 第 91 轮（2026-09-08，第三十一次启动，内容补充模式）：读写分离（mysql/connection-pool 第 2 篇）——SDK vs Proxy 路由、ThreadLocal 路由键丢失坑、主从延迟分级解决表。

### 第 90 轮（2026-09-08，第三十一次启动）：多卡并行（ai/basic/foundation 第 7 篇）——DP/TP/PP 与 ZeRO 三级消冗余、3D 并行布局、推理多卡简化为 TP。

### 第 89 轮（2026-09-08，第三十一次启动）：连接池 HikariCP（mysql 新建 connection-pool 分类第 1 篇）——池大小公式核数×2+盘数、泄漏与池内死锁、ConcurrentBag 快在哪。

### 第 88 轮（2026-09-08，第三十一次启动，内容补充模式）：LLM 应用架构总装（ai/intermediate/llm 第 11 篇）——收口 10 篇零件成端到端总装图、对话请求五步、可靠性与成本防线。

### 第 87 轮（2026-09-08，第三十次启动）：GPU 与算力（ai/basic/foundation 第 6 篇）——万核并行、算力/显存/带宽三概念（推理 memory-bound）、混合精度、买卡排序。

### 第 86 轮（2026-09-08，第三十次启动）：Agent 可观测性（ai/intermediate/agent 第 14 篇）——生命体征四信号、trace 穿透多模型调用链、坏 case 回流评测闭环。

### 第 85 轮（2026-09-08，第三十次启动，内容补充模式）：SSH 隧道与端口转发（linux/intermediate/system 第 8 篇）——-L/-R/-D 三转发方向与场景、安全边界、autossh 保活。

### 第 84 轮（2026-09-08，第二十九次启动）：SSH 密钥与远程访问安全（linux/basic/permission 第 3 篇）——挑战签名认证、加固四件套、堡垒机审计、known_hosts 防中间人。

### 第 83 轮（2026-09-08，第二十九次启动）：功能开关 Feature Flag（case-studies 第 22 篇）——四类开关生命周期、评估架构与推送缓存、kill switch、组合状态爆炸治理。

### 第 82 轮（2026-09-08，第二十九次启动，内容补充模式）：视觉 Agent 计算机使用（ai/intermediate/agent 第 13 篇）——截图理解操作循环、结构化动作输出、RPA 对比、护栏强制适用。

### 第 81 轮（2026-09-08，第二十八次启动）：LLM 网关（ai/intermediate/llm 第 10 篇）——统一接口/路由/配额/审计/密钥托管五职责；llm 10 篇 AI 应用主线全闭环。

### 第 80 轮（2026-09-08，第二十八次启动）：语音交互 ASR 与 TTS（ai/intermediate/llm 第 9 篇）——三段流水线延迟账、VAD 静音检测与打断、热词、流式 TTS 首包。

### 第 79 轮（2026-09-08，第二十八次启动，内容补充模式）：排队系统（case-studies 第 21 篇）——发号+分桶队列+匀速消费、进度反馈、过号清理、VIP 分层。

### 第 78 轮（2026-09-08，第二十七次启动）：Embedding 语义向量表示（ai/basic/foundation 第 5 篇）——对比学习与难负样本、三种度量表、MTEB 选型；AI 基础线补齐。

### 第 77 轮（2026-09-08，第二十七次启动）：定时任务 crontab 与 systemd timer（linux/intermediate/system 第 7 篇）——五字段三坑、分布式防重复三思路、定时任务必须幂等。

### 第 76 轮（2026-09-08，第二十七次启动，内容补充模式）：对账体系（case-studies 第 20 篇）——两套记录互证、三层核对与 T+1 分层防线、差错单闭环；24 篇分散对账的收口篇。

### 第 75 轮（2026-09-08，第二十六次启动）：数据权限行级过滤（case-studies 第 19 篇）——RBAC 数据范围四档、拦截器注入 SQL、部门树 path 法、索引性能影响。

### 第 74 轮（2026-09-08，第二十六次启动）：审批流（case-studies 第 18 篇）——单链状态机数据模型、引擎分界经验线、驳回三种语义、动态加签与超时升级。

### 第 73 轮（2026-09-08，第二十六次启动，内容补充模式）：Excel 导入导出（case-studies 第 17 篇）——同步三宗罪、流式导出与异步任务中心、导入两级校验与错误行回执。

### 第 72 轮（2026-09-08，第二十五次启动）：埋点与数据上报（case-studies 第 16 篇）——批量合并与 sendBeacon、失败容忍分级、MQ 削峰幂等；容忍度决定架构。

### 第 71 轮（2026-09-08，第二十五次启动）：评论系统（case-studies 第 15 篇）——两级拍平建模、游标分页与回复折叠、热度分时间衰减、先审后发分级。

### 第 70 轮（2026-09-08，第二十五次启动，内容补充模式）：结构化输出（ai/intermediate/agent 第 12 篇）——提示→解析容错→JSON mode→受限解码四层防线、schema 版本兼容。

### 第 69 轮（2026-09-08，第二十四次启动）：多模态 LLM（ai/intermediate/llm 第 8 篇）——patch 切块→ViT 编码→投影对齐、视觉 token 计费、OCR 边界；站点破 600 页。

### 第 68 轮（2026-09-08，第二十四次启动）：接口幂等篇撞题撤回（并行会话已有同主题），改修 Dubbo 篇 mermaid 语法错误；撞题预警须查图谱与全站标题。

### 第 67 轮（2026-09-08，第二十四次启动，内容补充模式）：修复并行会话 IO 多路复用篇 level 笔误（intermediate→basic）；并行会话新增 React/Vue 方向，站点涨至 599 页。

### 第 66 轮（2026-09-08，第二十三次启动）：模型量化（ai/intermediate/llm 第 7 篇）——FP16→INT4 显存账、PTQ/QAT 路线、GPTQ/AWQ、量化后必须评测回归。

### 第 65 轮（2026-09-08，第二十三次启动）：IM 聊天（case-studies 第 18 篇）——服务端单调 seq、推拉结合 ACK 位点、多端同步、群聊读写扩散、messageId 去重。

### 第 64 轮（2026-09-08，第二十三次启动，内容补充模式）：vLLM 推理服务（ai/intermediate/llm 第 6 篇）——PagedAttention 分页原理、continuous batching、前缀缓存、TTFT/TPOT 权衡。

### 第 63 轮（2026-09-08，第二十二次启动）：日志管理 logrotate（linux/intermediate/system 第 6 篇）——copytruncate vs create 轮转对比、df-du 不一致根因、容器 stdout 反模式。

### 第 62 轮（2026-09-08，第二十二次启动）：RAG 进阶混合检索与重排（ai/intermediate/agent 第 11 篇）——BM25+向量双路召回 RRF 融合、rerank 两阶段精排、查询改写。

### 第 61 轮（2026-09-08，第二十二次启动，内容补充模式）：支付系统（case-studies 第 17 篇）——渠道抽象统一网关、支付状态机含中间态、回调四纪律、掉单兜底与长款短款对账。

### 第 60 轮（2026-09-08，第二十一次启动）：文件不可变属性与 capabilities（linux/basic/permission 第 2 篇）——chmod→ACL→chattr→capabilities 四层模型、setcap 非 root 绑 80。

### 第 59 轮（2026-09-08，第二十一次启动）：库存扣减时机（case-studies 第 16 篇）——下单减/支付减/预扣三时机权衡、Redis 预扣+条件更新+回补幂等、热点 SKU 分桶。

### 第 58 轮（2026-09-08，第二十一次启动，内容补充模式）：订单超时自动关闭（case-studies 第 15 篇）——延迟任务四方案对比、关单支付撞车 CAS 与自动退款、回补幂等。

### 第 57 轮（2026-09-08，第二十次启动）：购物车（case-studies 第 14 篇）——Redis hash 字段级操作、游客态登录合并冲突策略、结算实时校验价格、上限治理防 big key。

### 第 56 轮（2026-09-08，第二十次启动）：消息推送系统（case-studies 第 13 篇）——四类通道矩阵与分级必达、长连网关三件事、去重聚合与推送风暴分批灰度。

### 第 55 轮（2026-09-08，第二十次启动，内容补充模式）：搜索联想（case-studies 第 12 篇）——LIKE 双输、trie vs FST 对比、热度×个人化排序、词表两层更新；构建竞态重跑恢复。

### 第 54 轮（2026-09-08，第十八次启动）：点赞与收藏（case-studies 第 11 篇）——去重/计数/列表三问三结构选型、Set 天然幂等、热 key 本地缓存聚合。

### 第 53 轮（2026-09-08，第十八次启动）：交换分区与内存回收（linux/basic/filesystem 第 2 篇）——匿名页回收路径、swappiness 旋钮、数据库关 swap 纪律、vmstat 信号。

### 第 52 轮（2026-09-08，第十八次启动，内容补充模式）：优惠券系统（case-studies 第 10 篇）——券模板与用户券状态机、领券 Redis 预扣去重、核销回退与防重复核销三板斧。

### 第 51 轮（2026-09-08，第十七次启动）：LoRA 低成本微调（ai/basic/foundation 第 4 篇）——ΔW=BA 低秩分解与 250 倍参数账、可合并零推理延迟；AI 基础线闭环。

### 第 50 轮（2026-09-08，第十七次启动）：签到系统位图方案（case-studies 第 9 篇）——SETBIT/BITCOUNT 全操作、连续签到与补签、亿级分 key 防 big key、选型前提。

### 第 49 轮（2026-09-08，第十七次启动，内容补充模式）：抽奖系统（case-studies 第 8 篇）——整数权重区间法、Redis 预扣库存与谢谢参与兜底、发奖异步状态机与对账。

### 第 48 轮（2026-09-08，第十六次启动）：抢红包系统（case-studies 第 7 篇）——二倍均值法、Redis 预拆分 LPOP 原子领取、两阶段抢与拆、热点账户缓冲记账。

### 第 47 轮（2026-09-08，第十六次启动）：敏感词过滤（case-studies 第 6 篇）——trie 前缀共享、AC 自动机失败指针与 KMP 关系、双缓冲热更新、误杀分级。

### 第 46 轮（2026-09-08，第十六次启动，内容补充模式）：大文件上传（distributed/case-studies 第 5 篇）——分片与断点续传、秒传 hash 去重、对象存储直传+预签名、孤儿分片治理。

### 第 45 轮（2026-09-08，第十五次启动）：Token 计费与成本优化（ai/intermediate/llm 第 5 篇）——一次调用账单构成、O(n²) 成本根源、降本四招、提示缓存。

### 第 44 轮（2026-09-08，第十五次启动）：密码存储（network/basic/http 第 8 篇）——MD5 太快+彩虹表死穴、加盐与慢哈希分工、bcrypt 自带盐、前端 MD5 不可取。

### 第 43 轮（2026-09-08，第十五次启动，内容补充模式）：WebSocket（network/basic/http 第 7 篇）——轮询/长轮询/SSE 对比、Upgrade 握手时序、心跳重连、LLM 流式为何用 SSE。

### 第 42 轮（2026-09-08，第十四次启动）：str 与 bytes（python/basic/data-structures 第 3 篇）——encode/decode 方向、UnicodeDecodeError 三步排查、Content-Length 是字节数。

### 第 41 轮（2026-09-08，第十四次启动）：打包压缩与远程传输（linux/basic/commands 第 3 篇）——tar 口诀与解压先 -t、scp 全量 vs rsync 增量、--delete 先 -n 预演。

### 第 40 轮（2026-09-08，第十四次启动，内容补充模式）：Agent 应用评估（ai/intermediate/agent 第 10 篇）——模型评测不等于应用评估、黄金评测集/LLM-as-judge/线上验证三手段。

### 第 39 轮（2026-09-08，第十三次启动）：HTTP 缓存（network/basic/http 第 6 篇）——强/协商两级缓存、Cache-Control 四参数、304 决策流程、ETag 多机一致性追问。

### 第 38 轮（2026-09-08，第十三次启动）：Agent 护栏（ai/basic/agent 第 5 篇）——攻击面=模型不可靠×工具有权限、提示注入形态、防线五层、硬上限三件套。

### 第 37 轮（2026-09-08，第十三次启动，内容补充模式）：同源策略与 CORS（network/basic/http 第 5 篇）——拦截本质是响应被扣下、CORS 四件套、预检触发条件、凭证跨域三缺一坑。

### 第 36 轮（2026-09-08，第十二次启动）：登录态 Session 与 JWT（network/basic/http 第 4 篇）——Cookie 安全属性、Session 集中存储、JWT 注销代价、选型对比表。

### 第 35 轮（2026-09-08，第十二次启动）：Linux 性能排查（linux/intermediate/system 第 5 篇）——load average 真实含义、CPU/内存/IO 四象限排查、CPU 飙高四步法。

### 第 34 轮（2026-09-08，第十二次启动，内容补充模式第二轮）：Transformer 专篇（ai/basic/foundation 第 3 篇）——Q/K/V 检索类比、√d 缩放与多头、位置编码、Encoder/Decoder-only 分化。

### 第 33 轮（2026-09-08，第十一次启动）：推理参数（ai/intermediate/llm 第 4 篇）——温度与 top_p 的解码本质、top_k vs top_p 对比、任务-参数速查表。

### 第 32 轮（2026-09-08，第十一次启动）：LLM 落地选型（ai/intermediate/llm 第 3 篇）——提示工程/RAG/微调三路线决策树、成本对比、微调别灌知识的判断。

### 第 31 轮（2026-09-08，第十一次启动，用户定向内容补充）：用户定向转入内容补充；Linux 文本三剑客（linux/basic/commands 第 2 篇）——管道心智、grep/sed/awk 分工、日志统计组合。

### 第 30 轮（2026-09-08，第十次启动）：线上站点端到端抽查——新增页线上可达、404 正常，构建→部署→线上完整链路首次闭环验证。

### 第 29 轮（2026-09-08，第十次启动）：部署管道健康检查——GitHub Actions 近 5 次部署 4 success 1 cancelled，最新 HEAD 已成功部署。

### 第 28 轮（2026-09-08，第十次启动，低强度维持）：体检基线与并行新增处置——同步题库深化第三轮提交，verify:docs 全绿，慢构建判定偶发。

### 第 27 轮（2026-09-08，第九次启动）：低强度收尾纯记录轮——体检全绿沿用，无代码改动。

### 第 26 轮（2026-09-08，第九次启动）：构建耗时异常复测——15m38s 恢复 11.5s，判定与并行任务撞车的偶发竞争，无需干预。

### 第 25 轮（2026-09-08，第九次启动，低强度维持）：体检基线与并行处置——同步题库深化首轮（并行会话建 coverage-deepening.md）；发现构建耗时 15m38s 异常。

### 第 24 轮（2026-09-08，第八次启动）：为并行新增 11 个图块补跑双主题对比度审计全绿；顺带修审计脚本容错（三次重试+跳过警告）。

### 第 23 轮（2026-09-08，第八次启动）：新增 verify:docs 与 verify:contrast 一键脚本入口（consistency+mermaid 语法串联），全绿。

### 第 22 轮（2026-09-08，第八次启动，低强度维持模式）：低强度维持——同步并行 6 个新提交（quiz 收藏/侧边栏交互/覆盖度第五轮），体检与构建全绿，无代码改动。

### 第 21 轮（2026-09-08，第七次启动）：状态文件结构性维护——候选表按现状重置；判定常规内容缺口见底，阶段收敛方向权交还用户。

### 第 20 轮（2026-09-08，第七次启动）：core 星标全站分布体检——为 3 个零核心分类补主打篇标记，高占比分类不降标；内容缺口收敛信号。

### 第 19 轮（2026-09-08，第七次启动）：体检增补第 9 项图谱结构检查（节点 id 重复/边端点悬空），全站 9 项全绿零孤立节点。

### 第 18 轮（2026-09-08，第六次启动）：状态文件维护——6 个经验增补段合并为单一主题化经验段，去除过时信息，内容无损。

### 第 17 轮（2026-09-08，第六次启动）：Kafka 生产者路径（kafka/basic/core 第 3 篇）——send() 五步旅程、分区三规则、重试乱序陷阱、幂等生产者；五连验证首次例行。

### 第 16 轮（2026-09-08，第六次启动）：工具固化——8 项一致性体检收编为 scripts/consistency-verify.mjs（exit 1），注入自测通过。

### 第 15 轮（2026-09-08，第五次启动）：ES 集群与脑裂（新建 elasticsearch/intermediate/cluster 分类）——节点四角色、quorum 防脑裂、三色健康排障、磁盘双水位。

### 第 14 轮（2026-09-08，第五次启动）：RocketMQ 消费端语义（rocketmq/basic/core 第 2 篇）——集群 vs 广播、16 级重试与死信流转；mermaid 语法校验纳入例行体检。

### 第 13 轮（2026-09-08，第五次启动）：阻塞项置顶——新增 mermaid 语法守护脚本（逐块 parse+exit 1），补上构建静默吞语法错误的验证缺口。

### 第 12 轮（2026-09-08，第四次启动）：Kafka offset 语义（kafka/basic/core 第 2 篇）——位移提交时机取舍、至少一次因果链、__consumer_offsets 与位移重置追问。

### 第 11 轮（2026-09-08，第四次启动）：MongoDB 文档模型（mongodb/basic/core 第 1 篇）——概念映射表、内嵌 vs 引用建模决策图、16MB 与事务追问。

### 第 10 轮（2026-09-08，第四次启动）：PG 与 MySQL 差异地图（postgresql/basic/core 第 1 篇）——进程模型/MVCC/WAL/索引家族四层差异与 count(*) 追问。

### 第 9 轮（2026-09-08，第三次启动）：Kafka Rebalance 深挖（kafka/intermediate/core 第 5 篇）——JoinGroup/SyncGroup 时序、Generation 防僵尸、增量协作重平衡。

### 第 8 轮（2026-09-08，第三次启动）：RocketMQ 架构篇（新建 rocketmq/basic/core 分类）——四角色与 NameServer 无中心 AP 取舍、CommitLog 集中存储对比 Kafka。

### 第 7 轮（2026-09-08，第三次启动）：Kafka basic 入门（新建 kafka/basic/core 分类）——消息队列三问（同步异步/解耦削峰/代价与何时不用），三件套模式跑通。

### 第 6 轮（2026-09-08，第二次启动）：分类页导读质量体检——修复全站唯一空壳分类页 java/basic/tomcat，体检维度扩至四项。

### 第 5 轮（2026-09-08，第二次启动）：Kafka 高吞吐机制（kafka/intermediate/core 第 4 篇）——顺序写/页缓存/零拷贝/批量压缩/分区并行；三件套模式跑通。

### 第 4 轮（2026-09-08，第二次启动）：Spring 大重构后一致性复检——六项体检五项全绿，修复 13-lombok-apt 未注册侧边栏遗漏。

### 第 3 轮（2026-09-08）：frontmatter 规范与内链体检——470 处内链仅 1 处断链已修；确立 pathspec 指定路径提交纪律。

### 第 2 轮（2026-09-08）：Mermaid 双主题对比度全站审计——239 个含图页面×2 主题全部达标零违规。

### 第 1 轮（2026-09-08）：图谱覆盖度补全——java.json 补微服务总览节点与边；初始化本演进状态文件。

## 经验与判断沉淀

### 工作纪律

- 每轮开工：`git pull --ff-only` 同步 → `git status` 定界占用区 → 只提交本轮自建/自改文件；**必须 `git commit -- <pathspec>`，禁止裸 commit**（第 2 轮实际吞过并行会话已暂存内容）。
- Edit 冲突两则：①stale（文件被并行会话改）→ git status 确认 → 重读目标段 → 重新插入；②old_string 必须从最近 Read 的实际内容复制，**禁止凭记忆重打**（kafka.json 与本文件各踩过一次）。
- 图谱 JSON 多轮追加后、提交前 JSON.parse 校验；题库自 2026-09-23 起由演进任务的 **C 车道**
  单写者维护（原每 2 小时独立 cron 已停用，队列仍在 `coverage-deepening.md`），
  字段合法性由 `scripts/quiz-verify.mjs` 卡住；仍不得与并行会话同时写同一题库文件。
- 影像资产（配音视频 / 图卡）纪律：只从既有动画与正文派生，不新造事实；逐帧口播与源动画
  帧数一一对应，禁止无稿口播；帧尺寸必须等高（`media-capture` 自动钉），逐帧切片再拼接
  （ffmpeg concat 对图片 `duration` 不可靠，实测 10 帧压成 3 段）；截图前显式
  `dataset.theme='light'`，只设 `colorScheme` 无效；成片尺寸时长要回填 `media.ts`，
  闸门在 `scripts/media-verify.mjs`。口播字数按 **3.9 字/秒 + 每帧 0.35s 呼吸** 预算
  （`Tingting` 实测），9 帧成片文稿总长上限约 210 字——超 60s 时精简文稿，不拉长片子。
  但该公式**含英文标识时偏悲观**（第 172 轮 237 字 8 句实测 48.1s，公式估 60.5s 会误判超限）：
  `say` 读 `FIN_WAIT_1` 这类缩写按字母、比同字数中文快，定稿前逐句 `say -o` + `ffprobe`
  量真实时长再判，不照公式砍稿（第 174 轮 6 帧 182 字实测 41.6s ≈ **4.6 字/秒**，是这条判据的第三个数据点）。
  成片尺寸以 `ffprobe -select_streams v:0` 或浏览器 `videoWidth/videoHeight` 为最终依据；
  第 174 轮曾记录 `media-encode` 打印 730 而真值 732，**第 176 轮同输入复跑未能复现**（打印 732），
  故只留「回填前自己核一次尺寸」的纪律，不改脚本。
  **封面有 150 KiB（153,600 B）闸门**：第 187 轮 `kafka-segment` 帧 0 偏复杂，脚本原生产出
  154,031 B 直接超限——不必改脚本也不必量化成 256 色（有损），对同一帧加
  `-pred mixed -compression_level 12` 即可无损压到 148,355 B（用「解成 raw rgb24 比 md5」
  证明像素零改动）。这条 CAP 常数要先算再落账：本轮首版轮次记录写成「闸门当场判红」，
  实际当时并未跑过闸门，收尾才补做还原复跑把它变成实测（详见该轮记录）。
  每支短片帧说明的**字数 × 帧数**要先对着 60s 预算过一遍：帧数 ≥10 且帧说明普遍上百字
  （如 es-write）时口播预算会掉到 22 字/帧以下，这类动画要先在正文侧精简文稿再做片。
  细则见 `guide/diagrams`「配音短片与图卡」。
- 共享工作树的三条并发纪律（第 175/176 轮连撞，写死）：① **轮次号要在提交前复算一次**——
  `evolution.md` 是共享文件，两个会话会把同一个 `n` 各算一次（第 175 轮就这么撞给了并行的
  A 车道会话），收尾前用 `grep -o "^### 第 [0-9]* 轮" docs/evolution.md | sort -u | tail -1`
  确认自己写的号仍是「最大号 +1」，撞了就顺延、不重排对方已入库的记录；
  ② **浏览器量算（对比度审计、宽度审计）前必须确认没有并行 `pnpm build` 在同一工作树清空重建
  `dist`**——`pgrep -f astro.mjs build` 加看 `dist/index.html` mtime；第 175 轮（对比度审计只报
  66/385 页）与第 176 轮（宽度审计首轮 57 页落在重建窗口内）各自独立踩到，属常态而非偶发；
  ③ 与他人改动零重叠时照常按 pathspec 提交自己的文件，**台账 `evolution.md` 里只写自己新增的
  行**，改他人记录一律用显式降级/划除写法保留原文，不静默删除。
- 量代码块逐行宽度要按站点的 **`div.ec-line`** 行元素取 `getBoundingClientRect().width`：
  这类渲染结构下 `pre.textContent` 里**没有换行**，用 `split('\n')` 会把整块当一行（实测报出
  10012px 的假数）。判据仍用 `pre.scrollWidth > pre.clientWidth`，它直接等于「读者要不要横向滚」。

- astro.config.mjs 是高冲突文件（手动侧边栏），stale 频发但按纪律可安全使用；guide/diagrams、guide/resources 为体检豁免项（元文档）。
- **开工第 3 步跑 `pnpm verify:docs` 是唯一的复算点，别人的「本轮已跑绿」不能替代它**（第 189 轮实测：`1e5abec` 自述 25 项全绿、入库态却是 exit=1）。修基线时先归因再动手：`git log -S"<死链原文>" -- <文件>` 能一句话锁定引入提交，避免把他人已修的东西当成自己的发现。
- 站内绝对内链最容易写错的是**等级段**（`basic`/`intermediate`/`advanced`）——目录层级、笔记标题都不能证明它，只有 `src/data/graphs/<方向>.json` 的 `href` 与 `astro.config.mjs` 侧边栏的 `link` 两处是登记过的真值；改法照这两处，别按语义猜。
- **共享文件里只入自有 hunk 的正确姿势是重建 index，不是按 pathspec 提交**（第 189 轮实操）：`git commit -- <路径>` 对**该路径按工作树内容入库**，对方未提交的 hunk 会被一起带走（配方 §4.2 那句「`git commit -m ... -- <自有路径>`」在混合作业文件上是反效果）。可靠做法：`git show HEAD:<文件>` 取基线 → 只对基线施加自己的那几处改动（每处 `assert` 命中次数）→ `git hash-object -w` → `git update-index --cacheinfo <mode>,<blob>,<路径>` → 用 `git diff --cached --numstat` 与 `git cat-file blob :<路径> | grep -c <对方标记>` 双向核对（自有行数对、对方内容 0 命中），再以普通 `git commit`（只吃 index）落库；工作树保持原样，对方的改动一个字都不动。第 189 轮 `coverage-deepening.md` 即如此处理：暂存 1 加 1 删，对方「第六十八轮（第 190 轮｜车道 C）」与 3 道 ai 新题全部留在工作树。**建议下次修订配方 §4.2 时把「混合作业文件走 index 重建」写成显式分支**——属规范改动，本轮未自行修改 `docs/evolution-recipes.md`。

### 选题方法

- "根基缺失"模式三连验证（kafka 三问/PG 差异地图/MongoDB 文档模型）：薄弱方向先补"是什么/为什么/怎么选"，再深挖机制。
- 判断缺口必看目标篇目 ## 大纲，篇数不可靠：ES、rocketmq 分片键、nginx 都凭大纲避免了重复写作；seata/zookeeper 篇少但覆盖深不算缺。
- 勘察先行、候选可退场：middleware 已有 MQ 选型专篇即退场，不为写而写；选题按"面试出场率 × 与现有内容互补度"。
- 定量工具：方向笔记数排序找薄弱面（java 94 篇 vs etcd 2 篇），再进大纲细察。

### 三件套与验证

- 新建分类流程模板化：复制既有分类页改四处参数（组件名勿手写，CategoryIsland 教训）→ 写笔记 → 侧边栏分组 → 图谱节点/边 → 五连验证 → pathspec 提交。
- 体检体系：`scripts/consistency-verify.mjs`（10 项固化）+ `scripts/mermaid-syntax-verify.mjs`（语法守护，针对构建静默吞错的补丁，经注入自测）+ `scripts/quiz-verify.mjs`（题库 8 项）+ `scripts/media-verify.mjs`（影像 7 项）四者并入 `pnpm verify:docs`；`scripts/mermaid-contrast-verify.mjs`（双主题对比度，需 preview）单独跑。
- 配色守护分两层、缺一不可（第 170 轮）：**源码层**禁写颜色（一致性第 10 项，静态、离线、每轮必跑，覆盖 mermaid 围栏 + `src/data/viz/*.ts`），**结果层**量对比度（`mermaid-contrast-verify`，能抓到主题令牌本身的失效，但依赖 preview 且只覆盖 mermaid 渲染出的文字）。写新图表时以源码层为准：要区分语义只用 `good/bad/hl/rb-black/rb-red` 五个类名。
- 跑对比度审计前必须先确认 `dist` 新于工作树（第 170 轮实测在跑的 preview 挂着陈旧 dist，`/ascension/guide/` 直接 404 而页面数照跑，漏页不报错）：先 `pnpm build` 再 `astro preview stop && pnpm preview`；`astro preview` 全站单实例，替换他人会话起的实例属本地只读服务、可安全重起，但要在轮次记录里写明。
- 无图表笔记用表格/代码块承载结论（有 mermaid 才需跑对比度审计）；时序图（sequenceDiagram）适用于协议/流程类内容。
- 引用外部官方文档的口径与链接前，先确认真实出处（第 171 轮）：凭记忆写的 `react.dev/learn/rendering-performance` 实测 404；用 context7 对官方文档索引取回原话及其所在页面 URL 再落笔，现行索引取不到的机制断言可用 legacy 文档兜底佐证。

## 待用户决策

- 无人值守演进**同一时刻有多个写者**，轮次号与车道游标已被证明会撞：2026-09-25 一天内三次（本会话第 176 轮与并行 A 轮同取 175；本会话第 179 轮开工算 178、收尾发现已被占用；并行会话第 177 轮的提交号 177 与其在 `coverage-deepening.md` 写的「第 175 轮」错位）。**2026-09-26 第 189 轮又添一种形态**：并行会话的 A 车道产出（`1e5abec`，roadmap B1 第三批）入库后没占号，按其上轮留下的指令由本会话**代记**为第 188 轮——于是 188、189 两条记录同由一个会话执笔，188 那条只能写「可由 git 复核的事实」而不能替对方补选题心证；同轮还纠正了上轮入口的一句算术（189 mod 5 = 4 → A，不是 C）。**同日第 190~192 轮再暴露「漏号」形态且在累积**：并行会话两笔 A 车道产出入库后都没写轮次记录——`06e2d7b`（roadmap RD-02，`redis/intermediate/usage/08-observability`）与 `f97ed7a`（OPS-01，`kubernetes/intermediate/ops/05-java-on-k8s`，B1 末条），而 190/191/192 三个号已被各会话按「最大号 +1」用掉，实测本文件 2026-09-26 只有 189~192 四条记录、这两笔产出在台账上**永久无号**；第 191 轮写明「本会话不代写对方条目」，第 192 轮沿用同一纪律，说明「由下一会话代记」在实践中并不稳定发生，只靠纪律兜会持续丢历史。**推荐 A**：把定时任务收敛为**单写者**（同一时刻只允许一个演进会话跑，其余排队），并在配方 §4 增一步占位提交（把原 §0 的占位建议落到 commit 之前）：commit 前先往 `evolution.md` 追加本轮标题行（`### 第 n 轮（进行中）`）并单独提交推送，让 `n` 由提交顺序而非计算决定；**备选 B**：保持并发，但把全局号从 `evolution.md` 挪进一个只增不改的独立计数文件（如 `docs/evolution-counter`），谁 push 成功谁得号；**备选 C**：维持现状，靠每轮「收尾复算 + 顺延登记 + 代记」的纪律兜（第 187/189 轮就是靠这条兜住的，代价是台账出现越车道登记、代记条目与两套编号错位）。影响：这是流程与规范改动，涉及定时任务与其他并行会话的行为，按纪律不擅自动手。


- 代码块宽度：纸面规则与真实渲染差 2 列，选哪条路？第 176 轮实测——代码块字号 **14.4px**（AGENTS.md 写的是 14px）、ASCII 字宽 8.65625px、CJK 14.40625px（**1.664× ASCII，不是规则假设的 2×**）、1280 视口 `pre` 可用宽 674px ⇒ 真实上限 **77.9 个 ASCII 列**。按 ≤80 视觉列判定的 4 行已全部修完，但按真实常数全站仍有 **70 处代码块 / 57 页**需要横向滚动（最宽行 682~724px），这些行按现行规范是合格。**推荐 A**：把代码块字号 14.4px→14px（改 `src/styles/custom.css` 一处，80 视觉列 = 672px < 674px 就此成立，57 页几乎同时自愈），代价是全站代码视觉缩小约 3%、需 preview 抽查行高与滚动条观感；**备选 B**：不动样式，逐页重排 70 处（57 文件、约 15 轮量，零视觉风险但战线长）；**备选 C**：只把规范改严为「≤77 视觉列」并补第 11 项闸门（1 文件，规则与渲染对齐，但现有 57 页读者仍要横向滚）。影响：这是全站排版判断，A/C 均涉及既有读者观感与既有 533 篇的写作口径，按纪律未擅自落地。


- 是否把 `pnpm verify:docs` 接进部署流水线：第 170 轮核验 `.github/workflows/deploy.yml` 只有 `pnpm install` + `playwright install chromium` + `pnpm build`，**没有任何体检步骤**——25 项静态闸门（含本轮新增的配色闸门）全部依赖本地纪律，并行会话漏跑即静默入库、且 GitHub Pages 会照常发布。推荐选项：在 `Build` 前加一步 `run: pnpm verify:docs`（仓库已有 chromium 缓存步骤，成本约 1 分钟）；备选：维持现状（不占 CI 额度，但闸门形同建议）。影响：改动对外可见的 CI/CD 流水线，按纪律不擅自动手。

- 阶段目标确认：本文件「当前阶段目标」为无人值守自定（内容体系充实），推荐选项：维持；备选：用户指定内容路线图或阶段（如「把 XX 方向补完」）。影响：决定后续轮次选型方向。**21 轮后补充**：常规内容缺口已收敛，若继续本阶段，后续轮次自然放缓；更推荐用户给出下一阶段（如「提高已有功能使用率」需真实用户数据、「按你的学习计划补某方向」）。
- core 星标全站策略：36 个分类核心占比过高（部分 4/4 全标，星标失去区分度），14 个零核心分类中 11 个（linux/tools/单篇）留白待定。推荐选项：维持现状（不同方向 core 语义可以不同）；备选：定一条规则（如每分类最多 2 篇核心）并由用户/会话统一执行——影响：分类页核心导航的可用性。
- guide/diagrams、guide/resources 是否需要注册进侧边栏：推荐选项：维持现状（元文档）；影响：极小。
- 是否补 AI 生成的概念插画（位图）：2026-09-23 用户已选定「补齐无图笔记 + 动画导出 PNG 卡片」这条零幻觉路线，AI 插画**未采纳也未否决**。推荐选项：维持现状（矢量图已覆盖 83% 笔记，插画装饰性强、技术标签易错）；备选：允许对**不含任何文字标签**的抽象隐喻插画开一道口子，由人工逐张过审——影响：需要新增一条媒体来源与审核流程，且与「图中每个节点都要有出处」的质量红线存在张力。
- 配音音质是否可接受：现用 macOS 自带 `Tingting`（离线、零额度、零凭据），实测样片 `mysql-2pc-video` 57.2s / 0.90MB，语速偏机械。推荐选项：先用着（教学信息完整）；备选：换云端 TTS 需你提供凭据并同意按量计费，且成片体积会增大——影响：`scripts/media-encode.mjs` 的 `say` 调用要换成可插拔后端。
- 第 180 轮验证阻塞（2026-09-25）：工作区有从 17:56 起零 CPU 挂起的共享 `astro build` 进程，首轮构建调用未保留退出码；contrast 审计虽通过 386 页×2 主题，但报告 dist 有 1 页与内容树不一致，不能视为新鲜构建结果。为避免并发重建覆盖共享 `dist`，已撤回本轮速答行与候选记录，未提交未推送；待共享构建进程结束后重跑 `pnpm build`、确认 dist 新鲜，再按第 180 轮 D 车道完成。

- **B 车道（影像资产）在 Windows 机器上管线阻断（第 196 轮机器迁移暴露，2026-09-27）**：`scripts/media-encode.mjs` 的配音依赖 macOS 自带 `say -v Tingting` 与 `/opt/homebrew` 探测，Windows 上均不存在（另含同型绝对路径 import 缺陷，属候选表第 15 行①，修法已有先例）。既有 8 支成片全部产自 macOS，B 队列余 37 支。**推荐 A**：B 车道暂时只由 macOS 会话执行，Windows 会话按 §3 让位 C/D（第 197 轮入口已如此预排）；**备选 B**：你同意把 `media-encode` 的 TTS 改为可插拔后端并指定 Windows 可用的引擎（音质会变——注意「配音音质」一项你尚未裁决）；**备选 C**：撤 B 车道、把游标格还给 A/C。同机附带一问：是否为仓库加 `.gitattributes`（`* text=auto eol=lf`）以统一各机工作区行尾——闸门脚本已于第 196 轮改为读入归一可自护，但仓库其余工具/脚本仍各凭机器 autocrlf 运气；加一个仓根文件即可根治，代价是影响所有贡献者的检出行为，按纪律不擅自落地。影响：涉及车道表实质吞吐与仓库级配置，需你拍板。

- **B 车道游标已二次落到本机不可执行的产法，请裁决（第 197 轮，2026-09-27）**：游标 `197 mod 5 = 2` 再次判 B，本轮按配方 §3 退位到 C 完成产出（未空转），但这坐实了**车道表在本机每 5 轮必有 1 轮退位**，且 B 队列 37 支自第 192 轮起原地不动。三条路线：**A** 本机装 ffmpeg + 把 `media-encode` 的 `say` 换成可插拔 TTS 后端（需你提供凭据并同意按量计费，与现「零凭据、离线」前提决裂）；**B** 授权「导出图卡」走 `media-capture` 截帧后取末帧手工导出这条配方里没写的产法，并为它补一条选型前提（什么内容值得出站图卡）；**C** 在配方 §1 给 B 加平台前提（例如非 macOS 机器上余数 2 并入 C），把退位从每轮重复动作改成表内规则。推荐 **C**（零成本、不动生产内容、不引入凭据、不改既有 8 支成片的产法）。影响：涉及车道表实质吞吐与配方改表，按纪律不擅自动手。
