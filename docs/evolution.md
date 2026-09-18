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

> 2026-09-08 第六次启动末重置：第一版候选表（第 1 轮建）所列事项已全部落地或退场，按现状重置如下。

| 候选项 | 类型 | 贡献 | 置信 | 成本/风险 | 得分 | 状态 |
| --- | --- | --- | --- | --- | --- | --- |
| 1. 按大纲勘察继续补薄弱方向内容（候选池：ai/python 内部分类、linux/git/tools 工程向；rabbitmq/docker/etcd/mqtt/nginx/middleware 均已勘察为覆盖扎实） | 补功能 | 4 | 0.6 | 2.5 | 0.96 | 待办（宁缺毋滥） |
| 2. core 星标全站策略：36 个分类核心占比过高（星标失去区分度）——是否降标属内容判断，涉及各会话既有意图 | 修问题 | 3 | 0.3 | 2 | 0.45 | **待用户决策**（见待决策区） |
| 3. 移动端/打印样式实测（需 preview 实测，sidebar 组件常被并行会话占用） | 改善体验 | 2 | 0.4 | 3 | 0.27 | 待办 |
| 4. 需求验证类动作（SEO/分享卡片/统计埋点） | 验证需求 | — | — | — | — | 暂不开发：需真实用户数据支持决策，阶段边界条件 |
| 5. 体检工具脚本化收尾：consistency/mermaid-syntax/mermaid-contrast 三脚本接入 `pnpm verify:docs` 一键入口（package.json 并行改动风险，择机） | 改善体验 | 2 | 0.8 | 2 | 0.8 | 待办 |

历史已完成项存档：图谱覆盖度补全（第 1 轮，100%）、Mermaid 对比度审计（第 2 轮，零违规）、frontmatter/内链/分类页导读/图谱结构体检（第 3/4/6/19 轮，均全绿并固化为 scripts/consistency-verify.mjs）、方向内容补全（第 5/7/8/9/10/11/12/14/15/17/20 轮，16 篇 + 5 分类）、工具固化（第 16 轮）、状态文件整理（第 18 轮）。

## 轮次记录

### 第 1 轮（2026-09-08）

### 第 2 轮（2026-09-08）

### 第 3 轮（2026-09-08）

### 第 4 轮（2026-09-08，第二次启动）

### 第 5 轮（2026-09-08，第二次启动）

### 第 6 轮（2026-09-08，第二次启动）

### 第 7 轮（2026-09-08，第三次启动）

### 第 8 轮（2026-09-08，第三次启动）

### 第 9 轮（2026-09-08，第三次启动）

### 第 10 轮（2026-09-08，第四次启动）

### 第 11 轮（2026-09-08，第四次启动）

### 第 12 轮（2026-09-08，第四次启动）

### 第 13 轮（2026-09-08，第五次启动）

### 第 14 轮（2026-09-08，第五次启动）

### 第 15 轮（2026-09-08，第五次启动）

### 第 16 轮（2026-09-08，第六次启动）

### 第 17 轮（2026-09-08，第六次启动）

### 第 18 轮（2026-09-08，第六次启动）

### 第 19 轮（2026-09-08，第七次启动）

### 第 20 轮（2026-09-08，第七次启动）

### 第 21 轮（2026-09-08，第七次启动）

### 第 22 轮（2026-09-08，第八次启动，低强度维持模式）

### 第 23 轮（2026-09-08，第八次启动）

### 第 24 轮（2026-09-08，第八次启动）

### 第 25 轮（2026-09-08，第九次启动，低强度维持）

### 第 26 轮（2026-09-08，第九次启动）

### 第 27 轮（2026-09-08，第九次启动）

### 第 28 轮（2026-09-08，第十次启动，低强度维持）

### 第 29 轮（2026-09-08，第十次启动）

### 第 30 轮（2026-09-08，第十次启动）

### 第 31 轮（2026-09-08，第十一次启动，用户定向内容补充）

### 第 32 轮（2026-09-08，第十一次启动）

### 第 33 轮（2026-09-08，第十一次启动）

### 第 34 轮（2026-09-08，第十二次启动，内容补充模式第二轮）

### 第 35 轮（2026-09-08，第十二次启动）

### 第 36 轮（2026-09-08，第十二次启动）

### 第 37 轮（2026-09-08，第十三次启动，内容补充模式）

### 第 38 轮（2026-09-08，第十三次启动）

### 第 39 轮（2026-09-08，第十三次启动）

### 第 40 轮（2026-09-08，第十四次启动，内容补充模式）

### 第 41 轮（2026-09-08，第十四次启动）

### 第 42 轮（2026-09-08，第十四次启动）

### 第 43 轮（2026-09-08，第十五次启动，内容补充模式）

### 第 44 轮（2026-09-08，第十五次启动）

### 第 45 轮（2026-09-08，第十五次启动）

### 第 46 轮（2026-09-08，第十六次启动，内容补充模式）

### 第 47 轮（2026-09-08，第十六次启动）

### 第 48 轮（2026-09-08，第十六次启动）

### 第 49 轮（2026-09-08，第十七次启动，内容补充模式）

### 第 50 轮（2026-09-08，第十七次启动）

### 第 51 轮（2026-09-08，第十七次启动）

### 第 52 轮（2026-09-08，第十八次启动，内容补充模式）

### 第 53 轮（2026-09-08，第十八次启动）

### 第 54 轮（2026-09-08，第十八次启动）

### 第 55 轮（2026-09-08，第二十次启动，内容补充模式）

### 第 56 轮（2026-09-08，第二十次启动）

### 第 57 轮（2026-09-08，第二十次启动）

### 第 58 轮（2026-09-08，第二十一次启动，内容补充模式）

### 第 59 轮（2026-09-08，第二十一次启动）

### 第 60 轮（2026-09-08，第二十一次启动）

### 第 61 轮（2026-09-08，第二十二次启动，内容补充模式）

### 第 62 轮（2026-09-08，第二十二次启动）

### 第 63 轮（2026-09-08，第二十二次启动）

### 第 64 轮（2026-09-08，第二十三次启动，内容补充模式）

### 第 65 轮（2026-09-08，第二十三次启动）

### 第 66 轮（2026-09-08，第二十三次启动）

### 第 67 轮（2026-09-08，第二十四次启动，内容补充模式）

### 第 68 轮（2026-09-08，第二十四次启动）

### 第 69 轮（2026-09-08，第二十四次启动）

### 第 70 轮（2026-09-08，第二十五次启动，内容补充模式）

### 第 71 轮（2026-09-08，第二十五次启动）

### 第 72 轮（2026-09-08，第二十五次启动）

### 第 73 轮（2026-09-08，第二十六次启动，内容补充模式）

