---
title: Shell 脚本
description: Bash 脚本核心语法、变量与控制流、常用脚本范式与排错技巧
level: intermediate
---

## 为什么要写 Shell 脚本

Shell 脚本 = 把一串命令固化下来，可重复、可定时执行，是运维自动化的第一层。
它不适合写大逻辑（缺类型、难调试），但**做"胶水"极强**：串命令、批处理、
定时任务、环境初始化都是主场。

## 脚本基本骨架

```bash
#!/usr/bin/env bash
set -euo pipefail   # 严格模式：遇错退出、未定义变量报错、管道失败传播

name="${1:-world}"  # 取参数，默认 world
echo "Hello, $name"
```

- `#!/usr/bin/env bash`（shebang）：指定解释器，跨环境更稳。
- `set -euo pipefail`：脚本健壮性的第一道防线，强烈建议默认加。

## 变量与控制流

```bash
# 变量（注意：= 两边不能有空格）
count=5
path="/data/logs"
echo "count=$count, path=$path"

# 命令替换
files=$(ls /data)          # 或 files=`ls /data`

# 分支
if [ "$count" -gt 3 ]; then
  echo ">3"
elif [ "$count" -eq 3 ]; then
  echo "=3"
else
  echo "<3"
fi

# 循环
for f in *.log; do
  echo "$f"
done

while read line; do
  echo "$line"
done < input.txt
```

## 参数与退出码

```bash
$0  $1  $2 ...   # 脚本名、第 1、第 2 个参数
$#               # 参数个数
$@               # 所有参数（各自独立）
$?               # 上一条命令退出码（0=成功）
```

**退出码约定**：`0` 表示成功，非 `0` 表示失败。脚本最后用 `exit 0` /
`exit 1` 显式告知调用方成败，配合 `set -e` 才能被外部正确捕获。

## 常见范式

```bash
# 1. 遍历并重命名
for f in *.txt; do mv "$f" "${f%.txt}.md"; done

# 2. 逐行读文件
cat list.txt | while read host; do ssh "$host" "uptime"; done

# 3. 条件判断文件存在
if [ -f config.ini ]; then source config.ini; fi

# 4. 日志带时间戳
log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }
```

## 排错要点

- `bash -x script.sh` 逐步打印执行过程，是排错神器。
- `shellcheck script.sh` 静态检查，能抓大量低级 bug。
- 记得给变量加双引号 `"$var"`，否则含空格/空值会出错。

## 小结

- 脚本是运维自动化的胶水，严格模式 `set -euo pipefail` 是标配。
- 核心语法：变量、if/for/while、参数、退出码。
- 排错靠 `bash -x` 和 `shellcheck`。

## 延伸阅读

- [ShellCheck 官方文档](https://www.shellcheck.net/)