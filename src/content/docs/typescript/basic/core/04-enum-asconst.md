---
title: 枚举、字面量类型与 as const
description: enum 是 TS 少数不擦除的构造、数字枚举双向映射与字符串枚举、const enum 的内联与兼容坑、as const 冻结字面量、三方案选型的现代共识
level: basic
---

[类型系统第一性](/typescript/basic/core/01-type-system/)篇说「TS 是类型
擦除的」——有一个著名例外：**enum**。围绕它和 `as const` 的选型之争是
TS 面试的风格题：考的不只是知识点，还有你对「类型该不该进运行时」的
态度。

## enum：类型世界的钉子户

数字枚举编译后是真实的 JS 对象，还带双向映射：

```ts
enum Status {
  Active,
  Disabled,
}

// 编译产物（tsc 默认）：
// var Status;
// (function (Status) {
//   Status[(Status["Active"] = 0)] = "Active";   // 正向赋值
//   Status[(Status["Disabled"] = 1)] = "Disabled"; // 反向也写一份
// })(Status || (Status = {}));

Status.Active;      // 0
Status[0];          // "Active" —— 数字枚举可以从值反查名字
```

字符串枚举没有反向映射（值不唯一，反查无意义），只能正向取：

```ts
enum LogLevel {
  Debug = 'debug',
  Error = 'error',
}
LogLevel.Error; // "error" —— 单向
```

「enum 不擦除、有运行时产物」直接引出两个工程后果：bundle 里多了实际
代码；**tree-shaking 对普通 enum 不友好**（IIFE 形式有副作用痕迹）。

## const enum：内联的代价

`const enum` 在编译时把成员直接内联成字面量，不生成对象：

```ts
const enum Fast {
  A = 1,
}
const x = Fast.A; // 编译后就是 const x = 1 /* Fast.A */
```

听起来完美，但它有著名的兼容坑：`const enum` 依赖跨文件类型信息，而
现代构建链（Vite/esbuild/Babel 单文件转译，即 isolatedModules 模式）
**没有跨文件视野**，无法内联——生态的现状是 `const enum` 在打包器时代
逐渐失宠，官方文档也提示了限制。结论：新项目别把宝押在 const enum 上。

## as const：不进运行时的「枚举」

`as const` 把对象/数组断言成最窄的字面量类型并全部 readonly：

```ts
const Status = {
  Active: 'active',
  Disabled: 'disabled',
} as const;

type Status = (typeof Status)[keyof typeof Status];
// "active" | "disabled" —— 字面量联合类型

Status.Active = 'x'; // ❌ readonly，编译期拦截
```

两行代码得到：运行时一个普通对象（可 tree-shaking、可序列化）、类型层
一个字面量联合。`typeof` 取对象类型、`keyof` 取键联合、索引访问取值
联合——这是 TS 的「三板斧组合技」，面试能手写这套推导就说明真的用过。

## 三方案对比与选型

| | `enum` | `const enum` | `as const` 对象 |
| --- | --- | --- | --- |
| 运行时产物 | 有（对象+双向映射） | 无（内联） | 普通（就是对象本身） |
| 值反查名字 | 数字枚举可以 | ❌ | 需要自己写 |
| tree-shaking | 不友好 | ✅ | ✅ |
| 打包器兼容 | ✅ | ⚠️ isolatedModules 下失效 | ✅ |
| 值类型自由度 | 字符串/数字 | 同左 | 任意（含异构值） |

现代社区共识（官方风格指南背书）：**运行时需要真实对象（映射表、配置）
用 `as const` 对象 + typeof 推导联合；纯粹类型层的取值约束用字符串
字面量联合**；`enum` 留给明确需要「数字↔名字双向映射」的场景（如
协议状态机调试日志）。理由回到第一篇的第一性：TS 的默认美德是「类型
不进运行时」，enum 是历史留下的例外，`as const` 是回归正道的写法。

## 小结

- enum 是 TS 少数不擦除的构造：数字枚举有双向映射，字符串枚举单向。
- const enum 内联但有 isolatedModules 兼容坑，打包器时代失宠。
- `as const` = 字面量类型 + readonly，配合 `typeof`/`keyof` 推导出
  字面量联合，运行时只是普通对象。
- 选型共识：运行时映射用 as const 对象，类型约束用字面量联合，enum
  只在需要双向映射时用。

## 延伸阅读

- [TypeScript 官方：枚举](https://www.typescriptlang.org/docs/handbook/enums.html)
- [TypeScript 官方风格指南：不要无脑用 enum](https://www.typescriptlang.org/docs/handbook/enums.html#const-enum)
- [TypeScript 官方：as const 与只读类型](https://www.typescriptlang.org/docs/handbook/2/objects.html#the-readonly-qualifier)