### 第 74 轮（2026-09-08，第二十六次启动）

### 第 75 轮（2026-09-08，第二十六次启动）

### 第 76 轮（2026-09-08，第二十七次启动，内容补充模式）

### 第 77 轮（2026-09-08，第二十七次启动）

### 第 78 轮（2026-09-08，第二十七次启动）

### 第 79 轮（2026-09-08，第二十八次启动，内容补充模式）

### 第 80 轮（2026-09-08，第二十八次启动）

### 第 81 轮（2026-09-08，第二十八次启动）

### 第 82 轮（2026-09-08，第二十九次启动，内容补充模式）

### 第 83 轮（2026-09-08，第二十九次启动）

### 第 84 轮（2026-09-08，第二十九次启动）

### 第 85 轮（2026-09-08，第三十次启动，内容补充模式）

### 第 86 轮（2026-09-08，第三十次启动）

### 第 87 轮（2026-09-08，第三十次启动）

### 第 88 轮（2026-09-08，第三十一次启动，内容补充模式）

### 第 89 轮（2026-09-08，第三十一次启动）

### 第 90 轮（2026-09-08，第三十一次启动）

### 第 91 轮（2026-09-08，第三十一次启动，内容补充模式）

### 第 92 轮（2026-09-08，第三十一次启动）

### 第 93 轮（2026-09-08，第三十一次启动）

### 第 94 轮（2026-09-08，第三十二次启动，内容补充模式）

### 第 95 轮（2026-09-08，第三十三次启动，内容补充模式）

### 第 96 轮（2026-09-08，第三十三次启动）

### 第 97 轮（2026-09-08，第三十四次启动，内容补充模式）

### 第 98 轮（2026-09-08，第三十四次启动，内容补充模式）

### 第 99 轮（2026-09-08，第三十四次启动，内容补充模式）

### 第 100 轮（2026-09-08，第三十五次启动，内容补充模式，第 100 轮里程碑）

### 第 101 轮（2026-09-08，第三十五次启动，内容补充模式）：工具集设计（ai/intermediate/agent 第 16 篇）——grep 确认工具粒度/描述/错误返回设计无专篇；四原则（粒度一工具一事、描述是新人文档含"何时不用"、错误返回可行动、数量上限按需加载）+ 图谱 tooldesign 节点与 2 边；五连验证全绿，提交 5f717d4 已推送；agent 分类 16 篇主线闭环。

### 第 102 轮（2026-09-08，第三十六次启动，内容补充模式）：聚合管道（mongodb 新建 usage 分类第 1 篇，三件套）——mongodb 岗高频；管道顺序决定性能、$lookup 建模警报、100MB 内存限制、ES 分工（CDC 衔接）。五连验证全绿，提交 2497dab 已推送。

### 第 103 轮（2026-09-08，第三十六次启动）：分页与游标（mongodb/usage 第 2 篇）——$skip 性能悬崖与 MySQL/ES 深翻页同构；复合游标（sortKey,_id）、$sample 随机分页。五连验证全绿，提交 4b50cf8 已推送。mongodb/usage 2 篇成对。

### 第 104 轮（2026-09-08，第三十七次启动，内容补充模式）：TTL 索引与数据过期（mongodb/usage 第 3 篇）——grep 确认 TTL 专篇缺（Redis 过期/归档已有对照位）；60 秒删除周期、日期类型静默失效坑、大批量过期性能影响、三层过期治理对照（Redis/文档/文件）。五连验证全绿，提交 edbc05d 已推送。mongodb/usage 3 篇成对。

### 第 105 轮（2026-09-08，第三十八次启动，内容补充模式）：读偏好与读写关注（mongodb/usage 第 4 篇）——readPreference 五档、writeConcern/readConcern 权衡、与 MySQL 读写分离对照；资金类 majority 三件套、报表走 secondary 的组合矩阵。五连验证全绿，提交 5a75554 已推送。mongodb/usage 4 篇成对（聚合/分页/TTL/读偏好）。

### 第 106 轮（2026-09-08，第三十九次启动，内容补充模式）：多文档事务（mongodb/usage 第 5 篇）——grep 确认事务仅 2 篇顺带无专篇；4.0/4.2 演进、session 语法三步、snapshot+majority 前提、限制表（60s/16MB/并发代价）、单文档原子优先纪律。五连验证全绿（首轮跑卡死后重跑恢复——残留进程清理），提交 c862b0d 已推送。mongodb/usage 5 篇成对（聚合/分页/TTL/读偏好/事务）。

### 第 107 轮（2026-09-08，第三十九次启动）：语义缓存（ai/intermediate/llm 第 13 篇）——grep 语义缓存/semantic cache 零覆盖；向量相似当缓存键、与提示缓存的层次区别、阈值两难、不可缓存场景。提交 6488aec 已推送。**提交后验证发现 ai.json 被 JSON.stringify 重排格式（+740 行 diff）——节点/边内容等价验证通过，虚惊排除**。

### 第 108 轮（2026-09-08，第三十九次启动）：Change Streams（mongodb/usage 第 6 篇）——oplog 结构化订阅、resume token 断点续听、与外部 CDC 选型对比。五连验证全绿，提交 f9f78ba 已推送。mongodb/usage 6 篇成对（聚合/分页/TTL/读偏好/事务/变更监听）。

### 第 109 轮（2026-09-08，第三十九次启动，内容补充模式）：Schema 设计模式（mongodb/usage 第 7 篇）——子集模式/扩展引用/桶模式/Outlier 兜底，Mongo 建模进阶套路；grep 确认零覆盖。五连验证全绿，提交 82ba210 已推送。mongodb/usage 7 篇（聚合/分页/TTL/读偏好/事务/变更监听/Schema 模式）。

### 第 110 轮（2026-09-08，第四十次启动，内容补充模式）：索引进阶（mongodb/usage 第 8 篇）——部分索引省空间写放大、稀疏与部分的关系（部分是超集）、通配符索引管多态文档、唯一+稀疏组合允许多 null；grep 确认零覆盖。五连验证全绿，提交 5288823 已推送。mongodb/usage 8 篇。

### 第 111 轮（2026-09-08，第四十一次启动，内容补充模式）：多键索引（mongodb/usage 第 9 篇）——数组自动多键化、一次查询一个多键与复合索引至多一数组边界、$elemMatch 同元素匹配防跨元素假匹配。五连验证全绿，提交 88a8f7d 已推送。mongodb/usage 9 篇。

### 第 112 轮（2026-09-08，第四十二次启动，内容补充模式）：备份与恢复（mongodb/usage 第 10 篇）——三种备份方式（mongodump/快照/云快照）、oplog PITR 时间点恢复（MySQL binlog PITR 同构）、备份验证纪律（RTO/RPO/3-2-1）；grep 确认零覆盖。五连验证全绿，提交 74eb7ed 已推送。mongodb/usage 10 篇成对（聚合/分页/TTL/读偏好/事务/变更监听/Schema 模式/索引×2/备份）。

