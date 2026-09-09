---
title: 配置体系：外部化配置
description: 配置加载优先级、profile 多环境、@ConfigurationProperties 宽松绑定、配置中心与本地配置的博弈
level: intermediate
---

## 外部化：一次构建，处处运行

Spring Boot 的配置哲学是**外部化配置**：构建产物不变，配置随环境注入
——开发/测试/生产的差异收敛到 yml、环境变量与命令行参数里。

## 谁覆盖谁：配置优先级

同一 key 出现在多处时，高优先级覆盖低优先级（**高频考点**，记"越具体
的越强"）：

| 优先级 | 配置来源 |
| --- | --- |
| 高 | 命令行参数（`--server.port=8081`） |
| ↓ | JNDI / Java 系统属性（`-D`） |
| ↓ | **操作系统环境变量**（`SERVER_PORT`，容器化主力） |
| ↓ | `application-{profile}.yml` |
| ↓ | `application.yml` |
| 低 | `@PropertySource` 指定文件、默认值 |

容器化时代这条链简化成三步：**镜像里放 application.yml 默认值 →
K8s ConfigMap 挂环境变量/文件覆盖 → 启动参数兜底**。

## Profile：一套代码多套配置

`application-dev.yml` / `application-prod.yml` 按
`spring.profiles.active` 激活；`---` 分隔符可在单文件内切多段。Bean
级的开关用 `@Profile("prod")`（注解地图见
[常用注解地图](/java/intermediate/spring/08-annotations-map/)）。注意
**激活方式本身也有优先级**：命令行 `--spring.profiles.active=prod` 会
压过 yml 里的设置——CI 里"配置文件写了不生效"多半是这条。

## @ConfigurationProperties：类型安全绑定

`@Value` 适合单个值；成组配置用前缀绑定成对象（写法见
[注解地图](/java/intermediate/spring/08-annotations-map/)），本篇讲深
一层的**宽松绑定**：`app.max-pool-size` / `app.maxPoolSize` /
`APP_MAXPOOLSIZE`（环境变量）绑定到同一个 `maxPoolSize` 字段——kebab-
case 是 yml 里的规范写法，环境变量靠下划线映射。

```java
@ConfigurationProperties(prefix = "app.pool")
@Validated  // 绑定时就能校验（联动校验篇）
public record PoolProps(@NotNull @Min(1) Integer core,
                        @Max(100) Integer max) {}
```

绑定失败的报错发生在启动期——**配置错误在第一时间暴露，而不是半路
NPE**，这是它比 @Value 散装取值强的地方。

## 本地配置 vs 配置中心

| | application.yml | 配置中心（Nacos/Apollo） |
| --- | --- | --- |
| 变更生效 | 重启 | **动态推送，热更新** |
| 灰度/回滚 | 随发布走 | 独立操作 |
| 典型内容 | 连接池、端口等结构配置 | 限流阈值、开关等运营配置 |

两者是**分层覆盖**关系：配置中心的远程配置在优先级上压过本地
application.yml（原理是把远程属性源插到 Environment 前面，机制见
[ApplicationContext](/java/intermediate/spring/07-application-context/)；
集成方式见 [Spring Cloud 配置中心](/java/advanced/springcloud/06-config-center/)）。
热更新的落地是 `@RefreshScope`——不标它，Environment 变了 Bean 里的
字段还是旧值。

## 敏感配置一句

密码/密钥不进 Git：环境变量注入、启动时从 Vault/KMS 取、或 Jasypt
加密后由启动参数给钥匙。yml 里明文密码被扫库工具拖走是真实事故源。

## 小结

- 优先级记"越具体越强"：命令行 > 环境变量 > profile 配置 >
  application.yml；容器化的主战场是环境变量。
- @ConfigurationProperties 宽松绑定 + 启动期校验，成组配置首选；
- 配置中心与本地 yml 是分层覆盖 + 热更新（@RefreshScope）的关系，
  静态结构与动态运营配置各归其位。
