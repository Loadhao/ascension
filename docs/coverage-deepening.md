# 题库与速答深化状态

> 「题库与速答深化产出」定时任务（每 2 小时）的断点续跑文件。铁律：每轮必产出并提交推送，禁止空转；每轮从队列头部取条目执行，收尾追加 2~4 条新条目。

## 深化队列

### a 类：核心笔记第二题（core:true 且仅单一考点角度，全站约 200 篇候选，按方向分批入队）

- [ ] distributed/intermediate/case-studies/01-flash-sale — 第二题考「预扣不支付：下单消息带过期时间，超时关单 + 回补库存（延迟消息）」
- [ ] mongodb/intermediate/replication/01-replication-set — 第二题考「oplog 是固定大小环形缓冲，Secondary 落后超窗口被套圈只能重新 initial-sync」
- [ ] java/intermediate/spring/02-aop — 第二题考「通知执行顺序：@Around 前半 → @Before → 目标 → @AfterReturning/@AfterThrowing → @After → @Around 后半」
- [ ] redis/basic/core/01-data-structures — 第二题考「SDS 三改造：len 字段 O(1) 取长 / 二进制安全 / 空间预分配+惰性释放」
- [ ] distributed/intermediate/consensus/01-paxos-raft — 第二题考「term 单调递增是逻辑时钟 + 随机选举超时 150~300ms 错开起跑线」

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

## 经验与规则

- core: true 共 234 篇：`grep -rl "^core: true" src/content/docs`；难度定级锚点——1~2 概念识别、3 原理理解、4 边界/易错点、5 生产权衡/深挖。
- 新题红线：考点必须与该笔记现有题不同（入队时写明差异角度）；judge 固定 ["正确","错误"]；字段沿用所在文件格式；新题一律带 difficulty。
- 已完成记录不内嵌自身提交 hash（自指问题），以「本轮提交主题」字段配合 git log --grep 反查。
- 与并行会话（cursor/自主演进）撞车时：内容并集去重合并，绝不覆盖对方改动；只暂存本轮自己改的文件。
