# 项目演进状态

> 由 apex-project-evolution 维护，人可随时修改；技能每轮读写，手改内容视为最新事实。

## 当前阶段目标

- 阶段：内容体系充实（「可用版本」已达成：构建通过且已部署 GitHub Pages；尚无真实用户数据，无法进入「验证有人需要」）
- 目标描述：让站点成为结构自洽、核心技术方向内容成体系的知识库——每轮在补内容、修问题、改善体验中按证据选择一项最小改进，保持全站一致性体检全绿。
- 完成标志（全部可自动验证）：
  1. `pnpm build` 通过；
  2. 一致性体检通过：侧边栏 link 零死链、已提交笔记全部注册进侧边栏（guide 元文档除外）、图谱 href 零死链、方向目录与图谱 JSON 一一对应；
  3. Mermaid 全站双主题对比度审计 0 处低于 4.5:1（运行 `node scripts/mermaid-contrast-verify.mjs`）；
  4. 出现必须由真实用户数据裁决的方向性决策时，本阶段视为到达边界，转入待用户决策。

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

| 候选项 | 类型 | 贡献 | 置信 | 成本/风险 | 得分 | 状态 |
| --- | --- | --- | --- | --- | --- | --- |
| 1. 图谱覆盖度补全：量化无图谱节点的已提交笔记，为未被并行会话占用的方向补节点+关联边 | 修问题 | 4 | 0.9 | 2 | 1.8 | 第 1 轮进行中 |
| 2. Mermaid 双主题对比度全站审计（`scripts/mermaid-contrast-verify.mjs` + preview），低于 4.5:1 则修 | 修问题 | 3 | 0.8 | 2.5 | 0.96 | 待办 |
| 3. 为未占用方向（elasticsearch/kafka/nginx/mongodb/linux/git 等）补高频八股笔记（需动 astro.config.mjs 同文件异 hunk，有与并行会话交织风险） | 补功能 | 5 | 0.7 | 3 | 1.17 | 待办（观察并行会话结束后优先） |
| 4. 笔记内相对链接与 frontmatter 规范体检（level 与目录一致、必填字段） | 修问题 | 3 | 0.7 | 2.5 | 0.84 | 待办 |
| 5. 移动端/打印样式实测 | 改善体验 | 2 | 0.4 | 3 | 0.27 | 待办 |
| 6. 需求验证类动作（SEO/分享卡片/统计） | 验证需求 | — | — | — | — | 暂不开发：需真实用户数据支持决策，记录为阶段边界条件 |

## 轮次记录

### 第 1 轮（2026-09-08）

- 选择：候选项 1——图谱覆盖度补全。
- 依据：得分 1.8 居首；AGENTS.md 要求「新笔记关联图谱」；仅动 graphs/java.json（并行会话未占用），风险最低。
- 交付：src/data/graphs/java.json 补 `scoverview` 节点（微服务总览，group 框架）+ `springcloud→scoverview` 边（入门全景），共 +2 行；另初始化本状态文件（docs/evolution.md）。
- 验证：JSON 合法（100 节点/135 边）；图谱覆盖率 100%（335 篇笔记全覆盖）；`pnpm build` 通过（468 页，7.0s）；提交 917f6b1、2f58661 已推送 origin/main。
- 结论：修问题。
- 新证据与经验：①本轮执行期间并行会话提交了 4 个提交（js 拆篇、mysql/redis 四篇、分布式两篇、java 测试/日志五篇）并恢复网络方向侧边栏注册——并行活动非常频繁，每轮开工必须重新 `git status` 定界占用区；②新提交未破坏一致性（覆盖率仍 100%）；③"未注册侧边栏笔记"检查中 guide 元文档为有意豁免项。
- 下一轮入口：候选项 2——Mermaid 双主题对比度全站审计（需先 `pnpm preview`，再跑 `node scripts/mermaid-contrast-verify.mjs`）；开工先重新定界工作区。

### 第 2 轮（2026-09-08）

