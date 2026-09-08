---
title: 作用域与闭包
description: 词法作用域、var 提升与 let 的 TDZ、闭包的私有状态价值与泄漏现场——循环打印三连修复
level: basic
core: true
---

## 作用域：变量的查找规则

JS 是**词法作用域**（静态作用域）：函数能访问哪些变量，在**定义时**
就由代码嵌套位置决定，与在哪里调用无关。查找沿作用域链由内向外，
找到即停。

```js
const x = "outer";
function foo() { console.log(x); }
function bar() { const x = "inner"; foo(); }
bar();   // "outer"——foo 定义时就锁定了外层 x，与调用者无关
```

与之相对的动态作用域（查找取决于调用栈）在 bash 里有、在 JS 里没有
——但 **this 的动态绑定**常被拿来类比，两者的分界正是本目录 04 篇的
主题。

## var 的问题与 let/const 的修复

`var` 有两个历史包袱：**函数级作用域**（块内声明泄漏到函数）+
**提升**（声明与初始化分离，未赋值前是 undefined）；`let/const` 用
块级作用域 + **TDZ（暂时性死区）**修复——声明前访问直接抛
ReferenceError，而不是静默给你 undefined。

经典三连修复——循环打印问题：

```js
// ① 经典翻车：全打印 3
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i));
}
// var 只有一个函数级 i，回调执行时循环已结束

// ② let 修复：每轮迭代一个新绑定
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i));   // 0 1 2
}

// ③ var 但手动捕获：IIFE 建立独立作用域（ES5 时代的标准解法）
for (var i = 0; i < 3; i++) {
  ((j) => setTimeout(() => console.log(j)))(i);
}
```

②③ 输出相同的本质一样：**让每次回调捕获的是"各自的变量"而不是
"同一个变量"**。理解了这条，React 里 `useEffect` 闭包捕获旧 state
的问题就是同一道题的变体。

提升还有一个细节常被追问：**函数声明整体提升**（可以先调用后定义），
**函数表达式只提升变量名**（`var f` 提升了但 f 是 undefined）。

## 闭包：函数 + 它出生时的作用域

函数持有其**词法作用域的引用**，哪怕函数逃逸出去、作用域本该销毁，
被引用的变量依然存活：

```js
function counter() {
  let n = 0;
  return () => ++n;   // n 被闭包持有，外部无法直接触碰
}
const inc = counter();
inc(); inc();          // 1, 2——每个 counter() 调用产生独立的 n
```

闭包的三个高频价值：

| 价值 | 形态 | 现场 |
|---|---|---|
| 私有状态 | 返回的函数是唯一入口 | 计数器、防抖/节流（timer 变量） |
| 柯里化 | 逐层收集参数返回新函数 | `curried(a)(b)(c)`、函数式组合 |
| 模块模式 | IIFE 包住实现只导出接口 | 打包器出现前的"模块"标准姿势 |

防抖是最短的现场——**没有闭包持住 timer，防抖根本写不出来**：

```js
function debounce(fn, delay) {
  let timer = null;                    // 闭包持有，外部摸不到也清不掉
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
```

## 代价：内存泄漏的两大经典现场

**被闭包引用的变量随函数共存亡**——闭包把"作用域"变成了手动管理
的资源，两大泄漏源头：

```js
// ① 事件监听忘记解绑：handler 连同捕获的大对象一起常驻
button.addEventListener("click", () => {
  render(hugeData);          // hugeData 被 handler 捕获
});
// 组件销毁必须 removeEventListener，否则整条引用链不释放

// ② 定时器持有大对象：interval 不清，data 永不回收
const timer = setInterval(() => process(data), 1000);
clearInterval(timer);        // 停止时必须清理
```

排查思路见 Node.js GC 篇：闭包泄漏在堆快照里的特征是 **retainer 链
里出现 closure → 被捕获变量**。V8 的优化（Scavenge/Mark-Sweep）管
不了"你还引用着"的对象——GC 只回收不可达，可达性是闭包给你的承诺
也是负担。

## 何时警惕闭包

- 回调持有**大数组/大响应体**且生命周期长（全局缓存、长连接）；
- 循环里创建闭包且**预期每轮独立**（回到 let 修复）；
- 高频路径上为小状态建闭包——对象属性往往更便宜（闭包变量在 V8 里
  走 Context 对象，多数情况差异不大，别 prematurely optimize）。

## 小结

- 词法作用域在定义时定型；var 的函数级 + 提升是历史包袱，let/const
  的 TDZ 让错误尽早暴露。
- 循环打印三连的本质：让回调各自捕获独立绑定。
- 闭包 = 私有状态与柯里化的根基（防抖是必背现场），代价是引用链
  手动管理——监听解绑、定时器清理。
- 泄漏排查在 Node GC 篇：堆快照里找 closure 的 retainer 链。

## 延伸阅读

- [MDN 闭包](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Closures)
- [MDN 暂时性死区](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/let#%E6%9A%82%E6%97%B6%E6%80%A7%E6%AD%BB%E5%8C%BA)
