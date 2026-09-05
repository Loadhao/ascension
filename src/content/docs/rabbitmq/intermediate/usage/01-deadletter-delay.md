---
title: 死信队列与延迟消息
description: 消息什么时候进死信、TTL 与死信交换机组合实现延迟、重试与告警闭环
level: intermediate
core: true
---

## 死信：处理失败消息的归档通道

消息满足条件会进入一个"死信交换机（DLX）"，再路由到**死信队列**：

| 进入死信的三种情况 | 说明 |
|---|---|
| 被 `basicNack(reject, requeue=false)` 拒绝 | 主动放弃，不回队列 |
| 消息过期（TTL 到期） | `x-message-ttl` 超时 |
| 队列达到最大长度 `x-max-length` | 队满被挤出去 |

```java
Map<String, Object> args = new HashMap<>();
args.put("x-dead-letter-exchange", "dlx");      // 指定死信交换机
channel.queueDeclare("order-queue", true, false, false, args);
channel.queueBind("dlq", "dlx", "#");           // 死信队列绑定 DLX
```

死信的作用不是"丢掉"，而是**把失败消息从业务队列挪开**：业务队列不再被
坏消息堵住，死信队列单独由人工/脚本补救，并可对接告警。

## 延迟消息：TTL + 死信的组合拳

RabbitMQ 原生没有延迟交换机，经典思路是 **"到期后进死信再投给目标队列"**：

```mermaid
flowchart LR
    A["延迟交换机<br/>发送时设 TTL"] --> B["延迟队列<br/>（不消费，只等过期）"]
    B -->|"TTL 到期 → 进设置好的 DLX"| C["真实业务交换机"] --> D["业务队列"] --> E["消费者"]
```

配置要点：业务消息丢到"只设了 `x-message-ttl` 且 `x-dead-letter-exchange=真实交换机`"
的队列，过期时自动转投到真正的业务队列——**用"等待"换"延迟"**。
新版官方已提供 **Delay Exchange 插件**（`rabbitmq_delayed_message_exchange`），
延迟语义更直白，优先用它。

## 重试 + 死信 + 告警的闭环

1. 业务处理失败 → `basicNack(requeue=false)` → 进死信队列。
2. 死信监督任务按策略（如退避重投、人工干预）处理。
3. 监控死信队列深度，超阈值触发告警。

这套闭环保证：**坏消息不原地死循环、不占业务队列、失败可见可度量**。

## 常见坑

- 只配了队列 TTL 忘了给消息设 delivery_mode，重启仍丢。
- DLX 忘了绑定队列，死信消息进死信交换机后"无路可走"被丢弃。
- 延迟队列里塞了海量不同 TTL 的消息，会堆积在队头缓慢过期——延迟粒度
  太碎时慎用 TTL 方案，考虑插件或分级队列。

## 小结

- 死信 = 被拒/过期/队满的消息转投死信队列，把失败隔离归档。
- 延迟用「TTL + 死信转投」或官方延迟交换机插件。
- 闭环 = 失败进死信 + 监督重试 + 监控告警，失败可见可控。