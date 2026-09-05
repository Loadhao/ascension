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

## 一个 query 的完整执行路径（深入）

把"查询先问协调节点"落到每个分片，就明白为什么深分页贵、为什么 filter 快。

```text
客户端 POST /index/_search
  ↓
协调节点：解析请求，把扇到所有主/副本分片
  ↓
每个分片独立执行：倒排索引找词 → 打分 → 取前 size 个 → 汇总一个"局部 top-N"
  ↓
协调节点：合并各分片的 top-N，重新排序取全局 top-N → 返回
```

**得到三个关键推论：**

1. **深分页为什么贵**：`from=10000,size=20` 时，**每个分片都要先算出
   `from+size` 条局部结果再合并丢弃**——from 越大，每个分片算得越多，翻到
   最后基本等于扫一遍。所以要 `search_after`：

   ```json
   // 记住上一页最后一条的排序值，下一页从这里接着取（杜绝 from 深翻）
   GET /index/_search
   { "size": 20, "search_after": ["1670", 12345],
     "sort": [ { "@timestamp": "desc" }, { "_id": "asc" } ] }
   ```

2. **filter 快在"不参与打分 + 可缓存"**：filter 子句结果不写进 `_score`，
   可以被 **filter cache** 复用（同类过滤条件第二次起命中缓存）。所以把
   "状态、区间"等纯过滤放进 filter，查询又准又快。

3. **多分片数量影响准确性**：每个分片只返回局部 top-N，若 `size` 小于
   `分片数`，合并结果可能丢掉某些分片里排得靠前的文档。首次是大数据量
   精确分页时可临时加大 size 或用 scroll。

## 小结

- match 分词全文、term 精确值；别拿 term 查 text 字段。
- bool 用 filter 装纯过滤条件（不打分 + 缓存），must 留给需要打分的。
- 深页用 search_after/scroll，别用大 from/size。