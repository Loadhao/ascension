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
| 11. 缩进写法的 mermaid 围栏被两道静态闸门整块漏检：`consistency-verify` 第 10 项与 `mermaid-syntax-verify` 用行首锚定正则 `^```mermaid`，列表项内缩进书写的围栏不匹配。实测严格锚定 **538 块 / 411 篇**、容忍 `^[ \t]*` 缩进 **559 块 / 412 篇**，差 **21 块**分布在 **2 个文件**（`guide/diagrams.mdx` 20 块示例、`tools/basic/cli/03-jq.md` 1 块正文图示）。这些围栏**确实会渲染成读者看到的 SVG**（`dist/tools/basic/cli/03-jq/index.html` 含 `id="mermaid-`，而源文件按严格正则算「无围栏」——第 181 轮 dist 比对时暴露为唯一「有图无围栏」页），后果是该块既不过语法校验也不进硬编码颜色审计。改法：两处正则统一放宽为 `^[ \t]*`，预期块数 538 → 559，落地前先确认那 21 块无 `fill:`/`%%{init}` 且语法可 parse | 修问题 | 3 | 0.95 | 1.5 | 1.9 | **已完成（第 200 轮）**：三处围栏正则统一放宽为 `^[ \t]*`（含闭合围栏），块数 567→588；落地前置三条实测做完（21 块 parse 全过、无硬编码颜色、确实渲染成 SVG），并注入违规样本反证两道闸门均判红、旧严格锚定同场读 567 块全隐形 |
| 12. 站内已有动画的媒体派生队列：候选由 `node scripts/evolution-candidates.mjs --top 20` 每轮现算；第 182/187/192/202 轮已完成 `redisson-watchdog`/`kafka-segment`/`es-write`/`java-classload`，每片 ≤60 秒 / ≤4 MB。B 轮口径（第 192 轮实证）：10 帧级动画可直接开做，逐帧文稿去空白 ≤30 字、以中文为主、含英文标识时逐句实测语速，「须先精简帧说明正文」的前置已作废。**第 202 轮补一条口径**：7 帧级更宽裕（200 字文稿、口播 46.09s、成片 48.5s，实测语速 4.34 字/秒，比 4.5 的估算略慢），帧数少时不必把每句压到 25 字以内，留到 26~31 字反而正好贴着预算 | 改善体验 | 3 | 0.9 | 2 | 1.35 | 进行中（已完成 4 项，队列余 **36** 支，头部 `kafka-producer`、`redis-sentinel`、`mysql-replication`；第 197 轮游标落 B 因**当时那台 Windows 会话**管线阻断未产出，第 202 轮在 macOS 会话同游标**未退位、已产出**，见第 15 行与「待用户决策」） |
| 13. `media-encode` 封面不带 PNG 压缩参数会撞 `media-verify` 的 150 KiB 上限（第 187 轮 kafka-segment 首跑 154,031 B 实证），同轮登记判红文案 `0.15MB > 0.15MB` 读不出超限量级的缺陷——封面命令补 `-pred mixed -compression_level 12`（无损，256 色量化属有损不取）、判红改按字节打印，第 189 轮已落地并对 6 张在仓封面双跑回归（解 raw 后 md5 一致、像素零改动） | 修问题 | 3 | 0.95 | 1 | 2.85 | **已完成（第 189 轮）** |

| 14. `scripts/evolution-candidates.mjs` 车道游标建档即 off-by-one（余数 4 打成 B、余数 0 打印为空；git 逐字节取证自建档 `dbf9468` 未改过，非回归，D 轮此前靠会话按配方自行解读）——第 195 轮改为按余数显式建表 `LANES`（0→D、1/4→A、2→B、3→C，键即 `n mod 5`，与配方 §1 逐格同构；位置数组会随改表静默错位故不取）并补 `--round n` 覆盖参数（覆盖时明示「未读台账」、非整数 `exit 2`），一整圈余数回归与配方 §1 逐格一致 | 修问题 | 3 | 1.0 | 1 | 3.0 | **已完成（第 195 轮）** |
| 15. **Windows 机器迁移残留（第 196 轮现场勘察）**：本仓 2026-09-27 起出现第一个 Windows 会话（用户级 `core.autocrlf=true`、无 `.gitattributes`，`git ls-files --eol` 读数 `i/lf w/crlf`）。本轮已修 `verify:docs` 侧 4 处（`consistency-verify.mjs` 两处按 `\n` 锚定的读入加行尾归一、`mermaid-syntax-verify.mjs` 同、`media-verify.mjs` 与 `evolution-candidates.mjs` 的 Windows 绝对路径动态 import 改走 `pathToFileURL`）→ 25 项绿、565 块真读数。**未修的四处残留**：① `media-encode.mjs:45` 同型绝对路径 import，B 车道产法工具在 Windows 一跑即崩（修法照本轮）；② `mermaid-contrast-verify.mjs:30` 围栏正则仍 `\n` 锚定——CRLF 检出下会读 0 块并打印「0 处低于 4.5:1」的**假绿**，动图表的轮次用该审计前必须先修（修法=本轮同款读入归一，POSIX LF 行为不变）；③ 本机无 ffprobe（ffmpeg），`media-verify` 第 4 项音轨/时长核验空转（本轮实测 ⚠「未找到 ffprobe，跳过」），属环境动作非改码；④ B 车道配音依赖 macOS `say`，本管线在 Windows 整体不可用——已提请「待用户决策」。①②各 1 文件、修法明确，为 D 队列首选。**第 197 轮①二次复现**：`node scripts/media-encode.mjs --demo mysql-2pc-video` 实跑仍崩 `ERR_UNSUPPORTED_ESM_URL_SCHEME ... Received protocol 'd:'`，同轮实测本机 `ffmpeg`/`ffprobe`/`say` 三者皆缺 ⇒ 第 ④ 项由推断升为实测，B 车道在本机连续两轮（197 游标 2）无合格候选 | 修问题 | 4 | 1.0 | 1.5 | 2.67 | 部分完成（第 200 轮收口 ①②：`media-encode` 走 `pathToFileURL`、对比度审计补行尾归一并加「期望集空转即判红」守卫。**②的失效机理按本轮沙箱实测改写**：不是「读 0 块打印 0 处低对比」，而是 1:1 完整性自校验空转、dist 残缺时会被当完整读数放过。③④仅在 Windows 会话成立，本机 macOS 三件套齐） |

历史已完成项存档：图谱覆盖度补全（第 1 轮，100%）、Mermaid 对比度审计（第 2 轮，零违规）、frontmatter/内链/分类页导读/图谱结构体检（第 3/4/6/19 轮，均全绿并固化为 scripts/consistency-verify.mjs）、方向内容补全（第 5/7/8/9/10/11/12/14/15/17/20 轮，16 篇 + 5 分类）、工具固化（第 16 轮）、状态文件整理（第 18 轮）。

## 轮次记录

> 2026-09-27 体量压缩：第 190 轮及更早记录压缩为每轮单行（保留轮次号/日期/车道与真实性标注/一句核心结论；
> 第 1–100 轮的一句事实按压缩前时点的 git 历史 `4a36479` 补回）。完整详录与过程细节见本次压缩前的 git 历史，
> 不恢复；最近 5 轮（191–195）保留详录；「候选项」「经验与判断沉淀」「待用户决策」三区块未压缩。
> **2026-09-27 第 197 轮增量压缩**：本轮记录追加后端面 156,632 字节（152.96 KiB）越过 §7 的 150KB 闸门，按同一红线把第 191、192 两轮压为单行（记录头一字未改），上一行所述「最近 5 轮（191–195）保留详录」自本次起失效，最近 5 轮＝193–197；详情见 git 历史。
> **2026-09-27 第 198 轮增量压缩**：本轮记录追加后端面 152,227 字节（148.66 KiB），按第 197 轮已确立的同一读法（闸门＝150,000 字节）再次越线，故把第 193 轮详录压为单行（记录头一字未改、轮次号未动、删 9 条 bullet），压缩后 142,268 字节（138.93 KiB）；「最近 5 轮」自本次起＝**194–198**，上一行的 193–197 失效。详情见 git 历史。台账每轮净增约 5~8KB，按此增速下一轮大概率再次触发，开工先复测字节数。
> **2026-09-28 第 199 轮增量压缩**：本轮（A 车道新章节）记录追加后端面 161,966 字节（158.17 KiB）越过 §7 的 150,000 字节闸门，按第 197/198 轮同一读法把**第 194 轮详录压为单行**（9 条 bullet 删除、记录头一字未改、轮次号未动）；「最近 5 轮保留详录」自本次起＝**195–199**，上一行所述 194–198 失效。详情见 git 历史。
> **2026-09-28 第 200 轮增量压缩**：第 199 轮记的「闸门余量已归零、下一轮必触发」在本轮兑现——开工实读 149,957 字节，追加本轮记录必越 150,000 线，故按 §7 把**第 195 轮详录压为单行**（13 条 bullet 删除、记录头一字未改、轮次号未动，压缩动作由临时脚本 `tmp-compress-200.mjs` 完成并跑完即删，脚本内断言「压缩区只含 bullet 与空行」防误删他轮），压缩后 137,830 字节；「最近 5 轮保留详录」自本次起＝**196–200**。下一压缩对象＝第 196 轮详录。详情见 git 历史。
> **2026-09-28 第 201 轮增量压缩**：开工实读 154,703 字节（已越 §7 的 150,000 线，第 200 轮预警的「下一压缩对象＝第 196 轮详录」在本轮兑现），故本轮先把**第 196 轮详录压为单行**（9 条 bullet 删除、记录头一字未改、轮次号未动），再追加本轮记录；「最近 5 轮保留详录」自本次起＝**197–201**，上一行所述 196–200 失效。下一压缩对象＝第 197 轮详录。§7 的新口径仍在「待用户决策」（第 200 轮所提 A/B/C 三条路线），本轮未自行改配方。详情见 git 历史。

> **2026-09-28 第 202 轮增量压缩**：开工实读 **166,798 字节**（第 201 轮预警的「下一压缩对象＝第 197 轮详录」在本轮兑现——窗口随本轮入库前移为 198–202），故先把**第 197 轮详录压为单行**（12 条 bullet 删除、记录头一字未改、轮次号未动，压缩由临时脚本 `tmp-evolution-202-compress.mjs` 完成并跑完即删，脚本内断言「压缩区只含 bullet 与空行」防误删他轮），压缩后 **154,018 字节**；「最近 5 轮保留详录」自本次起＝**198–202**，上一行所述 197–201 失效。**自此窗口外一字一行皆无可压对象**，§7 的新口径仍在「待用户决策」（第 200 轮所提 A/B/C 三条路线），本轮未自行改配方、未删他轮历史。详情见 git 历史。

> **2026-09-28 第 203 轮增量压缩**：开工实读 **169,716 字节**（已越 §7 的 150,000 线约 20KB）。第 202 轮记的「窗口外自此一字一行皆无可压对象」在本轮因**入库窗口前移**而解除——追加第 203 轮记录后「最近 5 轮」＝**199–203**，第 198 轮详录自此落到窗口外，按 §7 压为单行（13 条 bullet 删除、记录头一字未改、轮次号未动，压缩由临时脚本完成并跑完即删，脚本内断言「压缩区只含 bullet 与空行」防误删他轮），压缩后 **153,825 字节**；「最近 5 轮保留详录」上一行所述 198–202 失效。下一压缩对象＝**第 199 轮详录**（须待第 204 轮入库、窗口前移为 200–204 之后）。§7 的新口径仍在「待用户决策」（第 200 轮所提 A/B/C 三条路线），本轮未自行改配方、未删他人历史。详情见 git 历史。

### 第 203 轮（2026-09-28，车道 C 题库｜游标一致，未越车道｜题库深化第 74 轮）：多键索引首题 + ThreadLocal / ConcurrentHashMap 第二题——a 类头部「1 条补缺 + 2 条第二题」一次收掉，补满 2 题的两篇就地留第三题角度、hint 撞车在入队环节兜住

