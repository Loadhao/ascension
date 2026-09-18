---
title: 属性描述符与冻结三兄弟
description: descriptor 四属性与存取器属性、枚举性对四种遍历的影响、defineProperty 与 Vue2 响应式的根基、preventExtensions/seal/freeze 能力递进、浅冻结问题
level: basic
---

日常写 JS 把对象当「键值对的袋子」，但对象属性其实自带一层**元数据**：
能不能改、能不能枚举、能不能删，每个属性都有开关。[Proxy 篇](/js/basic/core/10-proxy-reflect/)讲的 defineProperty 对比、Vue 2 响应式、
对象不可变三件套，底层全是这层元数据——这一篇把它拆开。

## 属性描述符：每个属性都有的四个开关

`Object.getOwnPropertyDescriptor` 能看到任意属性的描述符——它有
两种形态，**数据属性**和**存取器属性**，互斥不可兼得：

```js
const obj = { a: 1 };
Object.getOwnPropertyDescriptor(obj, 'a');
// { value: 1, writable: true, enumerable: true, configurable: true }

// 数据属性四开关：
// value       值本身
// writable    能否重新赋值
// enumerable  能否被 for...in / Object.keys 枚举到
// configurable 能否删除该属性、能否改回描述符（唯一「反悔口」）

// 存取器属性（getter/setter）：
// get / enumerable / configurable —— 没有 value/writable
```

存取器属性就是用 `get/set` 定义的属性——**读写时跑函数**。它是
Vue 2 响应式的根基：`defineProperty` 把 data 的每个属性改写成存取器，
在 getter 里收集依赖、setter 里派发更新。`configurable: false` 一旦
落下就不可逆（连改回 true 都不行），这是四开关里唯一的单行道。

## 枚举性：同是遍历，结果不同

`enumerable: false` 的属性像「隐身」，但不同 API 的隐身规则不同：

| API | 拿不拿非枚举属性 |
| --- | --- |
| `for...in` | 不拿（且连原型链上可枚举的也拿） |
| `Object.keys` / `entries` / `values` | 不拿（仅自身可枚举） |
| `JSON.stringify` | 不拿 |
| 展开运算符 `{...obj}` | 不拿 |
| `Object.getOwnPropertyNames` | **拿**（含不可枚举，不含 Symbol） |

推论：想藏字段（如序列化时不输出的内部标记），`enumerable: false`
是原生方案——四种常规遍历全部自动绕开。

## 冻结三兄弟：能力递进的不变量控制

三个 API 都在「锁对象」，但锁的程度递进：

| API | 加新属性 | 删/改描述符 | 改已有值 |
| --- | --- | --- | --- |
| `Object.preventExtensions` | ❌ | ✅ | ✅ |
| `Object.seal` | ❌ | ❌ | ✅ |
| `Object.freeze` | ❌ | ❌ | ❌ |

`freeze` = preventExtensions + 全属性 `writable: false` +
`configurable: false`——完全不可变。三个高频追问：

- **freeze 后 `push` 数组会怎样**：非严格模式下**静默失败**（不报错、
  也不生效），严格模式（class/模块内）抛 TypeError——「悄悄不生效」
  是排查时的经典困惑。
- **`const` 和 `freeze` 什么区别**：`const` 锁**绑定**（变量不能再指向
  别处），对象内容照改不误；`freeze` 锁**内容**。两个是正交的，`const
  obj = Object.freeze({...})` 才是完整锁。
- **freeze 是浅的**：只冻结第一层，嵌套对象的属性照改——「深冻结」要
  递归 freeze（注意循环引用），或直接用不可变数据结构库。

## 一点现代视角

这些 API 是 ES5 时代的元编程工具：Vue 2 用它做响应式、Redux 等库用
freeze 做开发期不可变校验。现代实践的两个变化：响应式已被 Proxy 取代
（Proxy 在对象层面拦截，不需要逐属性改写描述符，还能拦截新增属性）；
日常不可变需求更多交给展开运算符/结构化更新而非手写深冻结。但描述符
体系仍是理解这两者「为什么」的地基——面试答「Vue2 为什么有数组缺陷」
就要落到「defineProperty 够不到索引与 length」这层。

## 小结

- 属性有两形态：数据属性（value/writable/enumerable/configurable）与
  存取器属性（get/set），互斥；configurable 是单行道。
- 存取器属性是 Vue2 defineProperty 响应式的根基；其数组缺陷源于
  够不到索引与 length。
- 四种常规遍历全部绕开非枚举属性，enumerable: false 是原生「隐身」
  方案。
- 三兄弟能力递进：防加 / 防加防改描述符 / 全锁；freeze 浅冻结、
  非严格模式静默失败，与 const 的锁绑定正交。

## 延伸阅读

- [MDN：Object.defineProperty](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)
- [MDN：数据属性与存取器属性](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Data_structures)
- [MDN：Object.freeze 与浅冻结说明](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze)
