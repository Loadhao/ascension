---
title: ByteBuf 与引用计数
description: 读写指针分离、池化分配与手动释放：Netty 内存模型的三个关键约定
level: basic
core: true
---

## 读写指针分离：告别 flip

JDK NIO 的 Buffer 一个 flip 搞晕无数人：读写共用 position，切换要
手动翻转。Netty 的 ByteBuf 用**两个独立指针**解决了这个别扭：

```text
+-------------------+------------------+------------------+
| discardable bytes |  readable bytes  |  writable bytes  |
+-------------------+------------------+------------------+
|                   |                  |                  |
0             readerIndex      writerIndex           capacity
```

- 读数据推进 `readerIndex`，写数据推进 `writerIndex`，互不干扰
- `readableBytes()` / `writableBytes()` 随取随用，无需 flip
- `discardReadBytes()` 把已读区回收进可写区（有内存搬移成本，
  别在高频路径滥用）

## 引用计数：堆外内存的手动管理

ByteBuf 常驻**堆外内存**（绕开 GC、直写 socket），Java GC 管不到它，
Netty 用**引用计数**管理生命周期：

- `retain()` 计数 +1，`release()` 计数 -1，归零即归还内存
- 谁最后持有谁释放；传递给下一个 Handler 时所有权随之转移
- **漏 release = 内存泄漏**；多 release = 非法引用计数异常

```java
// SimpleChannelInboundHandler 读完自动 release，最省心
public class Biz extends SimpleChannelInboundHandler<ByteBuf> {
    protected void channelRead0(ChannelHandlerContext ctx, ByteBuf in) {
        // 用 in，无需手动释放
    }
}
// 手动模式：try/finally 里 release 收尾
try { decode(in); } finally { ReferenceCountUtil.release(in); }
```

## 池化：PooledByteBufAllocator

Netty 4.1 起默认**池化分配**：内存按大小分级预先向操作系统申请，
分配/归还走空闲链表（jemalloc 思路），避免高频 ByteBuf 触发的
GC 压力与内存碎片。日常用 `Unpooled` 的是非池化包装——两者API
一致，按需选择即可。

## 常见的坑

- **持有跨线程**：把 ByteBuf 传给异步任务后，EventLoop 侧又 release
  了——所有权必须唯一且明确，跨线程要先 `retain()` 再转交
- **切片共享**：`slice()`/`retain()` 出来的视图与原 Buffer 共享底层
  内存，改一处等于改全部
- **泄漏排查**：`ResourceLeakDetector` 默认 SIMPLE 级采样报告
  「LEAK: ByteBuf.release() was not called」，定位时调到 ADVANCED
  或 PARANOID（性能代价大，只用于排查期）

## 要点备忘

- 双指针取代 flip：读指针写指针各走各的
- 堆外内存靠引用计数管理：漏放泄漏、多放异常，所有权链路要清晰
- 池化是默认：高频小对象分配几乎无 GC 代价
- 泄漏报告不是可有可无的日志——出现就该当 P1 查

## 延伸阅读

- [Netty 官方 · Reference counted objects](https://netty.io/wiki/reference-counted-objects.html)