- 取号与车道：开工 `git pull --ff-only` → `Already up to date`（HEAD `0a7d0b5`，与 `origin/main` 同 sha、无分叉，不触发 §0.1）；`git status --porcelain` **干净**（无他人未提交改动，全程自有 3 个产出文件 + 台账 1，未与他人字节争抢同一文件）。基线 `pnpm verify:docs` **exit 0、25 项全绿**（一致性 10 项 + mermaid 语法 591 块 + 题库 8 项 **681** 题 + 影像 7 项 9 资产；本机 macOS `ffmpeg`/`ffprobe`/`say` 齐备、影像第 4 项为真验），不触发 §0.3 强制 D。台账最大号实读 **202**，本轮取 **203**；`node scripts/evolution-candidates.mjs --top 8` 打印「下一轮 = 第 203 轮，203 mod 5 = 3 → 车道 **C 题库**」，与配方 §1（3 → C）逐格一致、**未越车道**；勘察读数「笔记 564 篇｜题库 476 篇有题｜动画 44 支｜影像 9 个」，A 兜底双缺 20 / 纯文字无图 89 / 有图零题 68，B 队列 36、**C 队列 25**。提交前按第 202 轮入口口径复算一次游标（并行会话会顶掉号）仍判 C。
- 选题证据（配方 §2「取队列头部 3 条」+ `coverage-deepening.md`「新题红线」）：a 类头部三条逐条独立核实为真缺口——遍历 33 份题库、基线 **681** 题按 `noteId` 计数，实读 `mongodb/intermediate/usage/09-multikey-index` **0 题**（第一题补缺）、`java/intermediate/concurrent/06-threadlocal` **1 题**（`java-threadlocal-004`，multiple d4，考「泄漏成因链：key 弱引用 / value 强引用 / 线程池核心线程长存放大残留」）、`java/basic/collection/03-concurrenthashmap` **1 题**（`java-chm-007`，single d3，考「1.8 取消 Segment、靠 CAS 初始化/扩容 + synchronized 锁单个桶头」）；三篇 `core: true`、`level` 与目录等级段一致（前两篇 `intermediate`、chm `basic`），队列指定角度与各篇 `description` 逐字对应。两篇宿主实为 **`.mdx`**（chm 内嵌 `<AlgorithmVizIsland demo="hashmap-vs-chm" />`），已按 `git ls-files` 复核路径存在——`noteId` 不带扩展名，写错只静默 404，现由题库体检第 4 项卡住。
- 内容要点（三题均 `multiple`、`difficulty` 全 4；**fact 全部取自本轮通读的正文与该篇「高频追问速答」，零新增事实**）：**`mongo-multikey-015`**（`quiz/mongodb.json` 纯追加 20 行）考「数组字段自动多键化 + 一次查询只能用一个多键索引 + 复合索引至多一个数组字段 + `$elemMatch` 防跨元素假匹配」，三个正确项分别落 `{tags: ["mongodb", "database"]}` 在索引里产生两个条目、两数组字段的复合索引会笛卡尔积爆炸故无法创建、点路径自动多键**只允许一层嵌套**；两个错项取该篇「两条硬限制」被说反的样子——「`{tags:"a", categories:"b"}` 能同时用上两个多键索引求交集」（正文：优化器只选一个、另一个条件靠回表过滤）与「点路径可无限层自动多键」。**`java-threadlocal-140`** 考「key 用弱引用是止血带而非病因（把泄漏范围从「key + value 一起挂着」缩到「只剩 value 挂着」）+ InheritableThreadLocal 为什么在线程池里失灵 + TTL 的捕获快照—执行前重放 + 开放寻址与 `0x61c88647`」，错项取该篇明写反对的「弱引用正是泄漏根源、换强引用可根治」（正文：强引用反而让 key 连同它带过的所有 value 一起陪葬到线程结束）与「ThreadLocalMap 用拉链法逐桶比对」（正文：开放寻址，不是拉链）。**`java-chm-141`**（与前题同文件，两题合计纯追加 40 行）考「get 不加锁靠哪两处 volatile + 为什么禁 null 键值 + `size()` 为什么只能弱一致 + ForwardingNode 对 put 与 get 的两条不同分流」，错项取「get 也要 synchronized 锁桶头只是持锁时间短」（正文：读不加锁，靠 `val`/`next` 的 volatile 加 `tabAt` 走 `Unsafe.getObjectVolatile` 读数组元素）与「value 允许为 null、get 返回 null 时再用 `containsKey` 确认」（正文：putVal 第一行抛 NPE，理由是并发下的二义性）。三题 `answer` 为 [1,3,4] / [1,2,4] / [1,3,4]，正确项各 3、错项各 2，hint 里「第 N 项」人类序号与下标逐条对账。
- ⚠ **一处探针缺陷被当场纠正（不掩盖）**：第一趟真机核验在 `page.goto()` 返回后立刻读 setup 汇总，早于 React hydration，三题一律打印 SSR 默认的「已选 **33** 个方向 · 未刷 **684 / 684** 题」——与播种结果不符；若就此收尾，「播种生效、本轮只出这一题」就成了无证据的断言。补第二趟：`waitForFunction(/已选 1 个方向/)` 落定后再读才拿到真读数。**读数与预期不符时先怀疑探针自身**，与第 201 轮 `getComputedStyle().fill` 两主题同值、第 202 轮 `video[src]` 选不到元素是同一类错误。
- **真机端到端**（本机 Playwright + chromium 1440×900，非 600px MCP 视口；开工 `lsof -nP -iTCP:4321` 与 `pgrep -fl astro.mjs` 实测端口空闲、无并发 build，`pnpm preview` 为本轮自起并收尾停用、全程独占 dist）：逐题播种 `ascension-quiz-state-v1`（同方向其余题标已刷、scope 只勾该方向、关随机）后设置页如实打印「**已选 1 个方向 · 未刷 1 / 18 题**」（mongodb）与「**未刷 1 / 142 题**」（java 两题各一趟），开一轮后本轮进度均「**1 / 1**」、题面与数据**逐字相等**、选项 **5** 项、徽标 **★★★★☆ 难**与 difficulty 4 对应、chip 为「MongoDB/多选」「Java/多选」；只勾一个错项提交判「**✗ 回答错误**」并渲染 hint **221 / 262 / 272 字**，选项态与 `answer` 逐项一致（015 = `is-wrong|is-correct|is-dim|is-correct|is-correct`、140 = `is-wrong|is-correct|is-correct|is-dim|is-correct`、141 = `is-wrong|is-correct|is-dim|is-correct|is-correct`）；换全新 context 勾满正确项三题均判「**✓ 回答正确**」；「查看完整笔记」三条 href 逐个 `request.get` **200**（noteId 非静默 404）；选项区 `scrollWidth == clientWidth` **零溢出**；**未播种访问 0 处 JS 错误**、`scrollWidth/innerWidth` = **1440/1440**；三题 id 各命中 `dist/guide/quiz/index.html` **1** 处（未被静默丢弃）。
- 队列销号与追加（`docs/coverage-deepening.md`）：a 类头部三条销号；追加 **3** 条——`09-multikey-index` 的**第二题**角度取该篇「高频追问速答」里未被首题触及的两行（写放大：N 元素 = N 个索引项、超大数组走桶模式拆分；覆盖查询为何对多键不友好——数组字段返回的是数组本身），`06-threadlocal` 与 `03-concurrenthashmap` 补后各满 2 题、就地留**第三题**角度（分别取「Map 挂在 Thread 身上这条关键反转与 `tl.get()` 的读写定位路径」「double check 防的是锁错对象 + 树化双条件：链长 ≥8 **且** table ≥64」），四条角度均出自本轮通读正文、与同篇已有题不重叠。追加前跑现算口径复核（文档口径 `grep -rl "^core: true"`）：core 笔记 **371** 篇（与第 198 轮同读数）∩ 全站题数恰为 1 ∩ 不在队列 = **159** 条（第 198 轮为 164，减少即 chm/threadlocal 两篇出池所致），分布 java 30 / algorithm 30 / ai 26 / distributed 19 / python 8 / mongodb 8 / linux 8 / js 7 / network 6 / git 5——**本轮未从该池另取新篇**，理由同第 198 轮：另取须先通读才落得出角度，而刚通读的三篇角度已有正文直接支撑。销追后 a 类维持 **10** 条（1 第一题 + 6 第二题 + 3 第三题）、队列总条目维持 **25**（a 10 / b 2 / c 1 / d 12）；「已完成记录」补「第七十四轮（第 203 轮｜车道 C｜题库深化第 74 轮）」对齐两套编号。**一条 hint 撞车就地兜住**：`java-threadlocal-004` 的 hint 已点名「get/set 只顺带清理碰到的过期项、根治靠 finally remove()」，故 140 的 hint 不复述这一轴，第三题角度据此改取「Map 挂在谁身上 + 读写定位路径」，未等用户改规。
- ⚠ **一次越界编辑被当场撤销（不掩盖）**：核完第 198 轮压缩后我把说明行的「12 条 bullet」改成实测的「13 条」，用的是一条全局 sed——它同时命中了**第 202 轮压缩说明行**（那行记的是第 197 轮压掉 12 条，属他人历史记录）。发现后按 `git show HEAD:docs/evolution.md` 取回该行原文逐字节还原，`git diff HEAD` 复验现只剩「自有 203 说明行 + 自有 203 记录 + 198 区段」三处，他人行一字未动。教训：**台账这类多会话共享文件里改数字，只准用「带上下文的唯一串」定位，不准用会全局命中的 sed 模式**——与第 189 轮「pathspec 提交误带他人 7 行」是同一类越界，只是这次靠复验当场兜住、未进暂存区。
- 尺寸（如实记账）：产出 **3 文件**（`src/data/quiz/mongodb.json`、`src/data/quiz/java.json`、`docs/coverage-deepening.md`）＝C 车道 ≤4 上限、**尚余 1 个余量**（本轮未用满，未顺手加题）；多出的 1 个仍是台账类（本文件），与第 173/179/187/…/202 轮记录的是同一处规范冲突，未自行改配方。临时脚本 6 个（题库追加、队列销追、已完成记录、真机两趟、台账压缩与追加）跑完即删、未入库。
- 验证数字：`pnpm build` **746 页 / 24.97s**（pagefind 746 HTML，与第 202 轮同页数——C 车道不加页面）；`pnpm verify:docs` **exit 0、25 项全绿**（一致性 10 项：侧边栏 **743** 条 link 零死链、已提交笔记 **561** 篇全部注册、**179** 个 index 页无空壳、图谱死链 0 / 覆盖率 **100%**、**mermaid 591** 块 + viz 数据 5 份硬编码颜色 **0** 处——本轮未触碰任何图表与 viz 数据，该读数与开工基线一字不差，即为证据；mermaid 语法 591 块 chromium 实跑全部有效；题库 8 项 **684** 题（自有 +3：id 全局唯一 / noteId 可达 / difficulty 1~5 整数 / 选项 2~5 项 / answer 下标与题型自洽 / 每题有讲解）；影像 7 项 9 资产、public 媒体 **7.16 MB / 60 MB** 持平）；`git diff --numstat` 复核自有文件纯净：`quiz/mongodb.json` **20 增 / 0 删**、`quiz/java.json` **40 增 / 0 删**、`coverage-deepening.md` **5 增 / 3 删**（删的 3 行逐行核过＝本轮销号的三条队列项，未动他人任何字节）；本机三文件行尾 `i/lf w/lf`、纯追加无行尾噪声。本轮未改图表与媒体，按 §4.1 不触发双主题对比度审计与影像附加闸门。
- 候选项表本轮状态：**无行变更**（C 车道不动工具、图表与媒体）。第 **12** 行（B 队列 36 支）与第 **15** 行③④（B 车道的 Windows 平台前提）本轮未触及；第 **6**（代码块宽度路线）、第 **7** 行（CI 是否接 `verify:docs`）仍待用户裁决；本轮无新增判红证据（开工基线即全绿）。
- 下一轮入口：**第 204 轮，204 mod 5 = 4 → 车道 A 新章节**（`--round 204` 复算即得；提交前务必再算一次游标，并行会话会顶掉号）。① A 首要取点源 `content-roadmap.md` §2 仍不可取点（B1 十二条全 `done`、§3 写死「B2 不自动展开」、§5 三项待裁决一字未动）⇒ 退回兜底池：双缺 **20**（头部 8 条仍是 roadmap §4 已饱和的 `case-studies/*`，按配方 §2「已饱和一律不写、改为互链」**不可直取**）、纯文字无图 89、有图零题 68。② 连记两轮未清的 vue 留账仍在：A 车道若再落 vue，`vue/index.mdx` 首页「当前覆盖基础 · 核心概念」漏记中级层，一行改掉。③ C 队列（下一个 C 是第 208 轮，`208 mod 5 = 3`）头部现为 `java/intermediate/concurrent/05-aqs` 第二题 + `ai/intermediate/llm/06-vllm` 第二题 + `linux/intermediate/system/05-performance` 第二题；第 202 轮为 `01-class-loading` 自取的第三题不在此队列内。④ B 队列余 **36** 支（头部 `kafka-producer`、`redis-sentinel`、`mysql-replication`），下次游标落 B 是第 207 轮，本机 macOS 三件套齐、无 §3 退位理由。⑤ D 队列若再开：真实发现仍是审计脚本的 **26 页**序列图/饼图选择器盲区与「`stale` 是否收紧为判红」。⑥ 台账体量（§7 本轮靠**窗口前移**重新出现可压对象）：开工实读 **169,716 字节** → 压掉第 198 轮详录（13 条 bullet）后 **153,825** → 追加本条后约 **166.9KB**、比开工**回落约 2.8KB**（§7 的压缩自第 202 轮「窗口外无对象可压」死区后，本轮靠窗口前移重新生效一次；字节数随本行措辞自指变动，按第 198/200 轮口径只记量级不追末值）；「最近 5 轮详录」窗口＝**199–203**，下一压缩对象＝**第 199 轮详录**（须待第 204 轮入库、窗口前移为 200–204）。按此节奏每两轮才落得一次压缩、且压缩收益低于记录增量，台账仍在 150,000 线上方——「§7 体量闸门」那条待决策（推荐路线 A：闸门改按 KiB 200KB + 窗口缩到最近 2 轮）**仍待用户拍板**，本轮未自行改配方、未删他人历史。⑦ 收尾纪律：自有 4 路径逐个 `git add` → `git diff --cached --name-only` 核对只含自有项 → 单 commit → 立即 `git push origin main`（AGENTS.md 已规定不等确认）→ **入库态复跑 `pnpm verify:docs` 逐项对数字**（第 189/199/202 轮纪律）。