- 选择：候选项 2——Mermaid 双主题对比度全站审计。
- 依据：候选项 1 已完成退场，本项得分次高（0.96）；纯只读体检+按需修复，不触碰并行会话占用区（本轮开工时发现 algorithm 三篇、distributed 新篇+图谱、guide cheatsheet、astro.config.mjs 均为他人未提交改动，全部绕开）。
- 交付：审计报告结论（无代码改动需求）；本轮为验证型轮次。
- 验证：`pnpm preview` + `node scripts/mermaid-contrast-verify.mjs`：239 个含图页面 × 2 主题，**全部对比度 ≥ 4.5:1，0 处违规**——阶段完成标志 3 达成。
- 结论：修问题（体检通过，无需修复）。
- 新证据与经验：并行会话持续高强度提交（本轮开工时 distributed 方向又新增 2 篇+图谱改动）；审计脚本对 dist 快照运行，不受并行未提交改动干扰，适合无人值守轮次。
- 下一轮入口：候选项 4——frontmatter 规范与笔记内链接体检（level 与目录等级一致、title/description 必填、内链/图片死链），只修已提交且未被占用的文件。

### 第 3 轮（2026-09-08）

- 选择：候选项 4——frontmatter 规范与笔记内链接体检。
- 依据：候选项 2 已完成退场；候选项 3（补内容）需动 astro.config.mjs，该文件持续被并行会话占用，继续顺延。
- 交付：①体检脚本结论；②修复 distributed/intermediate/coordination/03-distributed-scheduler.md 第 43 行内链 `/etcd/basic/core/02-etcd-lease-txn-watch.md/` → `…-watch/`（全站唯一断链）。
- 验证：468 篇已提交笔记体检：frontmatter 0 缺陷、level 与目录等级 0 不一致、图片 0 死链、470 处站点绝对内链仅 1 处断链（已修）；修复后 `pnpm build` 通过（474 页，页面数增长来自并行会话新内容）；提交 ff18304 已推送。
- 结论：修问题。
- 新证据与经验：①**提交事故与教训（重要）**：第 2 轮提交时用裸 `git commit` 把并行会话已暂存的 java spring 目录重命名（9 文件）一并带入提交 3d40ce4 并已推送——内容完整无损（rename 100%）但提交归属混淆；自本轮起改用 `git commit -- <pathspec>` 只提交指定路径，第 3 轮 ff18304 已验证该方式干净。建议后续轮次一律沿用。②绝对内链以 `/` 开头的写法在 187 个品种、470 处中仅 1 处出错，是低风险惯例；代码块内链接需在体检时剔除围栏避免误报。
- 下一轮入口：候选项 3（为未被占用方向补内容，需观察 astro.config.mjs 占用解除）；或重新跑三合一体检（一致性+对比度+frontmatter/内链）作为轮前例行验证。

### 第 4 轮（2026-09-08，第二次启动）

- 选择：Spring 大重构（并行提交 034bed1）后的一致性复检 + 修复复检发现的缺口。
- 依据：大规模路径迁移是断链/图谱错位高发场景，属阻塞项检查，置顶执行。
- 交付：①六项体检复检结论；②修复 `java/basic/syntax/13-lombok-apt` 未注册侧边栏的遗漏（astro.config.mjs 补 1 行）。
- 验证：体检六项中五项全绿（侧边栏 471 link 零死链、图谱零死链、覆盖率 100%、内链零断链、frontmatter/level 零缺陷），唯一缺口已修；`pnpm build` 477 页通过；提交 63648a1 已推送。
- 结论：修问题。
- 新证据与经验：①astro.config.mjs 占用已解除（并行会话完成 Spring 四家拆分并提交）；②当前占用区转为 sidebar 组件三件套（public/scripts/sidebar-tree.js、src/components/starlight/Sidebar.astro、src/styles/custom.css）；③13-lombok-apt 正是此前轮次观察到"未提交文件"，其提交者漏了侧边栏注册——验证了"并行提交可能不完整"的判断，体检应每轮例行。
- 下一轮入口：候选项 3——astro.config.mjs 已释放，为薄弱方向补内容（笔记+侧边栏注册+图谱节点三件套）。

