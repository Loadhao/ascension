---
title: 备份恢复与 PITR
description: 误删表之后能拿回多少——全量备份与连续 binlog 归档的配对、PITR 五步序列、ROW 反向 SQL 的前提、单表恢复与延迟从库
level: advanced
---

## 问题：DROP 错了一张表，30 分钟后你要交代结果

先记住一句判据：**能恢复到哪一刻，不取决于你备份得多勤，而取决于
"最近一次全量"之后有没有连续的 binlog**。只有 nightly 全量备份，
RPO 就是一天；全量 + 归档 binlog，RPO 才降到分钟级甚至语句级。
[MongoDB 的备份篇](/mongodb/intermediate/usage/10-backup/)用同一套结构讲过
"全量 + oplog 重放"，本篇把它落到 MySQL 的具体命令与坑上。

三类灾难对应三条路，混用会白花三倍时间：

| 灾难 | 该走哪条 | RPO |
|---|---|---|
| 一条 `DELETE`/`DROP` 打错 | binlog 反向 SQL 或 PITR 到误操作前一刻 | ≈ 0 |
| 个别表/表空间损坏 | 可传输表空间导入或从备份捞单表 | 取决于备份 |
| 整实例丢失（盘坏了、误 `rm`） | 全量恢复 + binlog 重放到故障点 | 归档粒度 |

## 一、全量备份：逻辑与物理的分工

```bash
# 逻辑备份：一致性快照 + 把 binlog 位点写进文件头
mysqldump --single-transaction --source-data=2 \
          --routines --triggers --all-databases \
          > full-$(date +%F).sql
```

| 选项 | 作用 | 必须知道的边界 |
|---|---|---|
| `--single-transaction` | 开一个 REPEATABLE READ 事务取一致快照，**不锁表** | 只对 InnoDB 有效；**备份期间不能执行 DDL**，否则快照与新结构不一致 |
| `--source-data=2` | 在导出文件里以**注释**形式写入当前 binlog 文件与位点 | 官方明确它与 `--single-transaction` 可以同用——这正是"在线备份后做时间点恢复"的标准组合 |
| `--master-data` | 同名旧选项 | 老版本脚本里到处都是，新库改用 `--source-data` |
| `--flush-logs` | 备份前翻转 binlog | 让位点之后的日志落在独立文件里，重放时范围更干净 |

逻辑备份的致命短板不在备份而在**恢复**：它是一个巨型 SQL 脚本，
恢复=逐条重放 `INSERT`，百 GB 级别要跑上小时级。所以它的定位是
"小库、跨版本迁移、单表捞回"，不是大库的容灾手段。

```bash
# 物理备份：拷数据页 + 处理 redo 得到一致状态（以 Percona XtraBackup 为例）
xtrabackup --backup     --target-dir=/backup/base     # 拷贝期间持续记录 LSN
xtrabackup --prepare    --target-dir=/backup/base    # 回滚未提交、前滚 redo
xtrabackup --copy-back  --target-dir=/backup/base     # 放回 datadir
```

`--prepare` 是外行最容易跳过的一步：拷贝过程中数据页本身是**撕裂**的
（不同页在不同时刻被复制），只有把 redo 按 LSN 应用完才成为一致状态。
推论很硬：**直接 `cp -r` 一个正在运行的实例的 datadir，得到的是不可用备份**。
增量备份靠 LSN 链（`--incremental` 配 `--incremental-basedir` 指向上一次基线，
也可用 `--incremental-lsn-basedir` 直接给 LSN），
大版本与工具版本的配对要求查发行说明，别拿老命令直接跑 8.0。

## 二、binlog 不归档，等于没有备份

```ini
log_bin                 = mysql-bin
binlog_format           = ROW        ; 反向 SQL 与精确重放的前提
binlog_row_image        = FULL       ; 设成 MINIMAL 会缺列镜像，救不回行
binlog_expire_logs_seconds = 1209600 ; 保留窗口 = 你能回溯的时间
```

三条纪律，缺一条就会在事故现场发现自己只剩"回到昨天"这一个选项：

1. **binlog 与数据不在同一块盘上**，且**异机/对象存储留一份**——
   实例连盘一起没了的时候，本地 binlog 也跟着没了；
2. **保留窗口要大于"发现误操作的最坏延迟"**。凌晨删错、下午才发现，
   而 binlog 只留 6 小时，就已经不可恢复了；
3. 归档要有连续性校验：位点/GTID 集合断号，PITR 就只能走到缺口为止
   （这一点和[复制槽会夹住 WAL 位点](/postgresql/intermediate/wal/01-wal/)
   是同一个道理）。

## 三、PITR 主线：五步，且不要在生产实例上重放

```mermaid
flowchart LR
    A["① 止血<br/>停写/隔离，别让误删扩散"] --> B["② 定位那一刻<br/>binlog 事件或 GTID 区间"]
    B --> C["③ 在新一台实例上恢复全量"]
    C --> D["④ 重放 binlog 到误操作之前<br/>用 stop-position 或 stop-datetime 收口"]
    D --> E["⑤ 只把丢的表导回生产<br/>校验行数与抽样后再放流量"]

    class E good
    class A hl
    classDef good stroke-width:1.5px
    classDef hl stroke-width:1.5px
```

定位那一刻：