- 本条为入库后补记（另起一个 commit）：自有 4 路径逐个 `git add` → `git diff --cached --name-only` 实读**只有这 4 项**（开工工作树干净，无他人字节混入）→ 单 commit `e1c6da5`（4 文件 **+82 / −17**）→ push `0a7d0b5..e1c6da5` **只含本轮一个 commit**，推后 `git rev-list --left-right --count origin/main...HEAD` 读 **0 0**、`git status --porcelain` 干净。**入库态复跑** `pnpm verify:docs` → exit 0、25 项全绿，与提交前三趟读数逐项一致（侧边栏 **743** 条 / 已提交笔记 **561** 篇 / **179** 个 index 页 / 图谱覆盖率 **100%** / mermaid **591** 块硬编码颜色 **0** 处 / 题库 **684** 题 / 影像 9 资产 / public 媒体 7.16MB），未出现第 189 轮那种「自述全绿、入库态判红」。`--top 3` 复算 → 「下一轮 = 第 204 轮，204 mod 5 = 4 → 车道 **A 新章节**」与本条入口一致；勘察「题库有题篇数」由 476 → **477**（+1 即 multikey 首题入池，threadlocal / chm 本就已有题、不变更该计数）。台账体量按「只记量级不追末值」口径收尾（第 198/200 轮既定读法）：开工 169,716 字节 → 压掉第 198 轮详录腾出 17,869 字节 → 主记录 + 本条补记合计吃掉大半，收尾停在 **169KB 一线**、比开工净降不足 1KB。即 §7 一次窗口前移的压缩收益几乎被单轮记录抵消，**「每轮必触发、压一条只能撑一两轮」的判断在本轮得到量化复核**，台账仍停在 150,000 线上方约 19KB——「§7 体量闸门」待决策（推荐路线 A）的紧迫性不因本轮能压而下降。本轮自起的 `pnpm preview`（PID 17085）收尾已 kill，实测 4321 端口 **0 监听**、`pgrep -fl astro.mjs` 无遗留进程；6 个临时脚本已全部删除、未入库。

### 第 202 轮（2026-09-28，车道 B 影像资产｜游标一致，未越车道）：把站内 `java-classload` 七帧动画派生成 48.5 秒配音短片，挂回「类加载机制与双亲委派」——并实证第 197 轮那条「B 在本机不可执行」只在那台 Windows 会话成立

- 取号与车道：开工 `git pull --ff-only` → `Already up to date`（HEAD `6cc5c2c`，与 `origin/main` 同 sha、无分叉，不触发 §0.1）；`git status --porcelain` **干净**（第 201 轮入库后无他人未提交改动，全程自有 5 文件 + 台账 1，未与他人字节争抢同一文件）。基线 `pnpm verify:docs` **exit 0、25 项全绿**（一致性 10 + mermaid 语法 591 块 + 题库 8 项 680 题 + 影像 7 项 8 资产；本机 macOS `ffmpeg` `/opt/homebrew/bin/ffmpeg`、`ffprobe` `/opt/homebrew/bin/ffprobe`、`say` `/usr/bin/say` 实测三者齐备，影像第 4 项为真验），不触发 §0.3 强制 D。台账最大号实读 **201**，本轮取 **202**；`node scripts/evolution-candidates.mjs --top 12` 打印「下一轮 = 第 202 轮，202 mod 5 = 2 → 车道 **B 影像资产**」，与配方 §1（2 → B）逐格一致、**未越车道**；勘察读数「笔记 564 篇｜题库 476 篇有题｜动画 44 支｜影像 8 个」，A 兜底双缺 20 / 纯文字无图 89 / 有图零题 68，**B 队列 37**、C 队列 25。第 201 轮入口①的预判在本轮兑现：本机三件套齐 ⇒ 游标落 B **没有 §3 退位理由**，直接按 §2 产法执行。
- 选题证据（配方 §2「从已有动画未出片队列取一支，优先过程型经典」）：B 队列头部四条实读 `java-classload`、`kafka-producer`、`redis-sentinel`、`mysql-replication`，取头部第一条——它是**生命周期型**（类从字节码到可用的五阶段），与配方偏好的「链路/握手/生命周期」正对。核实宿主与形态：`grep -r java-classload src/` 命中 `src/data/viz/flows.ts`（定义处）与 `src/content/docs/java/advanced/jvm/01-class-loading.mdx`（唯一宿主，**已是 `.mdx`**，无需第 187/192 轮那种改扩展名动作）；`media-capture --list` 实读 `{frames: 7, title: "类加载五阶段 · 零值陷阱与 <clinit> 加锁"}`，7 帧 ≤12 上限、口播预算宽裕。该篇 `core: true`、`level: advanced`，站内已有 2 题但**无影像资产**，属「有动画未出片」而非「重复派生」。
- 产法与派生（四步照 `guide/diagrams.mdx`「配音短片与图卡」）：① 先在 `src/data/viz/media.ts` 登记 `java-classload-video`（`source: 'java-classload'`，`narration` **7 段 = 7 帧**逐帧对齐，事实全部取自 `flows.ts` 各帧 `note` 与该篇阶段表，不另起一套说法）；② `pnpm build` 出新 dist → `pnpm preview`（本轮自起、收尾停用，开工 `lsof -nP -iTCP:4321` 与 `pgrep -fl "astro.mjs build"` 实测端口空闲无并发 build）→ `media-capture --page /java/advanced/jvm/01-class-loading/ --figure 0 --demo java-classload-video` 导出 **7 帧，逐帧 1352×830 全等**（踩过的坑①「帧尺寸不齐」未发生；脚本把逐帧说明区钉成等高 64px，未手工截图）；③ `media-encode --demo java-classload-video`，逐句实测口播 **7.00/6.26/7.29/6.17/6.01/7.81/5.55 秒（合计 46.09s）**、含帧尾呼吸成片 **48.5s**，画面 **1280×786**、MP4 **0.69 MB**、封面 **116 KiB**（均在 4 MB / 150 KiB 闸门内）；④ 按脚本打印的真实尺寸时长**回填 `media.ts`**（width/height/duration 三值，浏览器 `videoWidth/videoHeight` 实测 1280×786 与回填值一字不差）。文稿每句去空白 **26~31 字**，全部 ≤36 硬上限；200 字 / 46.09s ⇒ 实测语速 **4.34 字/秒**，比台账沿用的 4.5 估算略慢，已把这条读数写进候选表第 12 行。
- 内容增量（配方 §1 硬约束，B 车道附 1 道考题）：`src/data/quiz/java.json` 纯追加 **`java-clinit-139`**（`multiple`、`difficulty: 4`，暂存核对 **21 增 / 0 删**），宿主即短片所在笔记。**先核实考点不撞车**：该篇既有 2 题实读为 `java-prepare-032`（准备期 `a=0` 与 `static final` 的 ConstantValue 例外）、`java-classidentity-097`（不同类加载器加载同一 class 文件的 Class 对象相等性与强转），与新题「`<clinit>` 何时执行、执行几遍」无一重合。三个正确项落该篇明写的**六种主动引用**（new、读写非 final 静态字段、调静态方法、反射、初始化子类先初始化父类、main 所在类）、**三类被动引用不触发**（定义类数组、引用 final 常量、经子类引用父类静态字段）、以及阶段表原文「执行 `<clinit>`：静态变量赋值 + static 块｜JVM 加锁保证只跑一次」；**两个错项取该篇明确反对的说法**——「解析必须在初始化之前全部完成、符号引用不可能拖到运行期」（表里写的是「可发生在初始化之后（运行期绑定）」）与「子类 `<clinit>` 先跑、父类等用到才补」（正解相反）。`answer [0,2,4]` 与 hint 的人类序号（第 1/3/5 项正确、第 2/4 项错）逐条对账。
- ⚠ **一处探针缺陷被当场纠正（不掩盖）**：第一版真机探针用 `figure.media-fig video[src$="<key>.mp4"]` 选元素，读回 **0 个 video、元数据 null**——`MediaFigure.astro` 把地址挂在 `<source>` 子元素上，`<video>` 本身没有 `src` 属性，若就此收尾会误判成「短片没进页面」。改成先按 `figure.media-fig source[src$=".mp4"]` 命中、再 `closest('video')` 反查父元素，才拿到真读数。**选择器读数为 0 时先怀疑探针自身，再下产品结论**，与第 201 轮「`getComputedStyle().fill` 两主题同值」是同一类错误。
- 尺寸（如实记账）：内容/媒体/工具 **5 文件**（`src/data/viz/media.ts`、宿主笔记 `java/advanced/jvm/01-class-loading.mdx`、`src/data/quiz/java.json`、`public/videos/java-classload-video.mp4`、`.poster.png`）＝配方 §1 B 车道「≤5 文件、媒体 ≤6 MB」上限（含 §1 允许附加那道考题的 +1 余量在内仍正好用满；实际媒体 0.81 MB，远低于 6 MB）。多出的 1 个仍是台账类（本文件），与第 173/179/187/…/201 轮记录的是同一处规范冲突，未自行改配方。临时脚本 3 个（两版真机探针 + 体量压缩）跑完即删、未入库；`node_modules/.cache/media-frames/java-classload-video/` 的 7 帧与 manifest 属缓存目录、不入 git。
- 验证数字：`pnpm build` **746 页 / 30.04s**（pagefind 746 HTML，与第 201 轮同页数——B 车道不加页面）；`pnpm verify:docs` **exit 0、25 项全绿**（一致性 10 项：侧边栏 **743** 条 link 零死链、已提交笔记 **561** 篇全部注册、**179** 个 index 页无空壳、图谱死链 0 / 覆盖率 **100%**、**mermaid 591** 块 + viz 数据 5 份硬编码颜色 **0** 处——本轮 `media.ts` 新增一条数据且**未写任何颜色**，该项读数即为证据；mermaid 语法 591 块 chromium 实跑全部有效；题库 8 项 **681** 题（自有 +1：id 全局唯一 / noteId 可达 / difficulty 1~5 整数 / 选项 2~5 项 / 答案下标与题型自洽 / 每题有讲解）；影像 **7 项 9 资产**、public 媒体合计 **7.16 MB / 60 MB**，其中第 3 项「口播文稿与帧数对齐」与第 4 项「音轨与封面」均为真验）。本轮动过媒体，按 §4.1 加跑 `node scripts/mermaid-contrast-verify.mjs` → **412 页 × 2 主题 0 处低于 4.5:1**（页面集与第 201 轮同数，自检「内容树带图笔记 **438** / dist 渲染出图 **438**」两数相等；脚本另打印的 26 页序列图/饼图选择器盲区与本轮无关，本轮未新增任何 mermaid 块）。**真机端到端**（本机 Playwright + chromium 1440×900，非 600px MCP 视口，全程独占 dist）：宿主页 **200**、`figure.media-fig` **1** 个、原 `figure.algo-viz` 动画 **1** 个仍在原位（短片插在其后、未挤掉）；video 实读 `readyState 4`、`videoWidth/videoHeight` **1280×786** ＝ `media.ts` 回填值、`duration` **48.55s**、`preload="metadata"`、`controls`/`playsinline` 齐、figure `aria-label` ＝「类加载五阶段 · 配音短片」、`figcaption` 渲染出结论句而非复述标题；双主题下短片卡片 `figcaption` 对比度 **light 12.63:1 / dark 14.17:1**（字色 `rgb(51,51,51)`/底 `rgb(255,255,255)`；`rgb(212,212,212)`/底 `rgb(0,0,0)`），配色仍全部由 `custom.css` 主题令牌接管、数据里零硬编码；`/videos/java-classload-video.mp4` **200 / 709 KiB**、`.poster.png` **200 / 116 KiB**；宿主页 `main pre` 横向溢出 **0** 处、`document.documentElement.scrollWidth` **1440** ＝ 视口宽。作答页链路：播种「java 方向其余 139 题已刷、只勾 java、关随机」后设置页如实打印「**已选 1 个方向 · 未刷 1 / 140 题**」；开一轮后题面**逐字命中**「什么时候执行 `<clinit>`」、选项 **5** 项、徽标 **★★★★** 与 difficulty 4 对应；只勾第 2 项（错项）提交判「**✗ 回答错误**」并渲染 hint；换全新 context 勾满 [0,2,4] 判「**✓ 回答正确**」，选项态 `is-correct|is-dim|is-correct|is-dim|is-correct` 与 `answer` 逐项一致；「查看完整笔记」回链 `/ascension/java/advanced/jvm/01-class-loading/` 实测 **200**（noteId 非静默 404）；**未播种访问 0 处 JS 错误**，播种路径 1 处 React #418（SSR 文本 vs 客户端首帧）与第 190/192/193/195/198/200 轮同因同判、非本轮产品缺陷。
- 候选项表本轮状态：第 **12** 行 → 已完成由 3 项增至 **4** 项、B 队列余 **36** 支、头部改 `kafka-producer`、`redis-sentinel`、`mysql-replication`，并补一条 7 帧级口播预算读数；同时把它在 197 轮的旧表述「游标二次落 B 仍因本机管线阻断未产出」**限定到那台 Windows 会话**，因为本轮在同一余数（2）上于 macOS 跑通了整条管线。第 **15** 行③④与「待用户决策」里第 197 轮那条「B 车道平台前提」的成立条件自此有了正反两面证据（Windows 阻断 / macOS 通），**待决策原文一字未改**（那是用户拍板区），推荐路线仍是第 199 轮登记的读法：游标落 B 时先判平台，而非把「B 不可执行」当跨平台事实照抄。第 **6**（代码块宽度路线）、**7**（CI 是否接 `verify:docs`）行仍待用户裁决；本轮无新增判红证据（开工基线即全绿）。
- 下一轮入口：**第 203 轮，203 mod 5 = 3 → 车道 C 题库**（`--round 203` 复算即得）。① C 队列 **25** 条不变，头部 `mongodb/intermediate/usage/09-multikey-index` 第一题 + java 三篇第二题（`06-threadlocal`、`03-concurrenthashmap`、`05-aqs`）；本轮为 B 车道，**未销号、未追加** `coverage-deepening.md`。**一条现算口径要提醒下一轮**：本轮给 `java/advanced/jvm/01-class-loading` 补的是该篇**第三题**（队列外自取），它现有 3 题，故下一 C 轮跑「core 且全站题数恰为 1」那套现算追加池时它不会再被列进去，不属重复入队。② A 车道续点：roadmap §2 仍不可取点（B1 十二条全 `done`、§3 写死「B2 不自动展开」、§5 三项待裁决一字未动）；兜底池双缺 **20**（头部 8 条仍是已饱和的 `case-studies/*`，不可直取）、纯文字无图 89、有图零题 **68**。第 201 轮留账一条仍在：**A 车道若再落 vue**，`vue/index.mdx` 首页「当前覆盖基础 · 核心概念」漏记中级层，一行改掉。③ B 队列余 **36** 支（头部 `kafka-producer`、`redis-sentinel`、`mysql-replication`）；下次游标落 B 是第 207 轮，届时先按 §2 判平台再决定是否退位。④ D 队列若再开：真实发现仍是审计脚本的 **26 页**序列图/饼图选择器盲区与「`stale` 是否收紧为判红」。⑤ 台账体量（§7 自此进入**每轮必触发的死区**）：开工 166,798 字节 → 压掉第 197 轮详录后 154,018 → 追加本条后仍在 150,000 线上方；窗口＝最近 5 轮（**198–202**）之外**已全部是单行**，再压即违反 §7 的「最近 5 轮保留详录」红线，只如实登记净增量：**本条净增约 15.7KB**（154,018 → 169,690，含末尾那条补记；字节数随本行措辞自指变动，按第 198/200 轮口径只记量级不追末值），比第 201 轮那条 18,773 字节小约 16%，但仍把台账推回 150,000 线上方约 20KB——**§7 的压缩机制自此失效**，每轮只能靠收紧措辞减缓增速，不能回落。**请用户尽快在「§7 体量闸门已无对象可压」那条待决策上拍板**（推荐其路线 A：闸门改按 KiB 200KB、窗口缩到最近 2 轮）；未自行改配方。⑥ 推送实测（本条为入库后补记，另起一个 commit）：自有 6 路径逐个 `git add` → `git diff --cached --name-only` 实读**只有这 6 项**（开工工作树干净，无他人字节混入）→ 单 commit `ae67341`（6 文件，**+63 / −14**）；台账那 14 行删除**逐行核过**＝第 197 轮 12 条详录 bullet + 被替换的候选表第 12 行旧文本 + 被替换的「§7 待决策」那条原文，**未动他轮任何字节**。push `6cc5c2c..ae67341` **只含本轮一个 commit**，推后 `git rev-list --left-right --count origin/main...HEAD` 读 **0 0**、`git status --porcelain` 干净；入库态复跑 `pnpm verify:docs` → **exit 0、25 项全绿**，读数与提交前逐项一致（笔记 561 篇 / mermaid 591 块 / 题库 681 题 / 影像 9 资产 / public 媒体 7.16MB），未出现第 189 轮那种「自述全绿、入库态判红」。本轮自起的 `pnpm preview`（PID 95282）收尾已 kill，实测端口 4321 **0 监听**、`pgrep -fl astro.mjs` 无遗留进程。同轮把「§7 体量闸门已无对象可压」那条待决策补上本轮实测（窗口外自此一字一行皆无可压对象、推荐路线仍为 A），待决策区其余各条原文未动。

