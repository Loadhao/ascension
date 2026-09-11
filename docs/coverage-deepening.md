# 题库与速答深化状态

> 「题库与速答深化产出」定时任务（每 2 小时）的断点续跑文件。铁律：每轮必产出并提交推送，禁止空转；每轮从队列头部取条目执行，收尾追加 2~4 条新条目。

## 深化队列

### a 类：核心笔记第二题（core:true 且仅单一考点角度，全站约 200 篇候选，按方向分批入队）

- [ ] kafka/basic/core/01-why-mq — 第二题考「MQ 的代价清单与 At Least Once + 幂等的默认组合拳」
- [ ] js/intermediate/node/01-node-gc-memory — 第二题考「heapUsed 只是 V8 堆：RSS 涨而堆不涨先怀疑 Buffer 等堆外」
- [ ] js/basic/modules/01-modules-import — 第二题考「import 是运行时执行且 sys.modules 缓存只跑一次」
- [ ] elasticsearch/intermediate/usage/03-pagination — 第二题考「search_after 与 scroll 的适用边界：实时翻页 vs 导出」

### b 类：旧题返修

- [ ] 抽查 hint 质量：hint 复述答案、干扰项不成立的就地返修（每条记录原因）
- [ ] 全库题型配比盘点：multiple 占比偏低的方向优先补多选

### c 类：速答打磨

- [ ] 通读「系统设计」小节，检查一句话是否都先结论、有无含糊表述

### d 类：新知补充

- （暂无；发现值得覆盖但无笔记的知识点时在此入队，先补笔记再收录）

## 已完成记录

- 2026-09-09 · 首轮：38 道旧题补 difficulty（2~5 按概念/原理/边界/生产权衡定级）+ 3 道核心笔记第二题（py-freethread-031 / pg-index-002 / docker-pid1-003）+ 状态文件初始化（本轮提交主题：feat: 题库深化首轮）

- 2026-09-09 · 第二轮：3 道核心笔记第二题（docker-latest-005 / py-mutparam-032 / java-metaspace-096，difficulty 3/3/4）· 本轮提交主题：feat: 题库深化第二轮

- 2026-09-09 · 第三轮：3 道核心笔记第二题（kafka-storage-012 / redis-watchdog-008 / java-classidentity-097，difficulty 3/4/4）· 本轮提交主题：feat: 题库深化第三轮

- 2026-09-09 · 第四轮：3 道核心笔记第二题（mysql-idxfail-005 / net-finwait-004 / es-writepath-007，difficulty 4/3/4；es 条目原定角度与 es-shard-002 撞车，就地换写路径四动作）· 本轮提交主题：feat: 题库深化第四轮

- 2026-09-09 · 第五轮：3 道核心笔记第二题（dist-flashrefund-035 / mongo-oplog-004 / java-adviceorder-098，difficulty 4/4/3）· 本轮提交主题：feat: 题库深化第五轮

- 2026-09-09 · 第六轮：3 道核心笔记第二题（redis-sds-009 / dist-term-036 / java-refqueue-099，difficulty 3/4/4）· 本轮提交主题：feat: 题库深化第六轮

- 2026-09-09 · 第七轮：3 道核心笔记第二题（linux-diskfull-007 / js-await-010 / java-treeify-100，difficulty 4/4/3）· 本轮提交主题：feat: 题库深化第七轮

- 2026-09-09 · 第八轮：3 道核心笔记第二题（nginx-location-004 / docker-voltrap-006 / java-fakedead-101，difficulty 3/4/4；docker 条目原定角度与 docker-vol-005 撞车，换行为细节与坑）· 本轮提交主题：feat: 题库深化第八轮

- 2026-09-09 · 第九轮：3 道核心笔记第二题（pg-rejoin-003 / seata-hotrow-003 / java-inline-102，difficulty 4/4/3）· 本轮提交主题：feat: 题库深化第九轮

- 2026-09-09 · 第十轮：3 道核心笔记第二题（mysql-rcrr-006 / tools-sedtrap-007 / java-zcp3gen-103，difficulty 4/4/4；tools 条目原定角度与 tools-gsa-001 撞车，换陷阱与安全姿势）· 本轮提交主题：feat: 题库深化第十轮

- 2026-09-09 · 第十一轮：3 道核心笔记第二题（rmq-silentdrop-005 / mq-cost-004 / net-dnsttl-006，difficulty 4/3/3）· 本轮提交主题：feat: 题库深化第十一轮

- 2026-09-09 · 第十二轮：3 道核心笔记第二题（java-casadder-104 / java-poolargs-105 / rabbit-confirmtack-006，difficulty 4/3/3）· 本轮提交主题：feat: 题库深化第十二轮

- 2026-09-09 · 第十三轮：3 道核心笔记第二题（js-tdz-011 / js-preflight-012 / git-ourstheirs-005，difficulty 3/3/4；git 条目原定角度与 git-remote-004 撞车，换 ours/theirs 语境反转）· 本轮提交主题：feat: 题库深化第十三轮

- 2026-09-09 · 第十四轮：3 道核心笔记第二题（java-framedec-104 / java-tricolor-105 / docker-stuckrun-007，difficulty 4/5/4；docker 与 GC 两条原定角度均与现有题撞车，分别换「起不来排查」与「三色标记修正流派」）· 本轮提交主题：feat: 题库深化第十四轮

