---
title: Map/Set 与 Symbol：ES6 的数据结构
description: Map vs Object 的选型、Set 去重与集合运算、WeakMap 弱引用与 GC、Symbol 的三大用途
level: basic
core: true
---

ES6 引入的 Map/Set/Symbol/WeakMap 是 JS 面试基础必考题——"Map 和
Object 有什么区别""WeakMap 为什么不会内存泄漏""Symbol 有什么用"，
每道都指向**数据结构选型与垃圾回收的底层理解**。

## Map vs Object：什么时候用 Map

| | Object | Map |
| --- | --- | --- |
| 键类型 | 字符串/Symbol | **任意类型**（对象/函数/NaN） |
| 顺序 | 整数键排前、字符串按插入 | **严格插入序** |
| size | 需手动 Object.keys().length | **size 属性** |
| 迭代 | 需 Object.entries() | **可直接 for...of** |
| 频繁增删 | 性能不确定 | **优化过，性能稳定** |

- **选型口诀**：键是字符串且当"对象"用（有固定属性名）→ Object；
  键是动态的/非字符串/频繁增删/需要 size → **Map**；
- `new Map(Object.entries(obj))` 可从 Object 转 Map，反向用
  `Object.fromEntries(map)`。

## Set：去重与集合运算

```javascript
[...new Set([1, 2, 2, 3])]           // [1, 2, 3] —— 数组去重
const a = new Set([1, 2, 3]);
const b = new Set([2, 3, 4]);
[...a].filter(x => b.has(x))          // 交集 [2, 3]
[...a].filter(x => !b.has(x))         // 差集 [1]
```

- Set 的 `has()` 是 O(1)（哈希表），比 Array 的 `includes()` O(n)
  快——**频繁 has 检查用 Set 不用 Array**（点赞篇的同款选型）。

## Symbol：不会冲突的唯一标识

```javascript
const id = Symbol("id");              // 每次调用都返回不同的 Symbol
const id2 = Symbol("id");
id === id2;                           // false —— 即使描述相同
Symbol.for("id") === Symbol.for("id"); // true —— 全局注册表版本
```

- **三大用途**：①对象属性的"隐藏键"（不会被 for...in 遍历到）；
  ②防止第三方库的属性名冲突；③定义对象的行为协议
  （Symbol.iterator/asyncIterator）；
- **Symbol.for vs Symbol**：for 版全局注册（跨模块共享），Symbol
  每次新建——框架/库的属性扩展用 for，私有标识用 Symbol。

## WeakMap/WeakSet：不阻止 GC 的集合

```javascript
const cache = new WeakMap();
cache.set(domElement, { computed: "..." });  // DOM 移除后自动回收
```

- **键必须是对象**，且是**弱引用**——键对象在其他地方无引用时被 GC，
  WeakMap 条目自动消失；
- 典型场景：**给 DOM 元素/第三方对象附加元数据**——不阻止这些对象
  被 GC（对照 GC 篇的内存泄漏：强引用闭包是泄漏源头）；
- 不可迭代（设计如此——如果可迭代就有强引用了）。

## 高频追问速答

- **Map 和 WeakMap 怎么选？** 需要遍历/持久存储用 Map；**键的生命
  周期由外部管理**（DOM/第三方对象）用 WeakMap——弱引用防泄漏。
- **Symbol 能当对象属性被 JSON.stringify 序列化吗？** 不能——
  Symbol 属性默认被 JSON.stringify 忽略（有时是优点：隐藏内部字段）。
- **Object 为什么比 Map 慢？** 对象的属性查找走原型链（可能多层），
  Map 是纯哈希表（一次定位）——频繁动态增删的场景差距明显。

## 小结

- Map：键类型自由 + size + 直接迭代——动态键/频繁增删选 Map；
  Set：O(1) has + 去重——频繁 has 检查选 Set。
- WeakMap/WeakSet：**弱引用不阻止 GC**——给外部对象附加元数据不
  泄漏。
- Symbol：防冲突的唯一标识 + 对象行为协议（Symbol.iterator）——
  for 版全局共享、Symbol 版私有。
