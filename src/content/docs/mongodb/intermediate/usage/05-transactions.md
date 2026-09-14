---
title: 多文档事务：语法、前提与正确姿势
description: 4.0/4.2 的事务支持演进、session 语法三步、readConcern snapshot 前提、"单文档原子优先"的设计纪律
level: intermediate
core: true
---

"MongoDB 支持事务吗？"——答案经历了从"不支持"到"支持但要用对"的演变：
**4.0 起复制集多文档事务、4.2 起分片集群事务**。支持了不等于该用——
本篇讲语法、前提，以及最重要的：**什么时候不该用**。

## 语法三步：session 包裹

```javascript
const session = db.getMongo().startSession();
session.startTransaction({
  readConcern: { level: "snapshot" },
  writeConcern: { w: "majority" }
});
try {
  accounts.updateOne({ _id: A }, { $inc: { balance: -100 } }, { session });
  accounts.updateOne({ _id: B }, { $inc: { balance: 100 } }, { session });
  session.commitTransaction();
} catch (e) {
  session.abortTransaction();   // 任一步失败全部回滚
}
```

- **前提组合**：readConcern snapshot + writeConcern majority——
  事务的一致性等级由这两个旋钮锁定（读偏好篇的三旋钮在事务里的
  具体化）；
- 事务内的操作必须**带 session 参数**——漏传即脱离事务（静默的坑）。

## 限制：为什么"能用不等于该用"

| 限制 | 数值/说明 |
| --- | --- |
| 事务时长 | 默认 60 秒自动中止 |
| oplog 条目 | 整个事务作为一条 oplog，**不超过 16MB** |
| 性能 | 事务持有锁与 WiredTiger 快照——并发吞吐明显下降 |
| 被阻塞 | 与事务冲突的写会让其他事务中止重试 |

长事务/大事务在 MongoDB 里比 MySQL 更危险——**事务是兜底不是常态**
（文档模型篇的选型结论）。

## 正确姿势：单文档原子性优先

MongoDB 的**单文档操作天然原子**——把需要原子性的数据**内嵌进同一
文档**（账户与余额明细内嵌），大部分"事务需求"在建模层就消解了：

- 内嵌覆盖不了的（跨账户转账、跨集合）→ 才上多文档事务；
- 与 MySQL 的对照：MySQL 靠行锁+事务保证多行一致，MongoDB 靠**文档
  边界**——**建模方式决定了事务需求量**（文档模型篇的核心洞察）。

## 高频追问速答

- **事务能替代关系库吗？** 不能：关系库的事务是第一公民（任意组合、
  长事务、复杂隔离级别），MongoDB 事务是受限兜底——强事务密集的系统
  仍选关系库（落地选型篇）。
- **单文档原子性够用吗？** 内嵌建模后覆盖大部分场景（订单+明细、
  用户+配置）——**建模做得好，事务需求少**；这正是文档模型的价值。
- **事务里能做 $lookup 吗？** 能（读操作），但事务内集合数量与操作
  类型有限制——复杂逻辑放事务外。

## 小结

- 演进：4.0 复制集事务 / 4.2 分片事务；语法三步：session → 操作
  （带 session）→ commit/abort。
- 前提：snapshot + majority；限制：60 秒、16MB oplog、并发代价。
- 纪律：**单文档原子优先，多文档事务兜底**——建模好，事务需求少。
