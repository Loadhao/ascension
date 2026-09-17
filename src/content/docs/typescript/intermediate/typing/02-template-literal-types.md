---
title: 模板字面量类型
description: 类型层的字符串拼接与组合、内置大小写工具类型的本质、infer 模式提取与手写 StartsWith、路由路径推导参数对象的实战、类型字符串的可读性税
level: intermediate
---

[类型编程三构件](/typescript/intermediate/typing/01-type-programming/)篇
之后，还差一块拼图：**模板字面量类型**——把 JS 的模板字符串搬进类型层，
让类型系统对字符串做拼接、拆解和模式匹配。它是内置大小写工具类型的
实现原理，也是路由参数推导这类「类型体操招牌题」的解法。

## 类型层的字符串拼接

模板字面量类型语法与 JS 模板串一致，占位符可以是任意类型，产出的是
**所有组合的联合**：

```ts
type Width = 'small' | 'medium';
type Height = 'top' | 'bottom';

type Pos = `${Width}-${Height}`;
// "small-top" | "small-bottom" | "medium-top" | "medium-bottom"
```

两个联合占位，类型就是笛卡尔积——组合爆炸是特性不是 bug，但**占位符
联合必须可控**，塞进 string 就是全字符串，失去意义。

四个内置大小写工具类型本质都是模板字面量的语法糖：

```ts
type Up = Uppercase<'abc'>;      // "ABC"
type Cap = Capitalize<'hello'>;  // "Hello"
```

它们等价于「内置的 infer 提取 + 重新拼接」——TS 把最常用的字符操作
内置了，日常不必手写。

## infer 拆字符串：模式匹配的正主

模板字面量真正的威力在条件类型里**反向使用**：不是拼接，而是按模式
拆解。`infer` 在模板串里就是通配符：

```ts
type StartsWith<S extends string, P extends string> =
  S extends `${P}${string}` ? true : false;

type A = StartsWith<'netty-core', 'netty'>;  // true
type B = StartsWith<'redis', 'netty'>;       // false
```

`${P}${string}` 读作「以 P 开头、后面随便」——字符串版的前缀匹配。
两个 `infer` 还能对半拆：

```ts
type Split<S extends string> =
  S extends `${infer Head}-${infer Rest}` ? [Head, Rest] : [S];

type R = Split<'user-profile'>; // ["user", "profile"]
```

递归 + 模板串能把字符串彻底解构（官方 Trim 实现就是「递归去掉首尾
空格模式」），但递归深度有限制（约 1000 层），工程上别玩火。

## 实战：路由路径推导参数

类型体操招牌题，也是框架源码里的真实用法——把
`/user/:id` 这类路径类型化成参数对象：

```ts
type Params<P extends string> =
  P extends `${string}:${infer Param}/${infer Rest}`
    ? { [K in Param]: string } & Params<Rest>
    : P extends `${string}:${infer Param}`
      ? { [K in Param]: string }
      : {};

type R = Params<'/user/:id/posts/:pid'>;
// { id: string } & { pid: string }
```

递归条件类型逐段扫描路径：遇到 `:xxx` 就用 infer 提取参数名、映射成
`{ xxx: string }`，再递归处理剩余段。React Router / Vue Router 的类型
安全跳转、tRPC 的类型链路，内核都是这套东西。写完再读一遍 01 篇的
可读性税——这种代码必须收进命名工具类型，业务代码里内联就是灾难。

## 小结

- 模板字面量类型 = 类型层字符串拼接，占位联合做笛卡尔积，占位要可控。
- Uppercase/Capitalize 是内置的模板 + infer 语法糖。
- 模板串里的 infer 是字符串模式匹配：前缀、对半拆、递归解构都靠它，
  递归深度有上限。
- 路径推导参数对象是模板字面量 + 条件类型 + 映射类型的合体应用，
  框架类型安全的地基。

## 延伸阅读

- [TypeScript 官方：模板字面量类型](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html)
- [TypeScript 官方：内置字符工具类型](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html#built-in-character-manipulation)
- [type-challenges：模板字面量专题](https://github.com/type-challenges/type-challenges)
