---
title: 内存管理与垃圾回收
description: 引用计数即时回收、分代 GC 只兜循环引用、weakref 不续命、__slots__ 减负
level: advanced
---

Java 程序员习惯"写就行，GC 兜底"；CPython 的答案是**引用计数为主、分代
回收兜底**——两套机制各管一半，理解分工才能解释"内存为什么不释放"。

## 主力：引用计数

每个对象头部带 `ob_refcnt`，**计数归零立即释放**（[GIL](/python/advanced/internals/01-gil/)
正是为它的线程安全而生）：

```python
import sys

a = [1, 2]
sys.getrefcount(a)    # 2 —— 函数传参临时 +1
b = a                 # +1
del b                 # -1
```

即时回收是 Java 没有的爽点：大对象离开作用域立刻还内存，没有"等 GC"的
概念。但它管不了**循环引用**：

```python
a = []
b = []
a.append(b)
b.append(a)    # 互相引用，计数永远 ≥ 1
del a, b       # 计数仍是 1，引用计数永远收不掉
```

## 兜底：分代垃圾回收

`gc` 模块专收循环引用：追踪容器对象（list/dict/实例……）的引用**图**，
从外部根出发做可达性分析，不可达的环整体拆掉。

分代依据"越新越早死"的假设：

```mermaid
flowchart LR
    G0["0 代：新对象<br/>回收最频繁"] -- "活过一次回收" --> G1["1 代"] -- "再活过" --> G2["2 代<br/>扫描最稀少"]
    class G0 hl
    classDef hl stroke-width:1.5px
```

注意与 Java 分代 GC 的本质区别：**这里回收的只有循环引用**——普通对象
靠计数就死了，根本不进 GC 的议题。所以 Python 的 GC 触发频率低、单次
也轻。实践上：`gc.collect()` 可手动触发；怀疑内存泄漏从 `gc.get_objects()`
入手；大量短命循环引用的场景可 `gc.disable()` 换吞吐（要谨慎）。

## weakref：引用但不续命

```python
import weakref

cache = weakref.WeakValueDictionary()
cache["session_1"] = load_session()    # 值不会因为被缓存而免死

obj = BigObject()
r = weakref.ref(obj)     # 弱引用：不增加计数
r() is obj               # True
del obj
r() is None              # True —— 对象已死
```

缓存、监听器注册表、给对象挂元数据——所有"想引用但不想延长生命周期"
的场景都用 weakref，这是避免缓存吃内存的标准手法。

## `__slots__`：砍掉实例字典

默认每个实例带一个 `__dict__` 存属性——灵活，但每个对象多一份字典开销：

```python
class Point:
    __slots__ = ("x", "y")    # 声明后实例没有 __dict__

p = Point()
p.x = 1
p.z = 2        # AttributeError：属性被锁死
```

几十万个小对象（节点、事件）的场景，`__slots__` 省一半以上内存还提速
属性访问；代价是不能动态加属性。dataclass 有现成开关（见
[dataclass 与 \_\_slots\_\_](/python/basic/oop/03-dataclass-slots/)）。
numpy 的 ndarray 省内存也是同思路：定长同型数据不配字典。

## 排查内存的三个工具

- `sys.getsizeof(obj)`：单个对象的浅大小（不含引用到的内层）；
- `tracemalloc`：快照对比，定位"哪行代码在涨"；
- `objgraph`：可视化引用链，找环和持有者。

综合运用见[性能剖析与优化](/python/advanced/internals/04-profiling/)。

## 小结

- 引用计数即时回收覆盖绝大多数对象；分代 GC 只兜循环引用，语义与 Java 分代不同。
- 缓存/监听用 weakref 避免续命；海量小对象上 `__slots__`。
- 排查三板斧：getsizeof 看单体、tracemalloc 看增长、objgraph 看引用链。