### 第 201 轮（2026-09-28，车道 A 新章节｜游标一致，未越车道）：新建「渲染机制与更新粒度」分类与「一次更新到底重做了什么」专篇——把「改了数据谁会收到通知」往下算成「通知之后重做了多少工作」的三段成本账

- 取号与车道：开工 `git pull --ff-only` → `Already up to date`（HEAD `5c9b7e8`，与 `origin/main` 同 sha、无分叉，不触发 §0.1）；`git status --porcelain` **干净**（无他人未提交改动，全程自有路径 4 项、未与他人字节争抢同一文件）。基线 `pnpm verify:docs` **exit 0、25 项全绿**（一致性 10 + mermaid 语法 588 块 + 题库 8 项 680 题 + 影像 7 项 8 资产；本机 macOS `ffmpeg`/`ffprobe`/`say` 齐备、影像第 4 项为真验），不触发 §0.3 强制 D。台账最大号实读 **200**，本轮取 **201**；`node scripts/evolution-candidates.mjs --top 12` 打印「下一轮 = 第 201 轮，201 mod 5 = 1 → 车道 **A 新章节**」，与配方 §1（1、4 → A）逐格一致、**未越车道**；勘察读数「笔记 563 篇｜题库 476 篇有题｜动画 44 支｜影像 8 个」，双缺 20 / 纯文字无图 89 / 有图零题 67，B 队列 37、C 队列 25。
- 选题证据（配方 §2 三级顺序，取到即停）：第一级 `content-roadmap.md` §2 仍不可取点——B1 十二条全 `done`、§3 复评写死「B2 不自动展开」、§5 三项待裁决未动，照此退回兜底池、未自行展开 B2。第二级双缺池头部 20 条里**前 8 条全是** `distributed/intermediate/case-studies/*`，而 roadmap §4 已把「系统设计案例群（31 篇）」列为已饱和，按配方 §2「落在已饱和清单里的主题一律不写、改为互链」**不可直取**（正是第 200 轮入口①预警的那处）；池内其余 **12** 条为既有无图无题笔记（`--top 20` 复算分布：js 7 / typescript 2 / linux 1 / mongodb 1 / python 1），与「1 篇笔记 + 三件套」的车道定义不重合，沿用第 **171/194/199** 轮口径把它们当**薄弱面线索**用。据此锁定 vue 方向：`git ls-files` 逐目录数 `.md/.mdx` 得 **vue 5 篇**（3 篇知识点 + 2 个 index），为**前端主力方向最薄**一面（react 9 / typescript 10 / js 47 对照；全站比它少的只有 `panorama` 1 与 `guide` 4 两个元文档目录），且该方向**只有 basic 一层、intermediate 与 advanced 皆空**；主题缺口按关键词全库实测零专篇——`grep -ril` 于 `src/content/docs/` 读得 `PatchFlags` 0 / `patchFlag` 0 / `blockTree` 0 / `Block Tree` 0 / `hoistStatic` 0 / `Pinia` 0 / `watchEffect` 0 篇，`静态提升` **仅 1 篇**且只是 `vue/basic/core/02-component-model.md:32` 的「模板不是字符串：编译为渲染函数并做静态提升等优化——**静态内容只创建一次**」一句顺带提（正是 roadmap §0 深度轴定义的「现篇只到顺带提一句」），`nextTick` 命中的 3 篇**全是 Node 侧 `process.nextTick`**、无一篇讲 Vue 的更新时机；逐篇核对 vue 三篇大纲（01 响应式止于 Proxy/ref/reactive 与 React 对照、02 组件模型讲 SFC/props/v-model、03 讲组合式与逻辑复用），**「通知之后重做了多少工作」这一问无一回答**，与 §4 已饱和清单八项均不重合。同时收掉一处衔接风险：新篇会把 01 篇「不需要整树 diff 重跑」读成「没有 diff」，故正文专门纠正该句读法并互链 02 篇那句一句话。
- 内容要点（新建 `vue/intermediate/rendering/01-update-cost.md`，308 行 + 新建该分类 `index.mdx`；`level: intermediate`、**不带 `core` 星标**，延续第 171/175/178/194/199 轮对候选项 2 待裁决的避让口径）：全篇只回答一个教学问题——**改了 `count.value`，Vue 到底重做了多少工作**，并把答案组织成**三段相乘**的成本账（① 谁重渲染 → ② diff 走几个节点 → ③ 每个节点改什么），而不是罗列优化名词。①**组件级粒度**：引官方两句 *When a component is rendered for the first time, Vue **tracks** every ref that was used during the render. Later on, when a ref is mutated, it will **trigger** a re-render for components that are tracking it.*，据此把「精准更新」钉准为**以组件为最小单位**（同一组件里没读该 ref 的部分不单独更新），再补三条读者真会踩的边界——同一次事件改多个 ref 靠 next tick 缓冲保证 *each component updates only once*、子组件闸门是 props（*a child component only updates when at least one of its received props has changed*，官方反例即「把 `activeId` 原样透传给每行让每行自己算」→「点一行全行重渲染」的根因，正解是把比较挪回父级只传 `active` 布尔）、3.4+ 的 computed 只在返回值变化才触发；本段结论直接对上 React：**Vue 通常不需要手写 `memo`**，因为「谁读了什么」是运行时记录的事实而非需要声明的假设，并互链站内 `react/basic/core/04-rerender-perf/`。②**编译器为什么进场**：先如实摆官方自陈的虚拟 DOM 通病（*even if a part of the tree never changes, new vnodes are always created for them on each re-render, resulting in unnecessary memory pressure*、*the somewhat brute-force reconciliation process sacrifices efficiency in return for declarativeness and correctness*），再给 React 做不到更好的**结构原因**（纯运行时 *cannot make any assumptions about the incoming virtual DOM tree, so it has to fully traverse the tree and diff the props of every vnode*），最后落在官方命名 **Compiler-Informed Virtual DOM**（*In Vue, the framework controls both the compiler and the runtime… leave hints in the generated code so that the runtime can take shortcuts whenever possible*），并钉住成立前提——模板语法确定性强、因此可静态分析。③**三条 hint 各收窄一段**：缓存静态内容（首渲创建后复用同一 vnode，**新旧是同一个引用**才整段跳过比对；够多连续静态再压成一个含纯 HTML 串的 static vnode、挂载直接走 `innerHTML`，②③两段同时被削）；更新类型标记（官方生成码末位 `2 /* CLASS */`、多标记按位或合并、运行时按位与判断，*Bitwise checks are extremely fast*，并配一张**全部取值与边界均取自 `vuejs/core` 源码**的标记表 `TEXT 1`/`CLASS 2`/`STYLE 4`/`PROPS 8`/`FULL_PROPS 16`/`STABLE_FRAGMENT 64`/`UNKEYED_FRAGMENT 256`/`DYNAMIC_SLOTS 1024`/`CACHED −1`/`BAIL −2`——表的价值在边界列：`PROPS` 另挂 `dynamicProps` 键名清单、`FULL_PROPS` 与前三者互斥、`DYNAMIC_SLOTS` 的注释明写「总是被强制更新」，这正是「我没改 props 它为什么还渲染」的答案）；树结构打平（`_openBlock()/_createElementBlock(…, 64 /* STABLE_FRAGMENT */)`、block 即「内部结构稳定的模板片段」、每个 block 记录**所有**带标记后代而非仅直接子节点、重渲染只遍历打平后的树、静态整体跳过、`v-if`/`v-for` 生成子 block 以保住父结构稳定，并按官方「对 SSR 激活的影响」两条收进激活侧收益）。④**优化不生效清单**（本篇对读者最有用的一段，也正是「Vue 一定比 React 快」这类误答的照妖镜）：手写渲染函数/JSX 拿不到 hint（`BAIL` 注释点名「非编译器生成的插槽（即手写渲染函数）**应当始终全量 diff**」）、结构不稳定的模板、动态键 `FULL_PROPS`、动态插槽 `DYNAMIC_SLOTS`。⑤**手动挡的真实定位**：`v-once` 引 *Render the element and component once only, and skip future updates.*；`v-memo` 把官方三条前提一起给（依赖数组写错会跳过本该发生的更新且 `v-memo="[]"` 等价 `v-once`；官方定位 *provided solely for micro optimizations… **should be rarely needed***、典型场景 `length > 1000` 的 `v-for`、`:key` 可自动推断不必重复写进数组；**必须与 `v-for` 同元素**——*v-memo does not work inside v-for*），另补响应式系统**自身的账**（*every property access triggers proxy traps*，官方界定为十万级嵌套属性才明显）与 `shallowRef`/`shallowReactive` 的代价（`push` 不触发、整根替换才触发）。**3 张 mermaid（颜色只用 `hl`/`good` 语义类，零硬编码）+ 2 张表 + 4 段代码**、面试答法 5 问、要点备忘 10 条。
- 事实核验：引文逐页取回英文原文并核对小节标题（`guide/extras/rendering-mechanism`、`guide/essentials/reactivity-fundamentals`、`guide/best-practices/performance`、`api/built-in-directives` 的 v-once/v-memo 四页 + `packages/shared/src/patchFlags.ts` 全文经 GitHub API 取回 4,714 字节）；中文术语按官方中文页对齐（带编译时信息的虚拟 DOM／缓存静态内容／更新类型标记／树结构打平／对 SSR 激活的影响），延伸阅读 5 条外链本轮 `curl` 逐个实测 **200**。**两处主动不写**：(a)「Vue 3.5 把静态提升换成 Cache Static」的版本沿革——本轮取 3.5 发布说明页**未取到**该段证据（拉回的正文里没有 Cache Static 字样），宁可不写沿革也不外推，正文一律用现行文档口径；(b) 缓存下标与 `_cache` 数组的生成码细节，文档该节未附样例，不自行补全。
- ⚠ **一处自造返工（如实登记）**：改 `src/data/graphs/vue.json` 时我先用 `python json.dump(indent=2)` 整体重写，把该仓库既有的「**一个节点一行**」紧凑排版全部打散（`git diff --stat` 读 **70 增 / 9 删**，全是格式噪声），与「保留现有文件约定、diff 只呈现语义变化」直接冲突。发现后 `git checkout -- src/data/graphs/vue.json` 还原（该文件当时无他人改动，还原安全），改用文本级 Edit 只加 1 个节点行与 3 条边行 → 终态 **6 增 / 2 删**（那 2 删是行尾逗号，非内容）。教训：**接线类改动（`graphs/*.json`、题库 JSON）一律走文本 Edit，不跑序列化脚本整写**。
- ⚠ **一处探针缺陷被当场纠正**：第一版真机探针读 `getComputedStyle(span).fill` 判字色，HTML 元素的 `fill` 不随主题变，导致亮暗两档读数完全相同（都 `rgb(63,52,40)`）——若就此收尾即是一次假验证。改为复用对比度审计的同款配对法（`g.node span.nodeLabel`/`g.node text` 的 `color` 配 `rect` 的 `fill`）后才拿到真读数。**读数无法区分两种状态的探针不算验证。**
- 尺寸（如实记账）：内容 **4 文件**（新篇 308 行 + 分类页 `index.mdx` 13 行 + `astro.config.mjs` + `src/data/graphs/vue.json`）＝配方 §1 A 车道「1 篇笔记 + 三件套」的原型上限、正好用满；**不享** roadmap 条目的 6 文件例外（本轮未从 roadmap 取点），故未碰 `src/data/quiz/vue.json`（新篇因此进入「有图但零题」池 67→68）、未加首题、未碰速答手册，与第 199 轮同形态。多出的 1 个仍是台账类（本文件），与第 173/179/187/189/…/200 轮记录的是同一处规范冲突，未自行改配方。**新留账两条**：① `vue/index.mdx` 首页「当前覆盖**基础 · 核心概念**」自本轮起漏记中级层（与第 194 轮 react 那条同型、第 199 轮已清 react 侧），下一轮落 vue 时一行改掉；② 新篇首题与 `vue/basic/core/02-component-model.md:32` 那句「静态提升」的展开互链已完成，但 02 篇本身仍无图、其「静态内容只创建一次」的判据（同一引用才跳过）只有新篇给出——下一 C 轮可据此入队 02 篇首题。
- 验证数字：`pnpm build` **746 页 / 56.61s**（+2 页——新篇 + 新分类页，与第 194 轮「新分类 +2」同因；pagefind 746 HTML）；`pnpm verify:docs` **exit 0、25 项全绿**，两阶段读数如实报：**提交前**（新文件未入库）一致性 10 项为侧边栏 link **743** 条（+2）零死链、已提交笔记 **560** 篇、**178** 个 index 页无空壳、图谱死链 0 / 覆盖率 **100%**、**mermaid 591** 块（+3）+ viz 数据 5 份硬编码颜色 **0** 处，mermaid 语法 591 块 chromium 实跑全部有效、题库 8 项 **680** 题持平（受上限未加题）、影像 7 项 8 资产 6.36MB / 60MB；**两个 commit 入库后复跑**（第 189 轮立下的纪律）→ 同样 exit 0、25 项全绿，其中「已提交笔记」**561**、空壳分类页检查项 **179**——两个 +1 正是本轮新篇与分类页入库的直接读数，未出现第 189 轮那种「自述全绿、入库态判红」。本轮动过图表，按 §4.1 加跑 `node scripts/mermaid-contrast-verify.mjs` → **412 页 × 2 主题 0 处低于 4.5:1**（第 200 轮 411，+1 即本页；自检行「内容树带图笔记 **438** / dist 渲染出图 **438**」两数相等，无第 190 轮那种假阴性；脚本另打印的 26 页序列图/饼图选择器盲区与本轮无关，三张均为 flowchart、不落入其中）。新篇代码块按 East Asian Width 逐行量过两遍口径（圆圈数字 ① ② ③ 记 1 列与记 2 列）：7 个围栏（3 mermaid + 4 代码）超 80 视觉列 **0 行**——首量时读出一行 83 列，已改短标签而非依赖横向滚动。**真机端到端**（本机 Playwright + chromium 1440×900，非 600px MCP 视口；开工 `lsof -nP -iTCP:4321` 与 `pgrep -fl "astro.mjs build"` 实测端口空闲、无并发 build，`pnpm preview` 为本轮自起并收尾停用的进程、全程独占 dist）：新页 **200** 且标题正确、页内实渲 **3** 个 mermaid SVG（**720×85 / 512×513 / 720×284**，均在 720 容器内未溢出）、`Parse error` **0**、`[object Object]` **0**、`<table>` **2** 张、`main h2` **11** 节、`main pre` 横向溢出 **0** 处、`document.documentElement.scrollWidth` **1440** = 视口宽；按审计同款配对法实量 **15** 个图表文本全部配到底色，**light 最低 10.29:1**（字色 `rgb(63,52,40)`／底 `rgb(243,236,219)`）、**dark 最低 11.02:1**（`rgb(232,221,203)`／`rgb(45,38,24)`），节点内联 `fill` 硬编码 **0** 处（配色确由 `custom.css` 主题令牌接管）；`main` 区内链去重 **5** 条逐个 `request.get` **200**——其中正文 4 条为 `01-reactivity`、`02-component-model`（本轮补的两处互链）、跨方向的 `react/basic/core/04-rerender-perf` 与新分类页，另 1 条是 Starlight 分页器的「上一页」指向 `/python/`（同报 200，如实注明出处以免读数被误读成正文链接数）；**5** 条外链全部带 `target=_blank`（缺失 **0** 处）且逐个 **200**；分类页 **200** 且实含新篇标题、其岛屿组件内 **2** 条指向新篇；方向首页 **200**、侧边栏进新篇 **1** 条、作答页 **200**、**未播种访问 0 处 JS 错误**。临时探针与量宽脚本（共 4 个：两口径量宽、主题配对对比度、链接与渲染核验、台账压缩）跑完即删、未入库。
- 候选项表本轮状态：**无行变更**（A 车道不动工具与闸门）。第 **12** 行（B 队列 37 支，头部 `java-classload`、`kafka-producer`、`redis-sentinel`）本轮未触及，而**下一轮游标恰落 B**；第 **6**（代码块宽度路线）与第 **7** 行（CI 是否接 `verify:docs`）仍待用户裁决——本轮新篇按现行 ≤80 视觉列写作、真机实测 `main pre` 零溢出，未新增该行的判据；本轮无新增判红证据（开工基线即全绿）。
- 下一轮入口：**第 202 轮，202 mod 5 = 2 → 车道 B 影像资产**（`--round 202` 复算即得）。① 本机 macOS 三件套实测齐（`/opt/homebrew/bin/ffmpeg`、`/opt/homebrew/bin/ffprobe`、`/usr/bin/say`，第 199 轮登记口径）⇒ 游标落 B **没有 §3 退位理由**，按 §2 产法做 1 条配音视频（`media-capture` → `media-encode` → 回填真实尺寸时长 → 宿主笔记改 `.mdx` 引用），上限 ≤5 文件、媒体 ≤6MB，**并须附 1 道考题或 1 条速答行**满足 §1「每轮必含内容增量」硬约束；候选队列头部 `java-classload`、`kafka-producer`、`redis-sentinel`，优先过程型经典。**拿在产资产做冒烟前先确认它不会写 `public/`**（第 200 轮教训）。② A 车道续点：roadmap §2 仍不可取点（§5 三项待裁决一字未动）；兜底池双缺 **20**（头部 8 条仍是已饱和的 `case-studies/*`，不可直取）、纯文字无图 89、有图零题 **68**（+1 即本轮新篇）；vue 侧留账见本轮「尺寸」条。③ C 队列 **25** 条不变（头部 `mongodb/intermediate/usage/09-multikey-index` 第一题 + java 三篇第二题）；本轮未销号未追加。已为本轮新篇钉死的首题/第二题角度可直接入 d 类：「`DYNAMIC_SLOTS` 为什么会突破 props 闸门强制更新子组件／`FULL_PROPS` 与动态键的退化关系／`v-memo` 三条前提（数组写对、与 `v-for` 同元素、`length > 1000` 才值得）／缓存静态 vnode 的跳过判据是『新旧同一个引用』而非『内容相同』」——入队动作归 C 轮现算，A 轮未碰队列文件。④ D 队列若再开：真实发现仍是审计脚本的 **26 页**选择器盲区（sequenceDiagram 与 pie 的节点/连线文字不进选择器，只 ⚠ 不判红）与「`stale` 是否收紧为判红」；候选表第 11、15 行已由第 200 轮收口。⑤ 台账体量（§7 **本轮再次触发，且自此无对象可压**）：开工实读 **154,703 字节**已越 150,000 线，收尾先把**第 196 轮详录压为单行**（9 条 bullet 删除、记录头一字未改、轮次号未动）再追加本条；追加后实测 **166,705 字节**（本条自身 18,773 字节），越线约 16KB（字节数随本行措辞自指变动，按第 198/200 轮口径只记量级不追末值）。按现行 §7 的「最近 5 轮以外」窗口，本轮后窗口＝**197–201**，而 196 及更早**已全部是单行**——第 200 轮预警的「已无对象可压」自此坐实，下一压缩对象＝**第 197 轮详录**（须到第 202 轮入库、窗口前移为 198–202 之后才落到窗口外）。§7 的新瘦身口径仍是第 200 轮提请的待裁决条（A 改 KiB 200KB + 窗口缩到最近 2 轮／B 拆 `evolution-history.md`／C 维持现状逐轮收紧措辞），本轮**未自行改配方**、也未删他人历史。⑥ 推送实测：本轮分两个 commit——`5723318`（内容 4 文件，主篇 + 三件套）与 `cb21615`（同篇补两处互链与一处读法纠正，+8/−1），两次 fast-forward 推上 `origin/main`，区间 `5c9b7e8..cb21615` **只含本轮这两个 commit**（开工工作树干净，无第 198 轮那种连推他人产出的情形）；推后 `git rev-list --left-right --count origin/main...HEAD` 读 **0 0**、`git status --porcelain` 干净。

