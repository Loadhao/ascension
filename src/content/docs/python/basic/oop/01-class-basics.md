---
title: 类、实例与魔术方法
description: __init__ 与 __new__ 的分工、类属性查找链、__repr__/__eq__、property 与鸭子协议
level: basic
core: true
---

## __new__ 才是构造器，__init__ 只是初始化

```python
class Point:
    def __new__(cls, *args, **kwargs):   # ① 分配并返回实例（很少重写）
        return super().__new__(cls)
    def __init__(self, x, y):            # ② 拿到实例做初始化
        self.x, self.y = x, y
```

99% 的类只写 `__init__`。需要控制实例创建本身时（单例、缓存复用、
元编程）才碰 `__new__`。

## 属性查找：实例 → 类 → 父类

```python
class Dog:
    species = "犬科"          # 类属性：所有实例共享
    def __init__(self, name):
        self.name = name       # 实例属性：各自一份

a, b = Dog("旺财"), Dog("来福")
a.species          # 犬科——自己没有，去类上找
Dog.species = "犬"  # 改类属性影响所有实例
a.species = "猫"   # 实例上新建同名属性，遮蔽类属性（只影响 a）
```

**可变类属性是隐形雷区**：`tricks: list = []` 会被所有实例共享，和
可变默认参数同源。要每实例一份就在 `__init__` 里建。

## 魔术方法：运算符是协议的语法糖

`len(obj)` 调 `__len__`，`obj[k]` 调 `__getitem__`，`a + b` 调
`__add__`……内置函数和运算符全是协议入口，这就是**鸭子协议**——
不看类型看行为：

```python
class Playlist:
    def __init__(self, *songs):
        self._songs = list(songs)

    def __len__(self):                # 支持 len(playlist)
        return len(self._songs)
    def __getitem__(self, i):         # 支持 p[0]、切片、甚至 for 遍历
        return self._songs[i]
    def __contains__(self, song):     # 支持 song in playlist
        return song in self._songs
```

实现了 `__getitem__` 的类即使没有 `__iter__` 也能被 for 迭代——
解释器会用 0, 1, 2... 逐个索引直到 IndexError。

## __repr__ 与 __str__

```python
class Money:
    def __init__(self, cents):
        self.cents = cents
    def __repr__(self):       # 面向开发者：日志/调试器/容器内的显示
        return f"Money({self.cents})"
    def __str__(self):        # 面向用户：print() 与 f-string
        return f"¥{self.cents / 100:.2f}"
```

只写一个就写 `__repr__`（`__str__` 缺省回落到它）。调试半天发现日志里
全是 `<Money object at 0x...>` 的场景都因为没写。

## __eq__：相等性自定义

```python
class Point:
    def __init__(self, x, y):
        self.x, self.y = x, y
    def __repr__(self):
        return f"Point({self.x}, {self.y})"
    def __eq__(self, other):
        if not isinstance(other, Point):
            return NotImplemented    # 不是同类：让解释器尝试反射比较
        return (self.x, self.y) == (other.x, other.y)
```

`NotImplemented`（不是 `NotImplementedError`！）表示"我不会比这个类型"，
解释器会转而尝试对面的 `__eq__`。要放进 set/dict 作 key 记得同时重写
`__hash__`（见 [dict 与 set](/python/basic/data-structures/02-dict-set/)）。

## property：字段的门卫

```python
class Account:
    def __init__(self):
        self._balance = 0          # 内部存 _balance

    @property
    def balance(self):              # 读：a.balance
        return self._balance

    @balance.setter
    def balance(self, value):      # 写：a.balance = v 带校验
        if value < 0:
            raise ValueError("余额不能为负")
        self._balance = value
```

property 的价值：**对外保持 `a.balance` 的字段语法，对内随时可加校验
或改算法**，不用像 Java 那样预防性地给所有字段配 getter/setter。

## 小结

- `__new__` 造实例、`__init__` 填内容；可变默认值性质的类属性要挪进
  `__init__`。
- 运算符和内置函数是魔术方法协议：实现协议即获得能力，无需继承接口。
- `__repr__` 给开发者、`__str__` 给用户、`__eq__` 返回 NotImplemented；
  property 让字段语法与内部实现解耦。
