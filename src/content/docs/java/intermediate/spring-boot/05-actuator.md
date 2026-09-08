---
title: Actuator：生产级运维端点
description: health/metrics/loggers/env 核心端点、暴露面收敛与安全、HealthIndicator 自定义、与 Prometheus 的指标对接
level: intermediate
---

## 运维能力的标准出口

Actuator 把"应用还活着吗、健康吗、慢在哪、配置对不对"做成 HTTP/JMX
端点——K8s 探针、Prometheus 抓取、值班排查都从这里拿数据，
spring-boot-actuator 依赖引入即用。

## 核心端点速查

| 端点 | 用途 |
| --- | --- |
| `/actuator/health` | 聚合健康：DB/Redis/磁盘探活 + 自定义 HealthIndicator；K8s liveness/readiness 的靶点 |
| `/actuator/info` | 构建信息、版本（git 构建插件注入） |
| `/actuator/metrics` | JVM 内存/GC、线程池、HTTP 请求耗时分布（Micrometer 坐标系） |
| `/actuator/loggers` | **运行时看/改日志级别**（POST 即改，配合[日志体系](/java/intermediate/log/01-logging-system/)的热调级） |
| `/actuator/env` | 当前生效的属性源与配置值（排查配置覆盖问题，见[配置体系](/java/intermediate/spring-boot/03-configuration/)） |
| `/actuator/beans`、`/mappings` | 容器里有什么 Bean、URL 映射到哪些 Handler |

## 暴露面：默认只开一小半

出于安全考虑，**web 上默认只暴露 health 与 info**，其余默认开在 JMX。
按需收敛式打开：

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,loggers,prometheus
  endpoint:
    health:
      show-details: when-authorized   # 细节别裸奔
  server:
    port: 9090          # 独立管理端口，不随业务端口对外
```

**独立 management 端口**是生产标配：运维端点不随业务端口暴露到公网，
探针与监控走内网专用口。env/beans 这类"信息泄露大户"绝不对外。

## HealthIndicator：健康怎么算

每个集成组件自动贡献一个 Health（DataSource/Redis/MQ 连不上 → DOWN
→ K8s 把 Pod 摘流）。自定义检查实现 `HealthIndicator`：

```java
@Component
public class PaymentChannelHealth implements HealthIndicator {
    public Health health() {
        boolean ok = channel.ping();              // 轻量探活，别打重接口
        return ok ? Health.up().withDetail("channel", "wx").build()
                  : Health.down(new TimeoutException()).build();
    }
}
```

分寸感：**探活要轻**（打重接口会把"下游抖动"放大成"本服务不健康"）；
readiness 与 liveness 语义不同——依赖抖动应该摘流量（readiness），
而不是重启（liveness），K8s 里把两者指向不同探针组。

## 指标落地：Micrometer 到 Prometheus

Actuator 的 metrics 底座是 **Micrometer**（指标界的 SLF4J：一套 API
多种后端）。加 `micrometer-registry-prometheus` 依赖并暴露
`/actuator/prometheus`，Prometheus 定时抓取文本格式指标，Grafana
出图——自定义业务指标用 Counter/Timer：

```java
Timer timer = Timer.builder("order.submit")
        .tag("channel", "wx").register(registry);
timer.record(() -> service.submit(req));          // 耗时 + 计数双收
```

`http.server.requests` 自带按 URI/状态码分位的耗时分布（histogram 打
开才有分位）——**接口性能数字先看它**，再决定要不要去
[排查耗时](/java/advanced/springcloud/08-tracing/)。

## 小结

- Actuator 是运维标准出口：health 给探针、loggers 给热调级、env/beans
  给排查、metrics 给监控。
- 默认暴露面极小是安全设计：独立 management 端口 + include 收敛 +
  show-details 授权可见。
- 健康检查要轻、readiness 与 liveness 语义分开；指标走 Micrometer
  → Prometheus 一条路，业务指标自己埋 Counter/Timer。