### 第 5 轮（2026-09-08，第二次启动）

- 选择：候选项 3——为薄弱方向补内容。方向密度扫描显示 java(94)/algorithm(40)/python(37)/distributed(35) 密集且被并行会话推进，kafka/postgresql/rocketmq/zookeeper/seata/etcd 各仅 2–3 篇；选 kafka（消息队列面试高频、用户近期在分布式方向提交过消息可靠性内容、目录未被占用）。
- 交付：新笔记 `kafka/intermediate/core/04-high-throughput.md`（高吞吐机制深挖：顺序写/页缓存/零拷贝/批量压缩/分区并行/Reactor + 高频追问速答），侧边栏注册 + 图谱节点/边（throughput 节点、root 与 reliability 两条边）三件套。
- 验证：`pnpm build` 478 页通过；新增图表双主题对比度审计通过（243 页全绿，完成标志 3 维持）；提交 91b6c1c 已推送（3 文件，pathspec 干净提交）。
- 结论：补功能。
- 新证据与经验：①kafka 方向只有 intermediate 等级、core 分类 4 篇，basic 等级空缺（入门篇如"消息队列三问"可作后续选题）；②选题方法：先读现有篇目大纲避重叠（01 的"Kafka 为什么快"仅总结清单小节，深挖可独立成篇），再按"面试出场率×与现有内容互补度"定题；③三件套模式（笔记+侧边栏+图谱）已跑通且可复制。
- 下一轮入口：新体检维度——分类页导读质量（AGENTS.md 要求分类页正文写简介，排查空壳分类页）；若全绿则本轮以体检结论收尾。

### 第 6 轮（2026-09-08，第二次启动）

- 选择：分类页导读质量体检——新体检维度，源自"AGENTS.md 要求分类页正文写简介"与现状的差距验证。
- 交付：修复全站唯一空壳分类页 `java/basic/tomcat/index.mdx`（补 4 行导读：定位、两篇的学习顺序、与 Spring Boot 内嵌容器篇的衔接、学习状态提示）。
- 验证：129 个分类/方向 index 页扫描，空壳 1 处（已修）、超短 0 处；`pnpm build` 478 页通过；提交 f0965a0 已推送。
- 结论：改善体验（分类页导读补全）。
- 新证据与经验：①分类页导读质量整体很高（128/129 有实质简介），仅并行提交潮中遗漏一处；②体检维度清单扩至四项：一致性（侧边栏/图谱/覆盖率/内链）、Mermaid 对比度、frontmatter/level、分类页导读。
- 下一轮入口：第三次启动候选——继续三件套模式补薄弱方向内容（推荐顺序：kafka basic 等级入门篇 → rocketmq/zookeeper 高频篇）；每轮开工先跑四项体检确认基线。

### 第 7 轮（2026-09-08，第三次启动）

- 选择：kafka basic 等级入门篇（状态文件既定入口）。
- 依据：体检基线全绿（473 link/344 篇/覆盖率 100%/零断链/零空壳）；kafka 是方向密度表中薄弱且面试高频度最高的方向；工作区首次完全干净，无并行冲突风险。
- 交付：新建 `kafka/basic/core/` 分类（对齐 rabbitmq 命名）——`01-why-mq.md`「消息队列三问」（同步/异步对比图、解耦削峰异步、代价三件、何时不用 MQ）+ 分类页 index.mdx 导读；侧边栏加"基础"分组；图谱加 whymq 节点与两条边。
- 验证：`pnpm build` 480 页通过；新图表双主题对比度审计通过（244 页全绿）；提交 7970e4e 已推送（4 文件）。
- 结论：补功能。
- 新证据与经验：①rocketmq 只有 advanced/core 3 篇（特性/顺序性能/积压），**缺架构模型基础**——NameServer/Broker 主从/消息模型是 RocketMQ 面试最高频题；②zookeeper 仅 2 篇待勘察；③kafka 现覆盖 basic(1)/intermediate(4)，下一个 kafka 缺口是消费组 Rebalance 深挖（01 只有清单式小节）。
- 下一轮入口：rocketmq basic 架构篇（先读现有 3 篇大纲避重叠）；zookeeper 高频篇作第 9 轮候选。

