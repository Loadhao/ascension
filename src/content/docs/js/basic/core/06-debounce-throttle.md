---
title: 防抖与节流：控制执行频率
description: 防抖"最后一次说了算"与节流"固定频率"、手写实现（闭包保存 timer）、场景选择矩阵
level: basic
core: true
---

搜索框每敲一个字发一次请求、滚动事件每像素触发一次——高频事件直接
绑处理器就是性能灾难。**防抖（debounce）**与**节流（throttle）**是
两个控制执行频率的手段，区别一句话：**防抖是"停下来才执行"，节流
是"按固定频率执行"**。

## 防抖：N 毫秒内只执行最后一次

```javascript
function debounce(fn, delay) {
  let timer = null;                    // 闭包保存 timer（闭包篇应用）
  return function (...args) {
    clearTimeout(timer);               // 每次触发取消上一次
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}
// 搜索框：停止输入 300ms 后才发请求
input.addEventListener("input", debounce(search, 300));
```

- 每次触发都**重置计时器**——只有停下来超过 delay 才真正执行；
- 场景：搜索联想（等用户停止输入）、窗口 resize 完成后重算、表单
  实时校验；
- **immediate 变体**：首次立即执行、之后 N ms 内忽略（按钮防连点）。

## 节流：固定频率执行

```javascript
function throttle(fn, interval) {
  let last = 0;
  return function (...args) {
    const now = Date.now();
    if (now - last >= interval) {
      last = now;
      fn.apply(this, args);
    }
  };
}
// 滚动加载：每 200ms 最多触发一次
window.addEventListener("scroll", throttle(loadMore, 200));
```

- **时间戳版**：固定频率但停止触发后不补最后一次（滚动到底的最后
  一次可能丢失）；
- **定时器版**：停止后保证最后一次也执行——按需求选版本；
- 场景：滚动加载、鼠标移动跟踪、游戏按键。

## 选择矩阵

| 场景 | 用哪个 | 为什么 |
| --- | --- | --- |
| 搜索联想 | 防抖 | 要的是"最终输入"，中间的都浪费 |
| 滚动加载更多 | 节流 | 要"持续响应"，不能停了才执行 |
| 按钮防连点 | 防抖（immediate） | 第一次立即生效，后续忽略 |
| resize 重算布局 | 防抖 | 重算贵，等最终尺寸 |

## 高频追问速答

- **手写防抖为什么用闭包？** timer 要跨多次事件调用保持状态——
  每次调用新建变量就失去"取消上一次"的能力（闭包篇的实战应用）。
- **防抖的 immediate 怎么实现？** 首次触发时立即执行并置执行标记，
  delay 后清除标记——"首次立即、后续防抖"。
- **节流要保证最后一次执行吗？** 视场景：滚动加载需要（否则到底部
  不加载），鼠标轨迹不需要——定时器版保证尾部执行。

## 小结

- 防抖"停下来才执行"（搜索/校验），节流"固定频率"（滚动/追踪）
  ——选错方向体验全毁。
- 手写实现的核心都是**闭包保存状态**（timer/last）——闭包篇的
  最典型应用。
- 生产可直接用 lodash 的 debounce/throttle（支持 immediate/尾部
  执行等选项）。
