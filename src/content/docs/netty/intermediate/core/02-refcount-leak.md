---
title: ByteBuf 泄漏排查
description: 引用计数失衡的定位路径：LeakDetector 分级、常见泄漏姿势与排查纪律
level: intermediate
core: true
---

## 为什么泄漏值得单独一篇

ByteBuf 走堆外内存、靠引用计数手动归还（见
[ByteBuf 与引用计数](/netty/basic/core/03-bytebuf/)）。堆内对象泄漏
有 GC 日志和 heap dump 兜底，堆外泄漏的表象却是——**堆很安静，
Direct buffer memory 缓慢上涨，最后 OOM**。没建立排查方法的团队
往往靠重启续命。

## 先认识 ResourceLeakDetector

Netty 内建泄漏检测：用**弱引用 + 采样**追踪被分配却未释放的 Buffer，
在它被 GC 后仍未 release 时打印报告。四档力度：

| 级别      | 行为                          | 用途        |
| ------- | ----------------------------- | --------- |
| DISABLED | 关闭                            | 不推荐       |
| SIMPLE  | 采样约 1/128，报告 LEAK 日志          | 生产默认      |
| ADVANCED | 采样同上，额外记录**分配处调用栈**           | 排查期首选     |
| PARANOID | 全量检测，性能损失大                    | 测试环境抓现行   |

```bash
-Dio.netty.leakDetection.level=ADVANCED
```

报告长这样：`LEAK: ByteBuf.release() was not called before it's
garbage-collected. ... Recent access records:`——**下面的访问栈就是
案发现场**，看它最后被谁持有、在哪读取后就没了下文。

## 常见泄漏姿势对照排查

| 姿势                         | 修复                       |
| -------------------------- | ------------------------ |
| 自定义入站 Handler 只读不放         | 换 SimpleChannelInboundHandler 或 finally 里 release |
| ByteBuf 丢给异步线程池后两边都不管      | 转交前 retain，约定唯一释放方       |
| 触发异常分支提前 return，绕过释放代码      | try/finally 包住所有权终点      |
| ctx.write 后忘了 flush 的场景滥用  | 明确 write 与所有权的关系，不必留引用   |
| tail 侧节点缓存消息做重试，缓存的就是 ByteBuf | 拷出 byte[] 或在重试期 retain/释放成对 |

## 排查纪律

1. 出现 LEAK 日志先别急着加内存——那是缓冲了症状
2. 生产开 SIMPLE 当哨兵，复现期切 ADVANCED 拿分配栈
3. 评审自定义 Handler 时固定问一句：**这个消息的所有权最终归谁、
   在哪一行释放**
4. 压测是照妖镜：泄漏类问题在流量模型下几小时就现形，上线前跑够时长

## 要点备忘

- 堆外泄漏不走 GC 报警，LeakDetector 是唯一的内建哨兵
- ADVANCED 级的「Recent access records」就是断点的调用栈
- 泄漏九成出在所有权约定不清：转交接手要 retain，终点释放要 finally
- 测试环境敢开 PARANOID，生产只留 SIMPLE 采样

## 延伸阅读

- [Netty · Reference counted objects（释放约定）](https://netty.io/wiki/reference-counted-objects.html)