### 第 8 轮（2026-09-08，第三次启动）

- 选择：rocketmq basic 架构篇（既定入口；勘察确认 zookeeper 2 篇覆盖尚可而 rocketmq 缺架构骨架）。
- 交付：新建 `rocketmq/basic/core/` 分类——`01-rocketmq-architecture.md`（四角色与 NameServer 无中心路由的 AP 取舍、Topic/Queue/消费组、CommitLog 集中存储与 Kafka 对比表）+ 分类页导读；侧边栏加"基础"分组；图谱加 arch 节点与两条边。
- 验证：`pnpm build` 482 页通过；新图表双主题对比度审计通过（245 页全绿）；提交 e6b80e3 已推送（4 文件）。
- 结论：补功能。
- 新证据与经验：①过程小错即改：分类页组件名误写成 CategoryIsland，Write 后立即自查修正为 CategoryNotesIsland（import 路径五级回退 `../../../../../components/`）——新分类页应直接复制既有分类页模板改参数；②rocketmq 现覆盖 basic(1)/advanced(3)，下一个缺口是消费端语义（重平衡/offset 管理）。
- 下一轮入口：kafka Rebalance 深挖篇（`kafka/intermediate/core/05-rebalance.md`，第 7 轮记录的缺口），补完 kafka 面试主线。

### 第 9 轮（2026-09-08，第三次启动）

- 选择：kafka Rebalance 深挖篇（既定入口；01 篇该小节仅"是什么+治理表格"，协议流程与参数陷阱是空白，互补明确）。
- 交付：`kafka/intermediate/core/05-rebalance.md`（触发三来源、JoinGroup/SyncGroup 两阶段时序图、Generation 防僵尸、Eager 全组停摆原理、静态成员与增量协作重平衡、session/max.poll 超时陷阱表、高频追问）+ 侧边栏注册 + 图谱 rebalance 节点与两条边（arch→rebalance、rebalance→reliability）。
- 验证：`pnpm build` 483 页通过；新图表双主题对比度审计通过（245 页全绿）；kafka.json JSON 校验合法；提交 343d270 已推送（3 文件）。
- 结论：补功能。
- 新证据与经验：①kafka 面试主线已成体系：basic 三问(1) + 架构/ISR/可靠性/高吞吐/Rebalance(5)，共 6 篇；②编辑教训：多轮往同一 JSON 追加节点时，old_string 必须基于最近一次 Read 的完整内容重建，凭记忆拼接会漏前轮插入的行（本轮 Edit 一次失败后 Read 核对即成功）；③时序图（sequenceDiagram）在 mermaid 主题接管下审计通过，可用于协议类内容。
- 下一轮入口：第四次启动候选——①kafka basic 再补 offset 语义/选型对比等入门篇；②rocketmq 消费端语义（重平衡/offset）；③postgresql/mongodb 等其他薄弱方向；每轮先跑四项体检基线。

### 第 10 轮（2026-09-08，第四次启动）

- 选择：postgresql basic 根基篇（密度重扫显示 etcd/seata/zookeeper 各 2 篇但覆盖深，postgresql 3 篇全是运维实战向、缺根基）。
- 交付：新建 `postgresql/basic/core/` 分类——`01-pg-vs-mysql.md`「PG 与 MySQL：一张差异地图」（进程模型/MVCC 元组多版本 vs undo log/WAL 物理日志 vs binlog/索引家族四层差异 + count(*) 等高频追问）+ 分类页导读（直接复制模板改参数，零失误）+ 侧边栏"基础"分组 + 图谱 pgmysql 节点与 4 条边。
- 验证：体检基线 8 项全绿（478 link/344→346 篇）；`pnpm build` 485 页通过；postgresql.json JSON 校验合法；提交 7f1fd99 已推送（4 文件）。本篇用对比表格代替 mermaid 图，无图表改动故未跑对比度审计。
- 结论：补功能。
- 新证据与经验：①mongodb 与 postgresql 病症相同：4 篇全是容量/性能/分片/复制集运维向，缺文档模型与选型根基篇——这是"薄弱方向补内容"的可复制选题模式（找根基缺失而非凑数量）；②seata/zookeeper 虽各 2 篇但主题覆盖深（核心机制+高频追问深挖），判定不缺，避免为密度数字写作。
- 下一轮入口：mongodb 文档模型与选型基础篇（同模式）；kafka offset/选型篇作第 12 轮候选。

