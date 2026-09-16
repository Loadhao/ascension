---
title: 错误处理：Error 类型与全局捕获
description: Error 类型体系、try/catch/finally 行为细节、全局错误捕获三入口、与可观测性日志的衔接
level: basic
core: true
---

JS 的错误处理看似简单（try/catch），实际有三个独立入口和一堆行为
细节：**同步 try/catch、异步 .catch、全局 window.onerror**——各有
各的覆盖范围，漏掉任何一个就是"用户看到了白屏但监控里什么都没有"。

## Error 类型体系

| 类型 | 什么时候抛 | 例子 |
| --- | --- | --- |
| Error | 基类 | throw new Error("自定义消息") |
| TypeError | 类型不匹配 | null.foo() |
| RangeError | 值越界 | new Array(-1) |
| SyntaxError | 语法错误（解析时） | eval("((") |
| ReferenceError | 引用未定义变量 | undeclaredVar |

- **自定义 Error**：`class AppError extends Error`——加 code/详情
  字段，catch 时按 code 分流处理（工具集设计篇的错误返回对接）；
- `instanceof` 判断类型比 `err.name` 可靠（name 可能被子类覆写）。

## try/catch/finally 的行为细节

```javascript
try {
  throw new Error("test");
} catch (err) {
  return "from catch";    // ← finally 仍然执行
} finally {
  console.log("finally"); // 总是执行
}
```

- **finally 总是执行**——即使 try/catch 里有 return/throw；
- **try/catch 只捕获同步异常**——异步回调里的 throw 和 Promise 的
  rejection 都不会被外面的 try/catch 捕获（要用 .catch 或
  await+try）；
- **finally 里的 return 会覆盖** try/catch 的 return（高频陷阱：
  把清理逻辑里的 return 写进 finally 就吞了正常返回值）。

## 全局捕获：三入口覆盖所有异常

```javascript
// ① 同步错误
window.addEventListener("error", (e) => { /* 上报 */ });
// ② 未处理的 Promise rejection
window.addEventListener("unhandledrejection", (e) => {
  console.error("未处理的 Promise:", e.reason);  // 上报
});
// ③ 资源加载失败（img/script 的 error）
window.addEventListener("error", (e) => {
  if (e.target !== window) { /* 资源加载失败 */ }
}, true);   // 捕获阶段才能拦到资源 error
```

- **三个入口覆盖范围不同**：① 捕同步 JS 错误；② 捕异步 Promise
  拒绝；③ 捕资源（img/css/script）加载失败（要捕获阶段才能拦到
  HTML 元素上的 error 事件）；
- Node 侧：`process.on("uncaughtException")` 和
  `process.on("unhandledRejection")`——但要意识到**进程收到这些
  事件时状态可能已不确定**（记录日志后优雅退出）。

## 高频追问速答

- **try/catch 能捕获 Promise 异常吗？** 不能——Promise 的 rejection
  不走 throw 通道；用 `.catch()` 或 `await` 包在 try/catch 里。
- **unhandledrejection 为什么会发生？** 创建了 Promise 但没人
  `.catch()` 也没人 `await`——Node 15+ 直接崩溃（此前只打警告）；
  生产必须挂全局监听。
- **怎么收集错误上下文？** e.message/e.stack 是基本——加上用户
  ID、页面 URL、构建版本号才能定位（Agent 可观测性篇的日志
  结构化思想）。

## 小结

- Error 类型体系 + 自定义 Error 类：instanceof 判断比 name 可靠。
- try/catch 只捕同步——异步分 .catch 和 await+try 两条路。
- 全局三入口（error/unhandledrejection/资源 error）覆盖所有异常
  ——漏一个入口就漏一类错误。