```bash
# 看某文件从某位点起的事件（人眼找误操作语句/事务）
mysql -e "SHOW BINLOG EVENTS IN 'mysql-bin.000123' FROM 4531 LIMIT 50;"

# 翻成可读事件再定 stop-position
mysqlbinlog --base64-output=decode-rows -vv \
            --start-position=4531 mysql-bin.000123 > /tmp/inspect.sql
```

恢复到新实例并重放：

```bash
mysql -u root -p < full-2026-09-25.sql        # 全量（文件头有起始位点）
mysqlbinlog --start-position=<全量位点> \
            --stop-position  <误操作事件前> \
            mysql-bin.000123 mysql-bin.000124 | mysql -u root -p
```

第 ⑤ 步是关键取舍：**别在生产实例上就地重放**，一律在新实例恢复到
目标时刻，再把需要的表 `mysqldump` 导回去。理由是重放中途发现位点选错
是可回退的，而在生产上写坏了就没有第二次机会。

## 四、更快的路径：ROW 事件反向生成 SQL

`binlog_format=ROW` 时每个事件都带前后镜像，社区工具（各类
binlog flashback / binlog2sql）能把它反着翻：`INSERT` ↔ `DELETE`、
`UPDATE` 用 before image 替换 after image，倒序输出即"撤销"。

适用边界要说清，否则会在现场踩空：

| 前提 | 不满足时 |
|---|---|
| `binlog_format=ROW` | STATEMENT/MIXED 无法可靠反推 |
| `binlog_row_image=FULL` | MINIMAL 只记主键与变更列，凑不出完整行 |
| 表有主键 | 无主键时 where 条件退化，反放可能多改/漏改 |
| 误操作后没有大量后续写 | 撤销会和已经发生的新写冲突，得人工裁决 |
| 大事务可控 | 单事务几十 GB 变更的反向脚本本身就是一个大 DDL 级负载 |

它的优势是**不用搬整库**（RTO 极短），劣势是只适合"回退几条语句"，
不适合"整库丢了重建"。两者不是替代关系。

## 五、只丢一张表：别拖整库陪葬

可传输表空间能把单表从备份实例搬到生产：

```sql
-- 备份实例上导出（会等该表上的写结束并刷新）
FLUSH TABLES orders FOR EXPORT;      -- 生成 ./orders.cfg 元数据
-- 生产上
ALTER TABLE orders DISCARD TABLESPACE;
ALTER TABLE orders IMPORT TABLESPACE;   -- 换上备份的 .ibd + .cfg
```

前提是表用独立表空间（`innodb_file_per_table=ON`，8.0 默认）且两边
行格式、字符集一致。跨备份位点导入时，导入之后仍要补重放该表在
备份点之后的变更——所以它省的是"恢复整库"的时间，不是"补数据"的时间。

## 六、买后悔药：成本从低到高

1. **`sql_safe_updates=1`**：不带主键/索引条件、没有 `WHERE` 的
   `UPDATE`/`DELETE` 直接被拒——**一条会话级设置拦住八成的误删全表**；
2. **权限收敛**：应用账号不给 `DROP`/`ALTER`，DDL 走变更平台；
    MySQL **没有回收站**，`DROP TABLE` 是即刻生效的，别指望"先变回收对象"；
3. **延迟从库**：`CHANGE MASTER TO MASTER_DELAY = 3600` 让一个只读副本
   固定晚一小时回放。误删后先去延迟从库捞数据，**10 秒解决**，
   不用走 PITR。代价是它不承担实时读，且必须小心别被业务当从库用；
4. **恢复演练**：每月真的 restore 一次并计时。没演练过的备份
   在概率上等于没有备份——这一条与
   [MongoDB 备份篇](/mongodb/intermediate/usage/10-backup/)的"验证纪律"同源。

## 小结

- 恢复能力 = **全量备份 + 该位点之后连续的 binlog**；只有 nightly 全量，
  RPO 就是一天。
- `mysqldump --single-transaction --source-data=2` 是官方给出的
  "在线备份 + 时间点恢复"配对；备份窗口内禁止 DDL。
- 物理备份的 `--prepare` 不可跳：拷贝出来的数据页是撕裂的，
  直接 `cp` 运行中的 datadir 等于没有备份。
- PITR 的铁律：**在新实例恢复到误操作之前，再把需要的表导回生产**，
  不要就地重放。
- ROW + `binlog_row_image=FULL` + 有主键，才谈得上反向 SQL 快速撤销；
  它救"几条语句"，救不了"整库重建"。
- 预防比恢复便宜：`sql_safe_updates`、DDL 权限收敛、延迟从库、
  定期真恢复演练。

## 延伸阅读

- [mysqldump 选项说明（`--source-data` 与 `--single-transaction` 可同用于 PITR 在线备份）](https://docs.oracle.com/cd/E17952_01/mysql-8.4-en/mysqldump.html)
- [MySQL 官方：Point-in-Time（Binary Log Position）恢复](https://docs.oracle.com/cd/E17952_01/mysql-8.4-en/point-in-time-recovery.html)
- [MySQL 官方：可传输表空间（DISCARD/IMPORT TABLESPACE）](https://docs.oracle.com/cd/E17952_01/mysql-8.4-en/independent-tablespace.html)
- [Percona XtraBackup 文档：backup / prepare / copy-back 流程](https://docs.percona.com/percona-xtrabackup/8.0/index.html)
