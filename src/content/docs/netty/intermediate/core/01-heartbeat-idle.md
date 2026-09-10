---
title: 心跳保活与连接假死
description: TCP keepalive 为什么不够用：IdleStateHandler 三种空闲检测与假死排查
level: intermediate
core: true
---

## 连接假死：TCP 探测不到的那种死

双方应用早已无法通信（对端进程 hang 死、网络单向中断、NAT 映射
超时回收），但 **TCP 连接状态还是 ESTABLISHED**——内核只看连接
状态不看「能不能真的通信」，这种半死连接会一直占着内存与句柄。

JDK/Netty 开 SO_KEEPALIVE 能让内核探活，但默认 2 小时后才出手，
且只证明「TCP 通」，不证明「应用活着」（进程 hang 死时 keepalive
照样通过）。**应用层心跳才是生产标配**。

## IdleStateHandler：三种空闲各盯一个方向

```java
pipeline().addLast(new IdleStateHandler(60, 30, 0));
//                       读空闲  写空闲  全部空闲（秒）
pipeline().addLast(new HeartbeatHandler());

class HeartbeatHandler extends ChannelDuplexHandler {
    public void userEventTriggered(ChannelHandlerContext ctx,
                                   Object evt) {
        if (evt instanceof IdleStateEvent e) {
            switch (e.state()) {
                case WRITER_IDLE -> ctx.writeAndFlush(PING); // 该发心跳了
                case READER_IDLE -> ctx.close();             // 对端疑似假死
                default -> {}
            }
        }
    }
}
```

- `userEventTriggered` 收到的是**用户事件**，不是数据——空闲本身
  不破坏流水线，由你的 Handler 决定动作
- 探测周期要留冗余：设 60s 心跳就至少容忍 2~3 个周期再判死，
  别让一次网络抖动误杀连接

## 经典分工：客户端 ping、服务端判死

- 客户端：`WRITER_IDLE` 定时发心跳，顺手当「我活着」的证明
- 服务端：`READER_IDLE` 超时没收到任何数据（含心跳）→ close 并
  记录，交给重连逻辑
- 客户端还要配**连接失败重连 + 指数退避**：心跳只负责发现死连接，
  恢复靠重连

## 要点备忘

- 假死 = TCP 状态活着但应用不可达；keepalive 太慢且语义不对
- IdleStateHandler 只产事件：写空闲发 ping、读空闲判死、全空闲兜底
- 误杀比不杀更伤：判死阈值要给足容错周期
- 心跳 + 重连是一对：发现假死靠心跳，恢复服务靠重连退避

## 延伸阅读

- [Netty · IdleStateHandler](https://netty.io/4.1/api/io/netty/handler/timeout/IdleStateHandler.html)
