---
title: 函数：参数、作用域与闭包
description: 可变默认值陷阱、LEGB 作用域、nonlocal、闭包的延迟绑定
level: basic
core: true
---

## 可变默认值：Python 第一坑

默认值在 **def 执行时求值一次**，所有调用共享同一个对象：

```python
def add_item(item, items=[]):      # 反面教材
    items.append(item)
    return items

add_item(1)    # [1]
add_item(2)    # [1, 2] —— 上次的 1 还在！
```

惯用修法——哨兵 None：

```python
def add_item(item, items=None):
    if items is None:
        items = []
    items.append(item)
    return items
```

## 参数全谱

```python
def f(pos_only, /, normal, *args, kw_only, **kwargs): ...
#      └─只能位置传  └─两种都行   └收集  └─只能关键字传  └收集关键字
```

- `/` 之后的参数才能用关键字传；`*` 之后的参数**必须**用关键字传
  （`sorted(data, key=len, reverse=True)` 就是受益者——可读性远超位置参数）。
- `*args` 收多余位置参数成 tuple，`**kwargs` 收多余关键字参数成 dict。
- 调用时 `f(*list, **dict)` 是反向的"展开"。

关键字参数是 Python 的签名自文档：**布尔参数永远用关键字传**
（`connect(host, timeout=5)` 而不是 `connect(host, 5)`）。

## LEGB 作用域

名字查找顺序 **L**ocal → **E**nclosing（外层函数）→ **G**lobal → **B**uilt-in：

```python
x = "global"

def outer():
    x = "enclosing"
    def inner():
        nonlocal x    # 改写 enclosing 层的 x（闭包写入的钥匙）
        x = "changed"
    inner()
    print(x)          # changed
```

Python 没有块级作用域：if/for 块里的赋值直接落在函数局部——
`for i in ...:` 之后 `i` 仍然可用。要写全局用 `global x`，写闭包外层用
`nonlocal x`；两者都只在"需要赋值"时才写（读取不需要声明）。

## 闭包：带着环境的函数

函数是一等对象（详见[对象模型](/python/basic/syntax/01-objects/)），
内层函数可以捕获外层变量并"打包带走"：

```python
def make_multiplier(n):
    def multiply(x):
        return x * n      # n 被闭包捕获
    return multiply

double = make_multiplier(2)
double(10)               # 20
```

闭包的经典陷阱——**延迟绑定**：捕获的是变量本身，不是当时的值：

```python
funcs = [lambda: i for i in range(3)]
[f() for f in funcs]              # [2, 2, 2]！

funcs = [lambda i=i: i for i in range(3)]   # 默认值在定义时求值 → 固定住
[f() for f in funcs]              # [0, 1, 2]
```

## lambda：表达式版的单行函数

```python
sorted(users, key=lambda u: u.age)
```

定位是**给 key/回调用的小表达式**。超过一行、需要名字复用 → def。
lambda 没有 def 的名字和可读性，别硬塞逻辑进去。

## 小结

- 可变默认值只求值一次：用 `None` 哨兵修复；布尔/关键参数永远关键字传。
- LEGB 查找链；写闭包外层用 `nonlocal`，写全局用 `global`。
- 闭包捕获变量而非值，循环里捕获要靠默认值参数固定。
