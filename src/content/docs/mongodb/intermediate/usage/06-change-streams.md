---
title: Change Streams：原生变更监听
description: oplog 的游标化订阅、resume token 断点续听、与外部 CDC 工具的选型对比
level: intermediate
core: true
---

CDC 篇讲的是"解析 MySQL binlog"的通用方案；MongoDB 自带**原生变更
订阅**——Change Streams 把 oplog 包装成可订阅的游标，应用不用部署
Canal/Debezium 就能实时收到集合变更。是 MongoDB 生态里 CDC 的原生
答案。

## 原理与用法

```mermaid
flowchart LR
    OP["oplog<br/>（复制操作日志）"] --> CS["Change Stream 游标<br/>（watch 集合/库/集群）"]
    CS --> E["变更事件流<br/>（insert/update/delete/replace）"]
    E --> APP["应用：实时处理<br/>（缓存失效/通知/联动更新）"]
    class CS hl
    class E hl
    classDef hl stroke-width:1.5px
```

```javascript
const stream = db.orders.watch(
  [{ $match: { "fullDocument.status": "PAID" } }],  // 聚合过滤
  { fullDocument: "updateLookup" }                   // 返回完整文档
);
// resumeToken = stream.resumeToken  → 断点续听的关键
```

- watch 的粒度三档：**集合/数据库/整个集群**；
- 事件带 `resumeToken`——**断线后凭 token 续听**，不丢不重（应用侧
  持久化 token，与 IM 位点同思想）；
- `fullDocument: "updateLookup"`：update 事件默认只带变更字段，
  开启后带完整文档。

## 与外部 CDC 的选型对比

| | Change Streams | Canal/Debezium |
| --- | --- | --- |
| 部署 | **原生，零组件** | 需部署解析器+MQ |
| 数据库 | 仅 MongoDB | MySQL/PG 等多库统一 |
| 消费方式 | 应用内直连游标 | 经 Kafka 广播多方订阅 |
| 断点续听 | resume token（存 oplog 窗口内） | 位点持久化，更可靠 |
| 适用 | 单一 MongoDB 生态的轻量联动 | 多数据源、多下游、强可靠场景 |

- **resume token 会过期**：oplog 是环形日志，token 对应的 oplog 条目
  被滚动覆盖后无法续听——oplog 窗口要足够大（覆盖应用最长离线时间）；
- 同一思想对照：MySQL binlog 同样是环形覆盖——CDC 的位点管理是
  共同的工程点。

## 高频追问速答

- **Change Streams 和 tail cursor 区别？** 老方案 tailable cursor 只能
  监听固定集合且语义弱；change stream 有过滤、有 resume token、
  支持全库/集群粒度、能感知 DDL——本质是 oplog 的结构化视图。
- **事件顺序保证？** 单文档/单分片内按 oplog 顺序；**跨分片不保证
  全局顺序**——跨分片顺序敏感的业务要按 key 分区处理。
- **和 MongoDB 事务的关系？** 事务提交后事件才对外可见（按 majority
  提交排序）——change stream 不会读到未提交事务的中间状态。

## 小结

- Change Streams = oplog 的结构化订阅视图：原生零组件、resume token
  断点续听、聚合过滤支持。
- 选型：Mongo 单生态轻量联动用 change stream；多数据源/多下游/强
  可靠用 Canal/Debezium + MQ（CDC 篇）。
- oplog 环形滚动决定 resume token 的有效期——离线时长要纳入容量
  规划。
