---
title: Promise 组合器与并发控制
description: all/allSettled/race/any 四兄弟的差异与选型、手写并发限制器、fail-fast 与全量收集的业务场景
level: intermediate
core: true
---

同时请求 3 个接口，"全部成功才继续"用 all，"有一个成功就行"用 any，
"无论如何都要结果"用 allSettled——**Promise 组合器的选型就是业务语义
的编码**。event-loop 篇给了 Promise 基础和手写 limit，本篇深挖四个
组合器的差异与实战模式。

## 四个组合器

| 组合器 | 全部成功？ | 一个失败？ | 返回值 | 典型场景 |
| --- | --- | --- | --- | --- |
| `all` | 全成功才 resolve | **立即 reject**（fail-fast） | 结果数组（按序） | 多个必须同时成功 |
| `allSettled` | 等全部结束（无论成败） | 不 reject | `{status, value/reason}[]` | 批量操作，**收集全部结果** |
| `race` | 第一个结束（无论成败） | 同上 | 第一个结果 | 超时控制（race + setTimeout） |
| `any` | 第一个**成功**的 | 全失败才 reject（AggregateError） | 第一个成功值 | 多 CDN 取最快可用 |

- **all 的 fail-fast 陷阱**：一个失败就立即 reject——其他还在进行的
  请求不会取消（只是结果被丢弃）——如果需要"全部完成再处理"用
  allSettled；
- **any 的 AggregateError**：全部失败时抛 AggregateError（包含所有
  失败原因），比 all 的"第一个失败就停"更适合"多源取最快可用"。

## 超时控制：race 的经典模式

```javascript
function withTimeout(promise, ms) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("timeout")), ms));
  return Promise.race([promise, timeout]);
}
```

- race 的"第一个结束就定结果"特性天然适合**超时竞速**——给任何
  Promise 套一层超时壳；
- 生产实践：配合 AbortController **真正取消底层请求**（race 只是
  不等了，请求还在跑——AbortController 才是取消）。

## 并发限制：手写并发限制器

```javascript
async function limitConcurrent(tasks, limit) {
  const results = [];
  const executing = new Set();
  for (const task of tasks) {
    const p = task().then(r => { executing.delete(p); return r; });
    results.push(p);
    executing.add(p);
    if (executing.size >= limit) {
      await Promise.race(executing);   // 等最快的完成，腾出位置
    }
  }
  return Promise.all(results);
}
```

- 与 event-loop 篇的"手写 limit"同源——核心是 `Promise.race`
  监听当前执行中的任务，**完成一个就补一个**（贪心调度）；
- `limit` 的值：IO 密集 10~20（带宽瓶颈），CPU 密集 = 核数
  （cluster 篇的多核对照）。

## 高频追问速答

- **all 的结果有序吗？** 有——结果数组按**输入顺序**排列（不是完成
  顺序），即使后面的先完成也不会乱序。
- **all 里一个失败，其他的还跑吗？** 跑——all 只是"不再等结果"，
  不会取消底层请求；要真正取消需要 AbortController 或每个 Promise
  自带取消逻辑。
- **allSettled 的结果结构？** `[{ status: "fulfilled", value: ... },`
  `{ status: "rejected", reason: ... }]`——每个都有 status 字段，
  区分成功和失败（all 的结果数组只有值没有状态）。

## 小结

- 四组合器按语义选：all（必须全成）、allSettled（收集全部）、
  race（竞速/超时）、any（多源取最快成功）——**选型就是业务
  语义的编码**。
- 并发限制器 = race 监听执行中任务 + 完成补位——贪心调度。
- all 的 fail-fast 不取消底层请求——生产需要 AbortController
  配合。