### 第 200 轮（2026-09-28，车道 D 体检与工具｜游标一致，未越车道）：三道闸门的 mermaid 围栏识别口径统一（567→588 块，21 块「会渲染却从不被校验」的盲区收口）+ 对比度审计自校验的 CRLF 假绿实测与修法 + `media-encode` 绝对路径 import；附幻觉篇首题

- 取号与车道：开工 `git pull --ff-only` → `Already up to date`（HEAD `e9c731b` 与 `origin/main` 同 sha、`rev-list --left-right --count` 读 `0 0`，无分叉不触发 §0.1）；`git status --porcelain` **干净**（第 199 轮入库后无他人未提交改动，作业中途复跑亦只有自有 5 项）。基线 `pnpm verify:docs` **exit 0、25 项全绿**（一致性 10 + mermaid 语法 567 块 + 题库 8 项 679 题 + 影像 7 项 8 资产；本机 macOS `ffmpeg`/`ffprobe`/`say` 齐备，影像第 4 项为真验、无 ⚠），不触发 §0.3 强制 D。台账最大号实读 **199**，本轮取 **200**；`node scripts/evolution-candidates.mjs --top 8` 打印「下一轮 = 第 200 轮，200 mod 5 = 0 → 车道 **D 体检与工具**」，与配方 §1（0 → D）逐格一致、**未越车道**。勘察读数：「笔记 563 篇｜题库 475 篇有题｜动画 44 支｜影像 8 个」，A 兜底双缺 21 / 纯文字无图 89 / 有图但零题 67、B 队列 37、C 队列 25。
- 选题证据（配方 §2「体检输出即候选池」）：四道闸门开工即全绿 ⇒ 落候选表带证据待办。取**候选表第 11 行**（缩进围栏被两道静态闸门整块漏检）与**第 15 行①②**（同族的读取口径残留）——三者根因同为「闸门用什么正则认围栏/怎么读源文件」，故合并为一轮收口（第 15 行①单独看是本组唯一与围栏无关的一项，但它与②同属一行、修法在第 196 轮已固化，拆到下轮只会多一次往返）。**本轮实测复核了第 181 行的原始读数并更新**：严格锚定 `^```mermaid` **567 块 / 436 篇**、容忍 `^[ \t]*` **588 块 / 437 篇**，差 **21 块 / 2 文件**——`guide/diagrams.mdx` 20 块（缩进 4 空格，列表项内示例）、`tools/basic/cli/03-jq.md` 1 块（缩进 3 空格，正文图示）。与第 181 轮的「538 vs 559、差 21 块/2 文件」在**差值与文件分布上一字不差**，基数随三轮内容增长上移，证明该盲区自 181 轮登记以来一字未动。
- 落地前置三条逐项做完（第 181 行明写「落地前先确认那 21 块无 `fill:`/`%%{init}` 且语法可 parse」）：① 那 21 块**确实渲染成读者看到的 SVG**（第 181 轮以 `dist/tools/basic/cli/03-jq/index.html` 含 `id="mermaid-` 取证）；② **全部通过 `mermaid.parse`**——临时探针把围栏正则放宽后逐块跑 chromium + 项目同版本 mermaid，**588 块 0 失败**（含 21 块新增），即 diagrams.mdx 的示例块里**没有故意写坏的「反例」**，放宽不会自找假红；③ **无一含硬编码颜色**——逐块扫描 `%%{init}` / `fill|stroke|color|background:` / 十六进制 / `rgb|hsl(` 四类规则，21 块只命中 `classDef … stroke-width:1.5px` 与 `style … `（无颜色赋值）；`stroke-width:` 不被 `/\b(?:fill|stroke|color|background)\s*:/` 命中是因为 `stroke` 后紧跟 `-` 而非 `\s*:`，这条「看似该判红实则不判红」的边界本轮实测确认属正确行为而非漏检。
- 修复要点（4 文件，均为读取口径，不动任何内容文件）：① `consistency-verify.mjs` 第 10 项、② `mermaid-syntax-verify.mjs` 的围栏正则统一放宽为 `/^[ \t]*```mermaid\n([\s\S]*?)\n^[ \t]*```/gm`（**闭合围栏同样放宽**——缩进块的收尾 ``` 也在缩进里，只放宽开头会把块切错）；③ `mermaid-contrast-verify.mjs` 的 `expectedPages()` 补**行尾归一** `.replace(/\r\n/g,'\n')`（它的围栏正则本来就容忍缩进，缺的是 CRLF 一环）并新增「期望集 0 篇而 dist 有图 ⇒ 判红」的空转守卫；④ `media-encode.mjs:45` 的 `await import(resolve('src',…,'media.ts'))` 改走 `pathToFileURL(...).href` 并补 `node:url` 导入，注释与第 196 轮 `media-verify`/`evolution-candidates` 的同型修法逐字对齐。三道闸门与勘察脚本（第 26 行用无锚定 `grep -rl '```mermaid'`，本轮实测**本来就不受限**、03-jq 从未被误列进「纯文字无图」池）至此口径一致。
- 反向验证（注入违规样本证明闸门真能判红，非只证明「不报红」）：给 `tools/basic/cli/03-jq.md` 追加两块缩进围栏（一块 `style B fill:#00ff00,color:#000`、一块 `A["甲" --> B["乙"]` 语法错）→ 第 10 项判红 `03-jq.md:115 CSS 颜色声明`、语法闸门判红 `03-jq.md:120 Parse error on line 2`，块数读数 588→590；**同一状态下**用旧严格锚定复算全站仍得 **567 块**（21+2 块全部隐形）——即「旧口径会把读者看得见的图块连同其中的硬编码颜色与语法错误一起放过去」是实测而非推断。探针随后按 `/tmp` 备份 `cp` 回原文件，`git status`/`git diff --numstat` 对 03-jq.md 均为空（字节级复原）。
- ⚠ **一处对候选表既有记载的实测更正**（第 15 行②的失效机理）：原写「CRLF 检出下会读 0 块并打印『0 处低于 4.5:1』的假绿」——本轮用 CRLF 沙箱（内容树 2 篇转 CRLF + 合成 dist 2 页）跑真实脚本测得：审计页面集取自 **dist**，页面照常进审计，**不会**变成「0 页低对比」；CRLF 下真正失效的是第 181 轮装的**「内容树 ↔ dist 1:1 完整性自校验」**——`expected` 读成 0 ⇒ `missing` 恒为 0，只剩一条不判红的 `⚠ stale`，后果是 **dist 残缺/落后于内容树时会被当成完整读数放过去**（第 175 轮那种「首跑 66 vs 真实 385」的漏页从此失去唯一报警器）。修法证据同场对照：**旧版**打印「内容树带图笔记 0 篇 / dist 渲染出图 2 页」，**新版**打印「2 篇」；再造「内容树零围栏 + dist 有图」⇒ 新版判红 `✗ …此刻的对比度读数不可信，判红` exit 1。候选表第 15 行②已按此改写。
- ⚠ **一次自我纠正（不掩盖）**：验证 ④ 的 import 修法时，我不该拿**在产资产** `--demo es-write-video` 做冒烟——脚本一路走完并**覆盖重编码**了 `public/videos/es-write-video.mp4` 与 `.poster.png`（`node_modules/.cache/media-frames` 里第 192 轮的帧缓存仍在，故过了 manifest 检查）。事后 md5 对照入库态**逐字节一致**（`253a3e27…` / `b4826fbd…`）、`git diff -- public/` 为空，**无内容变更**，但这是本轮计划外的写副作用。教训入台账：**验证 import 类修法只用未登记的 key**（走 `media.ts 里没有「…」` 分支即已证明 import 与资产查表都执行到位），或显式 `--frames`/`--outdir` 指到临时目录。附带一条有用读数：同文稿 + 同帧缓存下 `media-encode` 的成片是**可复现**的（字节级一致）。
- 内容增量（配方 §1 硬约束，D 车道附 1 道考题）：`src/data/quiz/ai.json` 纯追加 **`ai-halluc-055`**（`multiple`、`difficulty: 4`，暂存核对 **20 增 / 0 删**），宿主取 A 兜底双缺池头部 `ai/intermediate/llm/12-hallucination`（`core: true`；补前 `grep -c 12-hallucination src/data/quiz/*.json` 实跑 **0** 命中，且全库 679 题的题干/选项/hint **无一提及「幻觉」**——按 `noteId` 与关键词双路核实为真缺口）。三个正确项落「训练目标只奖励『像』不奖励『真』＋SFT 语料几乎全是『有答案』的对，故不承认不知道是机制副产品、要靠数据层补拒答样本」「采样随机性是放大器不是根源：temperature=0 贪心解码照错不误，稳定≠正确」「幻觉率可度量：多次采样互相矛盾、黄金问答集事实一致性评测、线上点踩与追问『你确定吗』比例」；**两个错项取该篇正文明确反对的说法**——「温度调到 0 并要求逐条给依据就能压到零」（正文：推理层只降低概率不根除）与「带引用出处即等于经过核验，不必再抽查引用与原文一致性」（正文：有出处也可能错误引用，要的是可验证的接地）。`answer [0,2,4]` 与 hint 人类序号（第 1/3/5 项正确、第 2/4 项错）逐条对账；难度按锚点定 4（两条错项都是边界/易错点而非概念识别）。**真机端到端**（Playwright + chromium 1440×900，preview 本轮自起并停用、开工实测端口空闲无并发 build）：播种「同方向其余 54 题已刷、只勾 ai 方向、关随机」后设置页如实打印「**已选 1 个方向 · 未刷 1 / 55 题**」；开一轮后题面与数据**逐字命中**、徽标「**AI 多选 ★★★★**」与 difficulty 4 对应；只勾下标 1 的错项提交判「**✗ 回答错误**」并渲染 hint（332 字）；换全新 context 勾满 [0,2,4] 提交判「**✓ 回答正确**」；「查看完整笔记」回链 `/ascension/ai/intermediate/llm/12-hallucination/` 实测 **200**（noteId 非静默 404，页面 HTML 命中「幻觉：为什么」3 处）、`dist/guide/quiz/index.html` 命中新题 id **1** 处、**未播种访问 0 处 JS 错误**。⚠ 如实登记：第一趟把回链拼成 BASE + 绝对 href 得 404，属**探针自身的拼接缺陷**，改用端口+href 即 200；播种页 1 处 React #418（SSR 文本 vs 客户端首帧）与第 190/192/193/195/198 轮同因同判；选项态数组因选择器过松**不引该读数**，判分以「回答正确/错误」文案为准。
- 尺寸（如实记账）：内容/工具 **5 文件**（4 脚本 + 题库）＝ D 车道 ≤4 上限 ＋ 配方 §1 附加 1 题的 +1 余量，与第 196 轮同形态；多出的 1 个仍是台账类（本文件），与第 173/179/187/189/…/199 轮记录的是同一处规范冲突，未自行改配方。临时探针与脚本（围栏计数、parse 对照、队列勘察、CRLF 沙箱与旧版对照、真机两趟、体量压缩、记录头恢复共 8 个）跑完即删、未入库。
- 验证数字：`pnpm build` **744 页 / 56.39s**（pagefind 744 HTML，与第 199 轮同页数——本轮不加页面）；`pnpm verify:docs` 最终 **exit 0、25 项全绿**（一致性 10 项：侧边栏 **741** 条 link 零死链、已提交笔记 **560** 篇全部注册、图谱死链 0 / 覆盖率 100%、178 个 index 页无空壳、**mermaid 588 块**（+21）+ viz 数据 5 份硬编码颜色 **0** 处；mermaid 语法 **588 块**全部有效（chromium 实跑，非空过）；题库 8 项 **680 题**（自有 +1）；影像 7 项 8 资产、public 媒体 6.36MB / 60MB）；本轮改了审计脚本，按 §4.1 加跑 `node scripts/mermaid-contrast-verify.mjs` → **411 页 × 2 主题 0 处低于 4.5:1**，自检行「内容树带图笔记 **437** / dist 渲染出图 **437**」两数相等（本轮未改任何图表，此跑是改动闸门后的回归，页面集与第 199 轮同数）；脚本另打印的 **26 页**「序列图/饼图选择器不覆盖」⚠ **与第 11 行无关**（第 199 轮把它记成本轮候选是误归因）——它是审计选择器覆盖问题，本轮登记进下一轮入口。自有文件逐行复核：题库纯追加 **20 行 / 0 删**，四个脚本只替换正则与导入行（各 −1~−3），未删他人任何字节；本机未开自动行尾转换，五文件行尾不变、无行尾噪声。
- 候选项表本轮状态：第 **11** 行 → **已完成（第 200 轮）**（含「闭合围栏同样要放宽」「21 块 parse 全过、无硬编码颜色」两条落地前置的实测结论）；第 **15** 行①② → **已完成（第 200 轮）**，②的失效机理按本轮沙箱实测改写；③④两项的成立条件仍是「Windows 会话」——本机 macOS `ffmpeg`/`ffprobe`/`say` 齐备，第 199 轮的换机读账本轮再次验证。第 12 行（B 队列 37 支）本轮未触及；第 6/7 行仍待用户裁决；本轮无新增判红证据（开工基线即全绿，全部红色来自当场注入的违规样本与沙箱）。
- 下一轮入口：**第 201 轮，201 mod 5 = 1 → 车道 A 新章节**（`--round 201` 复算即得）。① roadmap §2 仍不可取点（B1 全 `done`、§3 写死「B2 不自动展开」、§5 三项待裁决）⇒ 退回兜底池：双缺 **20**（头部 `ai/intermediate/llm/12-hallucination` 本轮补题后出池、仍无图仍在「纯文字无图 89」；新头部 `distributed/intermediate/case-studies/09-sign-in`）、纯文字无图 89、有图零题 67；但 roadmap §4 把 `case-studies/*` 列为**已饱和**而兜底池头部一大片正是它，按配方 §2「已饱和一律不写、改为互链」**不可直取**——A 轮要么在池里往后找非饱和方向，要么按 §3 退位，别硬写案例篇。② C 队列 25 条不变（头部 `mongodb/intermediate/usage/09-multikey-index` 第一题 + java 三篇第二题），本轮附题未销号也未追加；B 队列 37 支原地不动，游标落 B 时在本机 macOS **无退位理由**。③ D 队列若再开：围栏口径已拉平，剩余真实发现是审计脚本的 **26 页选择器盲区**（sequenceDiagram 与 pie 的节点/连线文字选择器不覆盖，411 页里 26 页「有 SVG 但未判定」只 ⚠ 不判红）与「`stale` 是否收紧为判红」。④ 台账体量：本轮把自己约 15KB 的记录收紧约 3KB 后，收尾实测约 **154KB、越 150,000 线约 4KB**（字节数随本行措辞自指变动，按第 198 轮口径只记量级不追末值）——「最近 5 轮＝196–200」之外**已无对象可压**，第 199 轮预警的「闸门余量归零」正式兑现；**下一压缩对象＝第 196 轮详录**（届时第 201 轮若为 A 车道，须先与用户议定新口径，见「待用户决策」新增条）。⑤ 推送前对入库态复跑 `verify:docs` 逐项对数字（第 189/199 轮口径），随即 push main；开工纪律沿用第 199 轮清单，新增一条：**拿在产资产做冒烟前先确认它不会写 `public/`**。⑥ 推送实测：入库态复跑 `verify:docs` 得 exit 0、588 块 / 680 题，与提交前逐项一致（未出现第 189 轮那种「自述全绿、入库态判红」）；push 区间 `e9c731b..9571241` **只含本轮一个 commit**，推后 `rev-list --left-right --count` 读 `0 0`、工作树干净。本条为补记，另起一个 commit 入库。

