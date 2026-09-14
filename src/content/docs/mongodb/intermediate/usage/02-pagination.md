---
title: 分页与游标：深翻页的 Mongo 版
description: $skip/$limit 的性能悬崖、range-based 游标、$sample 与随机分页、与 MySQL/ES 的同构对照
level: intermediate
core: true
---

深翻页是所有存储的共通题：MySQL 的 LIMIT 100000,20、ES 的 from+size
（分页篇都讲过）——**MongoDB 的 $skip/$limit 是同一性能悬崖的 Mongo 版**。
解法也同构：游标（range-based）代替偏移。

## $skip/$limit 的性能悬崖

```javascript
db.orders.find().skip(100000).limit(20)   // 第 5001 页
```

- $skip 要**顺序跳过并丢弃**前 10 万条文档——跳过的越多越慢，
  与 MySQL LIMIT 偏移量完全同构；
- 每一页的成本随页码线性增长——用户翻得越深，系统越疼。

## 游标方案：where > cursor

```javascript
// 第一页
db.orders.find({ _id: { $gt: lastSeenId } }).sort({ _id: 1 }).limit(20)
// 下一页：lastSeenId = 本页最后一条的 _id
```

- 用"上一页最后一条的 _id"做**下界查询**（$gt）——每个分页请求都是
  索引 Seek（恒定成本，不随页码增长）；
- 前提：排序字段**唯一且单调**（_id/ObjectId 天然满足；自定义排序键
  需保证唯一性，否则要复合游标 `(sortKey, _id)` 双条件）；
- 代价：**不能跳页**（只能连续翻）——信息流/聊天记录场景天然合适，
  后台管理"直接跳第 100 页"场景不适用。

## $sample 与随机分页

- `aggregate([{ $sample: { size: 20 } }])`：随机抽样 N 条——随机
  推荐场景；大集合上 $sample 走存储引擎随机游标（高效），但**结果
  不保证去重跨页**；
- "随机推荐、可重复"的需求用 $sample；"随机但可翻页"要预生成随机
  序号列——按需求选。

## 高频追问速答

- **$skip 慢的根因？** 无索引可走，跳过 = 扫描并丢弃——与 MySQL 深分页
  的"扫描并丢弃"同源（MySQL 深翻页篇的三方案可平移：游标/延迟关联/
  业务限制页深）。
- **自定义排序的游标怎么做？** 复合游标：`(sortField, _id)` 双字段
  $gt 条件（sortField 相同时用 _id 决胜，保证不漏不重）——组合游标
  是通用解。
- **总条数怎么显示？** countDocuments 是计数扫描（大集合慢）——
  估算值（estimatedDocumentCount）或异步计数器（点赞篇方案）。

## 小结

- $skip/$limit = 偏移分页的 Mongo 版，性能悬崖同源；**游标（range
  查询）恒定成本**是标准解。
- 复合游标 `(sortKey, _id)` 解决自定义排序的唯一性决胜。
- 三大存储的深翻页同构：MySQL LIMIT/ES from+size/Mongo $skip——
  学一次游标思想，三处通用。
