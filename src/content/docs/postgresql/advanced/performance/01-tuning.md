---
title: PostgreSQL 性能优化笔记
description: 连接池、索引与 EXPLAIN 执行计划、优化器统计信息、VACUUM 表膨胀与 WAL/checkpoint 调参——从慢查询定位到系统级调优
level: advanced
---

## 先看全景：慢是怎么来的

PG 的性能问题通常三条线：**连接太多**（每连接一个进程，fork 与内存先
扛不住）、**查询计划差**（索引没用上、统计信息过期）、**后台机制没调
好**（表膨胀、WAL 写放大、checkpoint 抖动）。排查也按这个顺序来：先
定位慢 SQL，再看执行计划，最后才动参数——顺序反了容易白忙。

## 连接池：别让 PG fork 到吐

PG 是"每连接一进程"模型，连接数一高，内存占用与进程上下文切换先成为
瓶颈。两个解法：

- **应用侧池化**：如 Java 侧 HikariCP 控制连接上限；
- **数据库侧代理**：**pgbouncer**（轻量，transaction 池化模式最省连接）
  或 **Pgpool-II**（顺带读写分离与高可用，见高可用篇）。

经验值：有效并发连接控制在 CPU 核数的 2~3 倍以内，超出的请求靠池排队。
连接数降下来之后，很多"数据库慢"会自行消失。

## 索引优化：让 EXPLAIN ANALYZE 说话

`EXPLAIN` 看预估计划，`EXPLAIN ANALYZE` 真正执行并给出每步**实际耗时
与行数**——预估行数与实际差一个数量级，多半是统计信息过期（见下节）。
几个高频结论：

- **选择性**：过滤后命中行占比小（约 <20%）走索引划算；>40% 基本全表
  扫描更优；20%~40% 是模糊地带，看缓存与随机读代价；
- **表达式写在运算符右侧**：`where col + 1 = 2` 不走索引，改写成
  `where col = 1` 才走——对索引列做运算，等于换成了一根索引不认识的列；
- **连接字段上建索引**：被驱动表的关联列没有索引，nest loop 就是灾难；
- **复合索引遵循最左前缀**：与 MySQL 一致，`(a, b)` 对只按 b 过滤的
  查询无效；
- 大批量导入可临时删除索引，导完再重建。

## 优化器：统计信息与连接方式

PG 优化器**没有内置 hint**，干预计划主要靠三件事：

1. **喂对统计信息**：`ANALYZE` 更新 `pg_class` 里的 `reltuples`（行数
   估计）与 `relpages`（页面数），成本估算 ≈ `relpages × seq_page_cost
   + reltuples × cpu_tuple_cost`。autovacuum 会顺带做，但大表批量写入
   后手动跑一次更稳；
2. **看懂连接方式**：
   - **Hash Join**：小表建哈希表，适合**大结果集**关联，全程在内存
     （`work_mem`）里完成，注意 work_mem 不够会落盘；
   - **Nest Loop**：外层每行去内层找匹配，适合**两表结果集悬殊**的
     场景，小表放驱动侧、内层必须有索引；
   - 显式指定 `LEFT/RIGHT/FULL JOIN` 时，优化器必须按定义顺序关联，
     重排自由度小于普通 `JOIN`，多表查询尽量让规划器自己重排；
3. **实在要干预**：装 **pg_hint_plan** 扩展用注释写 hint；或调
   `random_page_cost`（SSD 降到 1.1 左右，让优化器更爱走索引）。

## VACUUM 与表膨胀：MVCC 的账单

PG 的 MVCC 靠**多版本元组**实现：更新 = 插入新版本 + 旧版本打标记，
死元组要靠 **VACUUM** 回收。VACUUM 跟不上，表和索引持续膨胀（占页
变多、缓存命中率下降、查询变慢），这就是**表膨胀（bloat）**。