### 第 199 轮（2026-09-28，车道 A 新章节｜游标一致，未越车道）：新建「Effect 的契约」专篇——把生命周期心智模型换成订阅模型，用它一次推出 StrictMode 双跑、异步竞态与 Effect 准入判据

- 取号与车道：开工 `git pull --ff-only` **快进成功**（远端领先，`af06292 → 9c67a2e`，含对方知识全景布局修复 `46319c6` 与第 198 轮两条补记），无分叉不触发 §0.1 的 abort；`git status --porcelain` **干净**（第 198 轮记的四项对方在途改动已随 `46319c6` 入库，本轮无需绕开他人字节）。基线 `pnpm verify:docs` **exit 0、25 项全绿**（一致性 10 + mermaid 语法 565 块 + 题库 8 项 679 题 + 影像 7 项 8 资产），不触发 §0.3 强制 D。台账最大号实读 **198**，本轮取 **199**；`node scripts/evolution-candidates.mjs --top 8` 打印「下一轮 = 第 199 轮，199 mod 5 = 4 → 车道 **A 新章节**」，与配方 §1（1、4 → A）逐格一致、**未越车道**；提交前用 `--round 199` 复算同读数（仍以配方表为准）。**⚠ 本机换机了**：本轮在 **macOS（Darwin/arm64）** 跑，196–198 三轮的记录出自同一仓库的 Windows 会话——开工实测 `ffmpeg` `/opt/homebrew/bin/ffmpeg`、`ffprobe` `/opt/homebrew/bin/ffprobe`、`say` `/usr/bin/say` **三者齐备**，故那三轮的「影像第 4 项 ⚠ 跳过」在本机变为**真验**。
- 选题证据（三级顺序，配方 §2 现算）：第一优先源 `content-roadmap.md` §2 已无条目可取——B1 十二条全 `done`（第 198 轮已逐行实读状态列复核），§3 复评结论写死「**B2 不自动展开**，§5 三项待裁决需用户拍板，在此之前 A 车道退回脚本候选池」，本轮照此执行、未自行展开 B2。退到第二级时沿用第 **171/194** 轮确立的口径：勘察脚本那三条清单列的是**已存在**的无图/零题笔记（双缺 21 / 纯文字无图 89 / 有图零题 66），与「1 篇笔记 + 三件套」的车道定义不重合，故只当**薄弱面线索**用、其自身补图补题归后续 A/C 轮、**未销号**。据此锁定 react 方向：`git ls-files` 实读 5 篇（`basic/core` 4 + `intermediate/state` 1），对照 js 42 / typescript 7 / vue 3，仍是前端主力方向最薄一面；`grep` 在 `src/content/docs/react/` 下实测 `useEffect` 仅 `basic/core/02` 命中 4 次、`StrictMode|严格模式` 1 次、**`竞态` 0 次**，即「Effect 的清理契约与异步竞态」在 react 方向**零专篇**。逐篇核对不重复：02 篇止于「渲染后执行 + 依赖数组是正确性声明 + 闭包读旧值」，04 篇讲重渲染与 memo，`state/01` 讲服务端状态划界与四级台阶——三者均未回答「清理函数到底防什么 / 为什么多跑一轮 / 迟到的响应怎么盖掉新数据」。双缺池头部 `ai/intermediate/llm/12-hallucination` 与 `case-studies/*` 系列本轮未取（后者落 roadmap §4 已饱和清单，明写不写）。**同时收掉一笔四轮未清的留账**：`react/index.mdx` 首页「当前覆盖**基础 · 核心概念**」自第 171 轮起漏记 04 篇、第 194 轮又漏记 `intermediate/state`，194→198 每轮入口都写「A 车道落 react 时顺手一行改掉」——本轮落在该方向，4 文件配额内一并改掉，未新增文件。
- 内容要点（新建 `react/intermediate/state/02-effect-contract.md`，244 行，`level: intermediate`、**不带 `core` 星标**，延续第 171/175/178/194 轮对候选项 2 的避让口径）：全篇只干一件事——**把「Effect = 组件生命周期」换成「Effect = 一次订阅」**，再用这一个模型把三条事故线一次推出来，而不是罗列三条最佳实践。①**订阅模型**：官方定义原文 *An Effect can only do two things: to start synchronizing something, and later to stop synchronizing it.* 与 *This cycle can happen multiple times if your Effect depends on props and state that change over time.*，据此点破关键差别——生命周期模型把 cleanup 挂在「卸载」一个事件上，订阅模型把 cleanup 挂在**每一次重新同步**前面，后者才对得上真实行为；配一张 `setup① → StrictMode 额外一轮 → 依赖变化时 cleanup↔setup 往复 → 卸载 cleanup` 的循环图。②**StrictMode 那一轮是照妖镜**：引 *When Strict Mode is on, React will also run one extra setup+cleanup cycle in development for every Effect.*、*React remounts every component once after mount (state and DOM are preserved).*、*All of these checks are development-only and do not impact the production build.*，并用官方连接示例（重挂后 `"✅ Connecting..."` 打两遍，逼你回头查没 close）说明设计意图；再钉三条边界（只开发期／额外一轮仍是 setup→cleanup→setup 故**测的是对称性不是容忍乱写**／「跑两遍就出错」等于依赖频繁变化时同样会出错），把问题从「Effect 跑两遍怎么办」纠正为「我的 Effect 能不能被安全地重复启动和停止」。③**竞态**：取官方搜索框例（`query` 从 `"h"` 一路变到 `"hello"`，*there is no guarantee about which order the responses will arrive in*）与 race condition 定义原文，给 `ignore` 标志的完整 cleanup 写法，并补一条读者真正会卡的机制解释——**`ignore` 是每次同步各自的局部变量，Effect 体与它的 cleanup 共享同一次闭包，所以不会串到下一轮**；再引 *cleanup ensures that the 'Alice' response is ignored even if it arrives after 'Bob'* 收成判据（清理保证的是「旧请求的迟到结果进不了 state」，无论先到后到），并按官方那句把 `AbortController` 与 `ignore` 分工写清（省流量 vs 挡写入，**互补而非二选一**，只 abort 不判 flag 时某些封装仍会把 `undefined` 写进 state）；配一张「B 先到 → A 迟到」在两种写法下分叉的对照图 + 一张四类副作用（订阅/定时器/请求/全局事件与 DOM）不带清理的代价表。④**准入判据**：官方 *Use Effects only for code that should run **because** the component was displayed to the user* 与交互/可见性那句对照，解释为什么频次不同（*Unlike event handlers, which only run once per interaction, Effects run whenever synchronization is necessary*），并给两组 ✕/✓ 短码——派生 state（配官方 *If something can be calculated from the existing props or state, don't put it in state. Instead, calculate it during rendering.* 与其列出的三条收益）、「改密码重置确认框」写成 Effect vs 写成事件处理器。**密码那一例只作机制推演与判据应用，未标成官方示例**。⑤**收尾把数据获取的落点接回上一分类**：明写本篇给的是「手写时的自保姿势」，服务端状态的正解在 `state/01` 那条划界，避免读者把 Effect 拉数当成推荐架构。另以「量完布局必须立刻定位且不能露中间帧」这条窄缝划开 `useEffect` / `useLayoutEffect`（引 *can hurt performance. Prefer useEffect when possible.*）。**2 张 mermaid（颜色仅 `hl`/`good`/`bad` 语义类）+ 1 表 + 3 段代码**、面试答法 5 问、要点备忘 8 条。
- 事实核验：17 处引文**逐页 WebFetch 取回英文原文**（react.dev `lifecycle-of-reactive-effects`、`synchronizing-with-effects`、`you-might-not-need-an-effect`、`reference/react/StrictMode`、`reference/react/useLayoutEffect` + MDN `AbortController`），中文句为译注、原文以斜体或引号并列，未采信任何凭记忆的表述。**两处主动不写**：(a) `useEffectEvent`——lifecycle 页确实提到把 Effect 拆成 reactive 部分与非 reactive 部分「抽成 Effect Event」，但该 API 的稳定性和可用版本本轮未取得证据，正文一字不提；(b) Effect 执行与浏览器重绘的**精确帧序**——只取 useLayoutEffect 页那组对照原句，不自行外推成「useEffect 一定在下一帧之前完成」。`AbortController` 只写官方那句「可以额外用它取消不再需要的请求」，未引申为 React 内置能力。延伸阅读 6 条均为本轮实际取回的 URL。
- 尺寸（如实记账）：内容 **4 文件**（新篇 + `astro.config.mjs` + `src/data/graphs/react.json` + `react/index.mdx`）正好用满 A 车道兜底池 ≤4 上限——**不享**配方 §2 给 roadmap 条目的 6 文件例外，故本轮未碰 `src/data/quiz/react.json`（新篇因此进入「有图但零题」池）、未加首题、未碰速答手册，与第 194 轮同形态。多出的 1 个仍是台账类（本文件），与第 173/179/187/189/…/198 轮记录的是同一处规范冲突，未自行改配方。**新留账一条**：分类页 `state/index.mdx` 导读收束句只列三件事（谁持有／怎么送达／谁跟着重渲染），本篇带来第四件（外部数据与事件怎么安全进 state）；受 ≤4 上限本轮未动，留给后续同分类轮次一行改掉。接线三处：侧边栏「中级 › 状态与数据流」组 +1 条、图谱新增 `r-effect` 节点（分组「副作用」由 `colorForGroup` 按 PALETTE 自动派色，不改组件）+ 3 条边（`root`／`r-hooks`／`r-state`）。
- 验证数字：`pnpm build` **744 页 / 26.29s**（+1 页——本轮新篇落在**已存在**的分类下，不新增 `index.mdx`，故页数只 +1，与第 194 轮 +2 的差别的来源即在此；pagefind 744 HTML）；`pnpm verify:docs` **exit 0、25 项全绿**（一致性 10 项：侧边栏 link **741** 条 +1 且零死链、图谱死链 0 / 覆盖率 **100%**、图谱结构节点唯一边端点有效、**178** 个 index 页无空壳、**mermaid 567** 块 +2 + viz 数据 5 份硬编码颜色 **0** 处；mermaid 语法 567 块全部有效（chromium 实跑，非空过）；题库 8 项 **679** 题持平（A 车道受上限未加题，符合约束）；影像 7 项 8 资产、public 媒体 6.36MB / 60MB——**第 4 项「音轨与封面」在本机首次为真验**，不再打印 196–198 三轮那种 ⚠ 跳过）。「已提交笔记」这一项**两阶段读数如实报**：提交前 **559** 篇、`7a8c54c` 入库后原样复跑为 **560** 篇（该项按 `git ls-files` 取数、新文件未入库不计，与第 194 轮同一现象），复跑同为 **exit 0、25 项全绿**、link 741 / 567 块 / 679 题 / 8 资产逐项与提交前一致——即第 189 轮立下的「自述已跑绿 ≠ 入库态绿」闸门，本轮在 push **之前**完成复跑自证（先验后推，而非 198 轮的先推后验）。本轮动过图表，按 §4.1 加跑 `node scripts/mermaid-contrast-verify.mjs` → **411 页 × 2 主题 0 处低于 4.5:1**（第 194 轮为 410，+1 即本页；自检行「内容树带图笔记 437 / dist 渲染出图 437」两数相等，无第 190 轮那种假阴性；脚本另打印的 26 页「序列图/饼图选择器不覆盖」仍是候选表第 **11** 行既有盲区，本轮两张均为 flowchart、不落入其中）。新篇代码块按 East Asian Width 逐行量过：**非 mermaid 围栏 16 行、超 80 视觉列 0 行**。**真机端到端**（本机 Playwright + chromium 1440×900，非 600px MCP 视口；开工 `lsof -iTCP:4321` 与 `pgrep -fl "astro.mjs build"` 实测**端口空闲、无并发 build**，`pnpm preview` 为本轮自起并在收尾停用的进程，全程独占 dist）：新页 **200**、页内实渲 **2 个** mermaid SVG（**720×173** 与 **477×704**，父容器 `scrollWidth 720 = clientWidth 720` 未溢出）、`Parse error` **0**、`[object Object]` **0**、`<table>` **1** 张、`main pre` **3** 段且横向溢出 **0** 处、`main h2` **8** 节、`document.documentElement.scrollWidth` **1440** = 视口宽；双主题下实测节点字色 light `rgb(51,51,51)`/`rgb(63,52,40)`、dark `rgb(212,212,212)`/`rgb(232,221,203)`，**节点内联 `fill` 硬编码 0 处**（配色确由 `custom.css` 主题令牌接管，亮暗两种主题各自可读）；正文 **3** 条站内绝对内链逐个 `request.get` 均 **200**、**6** 条外链全部带 `target=_blank`（无一遗漏，避免内置浏览器吃掉当前页）；分类页 **200** 且实含新篇标题、方向首页 **200** 且实含改后覆盖文案（即第 194 轮留账收口的直接验证）、侧边栏与正文各 **1** 条指向本篇的 link、作答页 **200**、**未播种访问 0 处 JS 错误**。两个核验与探针脚本跑完即删、未入库。
- 候选项表本轮状态：**无行变更**（A 车道不动工具与闸门）。第 11 行（缩进围栏漏检）、第 15 行①②（Windows 侧 `media-encode` 崩溃与对比度审计 CRLF 假绿）本轮未触及；第 6/7 行仍待用户裁决。登记一条**换机带来的读账**：候选表第 15 行③④与「待用户决策」那两条 B 车道平台前提，其成立条件是 **Windows 会话**；本轮实测本机（macOS）`ffmpeg`/`ffprobe`/`say` 齐备 ⇒ **游标再落 B（余数 2）时在 macOS 上没有退位理由**，§3 的 B→C 退位只适用于 Windows 会话。待决策原文一字未改（那是用户拍板区），只在此登记，避免后续轮次把「B 不可执行」当跨平台事实照抄。
- 下一轮入口：**第 200 轮，200 mod 5 = 0 → 车道 D 体检与工具**（复算 `--round 200` 即得此读数）。① D 队列首选候选表第 **15** 行①②（各 1 文件、修法照第 196 轮的读入归一 + `pathToFileURL`；注意②的 CRLF 假绿**只在 Windows 检出下发作**，macOS 会话跑该审计读数正常，但仍是 Windows 贡献者的假绿盲区，修法不变）、次选第 **11** 行（两道闸门的围栏正则放宽为 `^[ \t]*`，538→559 块口径需在两种行尾下各复测一次）。② **本轮把新篇送进了「有图但零题」池**（66 → 67）：`react/intermediate/state/02-effect-contract` 的第二题角度已在正文钉死、可直接入 `coverage-deepening.md` d 类——「`ignore` 为何不会串轮（Effect 体与 cleanup 共享同一次闭包）／StrictMode 额外一轮测的是对称性而非容忍乱写／`AbortController` 与 `ignore` 各解决哪一半」；但**入队动作归 C 轮现算**，A 轮未碰队列文件。③ C 队列头部 **25** 条不变（a 类 10 条，头部 `mongodb/intermediate/usage/09-multikey-index` 第一题 + java 三篇第二题）。④ B 队列 **37** 支原地不动，头部 `java-classload`、`kafka-producer`、`redis-sentinel`；游标下次落 B 时**先按本轮登记判本机平台**再决定退位。⑤ A 车道续点：roadmap 仍不可取点（§5 三项待裁决未动），兜底池双缺 21 / 纯文字无图 89 / 有图零题 67；react 方向仍缺 `intermediate` 续篇与 advanced 层，新留账见本轮「尺寸」条（`state/index.mdx` 导读第四件事）。⑥ 台账体量（§7 本轮**两次触发**，末次已无对象可压）：追加本条后 161,966 字节越线，按 §7 把第 194 轮详录压为单行 → 149,692；补写「入库态两阶段读数」又回 150,153，而最近 5 轮（195–199）之外**已全部压完**，§7 自此无压缩对象，故改为**收紧自己措辞**回落、不删他人历史。**给后续轮次**：闸门余量已归零，下一轮按「必触发」规划——与用户议定新瘦身口径，或每轮自带等量压缩。⑦ 推送：`git push origin main` → `9c67a2e..7a8c54c`，`rev-list --left-right --count` 读 `0 0`，该区间**只含本轮一个 commit**（对方 `46319c6` 开工 pull 时已入库，无第 198 轮那种连推他人产出的情形）。⑧ **开工纪律（macOS 版，本轮换机后首跑）**：`git pull --ff-only` → `git status --porcelain` 定界（第 198 轮那四项对方在途改动已随 `46319c6` 入库，本轮开工面干净）→ `pnpm verify:docs` 基线（取真退出码 `> log 2>&1; echo $?`，勿用管道尾码）→ `node scripts/evolution-candidates.mjs --top 8` → 复算台账最大号 +1 → 查 `pgrep -fl "astro.mjs build"` 与 `lsof -nP -iTCP:4321`（本机 pnpm/node 在 `~/.local/bin`，ffmpeg 系在 `/opt/homebrew/bin`）→ commit 前最后一刻再核 `git diff --cached`。**换机后 `node_modules` 与 playwright chromium 已就位**（基线 mermaid 语法校验真跑 565 块即为证据），不必再走第 196 轮的三步装环境。