### 第 113 轮（2026-09-08，第四十三次启动，内容补充模式）：安全认证与角色（mongodb/usage 第 11 篇）——默认无认证的坑、SCRAM 挑战响应、内置角色最小权限（应用只给 readWrite）、bindIp 与 TLS；grep 确认零覆盖。**过程小错即改：frontmatter title 行打错（title>），构建失败拦截后修复**。五连验证全绿，提交 5be64d5 已推送。mongodb/usage 11 篇成对。

### 第 114 轮（2026-09-08，第四十四次启动，内容补充模式）：售后退款（case-studies 第 28 篇）——售后/退款流程/退款状态机 grep 零覆盖；退款单状态机与可退余额公式、钱货券三线回退对账、退款与发货撞车 CAS。五连验证全绿，提交 8672933 已推送。case-studies 28 篇，电商正向+逆向双链闭环。

### 第 115 轮（2026-09-08，第四十五次启动，内容补充模式）：排行榜：实时排名的方案矩阵（case-studies 第 29 篇）——排行榜系统 grep 零覆盖；三方案矩阵（DB 排序/zset/预计算分桶）、同分决胜 score 编码时间戳、周期榜按 key 切分。五连验证全绿，提交 ef78e5b 已推送（本篇纯表格）。case-studies 29 篇。
- 下一轮入口：候选池——①场景题：抽奖已写/红包已写/排行榜已写——场景池见底，转方向补全；②mongodb/usage 第 11 篇候选（changeStream 已写 06，看变更流细化）；③ai 线间歇。每轮开工先同步+定界+体检基线+PATH 前缀。
- 下一轮入口：候选池——①场景题：优惠券回退细化已在退款篇覆盖，转场景题新角度；②ai 线间歇；③mongodb/usage 11 篇歇。每轮开工先同步+定界+体检基线+PATH 前缀。
- 下一轮入口：候选池——①mongodb/usage 11 篇已厚，歇；②场景题 grep 非同构；③ai 线间歇。每轮开工先同步+定界+体检基线+PATH 前缀。
- 下一轮入口：候选池——①mongodb/usage 第 11 篇候选（安全：认证与角色）或歇；②场景题 grep 非同构；③ai 线间歇。每轮开工先同步+定界+体检基线+PATH 前缀。

### 第 116 轮（2026-09-08，第四十四次启动，内容补充模式）：敏感数据（case-studies 第 30 篇）——字段加密/盲索引/脱敏 grep 零覆盖；字段加密 AES-GCM、盲索引 HMAC 等值查询、展示脱敏分级、密钥分离、范围查询弱点。提交 fdffcdb 已推送。

### 第 117 轮（2026-09-08，第四十五次启动，内容补充模式）：Node 模块系统（js/intermediate/node 第 2 篇）——CJS 运行时加载与循环引用、ESM 静态分析与活绑定、互操作三坑；过程小错：description 裸冒号 YAML 解析错误加引号修复。五连验证全绿，提交 d1c6767 已推送。

### 第 118 轮（2026-09-08，第四十三次启动，内容补充模式）：防抖与节流（js/basic/core 第 6 篇）——grep 确认防抖/节流仅闭包篇顺带无专篇；防抖「最后一次说了算」vs 节流「固定频率」、闭包保存 timer 手写实现、immediate 变体、场景选择矩阵。五连验证全绿，提交 8f725e2 已推送。js/basic/core 6 篇。

### 第 119 轮（2026-09-08，第四十四次启动，内容补充模式）：EventEmitter 发布订阅（js/intermediate/node 第 3 篇）——grep 确认 EventEmitter/洋葱模型/发布订阅零覆盖；Map 事件表手写、once 包装技巧、error 事件特殊地位、监听器泄漏。五连验证全绿，提交 184dbec 已推送。js/intermediate/node 3 篇。

### 第 120 轮（2026-09-08，第四十五次启动，内容补充模式）：Stream 流处理（js/intermediate/node 第 4 篇）——grep 确认 Stream 在 node 分类零覆盖；四种流类型、背压自动调节（pipe vs 手动 data/drain）、pipeline 错误传播、内存 O(1) vs O(文件大小) 对比。五连验证全绿，提交 53c2911 已推送。js/intermediate/node 4 篇成对（GC/模块/EventEmitter/Stream），Node 主线闭环。

### 第 121 轮（2026-09-08，第四十六次启动，内容补充模式）：中间件模型（js/intermediate/node 第 5 篇）——洋葱模型 grep 零覆盖；Express 线性回调 vs Koa 洋葱圈 await、compose 手写（递归+Promise）、响应后逻辑的能力差异、四参数错误中间件陷阱。五连验证全绿，提交 85a7624 已推送。js/intermediate/node 5 篇。

### 第 122 轮（2026-09-08，第四十七次启动，内容补充模式）：cluster 与 worker_threads（js/intermediate/node 第 6 篇）——单线程准确含义、多进程 vs 多线程对比选型、CPU 密集解法；过程小错即改：description 首引号致 YAML 解析错误，构建拦截后修复。五连验证全绿，提交 c63ca06 已推送。js/intermediate/node 6 篇。

### 第 123 轮（2026-09-08，第四十八次启动，内容补充模式）：环境变量与配置管理（js/intermediate/node 第 7 篇）——环境变量 config grep 零确认；process.env 全字符串陷阱、.env 不入库红线、配置分层（代码默认<.env<环境变量）、fail-fast 校验。五连验证全绿，提交 a1cdca3 已推送。js/intermediate/node 7 篇，Node 主线完整（GC/模块/EventEmitter/Stream/中间件/cluster/配置）。

### 第 124 轮（2026-09-08，第四十九次启动，内容补充模式）：布隆过滤器（case-studies 第 31 篇）——grep 确认布隆过滤器 3 篇顺带无原理专篇；位数组+k 哈希原理、误判率参数表、Counting/cuckoo 变体、Set 选型对照。五连验证全绿，提交 fcaca1d 已推送。case-studies 31 篇。

### 第 125 轮（2026-09-08，第四十九次启动，状态文件维护）：轮次记录去重——第 124 轮记录被重复写入两份（同内容同编号），用脚本去重并保留单份。

### 第 126 轮（2026-09-08，第四十九次启动，状态文件维护）：轮次记录编号修复——第 124/125 轮编号错乱（布隆过滤器篇同时标 124 和 125），去重后 125 轮记录补充状态同步与下一轮入口。

