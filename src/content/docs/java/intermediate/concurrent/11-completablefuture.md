---
title: CompletableFuture 异步编排
description: 从 Future 的阻塞之痛到 CF 的声明式编排——创建与默认线程池、转换组合、异常传播、allOf 聚合与超时兜底
level: intermediate
---

## Future 的痛：能拿结果，但不能编排

JDK 5 的 `Future` 只解决"异步提交 + 取结果"，取结果只有 `get()` **阻塞
等**或轮询 `isDone()`——多个异步任务之间没有组合、没有回调、没有
异常传播，异步了还要在那干等，等于没异步。

`CompletableFuture`（JDK 8）把"任务完成后的下一步"变成**声明式回调
链**：结果在任务间自动流转，线程只做计算不做等待。

## 创建：先记住默认线程池的坑

```java
CompletableFuture<String> cf =
        CompletableFuture.supplyAsync(() -> queryRpc(id));   // 有返回值
CompletableFuture<Void>  cf2 =
        CompletableFuture.runAsync(() -> sendNotify());      // 无返回值
```

不传 executor 时跑在 **`ForkJoinPool.commonPool()`**（与
[parallelStream 同源](/java/intermediate/stream/01-stream-principle/)），
并行度 = 核数 - 1：**IO 密集任务共享它会把 CPU 密集任务饿死**。
生产铁律——**传自己的线程池**：

```java
CompletableFuture.supplyAsync(() -> queryRpc(id), rpcPool);
```

## 编排三板斧：转换、衔接、合并

| API | 签名直觉 | 说明 |
|---|---|---|
| `thenApply` | `T → U` | 同步转换结果，同一数据流 |
| `thenCompose` | `T → CompletableFuture<U>` | 衔接**下一个异步任务**（flatMap），避免嵌套 CF |
| `thenCombine` | `(T, U) → R` | 两个独立任务都完成后合并 |
| `thenAccept/thenRun` | 消费结果 / 只执行动作 | 链尾收口 |

`thenApply` vs `thenCompose` 的区别就是 map vs flatMap——返回值本身
就是异步任务时用 Compose，否则会得到 `CF<CF<U>>` 的套娃。

```java
// 下单流程：查用户 → 衔接查购物车（异步） → 与库存异步任务合并
CompletableFuture<Order> order =
    CompletableFuture.supplyAsync(() -> userRpc.query(uid), rpcPool)
        .thenCompose(user -> CompletableFuture.supplyAsync(
                () -> cartRpc.query(user), rpcPool))
        .thenCombine(stockFuture, (cart, stock) -> createOrder(cart, stock));
```

**Async 后缀**（`thenApplyAsync`）决定"这一步在哪个线程跑"：不带 =
回调可能在上一步完成或调用线程里就近执行；带 = 强制丢线程池。需要
线程隔离时显式加。

## 异常传播与兜底

CF 的异常沿链路**向下游传染**（像异常版的流水线），直到被处理函数
接住：

```java
supplyAsync(() -> risky())
    .exceptionally(ex -> fallbackValue())            // 换个兜底值，链继续
    .handle((value, ex) -> ex == null ? value : recover(ex));  // 正常/异常都能进来
```

`exceptionally` 只在异常时生效；`handle`/`whenComplete` 无论成败都回调
（区别：handle 能改结果，whenComplete 只是旁观）。**没人接的异常会
被静默吞进未完成状态**——链尾不加兜底，出问题连日志都没有。

## 多任务聚合与超时

```java
// allOf：等全员（返回值是 Void，结果要自己从各 CF 里取）
CompletableFuture.allOf(priceF, stockF, promoF).join();

// anyOf：任一完成即返回（对冲/竞速）
CompletableFuture.anyOf(mainF, backupF);

// 超时兜底（JDK 9+）
priceF.orTimeout(200, TimeUnit.MILLISECONDS)
      .completeOnTimeout(DEFAULT_PRICE, 200, TimeUnit.MILLISECONDS);
```

聚合多个下游是 CF 最经典的实战形态：三个 RPC 并行，总耗时 = 最慢
那个而非三者之和（对比串行 3 倍）；任何一个抛异常，`allOf().join()`
处统一炸出。

## 心法清单

- **异步任务必须传自定义线程池**，commonPool 只留给真·CPU 计算。
- **不阻塞是灵魂**：链尾 `join/get` 尽量放在最外层聚合点，中途不 get。
- **上下文会丢**：切了线程，`ThreadLocal` 里的 TraceId/登录态带不过去
  ——用 TransmittableThreadLocal 或显式传参（阿里开源 TTL 的存在
  就是为此）。
- 虚拟线程时代（[Java 21](/java/intermediate/version/04-java18-21/)）
  简单并发直接"每任务一线程"，但**需要编排/聚合/竞速时 CF 仍是
  正解**——它与线程模型正交。

## 小结

- Future 只能阻塞取结果；CompletableFuture 把"完成后干什么"声明成
  回调链，任务并行、结果自动流转。
- 三板斧：Apply（转换）、Compose（衔接异步，防套娃）、Combine（合并
  双任务）；异常沿链传播，链尾必须有人兜底。
- 生产三铁律：自定义线程池、中途不阻塞、ThreadLocal 上下文显式
  传递。
