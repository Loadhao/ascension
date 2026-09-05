---
title: 深翻页方案与查询性能优化
description: from+size 的 10000 之墙——scroll 快照、search_after 游标、filter 上下文与 fetch 阶段瘦身
level: intermediate
core: true
---

## 先想清楚：深翻页为什么慢

ES 检索分两个阶段：**query 阶段**各分片只筛出 doc_id 汇总，
**fetch 阶段**协调节点全局排序后取回完整文档。问题出在
`from + size`：协调节点要向**每个分片**要 `from + size` 条排序结果，
汇总排序后再丢掉前 `from` 条——翻到第 99000 页时，每个分片都白白
取回并传输了 9 万多条。这正是 `max_result_window` 默认卡在
**10000** 的原因。

## 四种翻页方案

| 方案 | 性能 | 优点 | 缺点 | 场景 |
|---|---|---|---|---|
| `from` + `size` | 低 | 简单、**可跳页** | 深翻页耗时线性恶化 | 小数据量、后台管理页 |
| `scroll` | 中 | 解决深翻页；可排序 | 维护 scrollId 快照，不反映实时变化；不能跳页 | 一次性全量导出 |
| `scroll` + `scan` | 中 | 比 scroll 更快 | 不支持排序 | 不关心顺序的全量拉取 |
| `search_after` | **高** | 无状态、实时、无深翻页问题 | 需**全局唯一排序字段**；只能连续翻页 | 线上列表无限下拉 |

### scroll：把 doc_id 存进 search context

首次查询生成 `scrollId`——ES 在 query 阶段把命中的 **doc_id 集合
缓存**进 search context（注意缓存的只是 id，不是文档本体，文档仍在
fetch 阶段取）。后续每批只需凭 scrollId 定位游标、抓取 size 条：

```json
POST /_search/scroll
{
  "scroll": "1m",                                  // context 有效期，每次请求续期
  "scroll_id": "DXF1ZXJ5QW5kRmV0Y2gBAAAAAAAAA5AW..."
}
```

代价：scrollId 是**历史快照**，期间写入/删除不会反映在结果里；
排序请求的 context 占用大量堆内存——所以它适合离线导出，不适合
做用户交互查询。

### search_after：用 sort 值当游标

ES 5 引入，思路类似 MySQL 的"书签记录"：每页返回带 sort 值数组，
下一页把它作为 `search_after` 入参，ES 直接从该位置向后取——没有
快照、没有 context、天然反映实时变更：

```json
GET /orders/_search
{
  "size": 10,
  "sort": [{ "created_at": "desc" }, { "_id": "asc" }],   // _id 兜底保证全局唯一
  "search_after": [1725148800000, "order_10086"]            // 上一页最后一条的 sort 值
}
```

约束：排序键必须**全局唯一**（通常加 `_id` 次级排序），且只能
"下一页"，不能跳页。

### 实测对比

| 翻页方式 | 第 1 页 | 49000 页 | 99000 页 |
|---|---|---|---|
| from + size | 8ms | 30ms | **117ms** |
| scroll | 7ms | 66ms | 36ms |
| search_after | 5ms | **8ms** | **7ms** |

from+size 随页深线性劣化，search_after 全程近乎恒定。

## 查询性能优化清单

翻页之外，日常查询优化按收益排序：

1. **filter 上下文代替 query 上下文**：query 回答"匹配到什么程度"
   （算 `_score`），filter 只回答"是/否"——不算分且**结果可缓存**。
   时间范围、状态、精确匹配这类不参与打分的条件全部塞进 filter；
   纯过滤/聚合字段在 mapping 里顺手关掉 `norms: false`；
2. **减少返回字段**：fetch 阶段才是大头——1000W 底池查 10W 条，
   返回 20 个字段约 8s，砍到 5 个字段约 2s（query 阶段均约 500ms）。
   用 `_source` 只取必要字段，列表页别 `SELECT *`；
3. **让 filesystem cache 装下索引**：ES 查询快的前提是数据在
   操作系统文件缓存里；装不下就会退化成磁盘查询。数据量远超内存时
   考虑 ES + HBase 架构——ES 只存检索必要字段，详情回查 HBase；
4. **日期用 date 类型别用字符串**：字符串 range 要对范围内每个
   term 逐一比较，数字/日期的范围计算高效得多；
5. **拆分索引**：按时间或数据源拆（配合索引别名），缩小搜索范围；
   字段拉平减少嵌套层级；少用通配符模糊匹配；
6. **写入侧调优**：`refresh_interval` 从 1s 调大到 30s（近实时要求
   不高时）；translog `flush_threshold_size` 从 512MB 调大；大批量
   导入时先 `number_of_replicas: 0`，导完恢复。

## 顺带一提：MySQL 深翻页是同构问题

`LIMIT 3000000, 1` 的病因一样——扫描并丢弃大量行。对应三味药：
**子查询先取主键**、**延迟关联**（先查 id 再 JOIN 回表）、
**书签记录**（记住上次位置，等价于 search_after）。核心思想都是
"少扫描、少回表、别 OFFSET"。

## 小结

- 深翻页慢在"每个分片都取 from+size 条再丢弃"；10000 是
  max_result_window 的默认红线。
- scroll 用快照换全量导出性能；search_after 用唯一排序键换无状态
  实时翻页——线上下拉列表首选。
- 查询优化先抓 fetch 阶段（减字段）与 filter 缓存，再谈写入侧
  refresh/flush/replica。
- ES 与 MySQL 的深翻页是同构问题，解法都是"游标替代 OFFSET"。

## 延伸阅读

- [ES翻页优化和性能优化——变速风声，掘金](https://juejin.cn/post/7103848212154286087)——本篇母本，含实测数据与 MySQL/CK 对照
- [Elasticsearch 官方 · Paginate search results](https://www.elastic.co/guide/en/elasticsearch/reference/current/paginate-search-results.html)（PIT + search_after 的现代推荐用法）
- [ES查询性能调优实践：亿级数据毫秒级返回（腾讯云）](https://cloud.tencent.com/developer/article/1427848)
