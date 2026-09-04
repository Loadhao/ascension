---
title: dataclass 与 __slots__
description: 装饰器生成样板代码、field 与 default_factory、frozen 不可变、slots 省内存
level: basic
---

## dataclass：把样板代码交给装饰器

3.7 起标准库 `dataclasses`，一个装饰器生成 `__init__`/`__repr__`/`__eq__`
全套：

```python
from dataclasses import dataclass, field

@dataclass
class User:
    name: str
    email: str
    tags: list[str] = field(default_factory=list)   # 可变默认值的官方解法

u = User("ada", "ada@example.com")
repr(u)            # User(name='ada', email='ada@example.com', tags=[])
u == User("ada", "ada@example.com")   # True：自动按字段相等
```

对比[魔术方法](/python/basic/oop/01-class-basics/)那版手写 Money——
`__init__`、`__repr__`、`__eq__` 三个方法的样板全省。注意
`tags: list = []` 在 dataclass 里会被**直接报错拒绝**（ValueError），
必须用 `field(default_factory=list)`——把最常见的坑变成编译期错误。

注意：默认生成的 `__eq__` 会把 `__hash__` 置为 None（可变对象不可哈希），
要当 dict key 用就加 `frozen=True`（见下）或 `eq=False`。

## 常用选项

```python
@dataclass(frozen=True)          # 不可变：字段赋值抛异常 + 自动可哈希
class Point:
    x: float
    y: float

p = Point(1, 2)
p.x = 10          # FrozenInstanceError
{Point(1, 2): "坐标"}    # 可作 dict key

@dataclass(kw_only=True)        # 3.10+：所有字段必须关键字传
class Conn:
    host: str
    port: int = 5432

Conn(host="db")                 # port=5432 这样传，可读性优先
```

`frozen=True` 的三个红利：天然线程安全、能进 set/dict、防御"顺手改共享
配置"的 bug。配置/值对象优先考虑 frozen。

## __slots__：砍掉 __dict__

普通实例把属性存在 `__dict__` 里——灵活但每个实例多背一个哈希表。
`__slots__` 声明固定字段后，属性直接落在预分配的槽位上：

```python
class Point:
    __slots__ = ("x", "y")
    def __init__(self, x, y):
        self.x, self.y = x, y

p = Point(1, 2)
p.z = 3           # AttributeError：没有 __dict__，不能新增属性
```

| | 普通 class | `__slots__` |
| ---- | ---- | ---- |
| 内存/实例 | 高（\_\_dict\_\_ + 引用） | 约省 40%~50% |
| 新增属性 | 运行时随意加 | 声明之外一律拒绝 |
| 多继承 | 自由 | 与带 `__dict__` 的类混用会失效 |

@dataclass 配套写法：

```python
@dataclass(frozen=True, slots=True)    # 3.10+：值对象满配
class Money:
    amount: int
    currency: str = "CNY"
```

## 小结

- dataclass 生成 `__init__`/`__repr__`/`__eq__`；可变默认值用
  `field(default_factory=...)`。
- 值对象首选 `frozen=True`（不可变 + 可哈希 + 线程安全），
  `kw_only=True` 提升调用可读性。
- 百万级实例的内存敏感场景加 `slots=True`：省约一半内存，代价是
  失去动态加属性的能力。
