---
title: 秒杀系统设计
description: 从百万流量到有限库存的全链路收窄：前端拦截、网关限流防刷、Redis 原子预扣、MQ 削峰下单、消费幂等与对账兜底
level: intermediate
core: true
---

## 题眼：收窄，层层过滤

秒杀的本质矛盾：**瞬时百万级请求 × 库存只有几百件**。99.9% 的
请求注定失败，设计的核心思想是**把请求在链路上层层收窄**，让
真正的下单流量接近库存量级：

```mermaid
flowchart LR
    A["1M 请求<br/>前端拦截"] --> B["10 万<br/>网关限流+防刷"]
    B --> C["几千<br/>Redis 预扣库存"]
    C --> D["几百<br/>MQ 异步下单"]
    D --> E["DB：等量级<br/>事务扣库存"]
    class E good
    classDef good stroke-width:1.5px
```

## 第一层：前端与 CDN——能不发请求就不发

- **静态资源全静态化**：商品页 CDN 缓存，详情数据走缓存接口，
  动静分离。
- **按钮置灰 + 前端防抖**：抢购开始前禁用按钮，防手抖重复提交
  （只是体验优化，挡不住脚本）。
- **URL 加密**：秒杀链接开始前不下发真实地址，防脚本提前囤 URL。
- 答题/验证码：人机校验顺便把瞬时洪峰摊平成几秒内的坡。

## 第二层：网关——限流与防刷

- **限流**：全局 + 接口 + 用户三级阈值（实现见
  [分布式限流](/distributed/intermediate/traffic/01-distributed-rate-limiting/)），
  超出容量的请求直接 429 快速失败——**比挤进系统后失败便宜得多**。
- **防刷**：IP/设备/账号维度风控，黑名单；同一用户 ID + 商品 ID
  去重（网关层直接拒绝重复抢购）。
- **负载均衡打散**：见 [负载均衡](/distributed/intermediate/cluster/01-load-balancing/)。

## 第三层：Redis 原子预扣——防超卖的核心

库存预热到 Redis，**Lua 原子"判断 + 扣减"**（天然防超卖）：

```lua
local stock = tonumber(redis.call('GET', KEYS[1]))
if stock and stock > 0 then
    redis.call('DECR', KEYS[1])
    -- 记录"用户已抢到"去重集合，同口径防重复抢
    if redis.call('SADD', KEYS[2], ARGV[1]) == 1 then
        return 1
    end
    return -1
end
return 0
```

返回 1 → 发 MQ 消息进入下单流程；0 → 售罄直接返回；-1 → 重复
抢购拒绝。**Redis 单线程串行执行保证不超卖**，性能瓶颈之前每秒
可扛十万级扣减。

面试追问"预扣了但用户不支付怎么办"：**下单消息带过期时间，超时
未支付关闭订单 + 回补库存**（延迟消息实现，见
[RocketMQ 延迟消息](/rocketmq/advanced/core/)）。

## 第四层：MQ 异步下单——把写压力变成匀速

预扣成功后发消息，**下单消费端匀速消化**：

- 削峰：数据库写入从瞬时洪峰变为可控速率。
- 解耦：扣库存、创建订单、发券、通知各自消费。
- **消费端幂等**（唯一业务号 + 去重，见
  [接口幂等性设计](/distributed/intermediate/coordination/02-idempotency/)）：
  MQ 至少一次投递，重复消息不能重复扣减——用户 ID+商品 ID 做
  唯一键。
- DB 兜底扣减仍用条件更新 `where stock > 0`，双保险。

## 全链路对账与降级

- **对账**：定时核对 Redis 库存、订单数、DB 库存三者一致；Redis
  与 DB 的偏差是超卖/少卖的直接信号。
- **降级**：售罄页直接由 CDN 返回；Redis 不可用时进入数据库
  乐观锁降级模式（性能降但不出错）。
- **预案**：核心链路开关化（风控、答题可热切换），大促前全链路
  压测 + 演练（见 [容灾演练](/distributed/advanced/availability/01-dr-multi-active/)）。

## 一分钟答法总结

1. 题眼：百万请求 × 几百库存 → **层层收窄**。
2. 前端静态化 + 防抖 + 验证码摊平洪峰。
3. 网关三级限流 + 风控防刷，超量快速失败。
4. Redis + Lua 原子预扣防超卖，去重集合防重复抢。
5. MQ 异步下单削峰，消费幂等，超时未付关单回补库存。
6. DB 条件更新兜底 + 定时对账 + 降级预案。

## 小结

- 秒杀没有新技术，全是已有零件的编排：限流挡量、缓存挡读、
  MQ 挡写、幂等挡重、对账兜底。
- 防超卖的锚点在**原子性**：Redis Lua 或 DB 条件更新，二者取一
  做准、另一个做兜底。
- 回答设计题的框架感比细节更值钱：流量从外到内逐层收窄，每层
  说清"挡掉多少、剩下的去哪"。

## 延伸阅读

- [分布式限流（同站）](/distributed/intermediate/traffic/01-distributed-rate-limiting/)
- [接口幂等性设计（同站）](/distributed/intermediate/coordination/02-idempotency/)
- [消息可靠性三问（同站）](/middleware/intermediate/reliability/01-message-reliability/)
