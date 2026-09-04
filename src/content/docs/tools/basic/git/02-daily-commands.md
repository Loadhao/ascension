---
title: 日常高频命令
description: init/clone、status/diff、add/commit、log/blame 的日常使用与推荐全局配置
level: basic
---

## 新建与获取仓库

```bash
git init                          # 当前目录变成仓库
git clone <url> [目录名]           # 克隆远程仓库
git clone --depth 1 <url>         # 浅克隆，只要最近 1 次提交（大仓救星）
```

## 状态与差异

```bash
git status                        # 当前状态（先看再动，肌肉记忆）
git status -s                     # 精简模式
git diff                          # 工作区 vs 暂存区
git diff --staged                 # 暂存区 vs 最近提交
git diff HEAD                     # 工作区 vs 最近提交
```

## 暂存与提交

```bash
git add <file>                    # 暂存指定文件
git add -p                        # 逐块挑选改动（最被低估的功能）
git commit -m "说明"
git commit --amend                # 修补最近一次提交（还没 push 时用）
```

## 查历史

```bash
git log --oneline --graph         # 精简图形化历史
git log -p <file>                 # 某文件的修改历史
git blame <file>                  # 每一行是谁在哪个提交改的
git show <commit>                 # 查看某次提交的完整改动
```

## 推荐全局配置

```bash
git config --global user.name "你的名字"
git config --global user.email "you@example.com"
git config --global pull.rebase true          # pull 默认 rebase，历史更干净
git config --global push.autoSetupRemote true # push 自动建跟踪，省去 -u
git config --global init.defaultBranch main
git config --global core.autocrlf input       # macOS/Linux；Windows 用 true
git config --global alias.lg "log --oneline --graph --all"
```

## 要点备忘

- 把 `git status` 和 `git log --oneline --graph` 当成「仪表盘」——任何不确定的时刻，先看这两个命令再操作
- 提交粒度：一个提交只做一件事，说明写得能让人不看代码就明白动机
- `--amend` 只能修补**尚未推送**的提交，已推送的历史不要动
