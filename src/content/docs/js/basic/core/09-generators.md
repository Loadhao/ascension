---
title: 迭代器与生成器：能暂停的函数
description: 迭代器协议与 for...of 底层、function* 与 yield 的暂停执行、惰性求值与 Symbol.iterator 自定义
level: basic
core: true
---

生成器（generator）是"**能暂停的函数**"——普通函数从头跑到尾，生成器
可以在 `yield` 处暂停、下次从暂停点继续。这个"暂停"能力是 for...of
的底层（迭代器协议）、Koa 中间件的实现基础（Koa 1.x 用生成器）、
惰性求值的关键。

## 迭代器协议：for...of 的底层

```javascript
// 任何实现了 Symbol.iterator 方法的对象都可被 for...of 遍历
const range = {
  from: 1, to: 3,
  [Symbol.iterator]() {
    let cur = this.from - 1;
    return {
      next: () => ({ value: ++cur, done: cur > this.to })
    };
  }
};
for (const n of range) console.log(n);   // 1, 2, 3
```

- **迭代器协议**：对象提供 `[Symbol.iterator]()` 返回一个带 `next()`
  方法的对象，`next()` 返回 `{ value, done }`——for...of 循环调
  next 直到 done=true；
- **for...in vs for...of**：for...in 遍历**可枚举属性键**（对象），
  for...of 遍历**可迭代接口**（数组/Map/Set/字符串）——完全不同的
  协议（经典面试辨析）。

## 生成器：function* 与 yield

```javascript
function* counter(from, to) {
  while (from <= to) yield from++;
}
const gen = counter(1, 3);
gen.next();  // { value: 1, done: false }
gen.next();  // { value: 2, done: false }
gen.next();  // { value: 3, done: false }
gen.next();  // { value: undefined, done: true }
```

- `function*` 声明生成器——调用**不执行函数体**，返回 Generator
  对象（同时实现了迭代器协议）；
- `yield` = 暂停点：产出值 + 暂停执行，下次 `next()` 从这里继续——
  **状态自动保存在 Generator 对象里**（不需要闭包）；
- 生成器也是迭代器——**可以直接用 for...of 遍历**。

## 惰性求值：只在需要时计算

```javascript
function* fibonacci() {
  let [a, b] = [0, 1];
  while (true) {       // "无限"序列——因为惰性，不会 OOM
    yield a;
    [a, b] = [b, a + b];
  }
}
const fib = fibonacci();
fib.next().value;  // 0
fib.next().value;  // 1
fib.next().value;  // 1
```

- 无限序列是惰性求值的典型场景——只在 `next()` 时算下一步，
  **不预计算**（对照瀑布流的按需加载）；
- 与 Stream 篇的分块处理同思想：**数据按需逐块产出**。

## 高频追问速答

- **生成器和普通函数的区别？** 调用不执行、返回 Generator 对象；
  每次 `next()` 执行到下一个 yield 并暂停——**执行状态可暂停可
  恢复**。
- **生成器是异步的吗？** 生成器本身是**同步**的（next() 立即返回）；
  但可以配 Promise 用（Koa 1.x 的中间件就是 yield Promise——后来
  被 async/await 取代，async 函数本质上就是"自动驱动的生成器"）。
- **for...of 和 for...in 怎么选？** for...of 遍历**值**（需要
  Symbol.iterator），for...in 遍历**键**（包括原型链上的）——
  数组用 for...of，对象属性用 for...in 或 Object.keys()。

## 小结

- 迭代器协议（next→value/done）是 for...of 的底层；自定义对象
  实现 Symbol.iterator 即可被 for...of。
- 生成器 = 能暂停的函数：yield 暂停 + next 恢复，状态自动保存。
- 惰性求值（无限序列）+ 状态机（暂停恢复）是两大应用——Koa
  中间件和 Stream 的设计思想都源于"暂停"这个原语。
