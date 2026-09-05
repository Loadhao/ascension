---
title: 终端效率
description: 终端生产力：滚动历史、快捷编辑、别名、复用与常用工作流
level: basic
---

## 终端是命令行的"握力"

终端（shell + 配置）熟练度直接影响所有 CLI 操作的速度。高手和新手的差距，
往往不是"知道多少命令"，而是"快捷键和复用机制用得多溜"。

## 行编辑快捷键（Emacs 风格，bash/zsh 通用）

| 快捷键 | 作用 |
|---|---|
| `Ctrl+A` / `Ctrl+E` | 行首 / 行尾 |
| `Ctrl+K` / `Ctrl+U` | 删到行尾 / 行首 |
| `Ctrl+W` | 删前一个词 |
| `Ctrl+R` | 反向搜索历史（神器） |
| `Ctrl+L` | 清屏（等价 clear） |
| `Alt+B` / `Alt+F` | 按词后退 / 前进 |

## 历史复用

```bash
history            # 列出历史
!!                 # 重复上一条
!$                 # 上一条的最后一个参数
Ctrl+R 关键词      # 增量搜索历史命令
```

`Ctrl+R` 是性价比最高的一个：输入几个字符就能召回很久以前的命令，避免重新
敲一遍长命令。

## 别名（alias）

把高频长命令缩短：

```bash
alias g='git'
alias gs='git status'
alias ll='ls -lah'
alias lg='ls -la | grep'
```

写入 `~/.bashrc` 或 `~/.zshrc` 持久化。**原则：经常重复的长命令都值得起个别名。**

## 复用与工作流

| 技巧 | 作用 |
|---|---|
| `$(...)` 命令替换 | 把命令输出当参数 |
| `xargs` | 把标准输入转成命令参数 |
| 管道组合 `\|` | 前一命令输出 → 后一命令输入 |
| 重定向 `>` `>>` | 输出写文件 / 追加 |

```bash
# 经典组合
ps aux | grep nginx | grep -v grep | awk '{print $2}' | xargs kill
find . -name "*.log" | xargs grep -l "ERROR"
```

## 小结

- 行编辑快捷键（尤其 Ctrl+R/Ctrl+A/Ctrl+E）是终端提速的基本功。
- alias 消除重复长命令，历史复用避免重复劳动。
- 学会命令替换、xargs、管道，把命令"接"起来。

## 延伸阅读

- [Bash 快捷键速查](https://www.gnu.org/software/bash/manual/)