### 第 198 轮（2026-09-27，车道 C 题库｜游标一致，未越车道｜题库深化第 73 轮）：支付 / Node Stream / 定时任务三篇首题——a 类头部三条「0 题补缺」收掉，并补上第 196、197 两轮欠的作答页真机读数

- 详录已压缩（2026-09-28 第 203 轮收尾，§7 增量压缩）：游标一致走车道 C，按配方 §2「取队列头部 3 条」执行而非第 197 轮入口预测，给 `17-payment` / `04-stream` / `07-cron-timer` 三篇补首题（`dist-payment-045` / `js-stream-026` / `linux-cron-017`，三份题库纯追加 17/21/21 行、676→679 题），干扰项一律取该篇正文明确反对的说法；同轮补掉第 196、197 两轮欠的作答页真机读数（在 Windows 会话用 Playwright 跑通播种→出题→判分→hint 渲染→笔记回链，此后 C/B 轮再无「本机跑不了真机」这条退路）；队列销 3 追 3、a 类维持 10 条；作业中途实测本机有他人并发 `pnpm build` 覆盖共享 `dist`，按第 180 轮先例先轮询等其退出再构建、并复用对方起的 4321 preview；首次 push 只含自有五文件，随后对方在同一共享工作树自行提交 `46319c6`、本会话补记 push 重试时被一并快进发布——本轮全程未 stage、未改对方一个字节。详情见 git 历史。
### 第 197 轮（2026-09-27，车道 C 题库｜游标本为 B，B 在本机无合格候选按 §3 降级 B→C 并如实登记｜题库深化第 72 轮）：推理参数 / Token 成本 / 工具集设计三篇第二题——把第 190 轮的三条首题考点往「输出边界与生产口径」再推一层

