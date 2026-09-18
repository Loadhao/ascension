---
title: Web 性能指标与采集
description: 用户感知与技术性能的差别、Core Web Vitals 三件套与阈值速记、FCP/LCP/INP/CLS 各测什么、PerformanceObserver 采集与 sendBeacon 上报、LCP 定位候选元素
level: intermediate
---

「页面快不快」没有单一答案：开发者看的 loading 时间和用户感知的「能用
了」是两回事。Core Web Vitals 是 Google 给出的**以用户感知为锚**的指标
体系，也是前端性能面试的主战场——背指标不如理解「每个指标在替用户
回答哪个问题」。

## 四个指标：替用户回答四个问题

```mermaid
flowchart LR
    A["开始加载"] --> B["FCP<br/>什么时候看见东西了"]
    B --> C["LCP<br/>主要内容什么时候出现"]
    C --> D["INP<br/>点了之后多久有反应"]
    D --> E["CLS<br/>页面稳不稳，会不会误点"]
```

| 指标 | 替用户回答 | 好线 | 差线 |
| --- | --- | --- | --- |
| **FCP**（First Contentful Paint） | 什么时候看见第一个内容？ | < 1.8s | > 3s |
| **LCP**（Largest Contentful Paint） | 主体内容什么时候出现？ | < 2.5s | > 4s |
| **INP**（Interaction to Next Paint） | 操作后多久有反应？ | < 200ms | > 500ms |
| **CLS**（Cumulative Layout Shift） | 内容会不会乱跳害我误点？ | < 0.1 | > 0.25 |

阈值速记：**2.5 / 200 / 0.1**——LCP 秒、INP 毫秒、CLS 无量纲。三个
理解要点：

- **LCP 不是 FCP 的重复**：首屏可能先出个 loading 图标（FCP），真正
  的主体（头图、正文块）晚得多——LCP 取**视口内最大的内容元素**完成
  渲染的时刻，候选只算 `<img>`、背景图、video 首帧、块级文本。
- **INP 取代 FID**：FID 只测「第一次交互的输入延迟」，INP 测**整个
  生命周期里所有交互的响应延迟**取最差（近似 P98）——一个页面只有
  第一次点击快没用，INP 抓的是常态。
- **CLS 是累积分数**：每次布局偏移记「影响面积比例 × 移动距离比例」，
  累加整个生命周期——所以无图页面加载后插 banner、字体晚到换行，
  都会推高 CLS。

## PerformanceObserver：指标怎么采

性能条目不是 read 一次就完——LCP/CLS 随交互持续更新，标准采集姿势是
**PerformanceObserver** 持续订阅：

```js
new PerformanceObserver((list) => {
  const entries = list.getEntries();
  const last = entries[entries.length - 1]; // LCP 取最后一个候选
  reportLCP(last.startTime);
}).observe({ type: 'largest-contentful-paint', buffered: true });
```

`buffered: true` 是关键参数： observer 注册前的历史条目一次性补发——
否则指标采集脚本晚加载几百毫秒，FCP/LCP 早就发生了，采到的永远是空。
每个指标对应一个 entryType：`paint`（FCP）、
`largest-contentful-paint`、`event`（INP 配合 event timing），
CLS 用 `layout-shift` 条目累加（有 `hadRecentInput` 标记的偏移不计
——用户主动操作后的位移不算分）。

## 上报：sendBeacon 为什么是标准答案

指标要上报服务端，难点在**页面卸载瞬间**：用户看完就走，
`unload` 里的同步 XHR 已经被淘汰，普通 fetch 在页面销毁时可能被取消。
`navigator.sendBeacon(url, data)` 专为这个时刻设计：浏览器承诺
**异步发送且不阻塞卸载**，页面关了数据照样送达。兼容兜底是
`fetch(url, { keepalive: true })`——同一诉求的两种 API。

## LCP 差了，往哪查

按「渲染管线的哪一步拖了」定位，四个常见元凶对应四类动作：

- **慢在服务器/网络**：TTFB 长 → CDN、缓存、SSR；
- **慢在资源加载**：图片没预加载 → `<link rel="preload">`、关键图
  优先、懒加载只给非首屏；
- **慢在阻塞**：同步 JS/CSS 挡住渲染 → defer、拆关键 CSS（呼应
  [渲染管线](/js/intermediate/web/04-browser-render/)篇）；
- **慢在排队**：主线程被长任务占满 → 代码分割、Web Worker。

面试答「怎么优化 LCP」先报定位路径再报手段，比背优化清单高一档。

## 小结

- Core Web Vitals 以用户感知为锚：FCP 见东西、LCP 见主体、INP 响应
  快、CLS 不乱跳，阈值速记 2.5s / 200ms / 0.1。
- LCP 取视口最大内容元素，INP 全周期取最差（取代 FID），CLS 是偏移
  累积分数且用户操作后不算。
- 采集用 PerformanceObserver + `buffered: true` 补历史；上报用
  sendBeacon / fetch keepalive 保卸载不丢。
- 优化先定位（TTFB/资源/阻塞/排队）再动手，渲染管线是底层依据。

## 延伸阅读

- [web.dev：Core Web Vitals](https://web.dev/articles/vitals)
- [MDN：PerformanceObserver](https://developer.mozilla.org/zh-CN/docs/Web/API/PerformanceObserver)
- [web.dev：sendBeacon 与 keepalive](https://web.dev/articles/sendbeacon)
