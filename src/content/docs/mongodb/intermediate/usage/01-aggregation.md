---
title: 聚合管道：从 $match 到 $lookup
description: 管道阶段顺序决定性能、$match/$group/$lookup 核心三件、索引与聚合的配合、何时该让 ES 接手
level: intermediate
core: true
---

MongoDB 的聚合管道（aggregation pipeline）是它区别于"简单 KV"的核心
能力：文档流经一系列阶段（$match → $group → $sort……），逐级变换。
面试考三件事：**核心阶段怎么用、管道顺序为什么影响性能、什么时候该
换搜索引擎**。

## 管道心智：文档流水线

```mermaid
flowchart LR
    C["全集合文档"] --> M["$match<br/>过滤（越早越好）"]
    M --> G["$group<br/>按 key 分组聚合"]
    G --> P["$project<br/>裁剪字段"]
    P --> SO["$sort<br/>排序"]
    SO --> L["$limit<br/>截断"]
    class M hl
    classDef hl stroke-width:1.5px
```

- 核心三件：**$match**（过滤，对应 SQL WHERE）、**$group**（分组聚合，
  对应 GROUP BY，配 $sum/$avg/$push）、**$lookup**（左连接其他集合，
  对应 JOIN——代价高，能内嵌就内嵌）；
- **管道顺序直接决定性能**：$match/$limit 放最前（尽早减少流入文档
  数量），$group/$sort 的数据量小了，后面阶段都快——与 Unix 管道
  （文本三剑客篇）同一哲学。

## $lookup：MongoDB 的 JOIN（及其代价）

```javascript
{ $lookup: {
    from: "users",
    localField: "userId",
    foreignField: "_id",
    as: "user"
} }
```

- 每条文档触发一次对 users 的查询（被驱动字段**必须有索引**，否则
  灾难）；
- **高频追问：频繁 $lookup 说明建模错了**——文档模型的优势是内嵌，
  频繁跨集合关联应该重新考虑内嵌或改用关系库（文档模型篇的建模
  决策）。

## 索引与聚合的配合

- $match 能走索引（与普通查询同规则）；$sort + $match 的组合若
  有对应复合索引可整段下推（避免内存排序）；
- **聚合内存限制 100MB**：$group/$sort 超限直接报错——加
  `allowDiskUse: true` 落盘（慢）或优化上游减少数据量；
- explain 查看管道各阶段是否走索引（性能篇的 explain 方法通用）。

## 何时该让 ES 接手

复杂全文检索、多维分析（大量维度交叉聚合）、全文相关性排序——
这些是搜索引擎的主场：数据同步给 ES（CDC 篇），MongoDB 保留
事务与主数据。**用对工具比硬拧管道重要**（落地选型篇的思想）。

## 高频追问速答

- **$group 为什么慢？** 内存聚合 + 可能落盘——减少分组前数据量
  （前置 $match）、group key 走索引排序避免内存 hash。
- **聚合能分页吗？** $skip/$limit 可以但深翻页慢——与 ES/MySQL
  同构的深分页问题（游标方案）。
- **$lookup 和内嵌怎么选？** 一起读的内嵌（点赞列表）、独立演进的
  引用（评论者资料缓存到文档里）——文档模型篇的判断框架。

## 小结

- 管道 = 文档流水线：$match 尽早、$group 配内存预算（100MB）、
  $lookup 必须索引且频繁使用是建模警报。
- 复杂全文检索与多维分析交给 ES，MongoDB 守住事务与主数据——
  CDC 同步衔接两者。
