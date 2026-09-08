---
title: Mockito：打桩与验证
description: mock 与 spy 的分野、when/thenReturn 打桩、参数匹配器、verify 与 ArgumentCaptor、静态方法 mock
level: intermediate
core: true
---

## 为什么要 mock

单元测试要快、要隔离：被测类依赖的数据库、HTTP、MQ 一律换成"假的"，
只验证**被测类自己的逻辑**——依赖的交互正确性（调没调、调了几次、
参数对不对）用 Mockito 表达。

| | mock | spy |
| --- | --- | --- |
| 本质 | 完全假的实例，方法默认返回 null/0 | **真实对象的壳**，默认走真方法 |
| 打桩 | 全部方法按桩返回 | 只替换关心的方法，其余走真实逻辑 |
| 场景 | 隔离外部依赖 | 想保留真实行为、只改个别方法 |

## 打桩：when 与参数匹配器

```java
@ExtendWith(MockitoExtension.class)     // 启用 @Mock/@InjectMocks 处理
class OrderServiceTest {
    @Mock PaymentClient payment;        // 假依赖
    @InjectMocks OrderService service;  // 被测对象，注入上面的假依赖

    @Test
    void payFailed_marksOrderUnpaid() {
        when(payment.charge(any(Order.class))).thenReturn(PayResult.fail("余额不足"));
        // BDD 风格等价：given(payment.charge(any())).willReturn(fail)

        service.submit(order);

        assertThat(order.getStatus()).isEqualTo(UNPAID);
    }
}
```

匹配器规则：**一个参数用了匹配器，全部都要用**——
`when(m.charge(any(), eq("CNY")))`（eq 是匹配器版的字面量）；裸值和
匹配器混用直接报错，这是 Mockito 第一报错大户。注意 `any()` 默认匹配
一切包括 null，想"非空任意"用 `any(Order.class)` 或 `assertThat` 兜底。

## 验证：调没调、几次、什么参数

```java
verify(payment, times(1)).charge(any());       // 恰好一次
verify(payment, never()).refund(any());        // 从未调用
verify(payment, atLeastOnce()).notifyUser(any());

ArgumentCaptor<Order> captor = forClass(Order.class);
verify(repo).save(captor.capture());           // 捕获实际传入的参数
assertThat(captor.getValue().getStatus()).isEqualTo(PENDING);
```

**verify 断言的是"交互行为"**（依赖怎么被调用），与 `assertThat`
断言"返回值/状态"互补——测试的两个观察面。catch 后再 assert 是
"传给依赖的参数对不对"的唯一手段。

## 静态方法与构造：最后的堡垒

`Mockito.mockStatic(Utility.class)`（5.x 内置支持，老版本要
mockito-inline 依赖）把静态方法也纳入打桩，用完必须 `close()`（放
try-with-resources）；mock final 类/方法 5.x 起默认支持。

克制使用：需要大量 mockStatic，说明代码把逻辑锁死在静态方法里——
**mock 困难是被测代码的设计味道**（依赖藏得太深），修代码比修测试
更治本。这与[构造器注入](/java/intermediate/spring/01-ioc-bean-lifecycle/)
的可测试性论证一脉相承。

## 打桩的坑

- **Strict stubbing**：MockitoExtension 默认检查"打了桩没用上"
  （UnnecessaryStubbingException）——多半是复制来的桩，删掉；
- **spy + when 的误用**：`when(spyList.get(0))` 会先真实执行 get 再
  打桩，可能炸——spy 上改用 `doReturn(x).when(spy).get(0)`；
- **链式桩**：返回流/Optional 的方法要一层层打
  （`when(a.b()).thenReturn(c)` 且 c.mock()），漏一层就是 NPE。

## 小结

- mock 全假隔离依赖，spy 半真保行为；打桩 when/then、验证 verify，
  交互与状态两面都看。
- 匹配器全或无（any/eq），捕获参数用 ArgumentCaptor；mockStatic
  是静态遗留代码的逃生门，用完即关。
- 打桩困难 = 设计问题外溢到测试，先改依赖注入再谈测试。
