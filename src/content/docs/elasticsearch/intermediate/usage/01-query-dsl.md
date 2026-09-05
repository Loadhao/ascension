---
title: Query DSL：match、term 与 bool
description: 查询骨架、全文与精确的取舍、bool 组合、filter 与分页游标
level: intermediate
core: true
---

## 查询骨架

一个查询是 `query`（打分过滤哪个文档）+ 可选 `aggregations`（聚合）+ `sort`。

```json
{
  "query": { "bool": { "must": [ ... ], "filter": [ ... ] } },
  "size": 10
}
```

## match 与 term：两种气质

| 关键字 | 行为 | 场景 |
|---|---|---|
| **match** | 对 `text` 字段**分词后**做全文相关度匹配 | 模糊搜索、搜索框 |
| **term** | 对字段做**精确值**匹配（不分词） | keyword/枚举/numeric 精确过滤 |

**经典误区**：拿 `term` 去查 `text` 字段——text 已被分词成多个词项，而 term
要求"整个字段值等于某词项"，几乎匹配不上。想要"包含某词"得用 `match`；
想要"精确等于某个值"才用 `term` 且字段得是 `keyword`。

## bool：组合各种子句

| 子句 | 语义 |
|---|---|
| `must` | 必须匹配且**参与相关度打分**（AND） |
| `must_not` | 必须不匹配，不进打分（NOT） |
| `should` | 至少满足其一（OR），提升相关度 |
| `filter` | 必须匹配但**不参与打分**，可走缓存（更快） |

```json
{
  "query": {
    "bool": {
      "must":    { "match": { "title": "Elasticsearch" } },
      "filter":  [ { "term": { "status": "published" } },
                   { "range": { "price": { "gte": 10 } } } ],
      "must_not": { "term": { "archived": true } }
    }
  }
}
```

**filter 常被忽略的收益**：纯过滤条件（状态、类目、价格区间）放进 `filter`
不参与打分还走缓存，性能与准确性都更好，别一锅端进 `must`。

## 分页与深页：from/size 与游标

- 小页 `from/size` 够用；但 **from 越大越慢**（ES 要把之前的分片结果都算一遍）。
- 大数据量**滚动/游标**用 `search_after`（结合排序字段）翻页，稳定不贵。
- 做"导出全部"用 **Scroll** API 维持游标上下文。

## 小结

- match 分词全文、term 精确值；别拿 term 查 text 字段。
- bool 用 filter 装纯过滤条件（不打分 + 缓存），must 留给需要打分的。
- 深页用 search_after/scroll，别用大 from/size。