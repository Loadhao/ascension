---
title: 管道、事务与 Lua
description: 管道省 RTT 的本质、MULTI/EXEC 事务为什么不支持回滚、WATCH 乐观锁、Lua 脚本的原子性与集群约束
level: intermediate
---

## 三种"批量/原子"手段的定位

Redis 单线程执行（见[线程模型](/redis/basic/core/03-thread-model/)）
给了两个先天条件：**命令天然原子**、**吞吐受 RTT 限制**。管道、事务、
Lua 分别对应三种诉求：

| 手段 | 解决什么 | 原子性 |
|---|---|---|
| Pipeline | N 条命令一次往返（**省 RTT**） | ✗ 不保证，逐条执行 |
| MULTI/EXEC 事务 | 多条命令**连续串行执行**不被插队 | 部分（无回滚） |
| Lua 脚本 | 多条命令 + **逻辑判断**整体原子 | ✓ |

## Pipeline：省的是 RTT，不是执行

100 条命令逐条发 = 100 次 RTT；管道打包发送、一次读回全部结果：

```java
try (Pipeline p = jedis.pipelined()) {
    for (String k : keys) p.hgetAll(k);   // 只入队不等待
    List<Object> res = p.syncAndReturnAll();  // 一次往返拿全部
}
```

三个要点：

- **服务端仍逐条执行**，只是客户端不等每条回应——各命令之间可能被
  其他客户端插队；
- 打包要**分批**（每批几百~一千条）：一次塞百万条会把服务端响应
  缓冲区撑大，反而阻塞；
- 大 key 批量读时管道 + MGET/HGETALL 的取舍看
  [大 key 篇](/redis/intermediate/usage/06-bigkey-hotkey/)。

## 事务：只保证"不被插队"，不保证"全对"

```text
MULTI           → 开启，之后命令入队（QUEUED）
SET k1 a
INCR k1         ← 类型错误：入队成功，EXEC 时这条失败
EXEC            → k1=a 执行成功，INCR 报错，但 k1 已被 SET！
```

两个反直觉事实（面试高频）：

1. **不支持回滚**：EXEC 后某条失败，其余照常生效。Redis 的理由：
   回滚救不了编程错误（类型错），只会拖慢常态路径。
2. **入队阶段出错**（语法/不存在命令）会整体放弃 EXEC——错误分
   "入队可见"与"执行才可见"两类，处理方式不同。

**WATCH = 乐观锁**：EXEC 前被监视的 key 被别人改过 → 整个事务放弃
（返回 nil），客户端自行重试——与 [CAS 重试](/java/intermediate/concurrent/09-cas-atomics/)
同一个思想。分布式锁尚未普及年代，"WATCH 余额再 EXEC 扣款"就是
标准并发写法。

## Lua：真正的"多命令原子"

```lua
-- EVAL "脚本" 1 mykey —— 单线程内整段执行，绝不被插队
if redis.call('GET', KEYS[1]) == ARGV[1] then
    return redis.call('DEL', KEYS[1])   -- 分布式锁的"校验+删除"原子化
else
    return 0
end
```

- **原子性来自单线程**：脚本执行期间其他命令全部排队——所以脚本
  必须**短小**，死循环/重逻辑 = 整个 Redis 假死（`SCRIPT KILL` 只能
  杀未写过的脚本）。
- **集群约束**：脚本访问的所有 key 必须同一槽——用 hash tag
  `{user1000}.orders` 强制同槽（槽机制见
  [主从哨兵与 Cluster](/redis/advanced/ha/01-replication-sentinel-cluster/)）。
- Redisson 看门狗续期、限流器等底层都是 Lua（见
  [分布式锁](/redis/intermediate/usage/03-distributed-lock/)）。

## 顺带：拿 Redis 当消息队列

| 方案 | 语义 | 短板 |
|---|---|---|
| List（LPUSH/BRPOP） | 简单队列 | 无 ACK、无消费组 |
| **Pub/Sub** | 即发即弃广播 | **不持久化**：掉线期间的消息永久丢失 |
| **Stream（5.0）** | 追加日志 + 消费组 + ACK + 持久化 | 功能齐但生态弱于专业 MQ |

结论：日志通知类轻量场景 Stream 够用；要求可靠投递请出门左转
[RocketMQ/Kafka](/rocketmq/)——别用 Pub/Sub 承载任何"丢了会出事"
的消息。

## 小结

- Pipeline 省网络不保原子；事务只防插队**不回滚**（错误分入队/执行
  两类），WATCH 提供乐观锁重试。
- Lua 靠单线程拿整段原子性，代价是"脚本必须短 + 集群 key 同槽"。
- 消息队列选型：Pub/Sub 不可靠是设计（广播非投递），可靠诉求用
  Stream 或专业 MQ。
