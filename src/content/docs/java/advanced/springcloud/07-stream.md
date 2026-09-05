---
title: Spring Cloud Stream：消息驱动
description: 为什么抽象绑定器、Binder/信道/绑定三部曲、与原生 Kafka 客户端的分工与选型
level: advanced
core: true
---

## 消息驱动的痛点

微服务里发消息常直接用 Kafka/RocketMQ 原生客户端。问题是：`@KafkaListener`
与 `@RocketMQListener` 注解互不相通，**换中间件就要重写一套收发代码**。
Spring Cloud Stream 在中间件之上做一层抽象，让生产者/消费者只跟自己的
"信道"打交道，底层换 Binder 即可。

```mermaid
flowchart LR
    S["业务 Producer<br/>只写 Sink.out 信道"] --> B["Binder 绑定器"]
    B --> M["中间件<br/>Kafka / RocketMQ / RabbitMQ"]
    M --> B2["Binder"]
    B2 --> C["业务 Consumer<br/>monitor 信道"]

    style B fill:#f5f0e6
    style B2 fill:#f5f0e6
```

## 三个概念串起来

| 概念 | 含义 | 例子 |
|---|---|---|
| **Binder** | 对接具体中间件的适配层 | `kafka` / `rocketmq` |
| **信道（Channel）** | 生产者/消费者侧的抽象出入口 | `Supplier`、`Consumer`（函数式） |
| **绑定（Binding）** | 信道 ←→ 中间件 destination 的映射 | `monitor-in-0` → topic `monitor` |

## 函数式定义（现代推荐）

```yaml
spring:
  cloud:
    stream:
      bindings:
        monitor-out-0: { destination: monitor, binder: kafka }
        monitor-in-0:   { destination: monitor, group: monitor-group, binder: kafka }
      binders:
        kafka: { type: kafka, environment: { spring.cloud.stream.kafka.binder.brokers: localhost:9092 } }
```

```java
@Component
public class MonitorStream {
    @Bean
    public Supplier<Monitor> publish() {       // 生产者：定时/事件发到 monitor-out-0
        return () -> new Monitor(...);
    }

    @Bean
    public Consumer<Monitor> consume() {       // 消费者：从 monitor group 消费
        return msg -> { /* 处理 */ };
    }
}
```

消费者侧的关键是 **group**：同一个 group 内的实例**负载分担**（一条只被一个消费），
不同 group 各自拿到一份——这就是"广播 vs 集群消费"的声明式开关。

## 失效场景（消息不消费/重复消费排查）

| 现象 | 根因 |
|---|---|
| 消息没到业务逻辑 | 绑定里 destination/group 配错；Binder 类型对不上中间件 |
| 消费者重复收到 | 没配/配错 group，或用错提交模式 |
| 换中间件后行为变了 | Binder 配置（brokers/ack 语义）未同步调整 |

## 与原生客户端的分工

- **要底层精细控制**（精确位点、事务、端到端时序）→ 用原生客户端。
- **要多中间件可切换、业务与中间件解耦** → 用 Spring Cloud Stream。

同一个项目常混用：框架接入走 Stream，性能敏感或强语义走原生。选型不讲绝对
优劣，讲**这一层抽象值不值**。

## 小结

- Stream 用 Binder 抽象掉具体 MQ，业务只依赖信道/绑定。
- 函数式 Supplier/Consumer + yaml 绑定，group 决定集群消费还是广播。
- 追求解耦可切换用 Stream，追求强控制/性能用原生客户端。