---
title: 模块系统：CommonJS 与 ESM
description: "require 的缓存与循环引用、ESM 静态分析的本质差异、互操作与 type: module 的坑"
level: intermediate
core: true
---

Node 的模块系统正在从 CommonJS 向 ESM 迁移——面试高频点不是"语法
长什么样"，而是**两套机制的本质差异**：CJS 运行时加载 vs ESM 静态
分析，由此派生出循环引用行为、tree-shaking、顶层 await 等一系列差异。

## CommonJS：运行时加载

```javascript
// math.js
exports.add = (a, b) => a + b;
// app.js
const math = require("./math");   // 运行时同步加载
math.add(1, 2);
```

- **require 本质是一个函数调用**——运行时读文件、包一层函数执行、
  缓存 module.exports；
- **缓存**：同一模块多次 require 只执行一次（`require.cache` 可查）；
- **exports 陷阱**：`exports = {...}` 是重绑变量（无效），必须
  `module.exports = {...}`——因为 exports 只是 module.exports 的
  引用别名。

## 循环引用：拿到的是"未完成"的模块

```javascript
// a.js:  exports.x = 1;  const b = require("./b");  exports.y = 2;
// b.js:  const a = require("./a");  console.log(a.x);  // 1（已写入）
//        console.log(a.y);  // undefined（还没执行到）
```

- CJS 循环引用拿到的是**执行到一半的 exports**（部分导出）——
  不报错但埋雷；
- 解法：**把 require 放到函数内部**（延迟加载），或重构消除循环。

## ESM：静态分析与编译时确定

```javascript
import { add } from "./math.js";   // 编译时解析，import 会提升
export const add = (a, b) => a + b;
```

- **import 是声明不是函数**——模块图在**编译时**就确定（这就是
  tree-shaking 的基础：打包器能静态分析哪些导出没被用）；
- **循环引用在 ESM 里靠"提升与绑定"工作**：导出的是**活的绑定**
  （变量变了引用处也变），循环引用比 CJS 更安全但仍有 TDZ 风险；
- **顶层 await**：ESM 支持（CJS 不行）——模块加载可异步。

## 互操作与迁移坑

- `package.json` 的 `"type": "module"` 决定 `.js` 文件按 ESM 解析
  （`.cjs`/`.mjs` 强制指定）；
- **CJS 里 require ESM**：Node 22+ 才支持 require 同步加载 ESM
  ——此前必须动态 `import()`（异步）；
- __dirname/__filename 在 ESM 不存在——用
  `import.meta.dirname` 替代（高频迁移坑）。

## 高频追问速答

- **tree-shaking 为什么需要 ESM？** CJS 的 require 是运行时函数
  调用，静态分析器无法确定会用到哪些导出；ESM 的 import/export
  是语法层声明——未引用的导出可安全删除。
- **动态 import 是什么？** `import("./mod.js")` 返回 Promise——
  运行时按需加载（代码分割/懒加载的基础），与静态 import 的
  提升行为互补。
- **循环引用在 ESM 怎么表现？** 活绑定让"函数导出"的循环引用
  大多能工作（调用时函数已定义），但顶层执行的值导出仍可能
  TDZ 报错——依赖加载顺序。

## 小结

- CJS = 运行时函数调用 + 缓存 + 部分导出的循环引用；ESM = 编译时
  静态分析 + 活绑定 + tree-shaking 能力。
- exports 别名陷阱、循环引用部分导出、__dirname 缺失——三大
  高频迁移坑。
- 判断题："为什么打包器需要 ESM 才能摇树"——静态分析，答到这就
  抓住了本质。