### 第 127 轮（2026-09-08，第五十次启动，内容补充模式）：Map/Set 与 Symbol（js/basic/core 第 7 篇）——grep 确认 Symbol/WeakMap/WeakSet/迭代器全站零覆盖；Map vs Object 选型表、Set 集合运算、WeakMap 弱引用与 GC 互链、Symbol 三大用途。五连验证全绿，提交 dc51223 已推送。js/basic/core 7 篇。

### 第 128 轮（2026-09-08，第五十次启动，内容补充模式）：错误处理（js/basic/core 第 8 篇）——Error 类型/全局捕获/未处理 rejection grep 零覆盖；Error 体系表、try/catch/finally 行为细节、全局三入口、自定义 Error 类。五连验证全绿，提交 ce15ffd 已推送。js/basic/core 8 篇。

### 第 129 轮（2026-09-08，第五十次启动，内容补充模式）：迭代器与生成器（js/basic/core 第 9 篇）——grep 确认 Symbol/WeakMap/迭代器/生成器全站零覆盖；Symbol.iterator 协议、function* 与 yield 暂停执行、惰性求值。五连验证全绿，提交 4892086 已推送。js/basic/core 9 篇。
- 下一轮入口：候选池——①js/basic/core 第 10 篇候选（this 全面解析——04 篇已有，看是否有补充空间）；②场景题 grep 找非同构；③mongodb/usage 第 11 篇候选。每轮开工先同步+定界+体检基线+PATH 前缀。

### 第 130 轮（2026-09-08，第五十一次启动，内容补充模式）：Proxy 与 Reflect（js/basic/core 第 10 篇）——Vue 3 响应式换代理由、13 种拦截陷阱、Reflect receiver、defineProperty 对比。提交 3c6be5a 已推送。js/basic/core 10 篇。

### 第 131 轮（2026-09-08，第五十一次启动）：Promise 组合器与并发控制（js/basic/core 第 11 篇）——all/allSettled/race/any 四组合器、超时控制 race 模式、手写并发限制器。提交 5f717d4 已推送（后被并行会话 reset 移除，60e4a35 重新入库）。

### 第 132 轮（2026-09-08，第五十一次启动，状态文件维护）：轮次记录重排与去重——130/131 轮补记后顺序修复。提交 3d99396 已推送。

### 第 133 轮（2026-09-08，第五十二次启动，环境恢复+内容补充）：PATH 恢复（nvm 路径显式化）+ distributed.json 冲突解决 + CDC 篇重新入库。提交 60e4a35 已推送。

### 第 134 轮（2026-09-08，第五十二次启动）：Promise 组合器篇 level 笔误修正（intermediate→basic）。提交 b8a2107 已推送。

### 第 135 轮（2026-09-08，第五十一次启动，内容补充模式）：Node 安全最佳实践（js/intermediate/node 第 8 篇）——grep 确认 Node 安全/供应链/原型污染/helmet 全站零覆盖；依赖供应链攻击、命令注入与原型污染、helmet 安全头、密钥与最小权限运行。五连验证全绿，提交 28a9cd4 已推送。js/intermediate/node 8 篇，Node 主线全闭环（GC/模块/EventEmitter/Stream/中间件/cluster/配置/安全）。
- 下一轮入口：候选池——①场景题/ai 线间歇；②linux 线歇；③建议用户将 nvm 初始化写入 shell profile 根治 PATH 问题。每轮开工先同步+定界+体检基线+PATH 前缀。

### 第 158 轮（2026-09-18，内容补充模式）：属性描述符与冻结三兄弟（js/basic/core 第 14 篇）——勘察确认属性描述符/存取器/freeze 家族在 js 方向零专篇（defineProperty 仅 proxy 对比语境、freeze 1 处顺带）。内容：数据属性四开关与存取器属性互斥（configurable 单行道）、存取器与 Vue2 响应式根基及其数组缺陷根源、枚举性对四种遍历的影响表（隐藏字段原生方案）、冻结三兄弟能力递进表（freeze 浅冻结/非严格静默失败/与 const 锁绑定正交）、Proxy 取代的现代视角。无 mermaid（表格+代码承载）。过程两则：①173 页构建卡死 15 分钟两连（astro 0% CPU 挂起），杀进程+清 node_modules/.astro 脏缓存后 2m45s 通过——卡点是缓存脏数据与并行会话进程争用，非内容问题，已沉淀处理办法；②轮 157 文中一处 .md 后缀内链被体检第 5 项拦截（并行会话已全站统一尾斜杠规范），修复后随本轮入库。构建 694 页、mermaid 522 块、一致性 8 项全绿。js/basic/core 14 篇。
- 下一轮入口：候选池——①场景题/ai/middleware 间歇勘察；②收尾 contrast 审计（158 无新图，157 有 1 图已过首轮对比度）。

### 第 157 轮（2026-09-18，内容补充模式）：rewrite、try_files 与文件解析（nginx/basic/config 第 3 篇）——勘察确认 root/alias/try_files/rewrite flag 全站零专篇（location 优先级已有 static-server 篇专节退场、事务消息有 rocketmq 架构篇承载退场、linux 19 篇已厚退场），与前端路由篇的 SPA fallback 提及互链。内容：root 拼接 vs alias 替换与末尾斜杠坑、try_files 短路查找与两种兜底（内部重定向=SPA fallback 原理 / =404 终判）、rewrite 四 flag 表与 last/break 高频追问、改写循环 10 次上限、return 与 rewrite 分工。1 张 mermaid try_files 流程图、1 张 flag 表、2 段配置。构建 693 页、mermaid 522 块、一致性 8 项全绿。过程：nginx 图谱边端点再次凭记忆猜错（nginx-static→static），体检第 9 项拦截后修正——已两次确认图谱 id 必须先查 JSON。nginx 7 篇。
- 下一轮入口：候选池——①js/basic/core 第 14 篇：属性描述符与冻结三兄弟（defineProperty 仅 proxy 对比语境提及）；②middleware/netty 续篇勘察；③收尾 contrast 审计（157 新增 1 图）。

### 第 156 轮（2026-09-18，内容补充模式）：前端错误监控与上报（js/intermediate/web 第 11 篇，web 线 11 篇收口）——勘察确认 window.onerror/unhandledrejection/Script error/sourcemap 还原全站零覆盖（与 basic 错误处理篇边界：那篇管语言机制、本篇管生产采集）。内容：四类错误来源与四个捕获入口路由图（资源错误不冒泡须捕获阶段监听、接口错误靠拦截器）、Script error. 跨域打码与 crossorigin+CORS 两件套、sourcemap 反向还原与「只进平台不上线」、上报三板斧（聚合去重/采样率/sendBeacon）与监控自我保护。1 张 mermaid 路由图、1 张入口表。构建 692 页、mermaid 521 块、一致性 8 项全绿。js/intermediate/web 11 篇。
- 下一轮入口：候选池——①web 线 11 篇体量已厚，下轮轮转其他线（middleware/netty 续篇、场景题/ai 间歇）；②收尾 contrast 审计（155/156 各新增 1 图）。

