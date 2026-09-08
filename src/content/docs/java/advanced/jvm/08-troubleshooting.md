---
title: 线上故障排查实战
description: CPU 飙高、GC 异常、线程假死三大场景的标准动作链与工具速查（jstack/jstat/arthas）
level: advanced
core: true
---

## 排查的通用框架

所有 JVM 故障排查都是同一套循环：**现象 → 现场 → 证据链 → 归因**。
铁律只有一条：**先留现场再动手**（重启 = 销毁证据）。堆 OOM 的 dump
流程见[运行时数据区](/java/advanced/jvm/02-memory/)，本篇覆盖另外两大
高频场景：CPU 飙高与线程/假死类故障。

## 场景一：CPU 飙高（100% 单核或满核）

标准动作链（四步，10 分钟内定位到代码行）：

```bash
# ① 找到进程
top                        # 假设 1234 号 Java 进程最吃 CPU

# ② 进程内找到线程
top -Hp 1234               # 记下最耗 CPU 的线程号，如 1305

# ③ 线程号转 16 进制（jstack 里 nid 是十六进制）
printf '%x\n' 1305         # → 519

# ④ 抓栈，按 nid 找线程
jstack 1234 | grep -A 30 'nid=0x519'
```

抓到的栈直接指向业务代码行。按栈内容归因速查：

| 栈形态 | 大概率原因 |
|---|---|
| 业务方法自循环 | 死循环 / 大集合全量遍历 / 无界重试 |
| `GC Task` / `G1` 相关线程 | **不是业务问题，是 GC 风暴**——转场景二 |
| `regex.Pattern` / `Matcher` | 正则回溯灾难（嵌套量词 + 长文本） |
| 序列化/加解密/压缩 | 大 payload 频繁序列化，考虑换流式/换算法 |
| `ThreadLocal` / hash 计算 | hashCode 冲突风暴（自定义 key 未正确实现） |

> 抓栈要**连抓三次间隔几秒**对比：栈一直在同一行 = 真死循环；
> 每次不同 = 只是忙，正常计算量大。

## 场景二：GC 异常（频繁 Full GC / 停顿抖动）

先确认是 GC 在吃 CPU，再看是哪一代在反复回收：

```bash
jstat -gcutil <pid> 1000   # 每秒一行：各代使用率 % 与 YGC/FGC 次数耗时
```

| jstat 形态 | 诊断 | 去处 |
|---|---|---|
| O 长期 90%+，FGC 缓慢增长 | 老年代被**常驻对象**塞满：真泄漏 | dump 对比，见下 |
| O 涨 → FGC → 骤降 → 再涨 | 老年代**晋升过快**：大对象/ Survivor 太小 | 查缓存大小、`-Xmn`、Humongous |
| E 剧烈波动 + YGC 频繁但正常 | 分配速率高，**不是故障**是压力 | 优化代码分配（JIT 篇） |
| M（元空间）持续涨到 FGC | 动态类生成失控 | 查 CGLib/反射/脚本引擎 |
| FGC 后 O 不降 | 内存被**持有**且 GC 收不走 | 仍是引用链问题 |

缓慢泄漏的黄金动作：**间隔一段时间抓两次 dump，用 MAT 对比直方图**
（Histogram diff），持续增长的那个类就是嫌疑人。Full GC 日志里的
`Cause` 字段（`Metadata GC Threshold`、`Allocation Failure`、
`Ergonomics`）对照[调优篇](/java/advanced/jvm/07-tuning/)归因。

## 场景三：接口假死 / 线程池打满

现象是超时、拒连，但 CPU 不高——典型**线程都被堵住**。jstack 全景
分析（重点看线程池 worker 的状态）：

```bash
jstack <pid> > stack.txt   # 关注：线程状态 + 锁等待目标 + 线程名
```

| 栈特征 | 诊断 |
|---|---|
| 大量 `BLOCKED`，waiting on monitor <0x…> | **锁竞争/死锁**；jstack 尾部自带 `Found one Java-level deadlock` |
| 大量 `WAITING (on object monitor)`，线程名 `http-nio-xxx-exec-*` | **Tomcat 线程池耗尽**：下游慢（DB/RPC）把线程全占住 |
| 大量 `TIMED_WAITING (parking)`，worker idle 却无新任务 | 队列满被上游拒绝，问题在消费速度 |
| `WAITING` 在连接池 `DruidDataSource.takeLast` 等 | **连接池耗尽**：连接泄漏或慢 SQL |

树状归因：入口线程全 WAITING 在 RPC 调用 → 看下游；全 BLOCKED 在
同一把锁 → 找锁的持有者（`-l` 参数打印 owner）。

## arthas：不用重启的"透视镜"

线上没有预埋工具时，[arthas](https://arthas.aliyun.com)（attach 即用）
把上面多数动作变成一条命令：

| 命令 | 替代的传统动作 |
|---|---|
| `dashboard` | top + jstat 一屏看线程/内存/GC |
| `thread -n 3` / `thread --state BLOCKED` | top -Hp + jstack + 人工 grep |
| `thread -b` | 直接找**死锁/持锁阻塞的源头** |
| `jad 类名` | 确认线上跑的代码版本（部署错包常见坑） |
| `watch 类 方法 '{params,returnObj}' -x 2` | 临时埋点看入参出参 |
| `trace 类 方法 '#cost > 200ms'` | 逐层定位慢在哪一段 |
| `profiler start/stop` | async-profiler 火焰图（CPU 抽样神器） |

## 方法论收束

```mermaid
flowchart LR
    P["现象<br/>告警/超时"] --> E["留现场<br/>栈 + dump + GC 日志"]
    E --> C["证据链<br/>多工具交叉验证"]
    C --> R["归因<br/>代码 / 参数 / 容量"]
    R --> PRE["预案<br/>监控 + 预留现场参数"]

    class PRE hl
    classDef hl stroke-width:1.5px
```

- **常备不留遗憾的启动参数**（零成本）：`HeapDumpOnOutOfMemoryError`、
  GC 日志、`-XX:NativeMemoryTracking=summary`。
- 单一工具会骗人：jstack 一瞬、jstat 一面、日志一线——交叉才有
  证据链。
- 排查的终点不是"这次修好"，是沉淀**预案**：这类问题的监控指标、
  现场采集脚本、处理 SOP。

## 小结

- CPU 飙高四步链：top → top -Hp → printf %x → jstack 按 nid 找栈；
  注意 GC 线程吃 CPU 要转 GC 场景。
- GC 异常先 `jstat -gcutil` 分辨"泄漏 / 晋升快 / 分配猛 / 元空间"，
  泄漏用两次 dump 直方图对比坐实。
- 假死看 jstack 线程状态分布：BLOCKED 找锁、WAITING 找下游慢、
  连接池栈找慢 SQL。
- arthas 让多数动作一条命令化；`thread -b`、`trace`、`profiler`
  是三大高频利器。
