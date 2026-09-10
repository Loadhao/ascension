---
title: Dubbo 架构与 SPI
description: 五角色三角、一次调用的旅程、自适应 SPI：Dubbo 扩展性的根基
level: advanced
core: true
---

## 角色三角：Registry 是路标，不是导游

```mermaid
flowchart LR
    C[Consumer] -- 1.订阅 --> R[(注册中心)]
    P[Provider] -- 1.注册 --> R
    R -- 2.地址变更推送 --> C
    C -- 3.直连调用（Dubbo 协议） --> P
    C -. 4.统计上报 .-> M[Monitor]
    P -. 4.统计上报 .-> M
```

注册中心**只管地址簿**（注册/订阅/推送变更），不参与调用——
注册中心全挂了，双方拿着本地缓存的地址照常通信。这一点与
「注册中心是调用中介」的直觉相反，也是高可用设计的题眼
（注册中心选型对比见
[注册中心](/java/advanced/springcloud/02-registry/)）。

## 一次调用的旅程

完整的分层链路（Proxy → Cluster → Protocol → Remoting →
Transport → Serialize）与四件套细节已在
[RPC 原理](/distributed/intermediate/governance/01-rpc-principles/)
拆解过，本篇补两块那篇没展开的：**SPI 与治理**。

## SPI：Dubbo 可扩展性的灵魂

JDK SPI 一次性实例化所有实现、拿不到「按名取一个」。Dubbo SPI
按 key 加载单个实现，再把扩展点织进框架每一层：

```java
// 协议层默认实现可被同名 key 替换：dubbo / triple / grpc
Protocol protocol = ExtensionLoader
    .getExtensionLoader(Protocol.class)
    .getAdaptiveExtension();       // 自适应扩展
```

- **自适应扩展（@Adaptive）**：运行时按 URL 参数决定用哪个实现——
  URL 是 Dubbo 的全局总线，注册地址、协议、序列化方式全在它身上
- **扩展实现靠约定**：`META-INF/dubbo/接口全限定名` 文件里
  `key=实现类`，与 Spring 的「约定优于配置」异曲同工
- 理解 SPI 才能看懂 Dubbo 的源码跳转：每一层的实现都是可替换的
  扩展点，框架只做装配

## 与 Spring Cloud 的体系对比

| 维度     | Dubbo                     | Spring Cloud（互链本站系列）        |
| ------ | ------------------------- | ---------------------------- |
| 定位     | RPC 框架内核 + 治理 SPI       | 微服务全家桶（网关/配置/熔断各组件）     |
| 通信     | 长连接 + 二进制协议，性能高      | OpenFeign 走 HTTP，通用性好（见 [OpenFeign](/java/advanced/springcloud/04-openfeign-loadbalancer/)） |
| 路线     | 接口级契约，代码侵入低          | 生态丰富、社区组件多            |
| 融合     | Dubbo3 支持应用级发现与 Triple 协议 | Spring Cloud Alibaba 双栈兼容 |

选型口径：**内部高频调用、性能敏感选 Dubbo；异构多语言、生态
整合选 Spring Cloud**；二者也可以共存（网关对外 HTTP、对内 Dubbo）。

## 要点备忘

- 注册中心只是地址簿，故障不阻断存量调用——本地缓存兜底
- Dubbo SPI 按 key 取实现 + @Adaptive 运行时决策，URL 是总线
- Dubbo3 把接口级发现升级为应用级发现：注册数据量降一个数量级
- 协议长连接 + 二进制序列化是性能优势的来源，跨语言用 Triple

## 延伸阅读

- [Dubbo 官方文档 · 框架设计（SPI 与分层）](https://cn.dubbo.apache.org/zh-cn/overview/reference/)
