---
title: JVM 参数与调优
description: 参数分类与查看方式、内存参数体系、G1/ZGC 常用参数、容器环境的内存姿势与调优方法论
level: advanced
---

## 参数的三层前缀

| 前缀 | 性质 | 例子 |
|---|---|---|
| `-` | 标准参数，所有 JVM 保证兼容 | `-server`、`-cp` |
| `-X` | 非标准但事实通用（HotSpot 生态） | `-Xms`、`-Xmx`、`-Xss` |
| `-XX` | 不稳定调优参数，版本可能变 | `-XX:+UseG1GC`、`-XX:MaxGCPauseMillis` |

布尔型 XX 参数用 `+/−` 表示开关：`-XX:+HeapDumpOnOutOfMemoryError` /
`-XX:-UseCompressedOops`。

**查看与对照**（`:=` 表示运行时被改动过/非默认值）：

```bash
java -XX:+PrintFlagsFinal -version | grep -i heap   # 出厂默认值
jcmd <pid> VM.flags                                 # 线上进程实际生效参数
java -Xlog:gc:file=gc.log -jar app.jar              # JDK 9+ 统一日志（替代 PrintGCDetails）
```

## 内存参数体系：预算先算总账

进程内存 ≠ `-Xmx`，总账 = **堆 + 元空间 + 每线程栈 × 线程数 + 直接内存
+ JVM 自身**。逐项参数：

```bash
-Xms4g -Xmx4g                      # 初始堆 = 最大堆：避免运行期扩容抖动与 Full GC
-Xmn1g                             # 新生代（G1 下不建议手设，让 G1 自适应）
-Xss512k                           # 单线程栈；线程数多时总账 = N × Xss
-XX:MetaspaceSize=256m             # 首次触发元空间回收的水位（不是初始大小！）
-XX:MaxMetaspaceSize=512m          # 元空间上限（不设 = 吃本地内存没上限）
-XX:MaxDirectMemorySize=1g         # 堆外直接内存上限
-XX:ReservedCodeCacheSize=256m     # JIT 机器码缓存（JIT 篇）
```

> 经典误区：`MetaspaceSize` 被当"初始大小"调大。它实际是**扩容触发
> GC 的起始水位**——不设时默认很小，动态类多的应用启动期就连环
> Full GC（日志里 `Metadata GC Threshold`），把它调到预期稳态水位
> 一次到位。

## 收集器选型与对应参数

选型逻辑（演进脉络见[垃圾回收](/java/advanced/jvm/03-garbage-collection/)）：

| 场景 | 选择 | 关键参数 |
|---|---|---|
| JDK 8 通用服务 | G1 | `-XX:+UseG1GC` |
| JDK 11+ 默认 | G1（默认，不用设） | 同上微调 |
| 大堆 + 极致延迟 | ZGC | `-XX:+UseZGC`；21 加 `-XX:+ZGenerational` |
| 离线批处理 | Parallel | `-XX:+UseParallelGC` |

G1 三个最有用的旋钮（默认 200ms 停顿目标、堆 45% 触发并发标记）：

```bash
-XX:MaxGCPauseMillis=100           # 软目标：别拍 10ms，G1 靠缩小 Region 集合逼近，太激进会积压
-XX:InitiatingHeapOccupancyPercent=40   # 并发标记触发水位；大堆/分配猛时调低提前规划
-XX:G1ReservePercent=15            # 预留防晋升失败（to-space exhausted）
```

ZGC 的正确期待：停顿恒定亚毫秒，但**吞吐略降**（读屏障成本）、占
用略高——延迟敏感的网关/交易链路才值得，普通服务 G1 足够。

## 容器环境：最容易翻车的三件事

1. **内存限额感知**：JDK 8u191+/10+ 默认 `UseContainerSupport`，
   能识别 cgroup 限额；但**默认只敢用限额的 25%**（`MaxRAMPercentage=25`）
   ——容器给 4G，堆只拿 1G。修复姿势：

   ```bash
   -XX:MaxRAMPercentage=75.0        # 堆拿限额的 75%，留 25% 给元空间/栈/直接内存
   ```

2. **`java -Xmx` 写死不如百分比**：镜像多环境复用时用 percentage，
   配额改了参数跟着变。
3. **OOM Killer 比 OOM 先来**：堆 + 堆外 + 栈 + 元空间总和超过容器
   限额，进程被内核直接杀（`dmesg` 里 `Killed process`），Java 层
   什么异常都没有——排查线索见[线上故障排查](/java/advanced/jvm/08-troubleshooting/)。

## 调优方法论：先测量，再动刀

```mermaid
flowchart LR
    G["定目标<br/>延迟 / 吞吐 / 占用三角"] --> M["收集证据<br/>GC 日志 + 监控"]
    M --> A["定位瓶颈<br/>分配速率 / 晋升速率 / 停顿构成"]
    A --> C["改一个变量"]
    C --> V["压测对比同口径数据"]
    V -->|"达标"| DONE["固化参数"]
    V -->|"没达标"| A

    class G hl
    classDef hl stroke-width:1.5px
```

三条纪律：

1. **多数服务不需要调**：默认 G1 + 合理堆 + 容器百分比，能解决 90%
   问题；先怀疑代码（大对象、缓存无界、同步块过宽）再怀疑 JVM。
2. **一次只改一个变量**，改前改后用同口径压测；凭"感觉快了"不算数。
3. **调优的上游是应用**：分配速率降一半，胜过任何收集器参数——
   对象少的原理见[JIT 与逃逸分析](/java/advanced/jvm/06-jit/)，
   内存账本见[对象布局](/java/advanced/jvm/05-object-layout/)。

## 小结

- 参数三层前缀：`-` 标准、`-X` 半标准、`-XX` 调优；`PrintFlagsFinal`
  与 `jcmd VM.flags` 对照"出厂 vs 实际"。
- 内存总账 = 堆 + 元空间 + 栈 × 线程 + 直接内存；`Xms=Xmx` 抗抖动，
  `MetaspaceSize` 是回收水位不是初始大小。
- G1 三旋钮：停顿目标、并发标记水位、预留比例；ZGC 买的是亚毫秒
  停顿，代价是吞吐。
- 容器里设 `MaxRAMPercentage`，防"默认 25% 太抠"与"总额超限被
  OOM Killer 杀"两头翻车。
- 调优铁律：目标先行、证据说话、一次一变量、应用层优先。
