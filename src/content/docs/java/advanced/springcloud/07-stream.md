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

## 绑定生命周期与消费组/背压（深入）

**绑定不是"启动就有"**，它的生命周期是：应用启动 → 扫描函数式 Bean →
转换成 Binding → 建立中间件连接。缺了任一环，消息就进不来/出不去。

```mermaid
flowchart LR
    A["函数式 Bean<br/>(Supplier/Consumer/Function)"] -->|"StreamFunctionAutoConfiguration<br/>按名称绑定"| B["Binding 注册<br/>out-0 / in-0 命名后缀"]
    B -->|"Binder（如 Kafka/SR）"| C["中间件连接<br/>topic/queue + 收发线程"]
```

- **命名约定**：`xxx-out-0`、`xxx-in-0` 的末尾 `-0` 是"绑定序号"——一个
  Supplier 只能有一个输出，所以永远是 `-0`；`xxx` 是 Bean 方法名。yaml 里
  `bindings.xxx-out-0` 要和它严格对应，拼错最常见的结果就是**消息进了默认
  topic 而你监听根本不在那**。
- **消费组（group）复数**：同 group 的多个实例**负载分担**（一条消息只被一
  个实例消费）；不同 group 是**各自的副本**。如果 Consumer 没配 group，每次
  实例重启都会被当成新的 group（自动生成随机 group）——**重启后重复消费旧
  消息**就是没配/配错 group 的经典症状。

**背压：消费太慢会怎样**

Stream（尤其 Kafka Binder）有自动背压：`Consumer` 处理不过来时，Binder
会**暂停拉取**（paused 状态），不会无限灌爆内存；恢复后自动续拉。所以：

- 消费者处理函数里**别做长阻塞**——它表现为"消息堆积但消费线程 idle（在
  等某个同步操作）"，是排查积压的第一步。
- 需要调吞吐去提高 `maxPollRecords`/并发消费者数，而不是赌中间件自动喂饱。

### 三句排查口诀

| 现象 | 先查 |
|---|---|
| 发出去消费不到 | `bindings` 的 destination/group 与名字是否对齐 |
| 重启后重复消费 | 是否配了稳定的 group |
| 消息积压但消费者空闲 | 处理函数里是不是卡在阻塞 IO |

## 可靠性端到端：从生产者确认到消费成功（深入）

很多人"用了 Stream 就以为消息绝对可靠"，其实可靠性要三段都接住——且
Stream 的配置项正好一一对应三段：

| 环节 | 对应 Stream 配置 / 行为 | 注记 |
|---|---|---|
| 生产者发成功 | Kafka Binder 的 `required-acks`（默认 all） | 相当于"broker 确认落盘" |
| broker 不丢 | `replication.factor` + 参数 | 对应队列/主题副本冗余 |
| 消费不丢 | 手动确认模式 `ackMode: MANUAL` | 成功才 ack，失败可重投 |
| 不重复 | 业务幂等（唯一键去重） | Stream 只保证"至少一次" |

```yaml
spring:
  cloud:
    stream:
      kafka:
        binder:
          required-acks: all              # 生产端：副本都确认才算发成功
          min-partition-count: 3
      bindings:
        monitor-in-0:
          consumer:
            ack-mode: MANUAL               # 消费端：手动 ack，不自动假装成功
```

**一个"手动 ack"场景下最容易踩的坑**：消费函数里**异常要自己捕获并按需重投**，
否则抛异常时若开启了重试耗尽策略，消息可能进死信/丢弃。可靠性的铁律不变：
**"不丢"看 broker + 确认，"不重"看业务幂等**——Stream 只是把这三个开关
替你摆了位置，不改变责任边界。

## Function 三形态与多 topic 拓扑（深入）

除了 `Supplier`（只出）与 `Consumer`（只进），还有 `Function`（梯形：进→出），
以及用 `Supplier<Flux<...>>` 做**多路输出**。拓扑决定绑定数量：

```java
// 只进：monitor-in-0
@Bean Consumer<Monitor> consume() { ... }

// 只出：send-out-0
@Bean Supplier<Monitor> send() { ... }

// 进出变换：transform-in-0 → transform-out-0（一个函数对应两个绑定）
@Bean Function<Flux<Monitor>, Flux<Metric>> normalize() {
    return in -> in.map(Monitor::toMetric);
}

// 多输出：用 returnMultiple / orElseThrow 区分 out-0 / out-1
@Bean Function<Flux<Order>, Flux<?>> route() { ... }
```

**拓扑设计的两个实战原则：**

1. **一个 Consumer 方法 = 一个消费绑定**；要么按"topic 数量"对齐方法数，
   要么用 `Function` 加路由（`StreamBridge`）手动指定发往不同 destination。
2. 用 `StreamBridge` 动态发消息更灵活：

   ```java
   StreamBridge.send("monitor-topic", payload);   // 不写死绑定名，运行期指定
   ```

适用度排序：**简单固定拓扑用函数式绑定；动态路由/多 destination 用 StreamBridge**。
纠结时先选绑定量少的，别上来就多路。

## 小结

- Stream 用 Binder 抽象掉具体 MQ，业务只依赖信道/绑定。
- 函数式 Supplier/Consumer + yaml 绑定，group 决定集群消费还是广播。
- 追求解耦可切换用 Stream，追求强控制/性能用原生客户端。

## 延伸阅读

- [Spring Cloud Stream 3.x 版本使用教程及如何整合 RabbitMQ（code84）](https://code84.com/747589.html)——3.x 函数式绑定的上手教程，与本篇函数式演进对照阅读