---
title: grep / sed / awk：文本处理三件套
description: grep 过滤、sed 替换编辑流、awk 按列切分统计——各司其职的组合姿势
level: basic
---

日志、配置、CSV 天天在手上，不出 IDE 也能高效处理。三件套的分工很清晰：

| 工具 | 一句话职责 | 典型场景 |
|---|---|---|
| **grep** | 按规则**筛出行** | 在日志里找异常 |
| **sed** | 按规则**改流**（替换/删行/编辑） | 批量替换、提取片段 |
| **awk** | 按规则**切成列并计算** | 取字段、统计求和 |

## grep：只负责"留下哪些行"

```bash
grep 'ERROR' app.log            # 基本匹配
grep -i 'error' app.log         # 忽略大小写
grep -E 'ERROR|WARN' app.log    # -E 扩展正则，多模式
grep -rn 'TODO' ./src/          # -r 递归目录
grep -v 'debug' app.log         # -v 反向（去掉匹配行）
```

管道是标配：`ps aux | grep java`。**grep 只看行内匹配**，不做跨行、不做
替换、不切列。

## sed：逐行编辑流

```bash
sed -n '10,20p' app.log    # -n 静默 + p 打印：只看 10~20 行
sed 's/ERROR/错误/' app.log # s/// 替换每行第一个
sed 's/ERROR/错误/g' app.log # 尾部 g：替换全部
sed -i 's/old/new/g' cfg.txt # -i 原地改（先备份！）
```

默认不改原文件，打印到输出；要改原文件加 `-i`。**sed 是"流式逐行改"**。

## awk：按列计算

```bash
awk '{print $1, $3}' data.txt   # 打印第 1、3 列（默认空白分隔）
awk -F',' '{print $2}' a.csv    # -F 指定分隔符为逗号
awk '{sum += $2} END {print sum}' num.txt  # 累加第 2 列，结束时输出
awk '$3 > 100 {print $1}' stat.txt # 条件过滤整行
```

`$NF` 是最后一列，`$0` 是整行。**awk 的价值在"跨行累计"和"按列取数"**。

## 组合姿势

```bash
# 统计每类错误条数
grep -oE 'ERROR_[A-Z]+' app.log | sort | uniq -c | sort -rn

# 取 CSV 第 2 列大于某值的前 10 行
awk -F',' '$2>500' data.csv | head -10

# 替换并统计
sed 's/GMT/UTC/g' app.log | awk '{print $2}'
```

## 把它们想成"一行一行流过"（深入）

三件套能组合，是因为它们共享同一个心智模型：**输入是逐行流，每行进来现用现丢**。
grep 决定"哪行过"，sed 决定"过的那行改成什么"，awk 决定"过的那行怎么切/统计"。
理解了这点，就不会犯"想跨多行匹配"的错——**工具只看单行**（除非用 `-z`、
`awk` 的 RS 多行模式，那是高级用法）。

把三件套当成流水线上三个各管一道的工人，就能随手搭管道：

```mermaid
flowchart LR
    IN["原始文件<br/>（逐行流入）"] --> G["grep 筛行<br/>留下匹配的行"]
    G --> S["sed 改流<br/>逐行替换/编辑"]
    S --> A["awk 切列统计<br/>取字段/累加"]
    A --> OUT["结果输出"]
    style G fill:#eef3ea
    style S fill:#f5f0e6
    style A fill:#f0eef5
```

**每个工具默认不改原文件、输出到 stdout**，正是"逐行流"才让 `|` 无缝衔接。

**正则三处高发陷阱**：

1. **转义层级**：外层单引号里，`\b`、`\d` 这类 PCRE 写法在 **BSD/Basic grep**
   不一定可用；用 `grep -E`（或 `-P`）才接近 PCRE 语义。看到"匹配不出来"，
   先确认是否少了 `-E`。
2. **sed 的 `s/old/new/` 只替换第一个**：漏写尾部 `g` 是"改了一半"最常见的坑。
3. **锚点 vs 子串**：`grep 'user'` 会命中 `username`；想精确匹配整块要加锚点
   `grep -E '^user$'` 或用词边界。

**`-i` 前的保险**：sed 原地改 `-i` 是**不可逆**的。稳的姿势：

```bash
sed -i.bak 's/old/new/g' cfg.txt   # 先生成 cfg.txt.bak 备份再改
# 或：先跑一遍不写原文件看结果
sed 's/old/new/g' cfg.txt | grep -n 'new' | head
```

## 三件套的排障快查（深入）

| 现象 | 原因 | 对症 |
|---|---|---|
| `grep` 命令直接挂了 | 模式开头是 `-` 被当成参数 | `grep -- '--debug' file` |
| 想找数字但 `\d` 无效 | Basic regex 不支持 `\d` | `grep -E '[0-9]+'` 或 `-P` |
| sed 只改了第一处 | 忘了尾部 `g` | `s/old/new/g` |
| awk 输出的列对不上 | 分隔符其实是制表/多空格 | `awk -F $'\t'` 或 `-F'  +'` |
| CSV 里有引号导致列错位 | 简单 `-F','` 处理不了引号内逗号 | 用 `csvkit`/`python`，别硬上 awk |

**一个把三者串起来诊断大量日志的例子**：

```bash
# 找某时间段里出现最多的 5 类错误码
grep '2026-09-05' access.log \
  | grep -oE '"code":[0-9]+' \
  | sort | uniq -c | sort -rn | head -5
# scope：grep 筛行+抽码 → sort/uniq 计数 → sort -rn 降序 → head 取前 5
```

## 小结

- **grep 筛行、sed 改流、awk 切列统计**，三者职责不重叠。
- 全部遵循"默认不改动输入、输出到 stdout，`-i` 才落地"。
- 真正的杀手锏是**用 `|` 串起来**，一次完成"过滤→转换→统计"。