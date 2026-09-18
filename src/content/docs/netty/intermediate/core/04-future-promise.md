---
title: Netty 的 Future 与 Promise
description: writeAndFlush 为什么不能立刻确认、ChannelFuture 凭证语义、EventLoop 内 sync 的死锁事故、Promise 可写 Future 可读的分工、与 JUC Future 的对比
level: intermediate
---

[Pipeline](/netty/basic/core/02-channel-pipeline/)篇讲过出站操作沿链
传播，这篇讲出站操作**怎么知道做完没有**——「`writeAndFlush` 返回后
数据发出去了吗」是 Netty 面试的经典陷阱题，答案全在 Future/Promise
这对机制上。

## 第一性：Netty 的一切 I/O 都是异步的

`channel.writeAndFlush(msg)` 把写操作**投递到 EventLoop 的任务队列**
就立刻返回了——此刻数据大概率还在队列里，连 socket 都没碰。返回值
`ChannelFuture` 是一张**结果凭证**：它现在不代表完成，但未来某时刻
一定会变成「成功」或「失败」，凭证上挂着完成时要执行的回调：

```mermaid
flowchart LR
    A["writeAndFlush(msg)<br/>立即返回 ChannelFuture"] -->|"入队"| B["EventLoop 队列"]
    B -->|"出站处理 + 真正写 socket"| C["promise setSuccess / setFailure"]
    C -->|"触发"| D["listener 收到结果"]
```

## ChannelFuture：监听是正道，sync 是事故之源

拿到凭证后有两种等结果的方式：

```java
ChannelFuture f = ctx.writeAndFlush(msg);

// 正道：回调，不阻塞任何线程
f.addListener(future -> {
  if (future.isSuccess()) {
    System.out.println("写出成功");
  } else {
    future.cause().printStackTrace(); // 失败原因在这里
  }
});

// 事故之源：sync() 阻塞当前线程直到完成
f.sync(); // Demo 里图省事可以，生产看场景（见下）
```

`sync()` 的存在感来自官方 Demo（main 线程要等关闭才能退出），于是被
大量初学者搬进 handler——这就是经典事故：**在 EventLoop 线程里
`sync()` 等它自己要执行的任务**，等于「站在收银台前等自己排到自己」，
EventLoop 被自己阻塞，这条线程上的所有连接全部冻结，典型死锁。
记忆口径：**main 线程可以 sync，EventLoop 里永远 addListener**。

## Promise：可写的 Future

Netty 把「读结果」和「写结果」拆成两个接口：

- **`Future`**：只读——检查状态、挂回调；
- **`Promise`**：Future 的子接口，多了 `setSuccess` / `setFailure`——
  由**执行任务的一方**在完成时填结果。

`writeAndFlush` 内部就是：创建一个 `ChannelPromise` → 传给出站链 →
head 写完后按结果 `setSuccess`/`setFailure` → 触发所有 listener。
业务里也能自造 Promise 做「异步流程的完成凭证」——比如把三次异步
操作用 Promise 串起来，谁做完谁 set。

与 JUC 的对比是高频追问：`java.util.concurrent.Future` 只能**阻塞式
`get()`**，没有回调能力；Netty 的 Future 天生支持 listener，这才是
事件驱动框架该有的形态——「阻塞等待」与异步模型天然相克。

## 高频追问

**`sync()` 和 `await()` 什么区别？** 都阻塞等待，差别在失败时：
`await()` 失败**静默**返回 false，不抛异常；`sync()` 会在失败时把
异常**重新抛出**。所以「要感知失败」用 sync，「只等结果不关心成败」
用 await——以及前文结论：都在 EventLoop 外才谈得上选择。

**write 失败了我怎么知道？** 三个入口：写时传的 Promise（自己 set）、
返回的 ChannelFuture 加 listener、以及兜底的
`ChannelFutureListener.CLOSE_ON_FAILURE` 这类现成监听器。什么都不挂，
失败就是静默的——「写入无感知丢失」事故的根源。

**为什么不用 CompletableFuture？** 历史原因（Netty 诞生早）+ 语义
原因：ChannelFuture 绑定 Channel/EventLoop 上下文，listener 默认在
**该 EventLoop 线程**回调，省掉了跨线程同步——这是 CompletableFuture
给不了的绑定语义。

## 小结

- Netty 一切 I/O 异步：`writeAndFlush` 立即返回凭证，数据是否写出
  要看 future 的终态。
- 读结果用 Future（addListener），写结果用 Promise（setSuccess/
  setFailure），JUC Future 只有阻塞 get。
- main 线程可以 sync，EventLoop 里 sync 等自己的任务是死锁；
  await 静默、sync 重抛失败。
- 写失败默认静默，感知失败必须挂 listener 或传自己的 Promise。

## 延伸阅读

- [Netty 官方 Javadoc：ChannelFuture](https://netty.io/4.1/api/io/netty/channel/ChannelFuture.html)
- [Netty 官方 Javadoc：Promise](https://netty.io/4.1/api/io/netty/util/concurrent/Promise.html)
- [Netty 源码导读：AbstractChannel 的 write 流程](https://netty.io/wiki/index.html)
