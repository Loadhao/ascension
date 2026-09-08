---
title: json 与 csv：数据序列化
description: dumps/loads 与 default 兜底、ensure_ascii 与编码陷阱、csv DictReader、选型边界
level: intermediate
core: true
---

服务间传 JSON、报表导 CSV——序列化是接口的空气。json/csv 都在标准库，
难点不在 API 而在**边界**：自定义类型怎么进 JSON、Excel 打开为什么乱码。

## json：四件套

```python
import json

user = {"name": "Ada", "age": 36, "vip": True, "tags": None}
s = json.dumps(user, ensure_ascii=False, indent=2)   # 对象 → 字符串
back = json.loads(s)                                  # 字符串 → 对象

json.dump(user, f)        # 直接写文件
user = json.load(f)       # 直接读文件
```

Python 类型到 JSON 的映射是固定表：dict→object、list→array、
str/int/float/bool/None 一一对应。**set、datetime、自定义类都不在表里**：

```python
from datetime import datetime

json.dumps({"t": datetime.now()})
# TypeError: Object of type datetime is not JSON serializable

json.dumps({"t": datetime.now()}, default=str)   # 兜底：不认识的一律 str()
```

`default` 回调处理"不认识"的对象；反向用 `object_hook` 在 loads 时把 dict
提升为自定义类。但手写转换很快失控——**结构化校验和类型转换是
[Pydantic](/python/intermediate/libs/02-pydantic/) 的主场**，json 模块只
负责原始编解码。

## 两个编码陷阱

```python
json.dumps({"名": "字"})                        # '{"\\u540d": "\\u5b57"}'
json.dumps({"名": "字"}, ensure_ascii=False)    # '{"名": "字"}'
```

- **ensure_ascii=False** 才输出真实中文，日志和文件里才可读；
- 读写文件永远显式 `encoding="utf-8"`——Windows 默认 GBK，跨机器必炸
  （编码纪律同[字符串与编码](/python/basic/syntax/03-strings/)）。

## csv：面向行的表格

```python
import csv

with open("report.csv", "w", newline="", encoding="utf-8") as f:
    w = csv.writer(f)
    w.writerow(["name", "amount"])
    w.writerows(rows)

with open("report.csv", encoding="utf-8") as f:
    for row in csv.DictReader(f):      # 每行一个 dict，按表头取值
        print(row["name"])
```

DictReader/DictWriter 用表头做键，比下标可读得多。写文件必须
`newline=""`——csv 模块自己管理换行，否则 Windows 下出空行。
**Excel 直接打开中文乱码**是 utf-8 无 BOM 所致：给 Excel 用的文件用
`utf-8-sig` 编码写出。

## 边界之外

标准库还有 `tomllib`（读 TOML，pyproject.toml 就是这个格式）。选型一句话：
**机器之间 JSON，人看的表格 CSV，人写的配置 TOML/YAML**。数据量一大就
都该退位给 pandas/Arrow——按行读的内存友好性是 csv 模块仅剩的长处。

## 小结

- dumps/loads 够用；自定义类型用 default 兜底，认真校验交给 pydantic。
- ensure_ascii=False + 显式 utf-8 是中文环境的两行铁律。
- csv 用 DictReader 按表头取值，写文件 newline=""，给 Excel 用 utf-8-sig。
