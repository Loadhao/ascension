---
title: 映射与分词器：term 为什么查不到 text
description: mapping 是不可随意改的 Schema、text 与 keyword 的分工与 multi-field、term 查 text 落空的根因、分词器三段流水线与 _analyze 调试、动态映射的三种档位
level: intermediate
---

ES 面试里出现率最高的一句「搜不到」是：**`term` 查 `text` 字段什么都
查不出来**。根因在映射与分词——字段类型决定「存什么词项」，查询类型决定
「拿什么去比」，两边对不上就空手而归。这篇把 mapping、text/keyword、
分词器三件事串成一条线。

## mapping：ES 的 Schema，写死就难改

mapping 声明每个字段的类型、是否分词、是否索引——它就是文档的表结构。
和 MySQL 最大的体验差异是：**ES 支持动态映射**，文档进来没建索引也能
自动猜类型建 mapping；但代价是「猜错就难受」——除了给字段加新字段，
**已有字段的类型不能改**，要改只能新建索引 + `_reindex` 迁移。生产
约定俗成的做法是索引模板/显式 mapping 先行，不让 ES 猜。

## text 与 keyword：一个管搜，一个管排

| | `text` | `keyword` |
| --- | --- | --- |
| 入库处理 | 分词成词项 | 原样整串 |
| 查询方式 | `match`（对词项算分） | `term`（整串精确比） |
| 聚合/排序/分组 | ❌ | ✅ |
| 典型内容 | 标题、正文、描述 | 状态码、标签、手机号 |

一句话分工：**text 服务「搜得准」，keyword 服务「排得对、聚得快」**。
状态、标签这类离散枚举字段用 text 是纯粹的错——分词后的枚举值既没法
精确聚合也浪费空间。

一个字段往往两个都要——用 **multi-field** 子字段：

```json
"title": {
  "type": "text",
  "fields": {
    "raw": { "type": "keyword" }
  }
}
```

搜索用 `title`（分词算分），按标题精确分组/排序用 `title.raw`。
[聚合分析](/elasticsearch/intermediate/usage/02-aggregation/)篇说
「聚合字段要 keyword」，指的就是这类子字段。

## term 查 text 为什么落空

关键认知：**倒排索引里存的从来不是原文，是分词后的词项（term）**。

```js
// 文档存入："title": "Hello World 分布式"
// text 字段分词后，倒排里是这些词项：
//   [hello] [world] [分布式]      ← 原文已被拆掉

// term 查询拿整个字符串直接比词项：
{ "term": { "title": "Hello World 分布式" } }  // miss：没有这个词项
{ "match": { "title": "Hello World 分布式" } } // hit：match 先分词再查
{ "term": { "title": "hello" } }               // hit：词项存在（已转小写）
```

`term` 不分词，拿查询串当词项去比；`match` 先用字段的分析器把查询串
分词、再逐词项算分。所以口诀是：**term 对 keyword，match 对 text**。
绕不过去的场景（term 查 text 前缀的一部分）说明字段类型选错了。

## 分词器：三段流水线

分词器（analyzer）是三段流水线：

```mermaid
flowchart LR
    A["原始文本"] --> B["字符过滤器<br/>去 HTML / 替换映射"]
    B --> C["分词器 Tokenizer<br/>按规则切成词"]
    C --> D["词项过滤器<br/>转小写 / 去停用词 / 词干化"]
    D --> E["词项流 → 倒排索引"]
```

英文标准分词器按空格标点切词即可，中文是真正的分词难题——「研究生命
起源」切成什么全看分词器。中文选型一句话：`standard` 会把中文切成
**单字**（能搜但效果差），生产用 IK 插件的 `ik_max_word`（索引时切到
最细）配 `ik_smart`（搜索时粗切），索引细切保证召回、搜索粗切保证
不拆坏查询词。

调试分词器的专用入口是 `_analyze` API——它直接告诉你文本被切成了哪些
词项：

```json
POST /my-index/_analyze
{ "analyzer": "ik_max_word", "text": "分布式一致性" }
```

「字段用了什么分析器、查询词实际被切成了什么」排查搜不到的问题，
第一步永远是 `_analyze` 看词项，而不是猜。

## 动态映射：三种档位

没建 mapping 就写文档，ES 会「猜」类型——字符串被猜成 text（附 keyword
子字段）、数字猜数值、看起来像日期的字符串猜成 date。`dynamic` 参数
控制宽松程度：

| 档位 | 新字段行为 | 适用 |
| --- | --- | --- |
| `true`（默认） | 自动加进 mapping | 开发期 |
| `false` | 入库可查（_source 有）但**不索引、不可搜** | 日志类只存不搜的字段 |
| `strict` | 直接拒绝写入 | 生产索引防手滑 |

动态映射最常见的坑：字符串字段被猜成 `date`——下一条写入非日期字符串
直接整条文档被拒。生产索引要么显式 mapping，要么 `strict`，让错误在
写入时暴露而不是在查询时消失。

## 小结

- mapping 是写死难改的 Schema（改类型 = reindex），生产先显式建映射。
- text 分词管搜索，keyword 整串管聚合排序；multi-field 让一个字段
  两者兼得。
- term 查 text 落空的根因：倒排里存的是分词后的词项——口诀
  「term 对 keyword，match 对 text」。
- 分词器是字符过滤 → 切词 → 词项过滤三段流水线；中文生产用 IK 双配置
  （索引 max_word、搜索 smart）；排查搜不到先 `_analyze`。
- 动态映射三档 true/false/strict，生产索引倾向 strict 让错早暴露。

## 延伸阅读

- [Elasticsearch 官方：映射](https://www.elastic.co/docs/manage-data/data-store/mapping)
- [Elasticsearch 官方：分析器 anatomy](https://www.elastic.co/docs/manage-data/data-store/text-analysis/anatomy-of-an-analyzer)
- [IK 分词器 GitHub](https://github.com/infinilabs/analysis-ik)