### 第 11 轮（2026-09-08，第四次启动）

- 选择：mongodb 文档模型与选型基础篇（mongodb 4 篇全是运维/集群向，缺根基——与 postgresql 同病症，模式可复制）。
- 交付：新建 `mongodb/basic/core/` 分类——`01-document-model.md`（概念映射表/内嵌 vs 引用建模决策图/16MB 与事务追问）+ 分类页 + 侧边栏"基础"分组 + 图谱 docmodel 节点与 2 条边。
- 验证：`pnpm build` 487 页通过；mongodb.json 合法；新图表对比度审计通过（246 页全绿）；提交 4c46cee 已推送（4 文件）。
- 结论：补功能。
- 新证据与经验：①"根基缺失"选题模式已三连验证（kafka 三问/PG 差异地图/MongoDB 文档模型）：薄弱方向先补"是什么/为什么/怎么选"，再深挖机制；②PG 与 MongoDB 两篇互为镜像（JSONB+GIN 与 BSON 的选型边界），已互相交叉引用。
- 下一轮入口：kafka offset 语义篇（`kafka/basic/core/02-offset.md`），与 Rebalance/幂等消费篇形成消费侧闭环。

### 第 12 轮（2026-09-08，第四次启动）

- 选择：kafka offset 语义篇（既定入口；位移提交时机是"丢/重"问题的公共根，与 Rebalance/可靠性篇互补）。
- 交付：`kafka/basic/core/02-offset.md`（offset=分区内序号、先处理/先提交取舍表、至少一次因果链、`__consumer_offsets` 50 分区与位移重置追问）+ 侧边栏注册 + 图谱 offset 节点与 2 条边。
- 验证：`pnpm build` 488 页通过；kafka.json 合法；提交 6b947e2 已推送（3 文件）。本篇无 mermaid 图，未跑对比度审计。
- 结论：补功能。
- 新证据与经验：①kafka basic 已成两篇（三问+offset），"三问→offset→intermediate 机制篇"的学习路径闭合，MQ 主线完整度显著提升；②四次启动累计模式：纯文字+表格的笔记（无图表）也完全符合站点文风，mermaid 不是必选项。
- 下一轮入口：第五次启动候选——①rocketmq 消费端语义篇（重平衡/offset，对齐 kafka 补齐 MQ 第二主线）；②elasticsearch（5 篇，缺全文检索原理根基）；③middleware 方向勘察（3 篇，主题未知）。每轮先跑体检基线。

### 第 13 轮（2026-09-08，第五次启动）

