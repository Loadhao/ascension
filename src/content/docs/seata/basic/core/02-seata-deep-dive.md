---
title: Seata 高频追问：全局锁、隔离性与失效场景
description: AT 模式的写隔离与读隔离、脏写与全局锁的代价、@GlobalTransactional 失效的四种场景、TC 高可用与性能调优
level: basic
core: true
---

AT 模式三角色与两阶段流程见[核心机制篇](/seata/basic/core/01-seata-core/)，
本篇收面试追问——全局锁和失效场景是 Seata 八股的主战场。

## 全局锁：AT 模式的隔离性根基

AT 一阶段**本地事务就直接提交了**（不等全局事务结束），两个全局
事务同时改同一行怎么办？靠 Seata 的**全局锁**：分支事务提交前要
向 TC 申请该行的全局锁，拿不到就自旋等待，超时回滚本地事务。

| 隔离级别 | 实现方式 | 说明 |
|---|---|---|
| 读未提交（默认） | 直接查本地库 | 能读到其他全局事务**未提交**的变更 |
| 读已提交 | `@GlobalLock` + `select for update` | 查询前先拿全局锁，代价明显 |

追问"AT 是什么隔离级别"：**写隔离靠全局锁，读默认读未提交**——
这是 AT 为性能做的取舍，要更严就上 `@GlobalLock` 或换 XA。

### 没有全局锁会怎样：脏写

两个全局事务改同一行、各自回滚时，undo log 的 after image 校验
不过（数据被别人改过），Seata 抛**脏写异常**，只能人工修数据。
全局锁就是为了让"回滚用的镜像"始终有效——**AT 的正确性押在
undo log 上，undo log 的正确性押在全局锁上**。

### 全局锁的代价

- 锁粒度默认是**行**（按表名 + 主键），但竞争热点行（秒杀库存、
  账户余额）时退化为串行——**热点行场景 AT 不适用**，换 TCC 或
  消息最终一致（见[分布式事务篇](/distributed/intermediate/transaction/01-distributed-transaction/)）。
- 锁要持有到**全局事务结束**（二阶段），链路越长锁越久——缩短
  全局事务范围是最有效的优化。

## @GlobalTransactional 失效场景（必考）

和 `@Transactional` 一模一样的四个坑：

1. **同类自调用**：`this.doBusiness()` 绕过了代理对象，注解不生效
   ——拆类或注入自身代理。
2. **异常被吞**：`try { ... } catch (Exception e) {}` 吃掉了回滚
   信号；或抛的是受检异常而 `rollbackFor` 未配置（默认按
   RuntimeException/Error 回滚）。
3. **非公开方法**：代理只拦截 public 方法。
4. **数据源未代理**：AT 依赖 `DataSourceProxy` 生成 undo log，
   多数据源场景手动 new 的连接池没被代理 → 分支没注册 → 无回滚
   能力且无全局锁。

追问"怎么快速排查失效"：看 `undo_log` 表有没有记录、TC 的
`global_table/branch_table/lock_table` 有没有分支注册——都没有
就是代理没生效。

## TC 高可用与部署形态

TC 是全局事务的协调者，挂了所有全局事务都悬——生产必配集群：

- **DB 模式**：全局事务状态存数据库（global_table/branch_table/
  lock_table），TC 无状态可水平扩，靠 DB 保证一致——默认生产
  形态。
- **Raft 模式**（1.5+）：TC 集群内嵌 Raft，省 DB 依赖，适合轻量
  场景。
- 注册中心把 TC 集群暴露给 TM/RM，挂一台流量切走即可。

## 性能账与调优清单

| 手段 | 原理 |
|---|---|
| 缩短全局事务范围 | 全局锁持有时间 = 全局事务时长，把 RPC/慢操作挪出去 |
| 调全局锁超时与自旋 | `lock.retryInterval/lock.retryTimes`，热点行场景权衡失败率 |
| undo log 定期清理 | `log_table` 膨胀拖慢回滚校验，配 `undo.log.saveDays` 等清理 |
| branch 异步提交 | 二阶段全局提交时异步删 undo log（默认已开） |
| 热点行直接放弃 AT | 换 TCC/消息最终一致，全局锁串行化不可接受 |

## 小结

- AT 的正确性链条：undo log 可回滚 → 依赖全局锁防脏写 → 全局锁
  持有到二阶段 → 热点行是天花板。
- 默认读未提交，读已提交要 `@GlobalLock` + for update，成本高。
- 注解失效四坑与 `@Transactional` 同源：自调用、吞异常、非 public、
  数据源未代理——排查入口是 undo_log 与 TC 三张表。
- TC 生产必配集群（DB 模式为主），全局事务范围能短则短。

## 延伸阅读

- [Seata 官方文档：AT 模式与全局锁](https://seata.apache.org/docs/dev/mode/at-mode/)
- [Seata 数据库三表与 TC 部署](https://seata.apache.org/docs/ops/deploy-guide-beginner/)
- [分布式事务五种方案（同站）](/distributed/intermediate/transaction/01-distributed-transaction/)
