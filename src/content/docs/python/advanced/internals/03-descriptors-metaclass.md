---
title: 描述符与元类：属性访问的底层协议
description: __get__/__set__ 拦截、property 与 ORM 字段的本体、class 语句与元类、注册器
level: advanced
---

dataclass 自动生成方法、Pydantic 字段自带校验、`@property` 把方法变属性
——这些"类在做聪明事"的魔法，底层都收拢到两个协议：**描述符**管实例
属性访问，**元类**管类本身的创建。

## 描述符：属性访问被拦截

一个类只要定义了 `__get__`/`__set__`，它的实例放在类属性位置上就是
**描述符**——访问它走的不是普通属性查找，而是协议方法：

```python
class Positive:
    def __set_name__(self, owner, name):
        self.name = name                  # 类创建时自动调用，拿到字段名

    def __get__(self, obj, objtype=None):
        return obj.__dict__[self.name]

    def __set__(self, obj, value):
        if value <= 0:
            raise ValueError(f"{self.name} 必须为正")
        obj.__dict__[self.name] = value

class Order:
    price = Positive()        # 描述符实例作为类属性
    qty = Positive()

    def __init__(self, price, qty):
        self.price = price    # 赋值即触发 Positive.__set__
        self.qty = qty
```

`Order(0, 1)` 直接 ValueError——**校验写在描述符里，字段声明处自动生效**。
Pydantic 的字段、SQLAlchemy 的 Column，本质都是增强版 `Positive`。

`property` 是描述符的官方语法糖：

```python
class Circle:
    def __init__(self, r):
        self.r = r

    @property
    def area(self):                       # c.area 触发 __get__
        return 3.14159 * self.r ** 2
```

**属性查找顺序**：数据描述符（有 `__set__`）→ 实例 `__dict__` → 非数据
描述符（只有 `__get__`，如函数）→ 类 `__dict__` 沿
[MRO](/python/basic/oop/02-inheritance-mro/)。方法绑定也靠这个协议：
函数是非数据描述符，`obj.method` 时 `__get__` 返回绑定了 obj 的方法对象。

## 元类：类的类

`type` 有双重身份：查类型时返回对象的类型；**传三个参数时创建类**：

```python
class Dog: ...

type(Dog)                     # <class 'type'> —— 类的类型是元类
Dog = type("Dog", (), {})     # 与上面的 class 语句等价

class Meta(type):
    def __new__(mcls, name, bases, ns):
        cls = super().__new__(mcls, name, bases, ns)
        print(f"类 {name} 被创建了")      # 在这里拦截/改写类定义
        return cls

class Foo(metaclass=Meta): ...    # 定义时即打印
```

`class` 语句的完整过程：**收集命名空间 → 选定元类 → 调用
`meta(name, bases, namespace)` → 绑定名字**。元类就是这一步的钩子——
Java 注解处理器在编译期生成代码，Python 元类在**类创建瞬间**改写类：

```python
class Registry(type):
    plugins = {}

    def __new__(mcls, name, bases, ns):
        cls = super().__new__(mcls, name, bases, ns)
        if bases:                       # 基类自身不注册
            mcls.plugins[name] = cls    # 每个子类自动进注册表
        return cls

class Plugin(metaclass=Registry): ...
class CSVPlugin(Plugin): ...            # Registry.plugins 自动出现
```

ORM 的 `Model` 基类用元类扫描字段声明建表映射；dataclass 和 Pydantic v2
则改用了更轻的 `__init_subclass__`/装饰器——**元类是重武器**，日常先
考虑类装饰器和 `__init_subclass__`，真要控制"类的创建过程本身"才上元类。

## 什么时候需要它们

| 需求 | 工具 |
| ---- | ---- |
| 单个属性的受控访问/计算 | property / 描述符 |
| 批量字段的校验与转换 | 描述符 + `__set_name__`（或 Pydantic） |
| 收集/注册子类 | `__init_subclass__`（轻）或元类（重） |
| 改写类定义（注入方法、改结构） | 元类 |

## 小结

- 描述符 = `__get__/__set__` 协议，property 与 ORM 字段的本体；数据描述符优先于实例字典。
- class 语句 = 元类调用；元类拦截"类的创建"，做注册、注入、校验。
- 力量层级：先属性、再类装饰器/`__init_subclass__`，元类是最后手段。
