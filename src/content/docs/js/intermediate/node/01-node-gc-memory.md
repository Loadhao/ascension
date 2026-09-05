---
title: Node.js 垃圾回收与内存管理
description: V8 分代回收：新生代 Scavenge、老生代 Mark-Sweep/Mark-Compact、增量与并发标记，以及线上内存泄漏排查
level: intermediate
core: true
---

## V8 的内存布局

Node 进程内存 ≠ V8 堆。堆外还有 Buffer（C++ 层）、libuv 线程栈等。
V8 堆按对象寿命分代：

```mermaid
flowchart LR
    A["新生代<br/>（1~8MB × 2 半空间）"] -->|"熬过两次回收<br/>或 To 空间超 25%"| B["老生代<br/>（数百 MB ~ 数 GB）"]
    B --> B1["老生代内部：<br/>标记清除 + 标记整理"]
```

- 64 位默认老生代约 1.4GB，`--max-old-space-size=4096` 调整；
- `process.memoryUsage()` 里的 `heapUsed` 只是 V8 堆，RSS 涨而
  heapUsed 不涨，先怀疑堆外（Buffer/内存映射）。

## 新生代：Scavenge 半空间复制

把堆对半切成 From/To 两块：回收时把**活对象**从 From 复制到 To 后
整体互换，一口气清掉死对象。

| 特性 | 代价/收益 |
|---|---|
| 复制成本 ∝ 活对象数 | 新生代"朝生夕死"，活对象极少 → 极快 |
| 空间利用率 50% | 新生代小（几 MB），可接受 |
| 晋升条件 | 经历两次 Scavenge 仍存活 / To 空间占比 > 25% |

短命闭包、临时数组都在这一代被几毫秒内清掉——**别怕创建小对象**。

## 老生代：Mark-Sweep + Mark-Compact

- **标记清除（Mark-Sweep）**：从根（全局对象、当前调用栈）遍历标记
  可达对象，清除不可达的。快，但留下**内存碎片**。
- **标记整理（Mark-Compact）**：清除时把活对象向一端搬移，消灭碎片。
  搬移要停机，所以 V8 只在碎片化严重时才启用。

老生代全量标记会造成**数百毫秒级停顿**，V8 用两招摊薄：

1. **增量标记（Incremental）**：标记拆成小步，与应用逻辑交替执行
  （写屏障记录标记期间的引用变化）；
2. **并发标记（Concurrent）**：标记主力在后台线程跑，主线程只在收尾
  暂停一小段——现代 Node（V8 ≥ 6.x）的默认主力。

## 什么时候泄漏：四个经典来源

```js
// ① 全局变量兜底（忘了 let/const，挂到 global）
function handle(req) { cache = loadData(req); }   // cache 成了全局

// ② 闭包持大对象：缓存函数把整个 response 对象存起来
const cache = {};
app.get('/a', (req, res) => { cache[req.url] = res; /* res 永不释放 */ });

// ③ 定时器/事件监听忘记清理
setInterval(poll, 1000);            // 组件销毁后仍在跑
emitter.on('data', handler);        // 没有对应 off/removeListener

// ④ 无界缓存：Map 只进不出
const m = new Map(); m.set(id, blob);   // 用 WeakMap/LRU 兜住
```

判定信号：RSS/heapUsed **锯齿上升且每次峰谷都抬高**——正常服务是锯齿
回到基线，泄漏是楼梯。

## 排查姿势

```bash
# 1. 压测中打堆快照
kill -USR2 <pid>              # 配合 heapdump/signal 库生成 .heapsnapshot

# 2. 或用内置诊断
node --inspect app.js         # Chrome DevTools → Memory → Heap Snapshot

# 3. 对比两个时间点的快照：按 "Objects allocated between snapshots"
#    排序，看谁的数量只增不减
```

```js
// 代码内定时自检：heapUsed 阶梯上涨即报警
setInterval(() => {
  const { heapUsed } = process.memoryUsage();
  console.log(`heap ${Math.round(heapUsed / 1e6)} MB`);
}, 30000);
```

## 小结

- 分代假说是根：短命对象 Scavenge（复制，极快），长寿对象 Mark-Sweep/
  Compact（标记，增量 + 并发摊停顿）。
- 泄漏四来源：全局兜底、闭包持大对象、监听器/定时器不清理、无界缓存。
- RSS 涨 heapUsed 不涨 → 查堆外；heapUsed 楼梯上升 → 双快照 diff
  找只增不减的对象。

## 延伸阅读

- [深入理解 Node.js 垃圾回收与内存管理（简书）](https://www.jianshu.com/p/4129a3fce7bb)——本篇母本
- [Node.js 官方文档 · Diagnostics](https://nodejs.org/zh-cn/docs/guides/diagnostics/)（heap snapshot 与 inspector 用法）
