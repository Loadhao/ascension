---
title: Proxy 与 Reflect：拦截对象操作
description: Proxy 的 13 种拦截陷阱、Reflect 的设计初衷、Vue 3 响应式的底层原理、与 Object.defineProperty 的对比
level: intermediate
core: true
---

Vue 3 的响应式系统从 `Object.defineProperty` 换成了 `Proxy`——这个
换代不只是因为"Proxy 更强大"，而是**defineProperty 有结构性缺陷**
（无法监听属性增删/数组索引）。理解 Proxy 就是理解 Vue 3 响应式的
底层。

## Proxy：对象的"代理层"

```javascript
const handler = {
  get(target, key, receiver) {
    console.log(`读取 ${key}`);
    return Reflect.get(target, key, receiver);
  },
  set(target, key, value, receiver) {
    console.log(`设置 ${key} = ${value}`);
    return Reflect.set(target, key, value, receiver);
  }
};
const proxy = new Proxy(target, handler);   // 所有操作经过 handler
```

- Proxy 在**目标对象外面加一层代理**——所有操作（get/set/delete/
  has/apply...）先经过 handler 再到底层对象；
- **13 种拦截陷阱**（trap）：get/set/has/deleteProperty/apply/
  construct 等——覆盖对象几乎全部操作；
- **不需要递归遍历属性**——Proxy 拦截的是"对对象的操作"而非"单个
  属性"，新增属性自动被拦截（defineProperty 需要逐个定义）。

## Reflect：Proxy 的"默认行为"

Reflect 不是新功能——它把 Object 上的**反射方法**收拢到一个命名空间，
并且**方法签名与 Proxy trap 完全对应**：

| Proxy trap | Reflect 方法 |
| --- | --- |
| get | Reflect.get(target, key, receiver) |
| set | Reflect.set(target, key, value, receiver) |
| has | Reflect.has(target, key) |
| deleteProperty | Reflect.deleteProperty(target, key) |

- **为什么在 Proxy handler 里用 Reflect 而不是直接 target[key]**：
  ①receiver 参数保证 getter/setter 里的 this 指向代理（继承场景
  必需）；②返回值与 trap 约定一致（set 返回 boolean）；
- 面试一句话："**Reflect 是 Proxy handler 里执行默认行为的标准方式**。"

## 与 Object.defineProperty 的对比

| | Object.defineProperty | Proxy |
| --- | --- | --- |
| 新增属性 | **无法监听**（需 $set） | 自动拦截 |
| 数组索引 | **无法监听** | 自动拦截 |
| 删除属性 | 无法监听 | deleteProperty trap |
| 性能 | 初始化递归遍历 | **惰性代理**（访问时才收集） |
| 兼容性 | IE9+ | 不支持 IE |

Vue 2 → Vue 3 的响应式换代正是 defineProperty → Proxy：
**解决了三大结构性缺陷**（新增属性/数组索引/删除），同时性能从
"初始化全量遍历"变为"访问时惰性代理"。

## 高频追问速答

- **Proxy 有什么限制？** 无法代理**非对象**（原始值直接返回）；且
  有些操作**不可拦截**（如 `Object.freeze` 后的对象）——Proxy
  拦截的是 JS 引擎层面的操作，有语言规范定义的不可绕过操作。
- **Reflect.set 的 receiver 为什么重要？** 如果 target 有继承链，
  getter 里的 this 应指向**代理**（否则拦截不到）——receiver
  参数修正 this 指向，保证代理链一致。
- **Proxy 能拦截什么场景？** 响应式（Vue）、数据校验（set trap
  校验类型）、权限控制（get trap 拦截私有属性）、API mock
  （apply trap）、惰性加载（get trap 返回新 Proxy）。

## 小结

- Proxy = 对象的代理层（13 种 trap 覆盖全部操作）；Reflect =
  handler 里执行默认行为的标准方式（receiver 保证 this 正确）。
- 对比 defineProperty：Proxy 解决新增属性/数组索引/删除的结构性
  缺陷 + 惰性代理提升性能——Vue 3 换代的完整理由。
- Proxy 的应用远不止响应式：校验/权限/日志/mock——**"在对象操作
  前插一层逻辑"的通用模式**。