- 详录已压缩（2026-09-28 第 202 轮收尾，§7 增量压缩）：游标本为 B，但本机（当时的 Windows 会话）`ffmpeg`/`ffprobe`/`say` 三者皆缺、`media-encode.mjs:45` 绝对路径动态 import 实跑崩溃，读完整 `media-capture.mjs` 后判定「导出图卡」只能自创配方外的手工产法而主动弃取，按 §3 退位 B→C；给 `ai/intermediate/llm` 的推理参数 / Token 成本 / 工具集设计三篇补第二题（`quiz/ai.json` 纯追加 60 行、673→676 题，干扰项一律取该篇正文明确反对的说法），并自查与首题 hint 的撞车、把措辞改为考「机制与代价的配对」；候选表第 12/15 行加读数、「B 车道平台前提」待决策条即本轮新增；`pnpm build` 743 页、`verify:docs` 25 项全绿，未做作答页真机端到端；§7 体量闸门于本轮首次触发（156,632 字节越线），同轮把第 191、192 两轮详录压为单行。详情见 git 历史。

### 第 196 轮（2026-09-27，车道 D 体检与工具｜游标本为 A，基线不绿按配方 §0.3 强制走 D）：本仓第一个 Windows 会话——修掉三道闸门「本机假红/假绿/崩溃」（4 文件），`verify:docs` 从 exit=1 回到 25 项全绿；附双缺池头部篇首题

- 详录已压缩（2026-09-28 第 201 轮收尾，§7 增量压缩）：本仓第一个 Windows 会话——开工基线判红（`consistency-verify` frontmatter 假红 559 篇、第 10 项打印「mermaid 0 块」假绿、`media-verify` 与 `evolution-candidates` 因 Windows 绝对路径动态 import 直接崩溃），按「读入即归一 + `pathToFileURL`」修 4 个脚本使 `verify:docs` 回到 25 项全绿，并把未修的 4 处残留登记为候选表第 15 行（①②后由第 200 轮收口）；游标本为 A、按 §0.3 强制走 D；附双缺池头部 `ai/basic/agent/05-guardrails` 首题 `ai-guardrails-051`；台账走第 189 轮的 index 重建路线绕开对方未提交字节；`pnpm build` 743 页、题库 673 题。详情见 git 历史。
### 第 195 轮（2026-09-26，车道 D 体检与工具｜游标一致，未越车道）：修掉勘察脚本的车道游标（余数 0 从未打印出 D、余数 4 打成 B），并把五格回归做成可核对；附第 194 轮新篇首题
- 详录已压缩（2026-09-28 第 200 轮收尾，§7 增量压缩）：D 车道修 `scripts/evolution-candidates.mjs` 的车道游标（余数 0 从未打印出 D、余数 4 打成 B），改为按余数显式建 `LANES` 表并补 `--round n` 回归入口；附第 194 轮新篇首题 `react-layer-008`（multiple、难度 4）。收口候选表第 14 行；`pnpm build` 743 页、`verify:docs` 25 项全绿（671 题）。详情见 git 历史。
### 第 194 轮（2026-09-26，车道 A 新章节｜**勘察脚本打印为 B、配方 §1 判为 A，按配方执行并如实登记差异**）：新建 `react/intermediate/state` 分类与「状态管理与 Context」专篇——把「这份状态放哪一层」补成专篇

### 第 193 轮（2026-09-26，车道 C 题库｜游标一致，未越车道｜题库深化第 71 轮）：vLLM 吞吐 / Linux 四象限 / 布隆过滤器——a 类头部三篇首题补缺

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
- **接线类 JSON 一律走文本级 Edit，不跑序列化脚本整写**（第 201 轮实测）：`src/data/graphs/*.json` 的既有约定是「一个节点一行」，用 `python json.dump(indent=2)` 写回会把整份文件打散（diff 读 70 增 / 9 删，全是格式噪声），与「保留现有文件约定、diff 只呈现语义变化」直接冲突；还原后改文本 Edit 得 6 增 / 2 删。题库 JSON 同理（且要沿用它自己的行尾）。
- **真机探针的读数必须能区分两种状态，否则不算验证**（第 201 轮实测）：用 `getComputedStyle(span).fill` 读图表标签字色时，HTML 元素的 `fill` 不随主题变，亮暗两档读出完全相同的 `rgb(63,52,40)`——若就此收尾即是一次假验证；改按 `mermaid-contrast-verify` 的同款配对法（标签取 `color`、形状取 `fill`，选择器 `g.node span.nodeLabel` / `g.node text` 配 `rect`）后亮暗才各自出数（本轮 light 10.29、dark 11.02）。同理，选择器写成 `svg#mermaid-*` 这类非法通配会直接抛错，别把抛错当成「没有违规」。
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

- **台账 §7 体量闸门已无对象可压，请定新口径（第 200 轮，2026-09-28）**：§7 规定「超过约 150KB 把**最近 5 轮以外**的轮次记录压为每轮单行」，但第 194 轮起已逐轮压完、本轮压掉第 195 轮后「最近 5 轮＝196–200」之外**再无可压对象**（第 199 轮已预警「闸门余量归零」）。本轮即使把自己约 15KB 的记录收紧 2KB，收尾实测仍越 150,000 字节线。**推荐 A**：把闸门改为「按 KiB 计 200KB」并把压缩窗口从「最近 5 轮」缩到「最近 2 轮」，历史详录靠 git 承载（配方 §6 已述「详情见 git 历史」是既定读法）；**备选 B**：新增 `docs/evolution-history.md`，把 20 轮以前的轮次记录整体迁出，主台账只留阶段目标＋候选表＋最近 N 轮（一次结构性搬迁，涉及所有并行会话的读写位置）；**备选 C**：维持现状，接受每轮靠「收紧自己措辞」硬塞，代价是轮次记录信息密度逐轮下降（本轮已出现「为体积删细节」的倾向）。影响：这是台账规范与体积策略，且直接决定后续无人值守轮次记录能保留多少证据，按纪律不擅自改配方。**第 202 轮补一条使该决策升级为「每轮必触发」的实测**：窗口（最近 5 轮＝198–202）之外的第 197 轮详录已在本轮按原口径压为单行，**自此窗口外一字一行皆无可压对象**；本轮追加记录后台账仍停在 168KB 一线（约 150,000 线上方 18KB），后续每轮只能靠收紧自身措辞减缓增速、无法回落。若选路线 C（维持现状），等于默认接受轮次记录逐轮降密；推荐仍是 **A**。
