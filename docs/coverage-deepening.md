# 题库与速答深化状态

> 「题库与速答深化产出」定时任务（每 2 小时）的断点续跑文件。铁律：每轮必产出并提交推送，禁止空转；每轮从队列头部取条目执行，收尾追加 2~4 条新条目。

## 深化队列

### a 类：核心笔记第二题（core:true 且仅单一考点角度，全站约 200 篇候选，按方向分批入队）

- [ ] js/basic/core/03-prototype-class — 第二题考「new 的四件事：建空对象链到 prototype、绑 this 执行、显式返回对象时覆盖、instanceof 沿链查找」
- [ ] network/basic/foundation/01-osi-tcpip — 第二题考「OSI 七层与 TCP/IP 四层的对应关系与分层意义」
- [ ] java/basic/io/01-io-model — 第二题考「BIO 一连接一线程的内存账：1000 连接 ≈ 1000 线程 × 1MB 栈；Reactor 三形态」
- [ ] linux/intermediate/system/01-shell-script — 第二题考「set -euo pipefail 三开关各自防什么」
- [ ] network/basic/http/01-http-basics — 第二题考「常见状态码分类：301/302 与缓存语义、502/504 网关差异」

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

## 经验与规则

- core: true 共 234 篇：`grep -rl "^core: true" src/content/docs`；难度定级锚点——1~2 概念识别、3 原理理解、4 边界/易错点、5 生产权衡/深挖。
- 新题红线：考点必须与该笔记现有题不同（入队时写明差异角度）；judge 固定 ["正确","错误"]；字段沿用所在文件格式；新题一律带 difficulty。
- 已完成记录不内嵌自身提交 hash（自指问题），以「本轮提交主题」字段配合 git log --grep 反查。
- 与并行会话（cursor/自主演进）撞车时：内容并集去重合并，绝不覆盖对方改动；只暂存本轮自己改的文件。
