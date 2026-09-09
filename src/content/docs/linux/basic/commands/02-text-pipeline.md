---
title: 文本处理与管道：grep、sed、awk 三剑客
description: 管道心智、grep 定位、sed 替换、awk 取列统计——日志分析高频命令组合与面试速查
level: basic
core: true
---

"统计日志里访问量前三的 IP""把配置里某个值批量替换掉"——后端面试的 Linux
实操题九成落在**文本处理与管道**上。三剑客分工一句话：**grep 找行、sed 改行、
awk 取列**，管道把它们串成流水线。

## 管道心智：一切皆字节流

Linux 的设计哲学：每个命令只做一件小事，**stdin 进 stdout 出**，用 `|`
把上一条的输出接到下一条的输入。这不是语法糖，是组合复杂能力的根本方式——
与其记一个大而全的命令，不如练熟 5 个小命令的拼装。

```mermaid
flowchart LR
    L["日志文件"] --> G["grep 过滤出目标行"] --> A["awk 取出目标列"] --> S["sort 排序"] --> U["uniq -c 计数"] --> R["sort -rn 取 TopN"]
    class L hl
    classDef hl stroke-width:1.5px
```

## grep：找到你要的行

```bash
grep -E "ERROR|FATAL" app.log      # 扩展正则，多关键词
grep -v "healthcheck" app.log      # -v 反选（排除健康检查噪音）
grep -c "Timeout" app.log          # -c 只数行数
grep -n -C 2 "panic" app.log       # -n 行号，-C 2 前后各 2 行上下文
grep -r "TODO" src/                # -r 递归目录
```

- 记忆锚点：**先过滤再分析**——日志动辄上 GB，任何统计前先用 grep 把数据
  缩小三个量级。
- 高频追问：`grep -E` 与 `grep -F` 区别？-F 按字面匹配（快，不解析正则），
  搜含 `.` `*` 的字符串时用 -F 防误匹配。

## sed：按行编辑

```bash
sed -n '10,20p' app.log            # 只打印 10~20 行（-n 抑制默认输出）
sed 's/127.0.0.1/localhost/g' conf # 全局替换（g = 每行所有匹配）
sed -i.bak 's/port=8080/port=9090/' app.conf  # 原地修改并留备份
sed -n '/START/,/END/p' app.log    # 打印两个标记之间的段
```

- **-i 原地修改是危险操作**：先 `-i.bak` 留备份或先跑一遍不带 -i 预览——
  生产配置文件被 sed 改坏是经典事故。
- 分隔符可换：路径替换用 `s|/usr/bin|/usr/local/bin|g` 免去转义 `/`。

## awk：按列提取与统计

awk 的心智模型是**模式-动作**：对每一行，判断模式、执行动作。

```bash
awk '{print $1}' access.log                    # 打印第一列（默认空格分列）
awk -F: '{print $1, $3}' /etc/passwd           # -F 指定分隔符
awk '$9 == 500 {print $7}' access.log          # 条件过滤：第 9 列状态码为 500
awk 'END {print NR}' access.log                # NR 行号：END 块里就是总行数
awk '{sum += $10} END {print sum/NR}' access.log  # 平均响应体积
```

面试必会的一道综合题——**统计 access.log 里访问量前三的 IP**：

```bash
awk '{print $1}' access.log | sort | uniq -c | sort -rn | head -3
#  取 IP 列 → 排序让相同相邻 → 计数 → 按次数倒序 → 取前 3
```

每一段单独都简单，组合起来就是答案——这题考的不是背命令，是**管道分解思维**。

## 高频追问速答

- **grep/sed/awk 怎么选？** 找内容用 grep，改内容用 sed，要"按列理解结构"
  或做统计用 awk——按输出意图选，不按熟练度选。
- **统计日志 QPS？** 时间戳截到秒（`awk '{print $4}' | cut -d: -f2,3,4`），
  同样走 `sort | uniq -c`，峰值即最大值——和 IP 统计同一套组合拳。
- **管道中间某步很慢怎么排查？** 逐段断开跑（`| head` 快速截断验证上游），
  先确认数据量再谈优化——`wc -l` 看每段行数是最快的定位手段。

## 小结

- 三剑客分工：grep 找行、sed 改行、awk 取列；管道把小命令拼成流水线。
- 经典组合 `awk 取列 | sort | uniq -c | sort -rn | head` 是日志统计的万能骨架。
- 生产纪律：sed -i 先备份，统计前先 grep 缩小数据量。