- 2026-09-09 · 第十五轮：3 道核心笔记第二题（seata-roles-004 / java-dcl-106 / js-new-013，difficulty 3/4/3）；message-reliability 条目因并行会话新增 mq-reliability-004 覆盖同角度而弃置 · 本轮提交主题：feat: 题库深化第十五轮

- 2026-09-09 · 第十六轮：3 道核心笔记第二题（java-biocost-107 / linux-strictmode-008 / net-osimodel-007，difficulty 3/3/3）；剔除演进任务回填的 js prototype 重复条目（js-new-013 上轮已完成）· 本轮提交主题：feat: 题库深化第十六轮

- 2026-09-10 · 第十七轮：a 类 1 题（net-redirect-013，difficulty 3；net-http-009 已覆盖 502/504 故聚焦 3xx/304）+ b 类自查发现并修复上轮 3 题 hint/difficulty 字段错位（校验脚本已补类型检查）· 本轮提交主题：feat: 题库深化第十七轮

- 2026-09-10 · 第十八轮：3 道核心笔记第二题（mysql-updatewal-007 / java-threecache-111 / java-markword-112，difficulty 4/4/4；出题脚本新增 hint/difficulty 参数顺序自动纠正；三条原定角度均与并行会话新题不同程度撞车，分别换「WAL 更新时序」「为何必须三级」「Mark Word 位级分配」）· 本轮提交主题：feat: 题库深化第十八轮

- 2026-09-10 · 第十九轮：3 道核心笔记第二题（docker-multistage-008 / java-embedtomcat-113 / java-metasize-114，difficulty 3/3/4；etcd 条目弃置——笔记已被 3 题覆盖无独立角度；tomcat 条目原定「连接器演进」事实在 io-model 篇，换考嵌入式容器取舍）· 本轮提交主题：feat: 题库深化第十九轮

- 2026-09-10 · 第二十轮：3 道核心笔记第二题（rabbit-headblock-007 / net-connid-014 / java-propagation-115，difficulty 4/3/4；http-evolution 与 transaction 两条原定角度与并行新题撞车换角；剔除 jvm/07-tuning 回填残留——java-metasize-114 上轮已完成）· 本轮提交主题：feat: 题库深化第二十轮

- 2026-09-10 · 第二十一轮：3 道核心笔记第二题（redis-slowcmd-010 / java-stringpool-115 / docker-layertrap-013，difficulty 4/3/4；thread-model 条目原定角度与并行新题 redis-thread-005 撞车，换考单线程三瓶颈）· 本轮提交主题：feat: 题库深化第二十一轮

- 2026-09-10 · 第二十二轮：3 道核心笔记第二题（kafka-pidboundary-013 / java-ctxloader-115 / net-boundary-015，difficulty 4/4/3；tcp-vs-udp 条目原定角度与 net-udp-004 答案重合，换考边界维度）· 本轮提交主题：feat: 题库深化第二十二轮

- 2026-09-10 · 第二十三轮：3 道核心笔记第二题（mysql-2nf-014 / java-g1knob-118 / net-urldebug-016，difficulty 3/4/3；normal-forms 条目原定角度与 mysql-nf-007 完全撞车，换考 2NF 部分依赖判定与键层级）· 本轮提交主题：feat: 题库深化第二十三轮

- 2026-09-10 · 第二十四轮：3 道核心笔记第二题（java-cfall-119 / js-arrowbind-013 / docker-downvol-013，difficulty 4/3/3；compose 条目原定角度与 docker-compose-007 完全撞车，换考卷与项目生命周期）· 本轮提交主题：feat: 题库深化第二十四轮

- 2026-09-10 · 第二十五轮：3 道核心笔记第二题（java-contended-119 / java-arrgrow-120 / js-implicit-014，difficulty 4/3/3；longadder 条目原定角度与 java-longadder-019 完全撞车，换考伪共享填充与扩容上限）· 本轮提交主题：feat: 题库深化第二十五轮

## 经验与规则

- core: true 共 234 篇：`grep -rl "^core: true" src/content/docs`；难度定级锚点——1~2 概念识别、3 原理理解、4 边界/易错点、5 生产权衡/深挖。
- 新题红线：考点必须与该笔记现有题不同（入队时写明差异角度）；judge 固定 ["正确","错误"]；字段沿用所在文件格式；新题一律带 difficulty。
- 校验脚本必须检查字段类型（hint 为 str、difficulty 为 1~5 整数），仅检查字段存在会漏掉参数顺序错位（第十六轮事故）。
- 追加题库时匹配原文件的 JSON 格式风格（紧凑数组 vs 缩进数组）：交替重排会让每次写入产生整文件 diff，淹没真实变更、干扰暂存核对。
- 出题 helper 内置 hint/difficulty 参数顺序自动纠正——写题时按「答案、难度、提示」的自然顺序传参也不会再产生字段错位。
- 已完成记录不内嵌自身提交 hash（自指问题），以「本轮提交主题」字段配合 git log --grep 反查。
- 与并行会话（cursor/自主演进）撞车时：内容并集去重合并，绝不覆盖对方改动；只暂存本轮自己改的文件。
- 事故记录（第十六轮提交 097a205）：演进任务的 cron 在本轮构建窗口内编辑了共享题库文件，git add 时将其已写完但未提交的 7 道题（java-dubboarch-108/dubbfail-109、linux-ctx-008/virt-009/epoll-010、net-http-009/finwait-010）一并扫入提交。已核验全部完整有效、build 通过，保留不回退；教训：add 前必须在同一命令里重新 git status 并 diff --cached 核对暂存内容，发现他人改动立即中止并改用 git add -p 或stash 分离。
