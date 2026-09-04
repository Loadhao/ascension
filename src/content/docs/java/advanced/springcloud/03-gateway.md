---
title: 服务网关 Spring Cloud Gateway
description: 网关的职责边界、路由/断言/过滤器三层模型、WebFlux 与 Netty 为什么快、网关层高频面试题
level: advanced
---

## 为什么需要网关

没有网关时，每个服务都要自己处理：跨域、鉴权、限流、日志、灰度路由……
这些**横切关注点**重复 N 遍。网关把它们收拢到**唯一入口**：

```mermaid
flowchart LR
    U["客户端"] --> GW["Spring Cloud Gateway"]
    GW --> P["统一鉴权 JWT"]
    GW --> L["全局限流"]
    GW --> C["跨域/日志/trace"]
    GW --> G["灰度路由<br/>Header X-Gray=true → v2"]
    P & L & C & G --> S1["订单服务 v1"]
    G -.-> S2["订单服务 v2（灰度）"]

    style GW fill:#f5f0e6
```

它与 Nginx/LVS 的层次差异：LVS 是四层负载（转发 TCP 包）、Nginx 是
七层通用网关（静态资源 + 反代 + 转发），Spring Cloud Gateway 是**离
业务最近的微服务网关**——能用 Java 写过滤器、直接读注册中心做服务发现
级路由、与 Sentinel 联动做业务维度限流。生产常见组合：**外层 Nginx
（TLS 终止、静态资源）→ 内层 Gateway（业务路由与鉴权）**。

## 三层模型：Route / Predicate / Filter

```java
// 配置式（等价于 application.yml 的 spring.cloud.gateway.routes）
@Bean
public RouteLocator routes(RouteLocatorBuilder builder) {
    return builder.routes()
        .route("order-service", r -> r
            .path("/api/order/**")                       // 断言：路径匹配
            .filters(f -> f.stripPrefix(1)                 // 过滤器：去掉 /api 前缀
                            .addRequestHeader("X-Trace", traceId()))
            .uri("lb://order-service"))                   // lb:// = 走注册中心负载均衡
        .build();
}
```

| 层 | 职责 | 例子 |
|---|---|---|
| Route（路由） | 一条转发规则的完整定义 | id + uri + 断言组 + 过滤器组 |
| Predicate（断言） | **要不要匹配这条路由** | Path / Method / Header / Query / 时间段 |
| Filter（过滤器） | 匹配后**怎么加工请求响应** | 改 header、鉴权、限流、重写路径 |

处理模型是个双端过滤器链（Servlet Filter 的响应式版）：

```mermaid
flowchart LR
    REQ["请求"] --> PF1["Pre Filter 1<br/>鉴权/限流"]
    PF1 --> PF2["Pre Filter 2<br/>改写路径"]
    PF2 --> SVC["转发到目标服务<br/>Netty 非阻塞 IO"]
    SVC --> RF2["Post Filter 2<br/>改写响应"]
    RF2 --> RF1["Post Filter 1<br/>记录耗时"]
    RF1 --> RESP["响应"]
```

- **GlobalFilter**：全局生效（鉴权、trace），有序（@Order）。
- **GatewayFilter**：绑定在具体路由上（改路径、重试）。

自定义全局鉴权过滤器（最常见考点）：

```java
@Component
public class AuthGlobalFilter implements GlobalFilter, Ordered {
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String token = exchange.getRequest().getHeaders().getFirst("Authorization");
        if (!JwtUtil.verify(token)) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();     // 直接拒绝，不进链
        }
        return chain.filter(exchange);                        // 放行到下一个过滤器
    }
    @Override
    public int getOrder() { return -100; }   // 越小越先执行（pre 阶段）
}
```

## 为什么是 WebFlux + Netty

网关的本质是**IO 密集**（转发、转发、还是转发），几乎零计算：

| | Servlet/Tomcat | WebFlux/Netty |
|---|---|---|
| 线程模型 | 一请求一线程（200 线程上限） | **少量 EventLoop 线程**，非阻塞多路复用 |
| 万级并发 | 线程耗尽排队 | 少量线程撑住 |
| 代码约束 | 同步阻塞随便写 | **不能阻塞 EventLoop**（不能写 JDBC！） |

代价：过滤器链全链路 `Mono/Flux` 响应式，`ThreadLocal` 失效（上下文要
靠 Reactor Context）——网关里做验证这种纯内存运算没问题，接数据库这种
阻塞操作就是事故。所以网关通常**无状态、无本地存储**，只做"门卫"。

## 与 Zuul 的对比（为什么淘汰它）

| | Zuul 1 | Gateway |
|---|---|---|
| 模型 | Servlet 阻塞，一请求一线程 | Netty + Reactor 非阻塞 |
| 性能 | 一般 | 高吞吐低资源 |
| 长连接 | 弱 | WebSocket 友好 |
| 生态 | 停止演进 | Spring 官方亲儿子 |

## 小结

- 网关收拢横切关注点：鉴权、限流、跨域、灰度，是微服务唯一流量入口。
- 三层模型：断言决定匹配、过滤器决定加工；lb:// 让路由直接对接注册中心。
- 非阻塞模型换吞吐，代价是全链路响应式 + 禁阻塞操作——门卫不能干
  保姆的活。
