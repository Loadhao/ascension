---
title: 聚合分析：度量、桶与管道
description: 三大聚合类型、terms 桶做分组、date_histogram 按时间统计、聚合与查询的关系
level: intermediate
core: true
---

## 聚合 = 对"查询命中的文档"做统计

聚合在查询结果之上做分析，不改变返回的文档，而是附加 `aggregations` 结果。
三大家族各管一摊：

| 类型 | 干什么 | 例子 |
|---|---|---|
| **度量（Metric）** | 单值数值计算 | `avg`、`sum`、`min/max`、`cardinality` |
| **桶（Bucket）** | 把文档**分组** | `terms`、`date_histogram`、`range` |
| **管道（Pipeline）** | 对**聚合结果**再算 | `bucket_script`、`average_bucket` |

```json
{
  "aggs": {
    "by_status": {
      "terms": { "field": "status.keyword", "size": 10 },   // 桶：按状态分组
      "aggs": {
        "avg_price": { "avg": { "field": "price" } }         // 子聚合：每组均价
      }
    }
  }
}
```

## 三个高频聚合

**按类目统计**（terms 桶）：
```json
{ "aggs": { "by_cat": { "terms": { "field": "category.keyword" } } } }
```

**按时间分桶**（date_histogram，做时间趋势/埋点统计最常用）：
```json
{ "aggs": { "per_day": { "date_histogram": { "field": "@timestamp", "calendar_interval": "day" } } } }
```

**去重计数**（cardinality，统计独立用户/UV）：
```json
{ "aggs": { "uv": { "cardinality": { "field": "user_id" } } } }
```

## 聚合的关键前提：字段要 keyword

`terms` 桶对**`keyword` / text 的 `.keyword` 子字段**生效（精确值分组）；
对 `text` 原始字段做 terms 会得到"分词后的词项"而不是整值——先确认映射。
这也是把聚合逻辑建在对的字段上最省心的经验：**聚合字段一律 keyword**。

## 核心规律

- 聚合**建立在查询之上**：查询命中哪些文档，聚合就统计哪些（可加 `size:0`
  只要聚合结果不要列表）。
- 拿多个维度切分 → 用**嵌套桶**（桶里套桶）。
- 性能：大基数 terms 记得给 `size`；时间粗粒度比细粒度省资源。

## 小结

- 度量=算值、桶=分组、管道=对聚合结果再算。
- date_histogram 做时间统计、terms 做分组、cardinality 做 UV。
- 聚合字段用 keyword，聚合在查询结果之上做，子聚合实现多维度切分。