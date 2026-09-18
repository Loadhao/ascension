---
title: 浏览器内存泄漏场景与排查
description: 可达性与 GC 的判定标准、五大泄漏场景对照（全局/定时器/闭包/脱管 DOM/监听器）、DevTools 内存快照三步排查法、监控侧的堆趋势判断
level: intermediate
---

[GC 与内存管理](/js/intermediate/node/01-node-gc-memory/)篇讲 Node 视角
的垃圾回收，[错误监控](/js/intermediate/web/11-error-monitoring/)篇讲
报错采集——但内存泄漏两者都抓不到：页面不报错、只是越来越卡、越用越
慢，最后「页面无响应」。这一篇讲浏览器侧泄漏的经典场景与排查手法。

## 泄漏的判定标准：不是「没释放」，是「不该可达却可达」

先纠一个常见误区：JS 没有 `free`，你**不能主动释放**内存，GC 自动回收
「不可达」的对象。所以泄漏的定义是：**对象已经没用（不再需要），但
仍然存在引用链把它挂在 GC Root 上**——GC 认为「还有人在用」，永远不收。
反过来说，防泄漏 = 及时断开引用链，排查 = 找到那条不该存在的引用链。

## 五大经典泄漏场景

| 场景 | 泄漏链 | 断链手法 |
| --- | --- | --- |
| 意外全局变量 | 未声明的赋值挂到 `window`，永不回收 | 严格模式 + ESLint `no-undef` |
| 被遗忘的定时器 | `setInterval` 回调闭包持有大对象 | 组件卸载时 `clearInterval` |
| 闭包持有大对象 | 长生命周期函数持有短生命周期的大数据 | 用完置 null，缩小闭包捕获面 |
| 脱管 DOM（detached） | JS 变量存着已被移出文档的节点 | 引用置 null，避免全局缓存节点 |
| 未清理的事件监听 | 监听器引用着组件实例/大对象 | `removeEventListener` / signal abort |

两个场景值得展开。「**脱管 DOM**」最反直觉：从 DOM 树上 `removeChild`
之后，节点本身不会回收——只要 JS 里还有变量指着它（常见于全局字典缓存
DOM 引用、或定时器闭包里引用节点），整棵子树连同上面的监听器都活着。
「**定时器**」是 SPA 事故之王：React 组件卸载没清 `setInterval`，
每次进出一遍这个页面就多一个定时器、多一份闭包持有的数据——页面
来回切换几十次后内存曲线只升不降，就是它的典型指纹。

## 排查三步：从「感觉卡」到「哪行代码」

DevTools 三件套按序使用：

1. **任务管理器/性能监视器定性**：确认「内存只升不降」——反复执行
   可疑操作（开关弹窗、切换页面），看 JS 堆是否阶梯式上涨且不回落；
2. **堆快照（Heap Snapshot）三照对比**：操作前拍一张 → 反复操作 5 次
   → 拍一张。三照对比看「新增对象」：按 Retained Size 排序，找
   Detached 节点和意料之外的大对象；
3. **看 Retainers（保留链）**：选中可疑对象，DevTools 直接列出「谁
   引用它」的完整链路——顺着链找到那个没断开的引用，就是泄漏点。

高频面试答法就卡在第二步到第三步：**快照看增量、Retainers 找引用链**
——「堆快照不是看谁最大，是看谁在增长、谁被谁拽着」。

## 生产侧：监控堆趋势而不是等用户投诉

单机的 DevTools 排查解决不了「线上才知道」的问题。生产监控的思路是
**趋势而非绝对值**：`performance.memory`（Chrome 限定）周期上报
`usedJSHeapSize`，按会话时长画堆趋势——健康会话的堆是锯齿形（分配、
GC 回落），泄漏会话的锯齿底线持续抬高。前端可配合
[性能监控](/js/intermediate/web/10-web-vitals/)体系一起上报，用
sendBeacon 通道；发现异常会话后再用「录制 + 堆快照」在本地复现。

## 小结

- 泄漏 = 不该可达的对象仍被 GC Root 引用链拽着；防泄漏 = 及时断链。
- 五大场景：意外全局、遗忘定时器、闭包持大对象、脱管 DOM、未清理
  监听器；SPA 里定时器与监听器是事故之王。
- 排查三步：性能监视器定性 → 堆快照三照对比看增量 → Retainers 找
  引用链定位代码。
- 生产监控看堆趋势（锯齿底线抬升即可疑），本地再用快照复现。

## 延伸阅读

- [Chrome DevTools：内存问题排查](https://developer.chrome.com/docs/devtools/memory-problems)
- [MDN：内存管理](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Memory_management)
- [web.dev：JavaScript 内存泄漏四类场景](https://web.dev/articles/js-memory)
