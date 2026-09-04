---
title: 服务通信：OpenFeign 与负载均衡
description: 声明式调用的动态代理原理、Ribbon 退场与 LoadBalancer、常见负载策略、超时重试的边界
level: advanced
---

## 从 RestTemplate 到声明式调用

```java
// 手写版：URL 硬编码、参数拼接、异常处理、负载均衡全要自己来
restTemplate.getForObject("http://order-service/api/order/" + id, Order.class);

// OpenFeign：像调用本地方法一样调远程
@FeignClient(name = "order-service")     // 服务名 = 注册中心里的 key
public interface OrderClient {
    @GetMapping("/api/order/{id}")
    Order getOrder(@PathVariable("id") Long id);
}

@Autowired OrderClient orderClient;     // 注入的是动态代理
Order order = orderClient.getOrder(42L); // 底层发 HTTP
```

接口即契约：注解直接复用 Spring MVC 语义（@GetMapping/@RequestBody），
服务端 Controller 和客户端 Feign 接口甚至可以共用同一个 API 模块。

## 底层：动态代理 + 负载均衡

```mermaid
flowchart TB
    C["orderClient.getOrder(42)"] --> P["JDK 动态代理<br/>（Feign 生成的 $Proxy）"]
    P --> M["解析方法上的注解<br/>拼出 HTTP 请求模板"]
    M --> LB["Spring Cloud LoadBalancer<br/>按服务名选实例"]
    LB --> R["服务列表<br/>（注册中心本地缓存）"]
    LB --> HTTP["HTTP 客户端发送<br/>（默认 JDK HttpURLConnection，可换 OkHttp/Apache）"]
    HTTP --> DECODE["响应反序列化为 Order 对象"]

    style P fill:#f5f0e6
    style LB fill:#f5f0e6
```

与 Java 基础篇反射与注解遥相呼应：**@FeignClient 的本质 = 注解元数据 +
JDK 动态代理 + 注册中心服务发现**——框架三板斧（注解描述意图、代理拦截
调用、注册中心寻址）在这里集齐。

## 负载均衡策略

Ribbon 已进入维护模式，Spring Cloud 官方继任者 LoadBalancer 精简了
策略，常用三种（`ReactorLoadBalancer` 实现类）：

| 策略 | 规则 | 适用 |
|---|---|---|
| RoundRobinLoadBalancer（默认） | 轮询 | 实例配置相近 |
| RandomLoadBalancer | 随机 | 简单兜底 |
| NacosLoadBalancer | **权重 + 同集群优先**（按 Nacos 元数据） | 机房就近 + 灰度权重 |

按权重路由是灰度发布的基础：新版本实例设低权重（Nacos 控制台直接改），
流量先小后大。

自定义策略只需注册一个 Bean：

```java
public class CustomLoadBalancerConfig {
    @Bean
    ReactorLoadBalancer<ServiceInstance> randomLoadBalancer(
            Environment env, LoadBalancerClientFactory factory) {
        String name = env.getProperty(LoadBalancerClientFactory.PROPERTY_NAME);
        return new RandomLoadBalancer(
            factory.getLazyProvider(name, ServiceInstanceListSupplier.class), name);
    }
}
// @LoadBalancerClient(value = "order-service", configuration = CustomLoadBalancerConfig.class)
```

## 超时与重试：调用方的安全带

注册中心篇说过：**服务列表永远有滞后**（下线实例还在列表里）。所以每次
调用都要带超时和重试：

```yaml
spring:
  cloud:
    openfeign:
      client:
        config:
          default:
            connect-timeout: 2000    # 连接超时 2s
            read-timeout: 5000       # 读超时 5s
          order-service:            # 按服务覆盖
            read-timeout: 3000
      okhttp:
        enabled: true               # 换更快的 HTTP 客户端（可选）
```

重试的**幂等约束**是铁律：

| 请求性质 | 可否重试 |
|---|---|
| 查询、删除（幂等） | ✅ |
| 创建订单（非幂等） | ❌ 超时后盲目重试 = 重复下单 |

```java
// 默认 Retryer.NEVER_RETRY；需要时才显式开启，且只对幂等接口
@Bean
public Retryer retryer() {
    return new Retryer.Default(100, TimeUnit.MILLISECONDS, 3);  // 间隔100ms，最多3次
}
```

非幂等接口要安全重试得靠**请求携带唯一业务号 + 服务端去重表**（本地
消息表思想，见分布式事务篇）。

## Feign 整合：日志与降级

```yaml
spring:
  cloud:
    openfeign:
      client:
        config:
          default:
            logger-level: basic     # NONE/BASIC/HEADERS/FULL（FULL 别在生产开）
```

```java
@FeignClient(name = "order-service",
             fallback = OrderClientFallback.class)   // Sentinel 熔断触发时走这里
public interface OrderClient { ... }

@Component
public class OrderClientFallback implements OrderClient {
    @Override
    public Order getOrder(Long id) {
        return Order.degraded(id);   // 降级数据：缓存/默认值/友好提示
    }
}
```

fallback 与 Sentinel/Resilience4j 联动（下一篇展开）：熔断打开后不再
发起真实调用，直接进 fallback——**降级是设计出来的，不是报错兜出来的**。

## 小结

- OpenFeign = 注解契约 + JDK 动态代理 + 注册中心寻址，声明式让远程调用
  退化成本地方法。
- LoadBalancer 接棒 Ribbon，默认轮询，Nacos 策略支持权重灰度。
- 超时重试必配，重试只属于幂等操作；fallback 提前设计，别让用户看堆栈。