### 第 155 轮（2026-09-18，内容补充模式）：Web 性能指标与采集（js/intermediate/web 第 10 篇）——勘察确认 Core Web Vitals/PerformanceObserver/INP/CLS 全站零覆盖（LCP 命中的 3 篇均为 Java CLSID 误命中）。内容：四指标各自替用户回答的问题与阈值速记（2.5s/200ms/0.1）、LCP 候选元素与 FCP 差异、INP 取代 FID 的理由、CLS 累积分数与 hadRecentInput、PerformanceObserver+buffered 补采、sendBeacon/keepalive 卸载不丢上报、LCP 差的四步定位路径（TTFB/资源/阻塞/排队，呼应渲染管线篇）。1 张 mermaid 指标时间轴图、1 张阈值表、2 段代码。构建 691 页、mermaid 520 块、一致性 8 项全绿。js/intermediate/web 10 篇。
- 下一轮入口：候选池——①前端错误监控与上报（web 第 11 篇，window.onerror/unhandledrejection/资源错误/Sentry 视角全站零覆盖，与 basic 错误处理篇边界：那篇管语言机制、本篇管生产采集）；②收尾 contrast 审计（155 新增 1 图）。

### 第 154 轮（2026-09-18，内容补充模式）：Service Worker 与离线缓存（js/intermediate/web 第 9 篇）——勘察确认 SW 生命周期/缓存策略/Cache API 全站零专篇（仅 worker/storage 篇各一句定位提及），network http-cache 篇管协议层与本篇分层互补不重叠。内容：SW 代理线程定位与 HTTPS 强制理由、三阶段生命周期与「一个 SW 服务一个页面」的绕圈根源、skipWaiting 接管、fetch 拦截与三策略表（Cache First/Network First/Stale-While-Revalidate）、res.clone 必踩坑、SW 拦截先于 HTTP 缓存的分层关系、PWA=SW+Manifest+HTTPS 组合答法。1 张 mermaid 生命周期图、1 张策略表、1 段代码。构建 690 页、mermaid 519 块、一致性 8 项全绿。js/intermediate/web 9 篇。
- 下一轮入口：候选池——①Web 性能指标与监控（web 第 10 篇，Web Vitals/PerformanceObserver/错误捕获全站零覆盖）；②错误监控上报（可与性能指标合篇或拆篇）；③收尾 contrast 审计（154 新增 1 图）。

### 第 153 轮（2026-09-18，内容补充模式）：类型声明与 .d.ts（typescript/basic/core 第 5 篇）——勘察确认 declare/.d.ts/@types 全站零覆盖。内容：ambient 声明的「只登记不生成代码」语义、.d.ts 定位、类型三来源按序命中（包自带 types 字段→@types/DefinitelyTyped→手写 declare module）、给无类型库补声明的三要点（include 范围/空壳兜底 TODO/CSS 图片通配声明）、库作者的 types 字段即 API 发布。无 mermaid（代码承载），构建 689 页、mermaid 518 块持平、一致性 8 项全绿。typescript/basic/core 5 篇、全方向 7 篇，本次启动 TS 线 +2 收口。
- 下一轮入口：候选池——①收尾 contrast 审计（152 新增 1 图）；②场景题/ai 线间歇；③web 线第 9 篇候选（浏览器缓存策略实践？与 network http-cache 篇需勘察边界）。

### 第 152 轮（2026-09-18，内容补充模式）：请求的取消与超时（js/intermediate/web 第 8 篇）——勘察确认 AbortController/请求取消全站零专篇（仅组合器篇缺口式提及，防重复提交 2 处顺带）。内容：race 假取消 vs AbortController 真取消对比图、三件套（controller/signal/abort）与 AbortError 按 e.name 分流防误报、AbortSignal.timeout 标准件与 AbortSignal.any 多源合并、搜索联想「新请求 abort 旧请求」防重复提交标杆实现（防抖管少发、abort 管作废互补）、signal 同时管理请求与事件监听的一行卸载收尾。1 张 mermaid 对比图、4 段代码。构建 688 页、mermaid 518 块、一致性 8 项全绿。js/intermediate/web 8 篇。
- 下一轮入口：候选池——①TS .d.ts 与类型声明（basic 第 5 篇，全站零覆盖：declare/module declaration/@types 机制）；②收尾 contrast 审计（152 新增 1 图）。

### 第 151 轮（2026-09-18，内容补充模式）：模板字面量类型（typescript/intermediate/typing 第 2 篇）——勘察确认模板字面量类型全站零覆盖（限流/熔断候选均有专篇退场，ai 方向活跃不轻碰）。内容：类型层字符串拼接与联合笛卡尔积、Uppercase/Capitalize 的内置语法糖本质、infer 拆字符串（前缀匹配/对半拆/递归深度上限）、路由路径推导参数对象实战（模板+条件+映射三构件合体，框架类型安全地基）、可读性税呼应。无 mermaid（代码承载），构建 687 页、mermaid 517 块持平、一致性 8 项全绿。typescript/intermediate/typing 2 篇。
- 下一轮入口：候选池——①请求的取消与超时（js/intermediate/web 第 8 篇，AbortController 仅被组合器篇缺口式提及）；②TS .d.ts 与类型声明（basic 第 5 篇）；③收尾 contrast 审计（本轮无新图）。

### 第 150 轮（2026-09-17，内容补充模式）：枚举、字面量类型与 as const（typescript/basic/core 第 4 篇，basic 线收口）——勘察确认 enum/as const/字面量联合在 TS 方向零覆盖。内容：enum 是 TS 少数不擦除的构造（数字枚举双向映射、字符串单向、tree-shaking 不友好）、const enum 内联与 isolatedModules 兼容坑、as const 三板斧组合（typeof/keyof/索引访问推字面量联合）、三方案对比表与选型共识（as const 对象/字面量联合为主、enum 留给双向映射）。本篇无 mermaid（表格+代码承载），构建 686 页、mermaid 517 块持平、一致性 8 项全绿。typescript/basic/core 4 篇收口，全方向 6 篇。
- 下一轮入口：候选池——①场景题/ai 线间歇；②netty/TS intermediate/typing 第 2 篇（模板字面量类型）；③收尾 contrast 审计（148/149 各新增 mermaid，150 无图）。

