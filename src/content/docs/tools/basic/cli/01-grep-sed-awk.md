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

## 小结

- **grep 筛行、sed 改流、awk 切列统计**，三者职责不重叠。
- 全部遵循"默认不改动输入、输出到 stdout，`-i` 才落地"。
- 真正的杀手锏是**用 `|` 串起来**，一次完成"过滤→转换→统计"。