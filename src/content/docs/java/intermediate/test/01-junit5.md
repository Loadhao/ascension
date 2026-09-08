---
title: JUnit 5：生命周期与参数化
description: 三层架构拆分、执行顺序与生命周期钩子、AssertJ 流式断言、参数化测试与异常断言
level: intermediate
core: true
---

## 三层架构：API、Engine、Platform

JUnit 5 拆成三块：`junit-jupiter-api`（写测试用）+ Jupiter Engine
（执行实现）+ Platform（统一跑各类引擎——Jupiter/Vintage/Spock 都能
挂上来）。**Vintage 引擎让 JUnit 4 的老用例混跑**，迁移期常客。

## 生命周期钩子

| 注解 | 时机 | 典型用途 |
| --- | --- | --- |
| `@BeforeAll` | 全类一次（**必须 static**） | 纯静态准备、昂贵资源 |
| `@BeforeEach` | **每个测试方法前** | 每个用例的新鲜夹具 |
| `@AfterEach` / `@AfterAll` | 对称收尾 | 清理、连接关闭 |
| `@Test` / `@DisplayName` | 用例本体 + 可读名 | — |

默认每个测试方法**新建一个测试类实例**（隔离用例间的实例状态）；想
让 @BeforeEach 少跑、用例间共享实例，加 `@TestInstance(PER_CLASS)`——
这时 @BeforeAll 不再要求 static。用例间**永远不要有隐式执行顺序依赖**，
真要排序用 `@TestMethodOrder`，但先想想是不是设计有问题。

## 断言：用 AssertJ 的流式姿势

JUnit 原生断言 `assertEquals(expected, actual)` 够用但难读难链；
AssertJ 的 `assertThat` 是事实标准：

```java
assertThat(list).filteredOn(u -> u.getAge() > 18)
        .extracting(User::getName)
        .containsExactlyInAnyOrder("tom", "jerry");

assertThat(user).as("校验默认值")
        .satisfies(u -> { assertThat(u.getAge()).isPositive(); });
```

失败的提示信息自动展开集合内容与差异——排障效率是原生的数倍。

## 异常断言与超时

```java
InvalidUserException ex = assertThrows(InvalidUserException.class,
        () -> service.register(null));
assertThat(ex.getMessage()).contains("username");
```

`assertThrows` 返回异常对象可以继续断言细节；替代老写法
`@Test(expected = ...)`（后者无法断言异常内容）。

## 参数化测试：一份数据一列用例

```java
@ParameterizedTest
@CsvSource({"1, 1, 2", "2, 3, 5", "0, 0, 0"})
void add(int a, int b, int expected) {
    assertThat(calc.add(a, b)).isEqualTo(expected);
}

@ParameterizedTest
@MethodSource("illegalNames")
void rejectBadName(String name) { ... }
```

`@ValueSource`（单参）、`@CsvSource`（多参字面量）、`@MethodSource`
（工厂方法供复杂对象）。参数化是消灭"复制粘贴测试方法"的第一利器。

## 好测试的形状

- **一个用例只断言一个行为**，名字说清"什么条件 → 什么结果"；
- **不依赖执行顺序、不依赖外部状态**（网络/时钟/随机用注入替代）；
- **测行为不测实现**——断言返回值与协作交互（Mockito 的 verify），
  而不是断言内部字段（私有字段反射测试是自欺）。
- 与 Mock 隔离依赖的配合见[Mockito 打桩](/java/intermediate/test/02-mockito/)；
  起容器测试的成本阶梯见[Spring Boot 测试](/java/intermediate/test/03-springboot-test/)。

## 小结

- 生命周期：@BeforeAll 一次（static，或 PER_CLASS 实例模式）、
  @BeforeEach 每例；用例间默认实例隔离。
- 断言选 AssertJ 流式，异常用 assertThrows 拿对象继续断言。
- 参数化测试消灭复制粘贴；好测试测行为、无顺序依赖。
