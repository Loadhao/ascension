---
title: 类型声明与 .d.ts
description: declare 的 ambient 语义、.d.ts 文件与三来源优先级、declare module 给无类型库补声明、@types 组织的 DefinitelyTyped 机制、库作者的类型出口配置
level: basic
---

npm 装个包编辑器就自带类型提示、`import` 一个 JS 老库却报「找不到声明
文件」——这背后是 TS 的类型声明体系。它是每个 TS 工程第一天就会撞上的
东西：看懂 `.d.ts`，90% 的「类型找不到」报错都能自己修。

## 声明文件：只有类型，没有实现

`.d.ts`（declaration file）是**只含类型、不含实现**的文件。普通 `.ts`
文件编译出 JS，`.d.ts` 不编译、不进产物，唯一用途是告诉编译器「某个
东西长什么形状」。它里面的声明叫 **ambient declaration**（环境声明）
——「这个东西在运行时是存在的，你别管从哪来，类型按我说的算」：

```ts
// 全局变量的声明：window 上挂的第三方 SDK
declare const gtag: (...args: unknown[]) => void;

// 全局函数 / 类型 / 模块，同理用 declare 前缀
declare function init(): void;
```

`declare` 的语义是「只描述、不生成代码」——普通 `const gtag = ...` 会
产生运行时赋值，`declare const` 不会，纯粹是给类型系统登记户口。

## 类型从哪来：三个来源按序命中

import 一个包时，TS 找类型的顺序：

1. **包自带**：`package.json` 的 `types`/`typings` 字段指向的
   `.d.ts`（现代库的标准姿势，如 vue、zod）；
2. **社区维护**：`@types/xxx` 包——DefinitelyTyped 组织为没自带类型的
   库写的声明，`pnpm i -D @types/node` 即装即生效；
3. **都没有**：报 TS7016「找不到声明文件」，需要你手写（见下节）。

三来源的判断口诀：**先看包里有没有，再去 @types 找，都没有就自己写**。
装了 `@types/xxx` 却不生效，先查是不是和包自带的类型打架（重复声明）。

## declare module：给无类型的库补声明

第三方 JS 库没有类型时，一个 `.d.ts` 文件就能补上：

```ts
// types/untyped-lib.d.ts
declare module 'untyped-lib' {
  export function format(input: string): string;
  export const version: string;
  const lib: { format: typeof format; version: string };
  export default lib;
}
```

`declare module '包名'` 把声明**挂到那个模块名上**，之后 import 该包
就有完整类型。三个实战要点：

- 文件必须在 `tsconfig` 的 `include` 范围内（一般放 `types/` 目录）；
- 赶时间可以先 `declare module 'xxx'` 空壳兜底（隐式 any），但要记
  TODO 别烂尾；
- 全局 CSS/图片导入报错（`import './a.css'`）同理，用
  `declare module '*.css'` 通配声明。

## 库作者：类型是 API 的一部分

自己发包时类型出口两步走：入口源码直接是 `.ts`（ bundler 生成
`.d.ts`），或手写声明文件，然后在 `package.json` 里指路：

```json
{
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts"
}
```

`types` 字段就是上面「来源 1」的挂载点。TS 项目里不写 `types`，用户
import 时 TS 会找同目录的 `index.d.ts` 兜底——找不到就走 @types，再
没有才报错。**类型就是库 API 的一部分**：库没类型，用户要么裸奔 any
要么自己补，生态位直接低一档。

## 小结

- `.d.ts` 只含类型无实现，不进编译产物；`declare` 是「登记户口」语义，
  不生成代码。
- 类型三来源按序命中：包自带 `types` 字段 → `@types/xxx` 社区包 →
  手写 `declare module`。
- 「找不到声明文件」的修复路径：先查包是否自带、再装 @types、最后
  自己写声明挂到模块名上。
- 库作者把 `types` 字段当 API 发布；类型缺失直接决定库的生态位。

## 延伸阅读

- [TypeScript 官方：声明文件与 @types](https://www.typescriptlang.org/docs/handbook/2/type-declarations.html)
- [DefinitelyTyped 组织](https://github.com/DefinitelyTyped/DefinitelyTyped)
- [TypeScript 官方：package.json 的 types 字段](https://www.typescriptlang.org/docs/handbook/declaration-files/publishing.html)