### 第 149 轮（2026-09-17，内容补充模式）：Netty 中的 WebSocket：握手与帧（netty/intermediate/core 第 3 篇）——勘察确认 WebSocket 与 netty 集成、HttpServerCodec/HttpObjectAggregator 在 netty 内零提及（js 与 network 方向的 WebSocket 篇管协议与浏览器侧，本篇管服务端实现，边界互补）。内容：四件套 handler 链与各司一职（Aggregator 拼完整请求、升级处理器 101 换道移除 HTTP handler）、帧六类型分流表、Continuation 分片与 WebSocketFrameAggregator 重组、协议层 Ping/Pong 证连接活性 vs 应用层心跳证业务健康的两层分工（呼应心跳篇）。1 张 mermaid 换道图、1 张帧类型表、2 段代码。构建 685 页、mermaid 517 块、一致性 8 项全绿。过程：netty 图谱边端点 id 再次凭记忆猜错（netty-pipeline→实际 nt-pipeline），被一致性体检第 9 项拦截后修正——教训再次确认：图谱 id 必须先查 JSON。netty 6 篇。
- 下一轮入口：候选池——①TS basic 第 4 篇（枚举与 as const / 函数重载，收口 basic 线）；②场景题/ai 线间歇；③收尾 contrast 审计（148/149 各新增 mermaid）。

### 第 148 轮（2026-09-17，内容补充模式）：弹性伸缩与 HPA（kubernetes/intermediate/ops 第 4 篇）——勘察确认 HPA/弹性伸缩/VPA/CA 全站零覆盖（HPA 提及仅 network 篇 HTTP 语境误命中）。内容：HPA 控制器定位与调谐回路图、目标值比例算法（ceil 公式+多指标取最大，可当场推导）、Utilization 分母是 requests 的高频坑与生效前提链（requests→metrics-server→指标可查）、缩容稳定窗口 5 分钟看峰值与 behavior 步长、扩容激进缩容保守的不对称设计、HPA/VPA/CA 三层分工表与 KEDA 定位。1 张 mermaid 回路图、1 张 yaml、1 张分工表。构建 684 页、mermaid 516 块、一致性 8 项全绿。kubernetes 8 篇。
- 下一轮入口：候选池——①netty WebSocket 集成（intermediate/core 第 3 篇，0 覆盖）；②TS 线收口（basic 第 4 篇：枚举/as const 或函数重载）；③场景题或 ai 线间歇。

### 第 147 轮（2026-09-17，内容补充模式）：声明式 API 与 List-Watch 机制（kubernetes/intermediate/ops 第 3 篇）——勘察确认 List-Watch/Informer/resourceVersion 全站零覆盖，kubectl apply 旅程是 K8s 最经典深挖题；候选 mongodb advanced（实际 13 篇已含分片/副本集/运维，状态文件记载过期）、docker（9 篇满编）、k8s HPA（0 覆盖但价值中等）依次勘察后退场。内容：kubectl apply 完整旅程图（API Server 唯一写入口+组件接力）、List 全量+Watch 增量与 resourceVersion 续传/compaction、Informer 三件套（Reflector/DeltaFIFO/本地缓存）与 workqueue、边缘触发+幂等调谐设计、三连追问（etcd 挂了能跑不能改/为何围着 API Server/为何本地缓存）。1 张 mermaid 旅程图、1 张组件表。构建 683 页、mermaid 515 块、一致性 8 项全绿。kubernetes 7 篇。
- 下一轮入口：候选池——①k8s HPA/扩缩容（0 覆盖）；②netty WebSocket 集成（0 覆盖但价值中）；③middleware 第 6 篇（积压通用篇边际价值低已排除）；④收尾 contrast 审计（145/146/147 各新增 mermaid）。

### 第 146 轮（2026-09-17，内容补充模式）：类型编程入门：映射、条件与 infer（typescript/intermediate/typing 第 1 篇，新建 TS 第一个中级分类）——勘察确认映射/条件类型/infer 全站仅本方向 2 处顺带提及，零专篇。新建 intermediate/typing 分类三件套（分类页 index.mdx + 侧边栏中级组 + 图谱类型编程组）。内容：映射类型（in 遍历、T[K] 索引访问、?/-?/readonly 修饰符，手写 Partial）、条件类型与分布式条件类型（裸联合自动分发、[T] 包裹关闭、never 吸收陷阱与 IsNever 正确写法）、infer 模式匹配槽位（手写 ReturnType/Element）、三构件总结图、可读性税纪律（两层以上封装成命名工具类型）。1 张 mermaid 三构件图、2 段代码。构建 682 页、mermaid 514 块、一致性 8 项全绿。typescript 4 篇。
- 下一轮入口：候选池——①mongodb advanced 勘察（11 篇全在 basic/intermediate，advanced 层空缺：分片集群/副本集选举深挖？）；②netty/middleware 勘察；③TS 线可歇；④收尾 contrast 审计（145/146 各新增 mermaid）。

### 第 145 轮（2026-09-17，内容补充模式）：严格模式与工程配置（typescript/basic/core 第 3 篇）——勘察确认 tsconfig/strict/路径别名/类型断言逃逸全站零专篇（strict 提及 3 处均非 TS 篇）。内容：strict 开关构成图与两大主力（noImplicitAny 堵静默失效、strictNullChecks 把空值搬进编译期）、noUncheckedIndexedAccess 单独推荐、?. 与 ?? 正牌工具 vs !/as 逃逸口纪律、双重断言=建模错误味道、路径别名编译与运行两界（tsc 不重写 import 的必踩坑）、新项目全开 vs 老项目文件级渐进+CI 门禁。1 张 mermaid 开关构成图、3 段代码。构建 680 页、mermaid 513 块、一致性 8 项全绿。typescript/basic/core 3 篇。
- 下一轮入口：候选池——①TS 第 4 篇：类型编程入门（映射/条件类型/infer，勘察 3 处提及是否实质覆盖）；②netty/middleware/mongodb advanced 勘察；③收尾 contrast 审计。

### 第 144 轮（2026-09-17，内容补充模式）：interface、type 与泛型入门（typescript/basic/core 第 2 篇）——内容：两种声明的等价为主与能力边界表（interface 声明合并补第三方类型、type 独占联合/映射/条件类型）、选型口径、泛型第一性「类型参数化表达类型间关联」与实参推导、extends 形状约束与结构化类型同世界观、Partial/Record/Pick/Omit 工具类型即官方泛型教材、何时该写泛型的判据（有关联才写）。1 张 mermaid 类型推导流动图、1 张能力边界表。构建 679 页、mermaid 512 块、一致性 8 项全绿。typescript/basic/core 2 篇。
- 下一轮入口：候选池——①TS 第 3 篇：tsconfig 严格档位与工程实践（strict 全家桶、路径别名）或类型编程入门（映射/条件类型）；②netty/middleware/mongodb advanced 勘察；③收尾需 contrast 审计（142/143/144 各新增 1 块 mermaid）。