- 选择：**阻塞项置顶**——并行提交 c480b1b 暴露"构建静默吞掉 mermaid 语法错误（正文整页丢失、构建仍成功）"，而既有 mermaid-verify.mjs 是过时的样式检查脚本，语法守护缺口悬空。
- 交付：`scripts/mermaid-syntax-verify.mjs`——提取全站 ```mermaid 围栏块（文件:行定位），playwright 无头浏览器加载项目同版本 mermaid 11.17.2 UMD 包逐块 parse，失败清单 + exit 1。
- 验证：①全站 393 个图块全部语法有效；②工具自测：向 01-why-mq.md 注入非法语法 → 脚本精确定位（文件:行）并 exit 1 → 恢复后复跑全绿；③提交 2a5b1fb 已推送。
- 结论：修问题（补上关键路径的验证缺口）。
- 新证据与经验：①实现细节：ESM 版 mermaid 在 about:blank 有 CORS 限制且不挂 window，换 UMD 版 addScriptTag 直接可用；②此脚本应纳入例行体检（mermaid 围栏块变更后必跑），当前口径 393 块；③并行会话的修复（c480b1b）已把存量错误清零，本工具保证增量不再静默腐坏。
- 下一轮入口：rocketmq 消费端语义篇（既定候选①）。

### 第 14 轮（2026-09-08，第五次启动）

- 选择：rocketmq 消费端语义篇（既定候选①；勘察确认重试队列/进度存储/重复消费无专篇，01 篇 Push 小节只讲长轮询）。
- 交付：`rocketmq/basic/core/02-consumer-semantics.md`（集群 vs 广播取舍表、%RETRY% 16 级递增重试与 %DLQ% 死信流转图、广播进度存本地的原因、与 Kafka Rebalance 的对照）+ 侧边栏注册 + 图谱 consumer 节点与 2 条边。
- 验证：四连验证全绿——`pnpm build` 490 页、mermaid 语法校验 394 块通过（新工具首次纳入例行）、rocketmq.json 合法、对比度审计 252 页；提交 abf302a 已推送。
- 结论：补功能。
- 新证据与经验：①并行会话期间再次修改 astro.config.mjs（Edit 报 stale 后重读重插，行号已偏移）——并行编辑高频区在变，但"stale 即重读"纪律有效；②重试队列设计（%RETRY% 递增退避 vs Kafka 无内建退避）是两 MQ 对比题的新弹药；③mermaid-syntax-verify 已成为体检第 9 项。
- 下一轮入口：elasticsearch 根基篇（候选②，勘察后定题）。

### 第 15 轮（2026-09-08，第五次启动）

- 选择：elasticsearch 集群与高可用篇（勘察发现 ES 覆盖比预期扎实——倒排/写路径/深翻页都有深入节，真实缺口是集群控制面：节点角色/选主/脑裂/健康三色）。
- 交付：新建 `elasticsearch/intermediate/cluster/` 分类——`01-cluster-split-brain.md`（四角色分工表、quorum 防脑裂分区图、三色健康排障、磁盘双水位追问）+ 分类页 + 侧边栏"集群与高可用"分类 + 图谱 cluster 节点与 2 条边。
- 验证：四连验证全绿——`pnpm build` 492 页、mermaid 语法校验 395 块、elasticsearch.json 合法、对比度审计 253 页；提交 b3cc4d5 已推送（4 文件）。
- 结论：补功能。
- 新证据与经验：①"根基缺失"模式要升级为"看大纲定缺口"：ES 各篇已有（深入）小节，凭篇数判断会选错题（差点重复写写入路径）；②quorum/脑裂与分布式共识篇同源，跨方向引用是本站知识的复利点；③本日三次新建分类流程全部模板化零失误。
- 下一轮入口：第六次启动候选——①mongodb 复制集/分片之上的分片键选型深入篇；②kafka/rocketmq/RabbitMQ 横向选型对比（需确认 middleware 方向是否已有，避免违反"不挂单一工具"约束）；③algorithm/api 等方向勘察。每轮先跑体检基线（含 mermaid-syntax-verify 第 9 项）。

## 经验与判断沉淀（第五次启动增补）

- **mermaid-syntax-verify.mjs 纳入例行体检（第 9 项）**：背景是构建静默吞 mermaid 错误（c480b1b 修复暴露），脚本经注入自测可信；凡围栏块变更必跑。
- 选题前必扫目标篇目的 ## 大纲：ES 差点重复写已有"从写入到可搜索的完整路径（深入）"，篇数判断不可靠，大纲判断才可靠。
- 并行编辑 stale 冲突处理已流程化：Edit 报 modified → git status 确认占用者 → 重读目标段落 → 重新插入（本轮 rocketmq 侧边栏实战验证）。

## 经验与判断沉淀（第四次启动增补）

- "根基缺失"选题模式已三连验证（kafka 三问/PG 差异地图/MongoDB 文档模型）：薄弱方向先补"是什么/为什么/怎么选"，再深挖机制；判断"缺不缺"看主题覆盖而非篇数（seata/zookeeper 各 2 篇但覆盖深，不缺）。
- 新建分类的三件套流程已完全模板化：复制分类页模板改四处参数 → 写笔记 → 侧边栏插"基础"分组 → 图谱加节点边 → build + JSON 校验 → pathspec 提交。
- 无图表笔记用对比表格与代码块承载结论，同样符合站点文风；有 mermaid 时才需跑对比度审计。

## 经验与判断沉淀（第三次启动增补）

- 新分类页不要手写模板：直接复制既有分类页（如 rabbitmq/basic/core/index.mdx）改 title/description/简介/categoryId 四处，本轮因手写把组件名写错（CategoryIsland），自查即改但可避免。
- 多轮追加同一图谱 JSON：每次 Edit 前以最近一次 Read 内容为准重建 old_string；提交前 node -e JSON.parse 校验。
- 时序图已进入本站图表语汇（Rebalance 篇首用，审计通过）；协议/流程类八股可用 sequenceDiagram 代替纯 flowchart。

## 经验与判断沉淀（第二次启动增补）

- 四项体检每轮例行：①一致性体检（侧边栏/图谱/覆盖率/笔记内链）；②Mermaid 双主题对比度审计（`scripts/mermaid-contrast-verify.mjs` + `pnpm preview`，图表改动后必跑）；③frontmatter/level 体检；④分类页导读体检。前两项本日已全绿。
- 三件套模式（新笔记+侧边栏注册+图谱节点/边）+ pathspec 提交已跑通两次，可复制到任意薄弱方向。
- 选题方法沉淀：先读目标分类现有篇目大纲避免重叠，按"面试出场率 × 与现有内容互补度"定题；补一篇前先量化方向密度（各方向笔记数排序）。
- astro.config.mjs 占用状态轮转：本轮已释放并成功安全使用两次（pathspec）；sidebar 组件三件套（sidebar-tree.js/Sidebar.astro/custom.css）当前被占用，涉及侧边栏交互样式的工作顺延。

## 经验与判断沉淀（第 1–3 轮）

- **每轮开工铁律**：先 `git status` 重新定界占用区（并行会话活跃度高，3 轮内占用区换了三轮：js/mysql/redis 图谱 → algorithm/distributed/guide → java spring 重命名）；只提交本轮自建/自改文件，**必须用 `git commit -- <pathspec>`，禁止裸 commit**（会吞并行会话已暂存内容，第 2 轮已实际发生）。
- 提交前先 `git fetch` 看远端是否领先（并行会话可能同时推送），推送被拒则按 AGENTS.md rebase 后重试。
- 三项可复用体检（均已在本状态文件留下脚本逻辑）：一致性体检（侧边栏/图谱/覆盖率）、Mermaid 双主题对比度审计（`scripts/mermaid-contrast-verify.mjs`，需先 `pnpm preview`）、frontmatter+内链体检（剔除代码围栏后匹配）。
- astro.config.mjs 是高冲突文件（手动侧边栏+并行会话常改）：涉及它的改动只在确认暂存区干净、且用 pathspec 提交时进行。
- 一致性体检中 guide/diagrams、guide/resources 为有意豁免项（元文档）。

## 经验与判断沉淀

- 工作区常驻并行会话改动（git status 长期不干净）：每轮开工先 git status 定界，只提交本轮自建/自改文件；astro.config.mjs 与 graphs/{js,mysql,redis}.json 当前为占用区。
- 一致性体检脚本逻辑（node 内联）：侧边栏 link 解析→文件存在性；git ls-files 笔记→侧边栏注册集合差；图谱 href→文件存在性。每轮验证复用。

## 待用户决策

- 阶段目标确认：本文件「当前阶段目标」为无人值守自定（内容体系充实），推荐选项：维持；备选：用户指定内容路线图或阶段（如「把 XX 方向补完」）。影响：决定后续轮次选型方向。
- guide/diagrams、guide/resources 是否需要注册进侧边栏：推荐选项：维持现状（元文档）；影响：极小。
