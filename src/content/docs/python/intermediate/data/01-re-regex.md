---
title: re：正则表达式
description: match/search/findall 的区别、分组与命名组、贪婪与非贪婪、编译与 VERBOSE
level: intermediate
---

文本处理的另一半基本功。Python 的 `re` 模块是 PCRE 风格，Java 程序员上手
几乎零成本，差异主要在 **API 形态**：顶层函数直接可用，复杂模式可预编译
成对象复用。

## 四个入口函数

```python
import re

re.match(r"\d+", "42abc")     # 从**开头**匹配，Match 或 None
re.search(r"\d+", "abc42")    # 任意位置找**第一个**，Match 或 None
re.findall(r"\d+", "a1b22")   # 所有匹配 → ['1', '22']
re.sub(r"\s+", " ", s)        # 替换（对应 Java 的 replaceAll）
```

最容易踩的坑：`match` 只锚定开头，不是全串匹配——要"完全等于"得用
`re.fullmatch`。search/match 的返回值是 **Match 对象**，按组取值：

```python
m = re.search(r"(\d{4})-(\d{2})", "发布于 2026-09")
m.group(0)     # '2026-09'   整个匹配
m.group(1)     # '2026'      第一个括号
m.groups()     # ('2026', '09')
```

## 命名组：可读性是生命线

```python
pattern = r"(?P<year>\d{4})-(?P<month>\d{2})-(?P<day>\d{2})"
m = re.search(pattern, "2026-09-08")
m.group("month")        # '09'
m.groupdict()           # {'year': '2026', 'month': '09', 'day': '08'}
```

`findall` 遇到分组返回的是**组**而不是整体：一个组 → 字符串列表，多个组
→ 元组列表——这是 findall 的第二大坑。命名组让规则和取值都有名字，排查
日志解析 bug 时省一半时间。

## 贪婪与非贪婪

`*`、`+` 默认**贪婪**——吃到不能再吃为止：

```python
re.search(r"<.*>", "<a><b>").group()    # '<a><b>'   整段吞掉
re.search(r"<.*?>", "<a><b>").group()   # '<a>'      加 ? 转非贪婪
```

但解析 HTML 这类嵌套结构，正则永远写不对（非贪婪只解决最浅层），该上
HTML 解析器。正则的适用边界：**平铺模式的提取与校验**。

## 编译与 VERBOSE 模式

```python
import re

LOG_LINE = re.compile(r"""
    (?P<ts>\d{4}-\d{2}-\d{2}\ \d{2}:\d{2}:\d{2})   # 时间戳
    \s+\[(?P<level>[A-Z]+)\]                        # [INFO]
    \s+(?P<msg>.*)                                  # 消息体
""", re.VERBOSE)

m = LOG_LINE.match("2026-09-08 10:00:01 [INFO] started")
m.group("level")     # 'INFO'

for m in LOG_LINE.finditer(log_text):    # 迭代器逐条产出 Match
    print(m.group("level"), m.group("msg"))
```

循环里用的模式**预编译成模块级常量**；复杂模式用 `re.VERBOSE` 允许换行
和 `#` 注释——正则是写给半年后的自己读的。原始字符串 `r"..."` 是 Python
特有纪律：让 `\d` 原样到达正则引擎，免去 `\\d` 双重转义。

## 小结

- match 锚开头、search 找首个、findall 收全部、sub 做替换；完全匹配用 fullmatch。
- 命名组 `(?P<name>...)` 让提取有名字；findall 返回的是组不是整体。
- 贪婪是默认，`?` 转非贪婪；嵌套结构交给解析器；循环用预编译 + VERBOSE。
