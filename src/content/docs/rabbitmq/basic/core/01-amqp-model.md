---
title: AMQP 模型：交换机、队列与绑定
description: 生产者-交换机-队列-消费者链路、四类交换机路由、Routing Key 与 Binding
level: basic
core: true
---

## 一条消息怎么投递

RabbitMQ 遵循 AMQP：**生产者只把消息交给交换机，不直接碰队列**；消息按
路由键（Routing Key）经交换机的规则转进一个或多个队列，消费者再从队列取。

```mermaid
flowchart LR
    P["生产者（Publisher）"] --> X["交换机 Exchange"]
    X -->|"binding: routing key=order.#"| Q1["订单队列"]
    X -->|"binding: routing key=pay.*"| Q2["支付队列"]
    Q1 --> C1["消费者A"]
    Q2 --> C2["消费者B"]
    
    style X fill:#f5f0e6
```

关键认知：**交换机和队列都不保存消息如何分发的逻辑，规则在"绑定"里**。
绑定 =（队列, 路由键模式），它决定消息进不进某队列。

## 四类交换机

| 类型 | 路由规则 | 适用 |
|---|---|---|
| **direct** | 路由键**完全相等**才进队列 | 定点路由（如按消息类型分队列） |
| **topic** | 路由键做 **通配符匹配**（`.` 分段，`*` 单段、`#` 多段） | 灵活分类（如 `order.created`） |
| **fanout** | 广播给**所有绑定队列**，忽略路由键 | 集群广播/事件通知 |
| **headers** | 按消息**头**（键值对）匹配，不是路由键 | 复杂条件路由，用得少 |

```mermaid
flowchart LR
    subgraph F["fanout：全广播"]
        A["消息"] --> B["队列1"] & B2["队列2"]
    end
    subgraph D["topic：# 通配"]
        C["order.created"] --> E["绑定 order.# 的队列"]
    end
```

## 队列与消息的持久性关系

- **Exchange / Queue 是否 durable**：决定 broker 重启后这些实体还在不在。
- **消息是否持久化（delivery_mode=2）**：决定排队中的消息落盘还是仅内存。
- 三层（交换机 durable + 队列 durable + 消息持久化）**一起**才算可靠投递，
  只记得队列 durable、忘了消息持久化，重启照样丢。

## 消费者模型

```mermaid
flowchart TB
    C["消费者消费消息"] --> A{"消费成功/失败?"}
    A -->|"成功：basic_ack"| OK["broker 删除该消息"]
    A -->|"失败或没回 ACK"| WAIT["消息留在队列/回推<br/>按投递策略重试或进死信"]
    A -->|"显式 basic_reject/requeue"| RQ["重新入队"]
```

消费者默认要 **显式 ACK**（`manual ack`），broker 只有收到 ACK 才删消息——
这是"不丢"的锚点，但它引出的重试/死信正是可靠性篇的主题。

## 一条消息到底进哪个队列（深入）

"规则在绑定"听着抽象，用一个**带真实绑定的交付场景**把它跑一遍。假设
订单系统有三类队列：

```java
// 初始化：声明交换机和队列，并绑定路由键（一次执行，幂等）
try (Channel ch = conn.createChannel()) {
    ch.exchangeDeclare("order.ex", BuiltinExchangeType.TOPIC, true);

    ch.queueDeclare("order.created", true, false, false, null);
    ch.queueBind("order.created", "order.ex", "order.created.#");

    ch.queueDeclare("order.paid", true, false, false, null);
    ch.queueBind("order.paid", "order.ex", "order.paid.#");

    ch.queueDeclare("order.all", true, false, false, null);
    ch.queueBind("order.all", "order.ex", "order.#");
}
```

现在发送不同路由键，判定过程是**逐绑定比对**：

| 发送路由键 | 命中绑定 | 进哪个队列 | 原因 |
|---|---|---|---|
| `order.created.1024` | `order.created.#` ✓ <br/>`order.#` ✓ | order.created、order.all | topic 的 `#` 匹配多段 |
| `order.paid.1024` | `order.paid.#` ✓ <br/>`order.#` ✓ | order.paid、order.all | 同上 |
| `order.delivered.3` | `order.#` ✓ | order.all | 没有 create/paid 的绑定匹配 |

**关键结论：**

1. **一条消息可以进多个队列**——因为可能匹配多条绑定，这正是 fanout
   广播和 topic 分发共用的底座。
2. **没有绑定匹配 = 消息被丢弃**（对发布方毫无报错）。所以"发了没收到"
   先查：**路由键 vs 绑定的掐型**，尤其是 `.` 分段是否一致。
3. 绑定是在**运行时**增删的：队列可以先建不绑、把绑定留给运维脚本，这是
   动态路由（如灰度）的入口。

排查"消息去哪了"，第一动作就是**用管理台列出该交换机所有绑定、比对路由键**，
而不是看生产者代码。

## 小结

- RabbitMQ 模型 = 生产者 → 交换机 → 队列 → 消费者，规则在绑定里。
- 四类交换机：direct(相等) / topic(通配) / fanout(广播) / headers(按头)。
- 可靠投递必须"交换机 + 队列 + 消息"三层都 durable/持久化。