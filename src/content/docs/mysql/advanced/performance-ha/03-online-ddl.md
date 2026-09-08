---
title: 大表变更与 Online DDL
description: DDL 锁行为的演进、ALGORITHM 三档与 INSTANT 加列、MDL 元数据锁的长事务陷阱、gh-ost 与 pt-osc 的影子表原理
level: advanced
---

## 为什么大表加个字段也值得写一篇

亿级订单表 `ADD COLUMN` 一条语句执行两小时：期间从库延迟暴涨、主库
磁盘翻倍、一条未提交的长事务能让 DDL 卡死并连锁堵死全部后续查询——
大表变更是线上事故重灾区，考的是"对锁和复制链路的整体理解"。

## DDL 锁行为的三代演进

| 时代 | 行为 | 问题 |
|---|---|---|
| 5.5 及前 | DDL 全程锁表（COPY：建影子表 + 锁写 + 拷数据 + 改名） | 大表 = 超长不可写窗口 |
| 5.6+ Online DDL | `INPLACE`：多数 DDL 允许**并发读写**，拷数据放引擎内部 | DML 不阻塞，但 DDL 开始/结束仍要短暂排他锁 |
| 8.0 `INSTANT` | 只改元数据（如加列在 8.0.12+），**秒级完成** | 适用范围有限（改列类型等仍不行） |

关键字节：每条 DDL 可以显式声明两个属性：

```sql
ALTER TABLE orders ADD COLUMN remark VARCHAR(255),
  ALGORITHM=INSTANT, LOCK=NONE;
-- ALGORITHM: COPY(锁写) / INPLACE(引擎内) / INSTANT(仅元数据)
-- LOCK: NONE / SHARED / EXCLUSIVE
-- 不满足时直接报错而不是降级——生产上要显式声明防"悄悄 COPY"
```

判断某 DDL 能不能用 INPLACE/INSTANT：查官方 online DDL 支持表——
**加列（8.0 INSTANT）、加索引（INPLACE）**是日常最常见的安全项；
**改列类型、改字符集**基本都是 COPY（锁写）。

## MDL 元数据锁：DDL 卡死的真凶

Online DDL 期间 DML 不被阻塞，但**DDL 前后需要拿 MDL 写锁**（防止
执行期间表结构被并发变更）。事故链条：

```mermaid
flowchart LR
    T["长事务/慢查询<br/>持有 MDL 读锁不放"] --> W["DDL 等 MDL 写锁<br/>（卡在队列）"]
    W --> B["后续所有 DML 排在 DDL 后面<br/>——整表业务雪崩"]

    class W hl
    class B bad
    classDef hl stroke-width:1.5px
    classDef bad stroke-width:1.5px
```

防御姿势：DDL 前 `information_schema.innodb_trx` 查长事务；
8.0 可以 `SET lock_wait_timeout` 给 MDL 等待设短超时，拿不到就先
放弃，避免堵住 DML 队列。

## 影子表工具：gh-ost 与 pt-osc

超大表（数亿行）即便 INPLACE 也有主从延迟与磁盘翻倍问题，业界改用
**影子表 + 增量回放**：

| 工具 | 增量捕获 | 特点 |
|---|---|---|
| pt-osc（pt-online-schema-change） | **触发器**写入原表时同步写影子表 | 触发器有额外写放大；单表触发器数受限 |
| **gh-ost** | 伪装成从库**拉 binlog** 回放到影子表 | 无触发器、可暂停/限流/演练，当前主流 |

两者流程同构：建影子表（已改好结构）→ 全量拷数据 → 增量回放追平 →
原子 rename 切换 → 删旧表。**限速因子**是主从延迟（复制链路见
[主从复制与分库分表](/mysql/advanced/performance-ha/02-replication-sharding/)）。

## 变更前检查清单

1. 表多大？估算时长；亿级直接考虑 gh-ost 而不是裸 ALTER；
2. 该变更走 INSTANT/INPLACE 吗？显式声明 `ALGORITHM`，拒绝静默 COPY；
3. 查一遍**长事务与慢查询**，避开业务高峰与批处理窗口；
4. 磁盘余量 ≥ 表大小（拷数据翻倍）+ binlog 增量；
5. 从库延迟监控与自动暂停阈值；gh-ost 的 `max-load`/`critical-load`
   设好；
6. 回滚预案：rename 之前旧表都在，rename 后回滚 = 反向再来一次。

## 小结

- DDL 演进：COPY 锁写 → Online INPLACE 并发读写 → INSTANT 秒级
  （加列）；显式声明 ALGORITHM 防静默降级。
- 事故第一现场是 **MDL**：长事务堵 DDL、DDL 堵全表——先清长事务、
  给 MDL 设超时。
- 亿级表走 gh-ost（binlog 回放，可限流可暂停）而非裸 ALTER；它的
  限速标尺是主从延迟。
- 变更清单六问：表多大、算法档位、长事务、磁盘、延迟、回滚。