### 第 143 轮（2026-09-17，内容补充模式）：新建 TypeScript 方向 + 首篇类型系统第一性（typescript/basic/core 第 1 篇）——勘察确认 TS 全站仅 1 处顺带提及，前端面试主力线结构性缺失，按「新增方向四处同步」执行：方向首页 RoadmapIsland + basic/core 分类页 + graphs/typescript.json（顶层键核对为 nodes/edges，修正了初稿多余的 root 键）+ 侧边栏插在 JS 与 React 组之间 + notes.ts DIRECTION_ORDER 在 js 后插入 typescript。首篇内容：类型擦除与 tsc 管线（类型不进运行时、TS 不替代运行时校验两推论）、结构化类型与名义类型对比、any/unknown/never/void 四兄弟辨析表、never 穷尽检查、收窄四手法与判别字段建模、面试答法框架。1 张 mermaid 编译管线图、2 张表。构建 678 页、mermaid 511 块、一致性 8 项全绿。
- 下一轮入口：候选池——①TS 第 2 篇：interface vs type 与泛型入门；②netty/middleware 勘察；③收尾需 contrast 审计（142/143 各新增 mermaid）。

### 第 142 轮（2026-09-17，内容补充模式）：映射与分词器：term 为什么查不到 text（elasticsearch/intermediate/usage 第 5 篇）——勘察确认动态映射/_analyze 全站零覆盖，text vs keyword 仅倒排篇一张浅表，term 查 text 落空根因零覆盖；候选「refresh/flush/translog 刷盘语义」因 shard-replica 篇已有写路径深挖+四件套表退场，场景题系列经典角度（优惠券/超时取消/库存/feed 流）均已有承载篇。内容：mapping 写死难改与 reindex、text/keyword 分工表与 multi-field 子字段、term 查 text 落空根因（倒排查词项）与「term 对 keyword，match 对 text」口诀、分词器三段流水线与 _analyze 调试、中文 IK 双配置（索引 max_word/搜索 smart）、动态映射三档与 date 猜型陷阱。1 张 mermaid 流水线图、2 张表、3 段代码。构建 675 页、mermaid 510 块、一致性 8 项全绿。elasticsearch 8 篇。
- 下一轮入口：候选池——①ES usage 已 5 篇，剩 refresh 调优细节偏运维（可选 basic/core 第 3 篇？勘察后再定）；②mqtt/netty/middleware 勘察；③TS 线未开。

### 第 141 轮（2026-09-17，内容补充模式）：相关性打分与 BM25（elasticsearch/intermediate/usage 第 4 篇）——勘察确认 BM25/相关性打分在 ES 内仅 2 行顺带提及，深挖题「ES 怎么决定谁排第一」零专篇；候选 etcd 第 5 篇与 ZK/RabbitMQ 深化均因大纲覆盖扎实退场。内容：搜索是排序问题、TF-IDF 两因子与两偏差（无饱和/无长度归一）、BM25 三要素与 k1/b 参数直觉、为什么换掉 TF-IDF、filter 不算分可缓存与 must 的分工、boost/function_score/业务重排三条干预路、_explain 排查。1 张 mermaid 三因子构成图、1 段 bool 查询 JSON。构建 674 页、mermaid 509 块、一致性 8 项全绿。elasticsearch 7 篇。
- 下一轮入口：本轮收尾需 pnpm preview + contrast 审计（139/140/141 各新增 1 块 mermaid）。候选池——①ES 剩余缺口：refresh/flush/translog 刷盘语义（写路径篇有底子）、分词器专篇（覆盖 1 篇浅）；②mqtt/netty/middleware 各 4-5 篇待勘察；③TS 线未开。

### 第 140 轮（2026-09-17，内容补充模式）：Node 事件循环与浏览器差异深挖（js/intermediate/node 第 10 篇，Node 主线十篇收口）——勘察确认 timers/poll/check 相位模型全站零专篇（basic 事件循环篇仅 4 行小结并显式留「深入另见」接口，边界互认不重复）。内容：libuv 六阶段模型与 poll 枢纽、process.nextTick 特权队列 vs Promise 微任务、setImmediate vs setTimeout(0) 主模块竞态与 I/O 回调内确定序、浏览器/Node 六维对比表（逐个 vs 分组的本质差异）、unref 与进程退出生命周期。1 张 mermaid 相位循环图、2 张表。构建 673 页、mermaid 508 块、一致性 8 项全绿。过程教训：图谱边端点 id 凭记忆写 eventemitter 被体检第 9 项拦截（实际是 emitter）——图谱 id 必须先查 JSON 再引用，与 old_string 禁凭记忆教训同源。js/intermediate/node 10 篇。
- 下一轮入口：候选池——①network 方向缺 intermediate 层（HTTP 缓存已有专篇退场，可勘察 HTTP/2/3 或 Web 安全网关向）；②TS 线未开（全站仅 1 篇提及）；③场景题/ai 线间歇。

### 第 139 轮（2026-09-17，内容补充模式）：前端路由与 History API（js/intermediate/web 第 7 篇）——勘察确认 pushState/popstate/History API 全站零覆盖（hashchange 提及均为 MQ 分片路由/CORS 场景顺带，非前端路由）。内容：后端路由 vs 前端路由分野、hash 路由锚点壳与 hashchange 全自动、history 路由 pushState 不触发 popstate 的手动渲染、刷新 404 根因与服务器 fallback（Nginx try_files）、两路由选型表、框架路由=两套内核+工程化外设。1 张 mermaid 事件分工图、1 张对比表。构建 672 页、mermaid 507 块、一致性 8 项全绿。js/intermediate/web 7 篇。
- 下一轮入口：候选池——①js/intermediate/web 7 篇已相当厚，后续轮转其他方向勘察（network 的 HTTP 缓存深挖、前端安全 referrer/CSP 在 security 的覆盖勘察）；②场景题/ai 线间歇。

### 第 138 轮（2026-09-17，内容补充模式）：Web Worker 与多线程逃生门（js/intermediate/web 第 6 篇，js/intermediate/web 六篇成体系收口）——grep 确认 Web Worker 全站零覆盖。内容：单线程长任务冻结与 Worker 逃生门定位（呼应 event-loop 与 renderpipe 两篇）、三段式基本用法、结构化克隆与 Transferable 零拷贝、能力边界清单表（DOM/Web Storage 禁用，fetch/IndexedDB 可用）、50ms 判据与 SharedWorker/Service Worker 一句话划界。1 张 mermaid 双线程通信图。构建 671 页、mermaid 506 块、一致性 8 项全绿。附带修正第 137 轮存储篇 security 内链层级（01-session-attack 在 intermediate 不在 basic，体检第 5 项拦截）。js/intermediate/web 6 篇。
- 下一轮入口：本轮收尾需 pnpm preview + contrast 审计（136/137/138 各新增 mermaid，共 4 块）。后续候选池——①js/intermediate/web 已 6 篇成体系，转向其他方向勘察；②defer 深挖、前端路由 hash vs history（待勘察）；③场景题/ai 线间歇。

