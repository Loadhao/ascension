---
title: 索引生命周期：rollover 与冷热分层
description: 单一大索引的困境、时间分片与读写别名、rollover 三条件、ILM 四阶段动作与节点分层、单 shard 20-50GB 的规划经验值
level: advanced
---

[ES 与 MySQL 分工](/elasticsearch/advanced/architecture/01-mysql-es-divide/)
篇确定了「ES 存什么」，这篇解决「ES 怎么扛时间」：日志、埋点、订单流水
这类**只增不改、按时间查询、新旧冷热分明**的数据，用一个巨大的索引硬扛
会同时死在写入、删除和成本三件事上。解法是索引生命周期管理（ILM）。

## 单一大索引的困境

一个每天 50GB、存 90 天的日志场景，如果全部塞进一个索引：

- **删除靠 `delete_by_query`**：倒排索引的文档删除是伪删除（打标记），
  50GB 的索引里删 1 天的数据要全量扫描+等段合并，慢且 IO 爆炸；
- **shard 数量锁死**：主分片数建索引时定死——按总量规划则单 shard 过大，
  按写入速率规划则远期 shard 太碎；
- **资源错配**：3 天前的数据几乎没人查，却和热数据享受同样的副本与
  内存。

三个问题的共同根源：**把「不同生命阶段的数据」放进了同一个索引**。
解法就是按时间切索引。

## 时间分片与读写别名

按天（或按大小）建 `logs-2026.09.18` 这类索引，查询用通配符
`logs-*` 跨索引搜；写入则不能跟着日期走（跨天瞬间要切目标）——用
**别名（alias）**做读写分离：

```json
// 写别名永远指向「当前索引」，rollover 时原子切换
POST /_aliases
{ "actions": [
  { "add": { "index": "logs-000001", "alias": "logs-write" } }
] }
```

业务代码始终写 `logs-write`、查 `logs-read*`——索引怎么拆、怎么滚，
对业务完全透明。这是时间分片方案的「接口层」。

## rollover：满足条件自动滚新索引

rollover 在**写别名**背后自动创建下一个索引并切换别名，三个触发条件
任一满足即滚：

| 条件 | 含义 | 典型值 |
| --- | --- | --- |
| `max_age` | 索引活了多久 | 1d（日志按天） |
| `max_size` | 主分片总大小 | 50GB |
| `max_docs` | 文档条数 | 2 亿 |

条件是「或」不是「且」——先到先滚。为什么 size 上限定 50GB 量级：
**单 shard 的经验区间是 20–50GB**，太大恢复慢、merge 久，太小则
shard 数爆炸、集群元数据压力大——这个经验值是 shard 规划题的标准答案。

## ILM：四阶段把数据推向该去的地方

ILM（Index Lifecycle Management）把 rollover 扩展成一条**自动流水线**，
按阶段对索引执行动作：

```mermaid
flowchart LR
    H["Hot<br/>滚动写入，副本齐全"] -->|"rollover 后"| W["Warm<br/>只读，force merge<br/>缩副本，迁到低配节点"]
    W -->|"到期"| C["Cold<br/>迁到冷节点/冻结层<br/>检索更慢但成本更低"]
    C -->|"到期"| D["Delete<br/>整个索引删除<br/>告别 delete_by_query"]
```

- **Hot**：承接写入，与 rollover 联动；
- **Warm**：数据只读后 `force_merge` 成少量大段、降副本、迁移到
  大容量低配节点（节点打 `box_type: warm` 标签，ILM 按标签分配）；
- **Cold**：更冷的层（frozen 层用可搜索快照，成本再降一档）；
- **Delete**：到龄整个索引删掉——**删索引是 O(元数据) 的秒级操作**，
  对比单大索引的 delete_by_query 是两个世界。

冷热分层的本质是**让硬件资源跟着数据的访问频率走**：NVMe 给热数据、
机械盘给冷数据，成本曲线立刻平滑。

## 高频追问

**为什么删除大索引里的数据慢？** 段是不可变的，删除是伪删除（打
.tombstone 标记），查询还要过滤已删文档，真正释放空间要等段合并
（merge）——所以「按时间拆索引 + 整索引删除」才是日志类数据的正解
（合并机制见[倒排索引篇](/elasticsearch/basic/core/01-inverted-index/)）。

**shard 数怎么规划？** 三个输入：日增量（定 rollover size）、保留
天数（定索引个数）、单 shard 20–50GB（定每索引分片数）；再留出
扩容余量。反例是「按集群机器数拍脑袋定」，数据涨了就无解。

## 小结

- 单一大索引死于删除慢、shard 锁死、资源错配——根源是不同生命阶段的
  数据混在一个索引里。
- 时间分片 + 读写别名是接口层：业务写别名、查通配，rollover 原子切换。
- rollover 三条件先到先滚；单 shard 20–50GB 是规划经验锚点。
- ILM 四阶段 hot→warm→cold→delete：force merge/降副本/迁冷节点/
  整索引删除，让硬件跟着数据温度走。

## 延伸阅读

- [Elasticsearch 官方：ILM](https://www.elastic.co/docs/manage-data/lifecycle/index-lifecycle-management)
- [Elasticsearch 官方：rollover API](https://www.elastic.co/docs/api/doc/elasticsearch/operation/operation-indices-rollover)
- [Elasticsearch 官方：容量规划](https://www.elastic.co/docs/deploy-manage/production-guidance/sizing-and-resiliency)
