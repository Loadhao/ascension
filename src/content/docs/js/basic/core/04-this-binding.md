---
title: this 与箭头函数
description: 四条绑定规则的优先级、隐式丢失的三大现场、call/apply/bind 手写与箭头函数的词法 this
level: basic
---

## this 不是"定义时"而是"调用时"

与词法作用域相反，**普通函数的 this 在调用时确定**——看的是"函数
以什么形式被调用"，不是"函数写在哪里"。四条绑定规则，优先级从高到低：

| 优先级 | 规则 | 场景 | this |
|---|---|---|---|
| 1 | new 绑定 | `new Foo()` | 新建的对象 |
| 2 | 显式绑定 | `call/apply/bind` | 指定的对象 |
| 3 | 隐式绑定 | `obj.fn()` | obj（链式取最后一层） |
| 4 | 默认绑定 | 独立调用 `fn()` | undefined（严格模式）/ window |

判断流程就是查表：**有没有 new → 有没有 call/apply/bind → 是不是
`obj.fn()` 形式 → 都不是就默认绑定**。

## 隐式丢失：this 问题的九成来源

隐式绑定要求"调用处带上对象前缀"，**一旦赋值/传参把调用形态改掉，
this 就丢了**：

```js
const obj = { name: "a", getName() { return this.name; } };

// ① 赋值丢失：调用形态变成独立调用
const f = obj.getName;
f();                    // undefined——默认绑定

// ② 传参丢失：setTimeout 只认函数本身
setTimeout(obj.getName, 100);     // undefined

// ③ 嵌套取值：取最后一层
const outer = { inner: { name: "b", getName: obj.getName } };
outer.inner.getName();            // "b"——绑定到 inner
```

三大修复姿势对应三种场景：

```js
setTimeout(() => obj.getName(), 100);  // 箭头函数包一层：外层 this 接管
setTimeout(obj.getName.bind(obj), 100);  // bind 固化
setTimeout(obj.getName, 100);  // 把getName写成箭头函数属性（类字段）
```

## 显式绑定三兄弟

```js
fn.call(ctx, a, b);      // 参数逐个传，立即调用
fn.apply(ctx, [a, b]);   // 参数数组传，立即调用（类数组转数组的古典姿势）
const g = fn.bind(ctx);  // 不调用，返回 this 固化的新函数
```

**手写 bind** 是高频手写题，两个考点：返回函数要能 new（new 时 this
让位于新对象）、要维护原型链：

```js
Function.prototype.myBind = function (ctx, ...outer) {
  const fn = this;
  const bound = function (...inner) {
    // new 优先：new 调用时 this 是新实例，忽略 ctx
    return fn.apply(this instanceof bound ? this : ctx, [...outer, ...inner]);
  };
  bound.prototype = Object.create(fn.prototype);   // 保住 instanceof
  return bound;
};
```

默认绑定的例外：**硬绑定后再 new，new 的优先级更高**——上表 new 排
第一的由来；`bind` 返回的函数 this 永久固化，但可被 new 穿透。

## 箭头函数：没有 this，才是它最大的特点

箭头函数**不创建 this**，沿词法作用域取外层——"this 是谁"在定义处
就定了，任何调用形式都改不了：

```js
class Timer {
  start() {
    setTimeout(() => {
      console.log(this);       // Timer 实例——取 start 的 this
      this.tick();
    }, 100);
  }
  tick() {}
}
```

三条使用边界：

1. **不能 new**：没有 `[[Construct]]`，new 箭头函数直接抛错；
2. **不适合作对象方法**：`obj.fn = () => this.x` 的 this 是外层
   （模块/window），不是 obj；
3. **也没有 arguments/super**：同样沿词法作用域取外层。

`call/apply/bind` 对箭头函数的第一个参数**无效**——改变不了它没有的
东西，只能传参。

## 工程现场速查

| 现场 | this 指向 | 姿势 |
|---|---|---|
| React 类组件回调 | undefined（严格模式） | 类字段箭头函数 / 构造器 bind |
| `addEventListener` | 被绑定的 DOM 元素 | 需要外层 this 时用箭头函数 |
| Vue2 选项式 data/methods | 组件实例（框架做了 bind） | 生命周期里放箭头函数防丢 |
| 模块顶层 | undefined（ESM 严格模式） | 别在顶层依赖 this |

## 小结

- this 四级优先级：new > 显式 > 隐式 > 默认；判断时按序查表。
- 隐式丢失的根源是"调用形态变了"——赋值、传参、解构都会丢。
- bind 手写两个考点：new 穿透 + 原型链维护。
- 箭头函数取词法 this：回调保 this 的现代答案，但别拿它当对象方法。

## 延伸阅读

- [MDN this](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/this)
- [MDN 箭头函数](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Functions/Arrow_functions)