- `VACUUM`：常规回收死元组空间，可复用但不归还 OS；
- `VACUUM FULL`：整表重写、彻底收缩，但拿排他锁——线上慎用；
- `ANALYZE`：只更新统计信息，不做空间回收；
- **autovacuum** 默认开启，`autovacuum_vacuum_scale_factor` 等参数
  决定触发阈值，写入密集的大表要单独调小阈值；
- **长事务与废弃复制槽持有旧快照，会阻止 VACUUM 清理**，是膨胀的常见
  元凶——先查 `pg_stat_activity` 里的长事务。

## WAL 与 checkpoint：写路径调参

写路径是"WAL 先落盘、数据页后刷"。两个机制决定写吞吐：

- **checkpoint**：周期性把脏页全量刷盘、之后 WAL 可回收。太频繁 →
  IO 尖峰（checkpoint 抖动）；太稀 → 崩溃恢复时间长；
- **full_page_writes**：checkpoint 后首次修改某页时整页写进 WAL，防
  半页写坏，代价是 WAL 写放大。

调优方向：`max_wal_size` 调大（16GB 起）让 checkpoint 别太勤；
`checkpoint_completion_target = 0.9` 把刷脏摊平到整个间隔；
`wal_compression = on` 压缩整页镜像，缓解写放大。

## 关键参数速查

| 参数 | 默认值 | 建议起点 | 说明 |
|---|---|---|---|
| `shared_buffers` | 128MB | 内存的 25% | PG 共享缓冲池 |
| `work_mem` | 4MB | 按"连接数 × 每查询多个排序/哈希"倒推 | 单个排序/哈希操作的内存，超了落盘 |
| `maintenance_work_mem` | 64MB | 512MB~1GB | VACUUM、建索引专用 |
| `effective_cache_size` | 4GB | 内存的 50%~75% | 告诉优化器 OS 缓存有多大 |
| `random_page_cost` | 4.0 | SSD 1.1 / 机械盘 4.0 | 直接影响走不走索引 |
| `max_wal_size` | 1GB | 16GB 起 | checkpoint 间隔的"刹车" |
| `checkpoint_completion_target` | 0.9 | 0.9 | 刷脏摊平程度 |
| `synchronous_commit` | on | 按业务降档 | 提交等待强度，见高可用篇同步级别表 |
| `autovacuum_vacuum_scale_factor` | 0.2 | 大表调 0.01~0.05 | 死元组占比触发阈值 |

## 慢查询排查流程

```text
1. pg_stat_statements 找 TOP 慢 SQL（总耗时 × 调用次数排序）
2. EXPLAIN (ANALYZE, BUFFERS) 看计划：预估行数 vs 实际行数
3. 行数差大 → ANALYZE / 调 autovacuum 阈值；计划差 → 补索引、改写法
4. 排序/哈希落盘（spill to disk）→ work_mem 不够
5. 依旧慢 → 连接数、表膨胀、checkpoint 抖动逐项排除
```

两个附加技巧：大数据量聚合先用**临时表**分步算；批量插入三板斧——关
autocommit 攒批提交、能用 `COPY` 就别用 INSERT、先卸索引/外键再导。

## 小结

- 连接层先池化，把有效并发压到 CPU 核数级别；
- 查询层让 EXPLAIN ANALYZE 说话：选择性、最左前缀、表达式放右侧；
- 优化器没有内置 hint，统计信息（ANALYZE）与成本参数才是正道；
- MVCC 的账单是表膨胀：盯 autovacuum、杀长事务、慎用 VACUUM FULL；
- 写路径调 `max_wal_size` 与 `checkpoint_completion_target`，别让
  checkpoint 抖。

## 延伸阅读

- [PostgresSQL 性能优化笔记（简书）](https://www.jianshu.com/p/4ad2aa772812)（本文来源，索引选择性与连接方式经验值）
- [PostgreSQL 官方文档](https://www.postgresql.org/docs/)（Routine Vacuuming、Resource Consumption、Query Planning 各章）
- [pg_hint_plan](https://github.com/ossc-db/pg_hint_plan)（PG 的优化器 hint 扩展）