### 第 137 轮（2026-09-17，内容补充模式）：浏览器存储全家桶（js/intermediate/web 第 5 篇）——勘察确认 Cookie/Web Storage/IndexedDB 横向对比全站零专篇（cart/cors/session-attack 仅顺带提及，security 方向 HttpOnly/SameSite 仅 5 处轻覆盖，边界划在平台存储视角不复述 CSRF 防御）。内容：四代存储横向对比表（容量/生命周期/随请求发送/API 形态/动机）、Cookie 四属性与凭证承载、localStorage vs sessionStorage 标签页隔离与 storage 事件跨标签页通信、IndexedDB 异步事务定位与 Cache API 分工、token 存放 XSS vs CSRF 权衡选型。1 张 mermaid 选型决策图、1 张对比表、storage 事件代码示例。构建 670 页、mermaid 505 块、一致性 8 项全绿。js/intermediate/web 5 篇。
- 下一轮入口：候选池——①Web Worker 全站零覆盖（js/intermediate/web 第 6 篇，与 event-loop 篇互补讲多线程边界）；②下轮收尾跑 contrast 审计（136/137 各新增 mermaid）。

### 第 136 轮（2026-09-17，内容补充模式）：渲染管线与重绘回流（js/intermediate/web 第 4 篇）——grep 勘察确认重绘回流/合成层/布局抖动/defer 属性全站零专篇（CSSOM 仅 network 的 URL-to-page 篇概览提及）。内容：关键渲染路径五步、CSS/JS 阻塞渲染差异与 defer/async 对比表、回流>重绘>合成三档开销、transform/opacity 走合成线程原理、布局抖动读写交错与批量读再写修复、display 三兄弟渲染差异对比。2 张 mermaid（管线流程+属性路由决策）。构建 669 页、mermaid 504 块、一致性 8 项全绿。js/intermediate/web 4 篇。
- 下一轮入口：候选池——①浏览器存储专篇（Cookie/localStorage/sessionStorage/IndexedDB 全站零专篇，cart/session-attack/cors 仅顺带提及）；②Web Worker 全站零覆盖；③补记：解构篇提交 3468348 的轮次记录又被并行会话压缩丢失（6824c98 声称 136 轮连续，实际现存 135 条），本条按文件现存编号续写。
- **状态文件压缩说明（第 137 轮）**：第 130-134 轮详细记录在并行会话的多次 reset/rebase 中丢失，代码提交均在 git 历史可查（Proxy/Reflect 3c6be5a、Promise 组合器 60e4a35、Node 安全 28a9cd4 等）。不恢复旧记录——当前状态足以恢复现场。
- **状态文件压缩说明（第 135 轮）**：第 130-134 轮的详细记录被并行会话的状态文件压缩操作删除（单行摘要替代详述），内容对应的代码提交均在 git 历史中（3c6be5a/5f717d4/b8a2107/60e4a35/28a9cd4），git log 可追溯。接受并行会话的压缩行为，不恢复——旧记录的详情通过 git log -- docs/evolution.md 可查。

## 经验与判断沉淀

### 工作纪律

- 每轮开工：`git pull --ff-only` 同步 → `git status` 定界占用区 → 只提交本轮自建/自改文件；**必须 `git commit -- <pathspec>`，禁止裸 commit**（第 2 轮实际吞过并行会话已暂存内容）。
- Edit 冲突两则：①stale（文件被并行会话改）→ git status 确认 → 重读目标段 → 重新插入；②old_string 必须从最近 Read 的实际内容复制，**禁止凭记忆重打**（kafka.json 与本文件各踩过一次）。
- 图谱 JSON 多轮追加后、提交前 JSON.parse 校验；quiz 题库由并行会话维护（PR 流），演进轮次避开 quiz 数据防撞车。
- astro.config.mjs 是高冲突文件（手动侧边栏），stale 频发但按纪律可安全使用；guide/diagrams、guide/resources 为体检豁免项（元文档）。

### 选题方法

- "根基缺失"模式三连验证（kafka 三问/PG 差异地图/MongoDB 文档模型）：薄弱方向先补"是什么/为什么/怎么选"，再深挖机制。
- 判断缺口必看目标篇目 ## 大纲，篇数不可靠：ES、rocketmq 分片键、nginx 都凭大纲避免了重复写作；seata/zookeeper 篇少但覆盖深不算缺。
- 勘察先行、候选可退场：middleware 已有 MQ 选型专篇即退场，不为写而写；选题按"面试出场率 × 与现有内容互补度"。
- 定量工具：方向笔记数排序找薄弱面（java 94 篇 vs etcd 2 篇），再进大纲细察。

### 三件套与验证

- 新建分类流程模板化：复制既有分类页改四处参数（组件名勿手写，CategoryIsland 教训）→ 写笔记 → 侧边栏分组 → 图谱节点/边 → 五连验证 → pathspec 提交。
- 体检体系 10 项：`scripts/consistency-verify.mjs`（8 项固化）+ `scripts/mermaid-syntax-verify.mjs`（语法守护，针对构建静默吞错的补丁，经注入自测）+ `scripts/mermaid-contrast-verify.mjs`（双主题对比度，需 preview）。
- 无图表笔记用表格/代码块承载结论（有 mermaid 才需跑对比度审计）；时序图（sequenceDiagram）适用于协议/流程类内容。

## 待用户决策

- 阶段目标确认：本文件「当前阶段目标」为无人值守自定（内容体系充实），推荐选项：维持；备选：用户指定内容路线图或阶段（如「把 XX 方向补完」）。影响：决定后续轮次选型方向。**21 轮后补充**：常规内容缺口已收敛，若继续本阶段，后续轮次自然放缓；更推荐用户给出下一阶段（如「提高已有功能使用率」需真实用户数据、「按你的学习计划补某方向」）。
- core 星标全站策略：36 个分类核心占比过高（部分 4/4 全标，星标失去区分度），14 个零核心分类中 11 个（linux/tools/单篇）留白待定。推荐选项：维持现状（不同方向 core 语义可以不同）；备选：定一条规则（如每分类最多 2 篇核心）并由用户/会话统一执行——影响：分类页核心导航的可用性。
- guide/diagrams、guide/resources 是否需要注册进侧边栏：推荐选项：维持现状（元文档）；影响：极小。
