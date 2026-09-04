---
title: pathlib 与文件 IO
description: Path 对象化路径操作、glob、with 上下文管理、编码纪律
level: intermediate
---

## pathlib：路径是对象，不是字符串

```python
from pathlib import Path

p = Path("/data/logs") / "app.log"    # 用 / 拼路径，跨平台正确
p.name           # 'app.log'
p.stem           # 'app'
p.suffix         # '.log'
p.parent         # Path('/data/logs')
p.exists()       # True/False

home = Path.home()
cfg = home / ".config" / "app.toml"
```

对比 os.path 的 `os.path.join(a, b)` 字符串拼接流：**pathlib 把路径
变成有行为的对象**，IDE 能补全、不用记 30 个 os.path 函数。
`/` 运算符就是拼接——这是魔术方法协议（见
[类与魔术方法](/python/basic/oop/01-class-basics/)）的优雅应用。

## 批量查找与读写

```python
for f in Path("src").rglob("*.py"):          # 递归 glob
    print(f.relative_to("src"))

data = Path("config.json").read_text(encoding="utf-8")   # 小文件一步读
Path("out.txt").write_text("done", encoding="utf-8")

stats = [f.stat().st_size for f in Path("logs").iterdir() if f.is_file()]
```

read_text/write_text 是"小文件一步到位"糖；大文件仍然回到生成器流式
读取（见[迭代器与生成器](/python/basic/func/02-iterators-generators/)）。

## with：资源必须托管

```python
with open("app.log", encoding="utf-8") as f:
    for line in f:            # 文件对象本身是惰性迭代器
        process(line)
# 离开块自动 f.close()——异常路径也保证关闭
```

`with` 的协议是 `__enter__`/`__exit__`：**把"用完必须清理"从纪律
变成语言结构**。finally + close 的手写版能忘，with 忘不了。
数据库连接、锁、临时目录（`tempfile.TemporaryDirectory`）全部适用。

读写模式速查：`r` 读 / `w` 清空写 / `a` 追加 / `x` 独占创建（存在即报错，
防覆盖）/ `b` 二进制。**文本模式永远带 `encoding=`**——不传等于把编码
交给平台默认值赌运气，这是 Windows 上 GBK 乱码的头号来源（见
[字符串与编码](/python/basic/syntax/03-strings/)）。

## 结构化数据读写

```python
import json, csv

# JSON：dumps/loads 走字符串，dump/load 走文件对象
config = json.loads(Path("config.json").read_text(encoding="utf-8"))
Path("out.json").write_text(
    json.dumps(config, ensure_ascii=False, indent=2),   # 中文不转义
    encoding="utf-8",
)

# CSV：别手写 split，引号/转义/换行都有坑
with open("users.csv", newline="", encoding="utf-8") as f:
    for row in csv.DictReader(f):      # 每行是 dict
        print(row["name"])
```

## 小结

- pathlib 用 `/` 拼路径、`rglob` 递归找文件、read_text 一步读小文件。
- 资源打开必用 with：异常路径也保证清理；文本 IO 必带 `encoding="utf-8"`。
- JSON 注意 `ensure_ascii=False`；CSV 用 csv 模块，别手写 split。
