---
title: EventEmitter：发布订阅模式
description: on/emit/off/once 的实现、Node 一切异步 API 的底座、error 事件的特殊地位与监听器泄漏
level: intermediate
core: true
---

Node.js 的**一切异步 API 都基于 EventEmitter**：http server 的
request、stream 的 data/error、process 的 exit——理解发布订阅模式
就是理解 Node 的事件体系（浏览器端的 addEventListener 是同构思想）。

## 核心机制：事件表 + 触发

```javascript
class EventEmitter {
  #events = new Map();
  on(event, fn) {
    if (!this.#events.has(event)) this.#events.set(event, []);
    this.#events.get(event).push(fn);
    return this;                       // 链式
  }
  emit(event, ...args) {
    (this.#events.get(event) || []).forEach(fn => fn(...args));
    return this;
  }
  off(event, fn) {
    const fns = this.#events.get(event) || [];
    this.#events.set(event, fns.filter(f => f !== fn));
    return this;
  }
  once(event, fn) {                    // 执行一次自动移除
    const wrapper = (...args) => { this.off(event, wrapper); fn(...args); };
    this.on(event, wrapper);
  }
}
```

- **手写 EventEmitter** 是 Node 面试的手写题 Top3——核心是
  `Map<事件名, 回调数组>` 的增删遍历；
- **once 的实现技巧**：包装一层先移除再执行（移除的必须是包装后的
  引用，否则 off 不掉）。

## error 事件的特殊地位

Node 的约定：**emit("error") 且无监听器时，直接抛异常崩掉进程**——
其他事件没监听器只是忽略。这是 Node 的错误处理哲学：错误不允许被
静默吞掉（对照回调的 error-first 约定）。

## 监听器泄漏：长生命周期的坑

http server 这类**长生命周期对象**的监听器只增不减——每次请求都
注册新监听器、从不移除 → 内存泄漏 + 重复执行：

- Node 超过 10 个同事件监听器会打
  `MaxListenersExceededWarning`（默认阈值）；
- 解法：一次性逻辑用 once、动态注册必须配对 off、命名函数方便
  移除（匿名函数无法 off）。

## 高频追问速答

- **emit 是同步还是异步？** 同步——emit 时立即依次执行所有监听器
  （异步要自己 setTimeout/process.nextTick）；这意味着 emit 后的
  代码在监听器**之后**执行。
- **事件顺序有保证吗？** 同一事件的多个监听器按注册顺序同步执行；
  监听器内再 emit 其他事件是嵌套调用——复杂链路建议解耦为独立事件。
- **EventEmitter 和 Promise 怎么选？** 单次结果 → Promise（then/
  await）；**多次/持续事件** → EventEmitter（流、连接、进度）——
  "一次性结果 vs 持续事件流"是分界线。

## 高频追问速答（续）

- **怎么给 EventEmitter 加通配符监听？** 原生不支持——扩展事件表
  的匹配逻辑（前缀匹配/正则）或用命名空间约定（"user:*"）。

## 小结

- 核心结构：Map<事件, 回调数组>；on/emit/off/once 四件套，once 用
  包装函数实现自动移除。
- error 事件无监听器直接崩进程——Node 的错误不允许静默。
- 长生命周期对象的监听器泄漏是 Node 内存泄漏的经典来源——注册
  必须配对移除。
