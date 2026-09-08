---
title: Spring Boot 测试：切片与全量
description: 测试成本阶梯——纯单测、@WebMvcTest/@DataJpaTest 切片、@SpringBootTest 全量，@MockBean 与 Testcontainers
level: intermediate
---

## 成本阶梯：能不起容器就不起

起 Spring 上下文的测试秒级起步，CI 里动辄拖垮流水线。选择测试策略
的本质是**给"真实的信任度"定价**：

| 层级 | 手段 | 起容器？ | 用途 |
| --- | --- | --- | --- |
| 纯单测 | JUnit + Mockito | 否 | Service 逻辑、工具类（大头） |
| Web 切片 | `@WebMvcTest` | 只装 MVC 一角 | Controller 的路由/参数/序列化/异常 |
| 数据切片 | `@DataJpaTest` | 只装 JPA 一角 | Repository SQL、映射 |
| 全量 | `@SpringBootTest` | 是 | 装配正确性、端到端链路 |

原则：**绝大多数行为在纯单测层解决**（[Mockito 篇](/java/intermediate/test/02-mockito/)），
切片验证"框架接线和我的注解写对了"，全量测试只留关键路径——金字塔，
不要冰淇淋筒。

## @WebMvcTest：只测 Controller 这一层

```java
@WebMvcTest(OrderController.class)
class OrderControllerTest {
    @Autowired MockMvc mockMvc;
    @MockBean OrderService service;          // 把容器里的真 Service 换成 mock

    @Test
    void getOrder_returns200WithJson() throws Exception {
        when(service.find(1L)).thenReturn(new Order(1L, PENDING));

        mockMvc.perform(get("/api/orders/1"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.status").value("PENDING"));
    }

    @Test
    void invalidParam_goesToAdvice() throws Exception {
        mockMvc.perform(get("/api/orders/abc"))
               .andExpect(status().isBadRequest());   // 全局异常处理接管
    }
}
```

切片只装载 MVC 相关 Bean（ArgumentResolver、MessageConverter、
[统一异常处理](/java/intermediate/spring/08-exception-advice/)都在），
业务 Bean 一律用 `@MockBean` 顶替——**这正测到
[Spring MVC 请求处理全流程](/java/intermediate/spring/09-springmvc-flow/)里
doDispatch 的第③到第⑧步**，与[请求参数注解](/java/intermediate/spring/12-annotations-map/)
的每个来源（@RequestParam/@PathVariable/@RequestBody）一一对账。

## @DataJpaTest 与 @MockBean 的位置

`@DataJpaTest` 只装配 Repository + 内嵌数据库（默认 H2），每个用例
自动回滚事务；要跑真实 SQL 方言，换 `@AutoConfigureTestDatabase(replace =
NONE)` + Testcontainers。注意 `@MockBean` 会**替换容器里的同名 Bean**
并在测试结束自动还原——同一个 Bean 反复 @MockBean 是性能杀手（每次
重建上下文）。

## 全量 @SpringBootTest

```java
@SpringBootTest(webEnvironment = RANDOM_PORT)
class OrderFlowIT {
    @LocalServerPort int port;
    @Autowired TestRestTemplate rest;

    @Test
    void createAndQuery() {
        var created = rest.postForEntity("/api/orders", req, Order.class);
        assertThat(created.getStatusCode()).isEqualTo(HttpStatus.CREATED);
    }
}
```

`RANDOM_PORT` + `TestRestTemplate` 走完整 HTTP 链路（Filter → 拦截器
→ Servlet）；配 `@ActiveProfiles("test")` 切测试配置。外部依赖
（MySQL/Redis/Kafka）不再用 H2 凑合——**Testcontainers** 起真实
Docker 容器，方言兼容与特性差异无处遁形，CI 里的事实标准。

## 测试数据与配置

- `@TestPropertySource(properties=...)` / `application-test.yml` 覆盖配置；
- `@Sql("/cleanup.sql")` 在用例前后执行脚本造数/清场；
- 时钟、UUID、随机数做成 Bean 注入（测试里换成固定值）——不可测的
  静态调用是设计问题的回声。

## 小结

- 成本阶梯：纯单测占大头，切片测框架接线，@SpringBootTest 只守
  关键路径。
- @WebMvcTest + @MockBean 验证 Controller 与全局异常；@DataJpaTest
  验证 SQL 映射；全量配 Testcontainers 贴近生产。
- @MockBean 会重建上下文，同一 Bean 反复替换是 CI 慢的常见根源。
