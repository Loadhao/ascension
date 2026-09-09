---
title: 性能排查：CPU、内存、磁盘 IO 与负载
description: load average 的真实含义、free 输出解读、CPU 飙高四步定位法、iostat 关键列与四象限排查表
level: intermediate
core: true
---

"线上 CPU 飙高怎么排查？""负载很高但 CPU 使用率不高，为什么？"——Linux
性能排查是后端面试的必考大题，也是值班时的救命技能。本篇给出一套**先分象限、
再逐层下钻**的排查框架，工具只需五个：top、free、vmstat、iostat、pidstat。

## 先搞懂 load average：它量的不是 CPU

`uptime` 显示的三个数字是 1/5/15 分钟的**平均负载**：可运行状态（R）+
不可中断睡眠（D，通常是 IO 等待）的进程数。它不等于 CPU 使用率——

- load 高 + CPU 低 → 大概率是 **D 状态进程**（NFS 挂载卡死、磁盘 IO 打满）
  在排队——"负载高 CPU 不高"这道经典题的答案；
- load 高 + CPU 也高 → 真的计算忙，走 CPU 排查流程。

经验值：load 持续超过 CPU 核数即需要关注（4 核机器 load 8 就很挤）。

## 四象限排查表

| 症状 | 第一步 | 下钻 |
| --- | --- | --- |
| CPU 高 | `top`（按 P 排序）找进程 → `top -Hp PID` 找线程 | Java 线程 nid 转 16 进制对照 jstack（见 JVM 篇） |
| 内存高 | `free -h` 看可用，`top`（按 M 排序）找进程 | OOM 记录：`dmesg \| grep -i "killed process"` |
| 磁盘 IO 高 | `iostat -x 1` 看 %util、await | `pidstat -d 1` 定位到进程，`lsof -p` 看在写什么 |
| 负载高但 CPU 低 | `vmstat 1` 看 b 列（阻塞进程数）、wa 列（IO 等待 CPU 占比） | 顺藤摸到 IO 或不可中断挂起，转 IO 排查 |

## free 的输出：available 才是真可用

```
              total    used    free   shared  buff/cache   available
Mem:           15Gi    3Gi    8Gi     21Mi       4Gi        11Gi
```

- **free 小 ≠ 内存不足**：buff/cache 是内核拿来缓存磁盘数据的（要用随时
  可回收），看**available**（不开新交换就能给新进程用的量）才是真实水位。
- 这解释了"机器内存全占满了但很健康"——Linux 的策略就是**有内存闲着就
  拿来做缓存**（文件系统篇的页缓存思想）。
- **OOM Killer**：内存真耗尽时内核按 oom_score 挑进程杀掉，`dmesg` 里找
  "Killed process" 是排查服务莫名消失的第一步。

## CPU 飙高的标准四步

1. `top` 找到吃 CPU 的**进程**（按 P 排序）；
2. `top -Hp <PID>` 找到该进程里吃 CPU 的**线程**（记录线程 ID）；
3. Java 应用：`printf '%x' <TID>` 把线程 ID 转十六进制，在 `jstack` 输出里
   按 nid 对位，看线程栈在执行什么（死循环/频繁 GC/锁竞争）；
4. 非 Java 进程：`perf top -p <PID>` 看热点函数。

如果是 **GC 导致的 CPU 高**（jstack 里大量 GC 线程），转内存排查——CPU
症状常常是内存问题的影子。

## iostat 与 vmstat：IO 与整体健康

```bash
iostat -x 1     # %util 接近 100% = 设备饱和；await 是请求平均等待 ms
vmstat 1        # r 列运行队列、b 列阻塞进程、wa 列 CPU 等 IO 的占比
pidstat -d 1    # 按进程看读写量，定位 IO 大户
```

- `iowait`（wa）高说明 CPU 在等 IO——CPU 空转背锅，根因在磁盘；
- await 高 + %util 高 → 存储到瓶颈了：要么换盘（SSD），要么降写入
  （批量/压缩/异步），应用侧手段见各中间件的刷盘策略篇。

## 高频追问速答

- **buff 和 cache 的区别？** buff 缓存块设备元数据/写缓冲，cache 缓存文件
  内容（页缓存）；现代内核两者边界模糊，合算为 buff/cache 即可——面试
  说清"都是可回收的磁盘缓存，看 available"就够。
- **CPU 高但应用 QPS 正常？** 可能是后台任务、日志刷盘、GC 或编译——
  先按四步定位到线程栈再下结论，别急着回滚。
- **怎么找被删了但仍被进程占着的文件？** `lsof | grep deleted`——
  日志文件删了没释放空间（fd 还开着）的经典问题，配合 commands 篇的
  磁盘排查流程。

## 小结

- load 量的是"要跑的+等 IO 的"进程数：负载高 CPU 低 → 查 D 状态与 IO。
- 四象限框架：CPU/内存/IO/负载各自的第一步与下钻路径，工具五个足够。
- 内存看 available 不看 free；CPU 高的下钻终点是线程栈；IO 高先 %util
  后 pidstat 定位进程。
