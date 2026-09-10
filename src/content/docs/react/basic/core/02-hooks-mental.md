---
title: Hooks 心智模型
description: 每次渲染都是快照：useState 的快照语义、useEffect 的时机与闭包陷阱
level: basic
core: true
---

## useState：状态是渲染的快照

组件函数每次渲染都会重跑（见
[声明式 UI](/react/basic/core/01-declarative-ui/)），所以**每次渲染
都有自己独立的一份 state 快照**：

```jsx
function Counter() {
  const [count, setCount] = useState(0);
  function handleClick() {
    setCount(count + 1);
    setCount(count + 1);
    setCount(count + 1);   // 三次都基于同一快照 → 只 +1
  }
  return <button onClick={handleClick}>{count}</button>;
}
```

- `setCount(count + 1)` 三次传的都是本次渲染快照里的 `count`——
  批量更新后结果仍是 +1
- 要基于最新值连续更新，用**函数式更新**：`setCount(c => c + 1)`
- useState 的「钩子」本质：框架按调用顺序把状态挂到组件实例上——
  **Hooks 不能放进 if/循环**，顺序一乱状态就串了

## useEffect：把副作用挂到渲染之后

组件函数必须纯（同样输入出同样输出），但请求、订阅、改 DOM 这些
副作用总要发生——useEffect 约定它们在**提交到屏幕之后**执行：

```jsx
useEffect(() => {
  const id = setInterval(fetchPrice, 5000);
  return () => clearInterval(id);   // 清理函数：下次执行前/卸载时调用
}, []);                             // 依赖数组：变了才重跑
```

- 依赖数组是「这些值变了就重新执行副作用」的声明，不是优化提示——
  **漏写依赖 = 闭包里的旧值**，这是 Hooks 第一大坑
- 闭包陷阱：effect 捕获的是**那次渲染**的 props/state；依赖写 `[]`
  却在内部读后续变化的 state，读到的永远是旧快照
- 与外部系统同步才用 effect；能由 props/state 推导的数据不要
  再 useState 存一份（派生状态直接算）

## 渲染之间的并发（React 18+）

18 起更新默认**自动批处理**（多处 set 合并成一次渲染）；可中断的
并发渲染让高优先级更新能插队——副作用必须幂等且可清理，因为
effect 可能被执行多次（StrictMode 下开发期就故意双调）。

## 要点备忘

- 快照语义：每次渲染独立 state；连续更新用 `set(c => c + 1)`
- Hooks 按调用顺序取状态，所以不能写在条件与循环里
- 依赖数组是正确性声明：漏依赖读旧值，代价是难查的「时灵时不灵」
- effect 可能多次执行：清理函数不是可选项，是正确性的一部分

## 延伸阅读

- [React 官方文档 · Thinking in React](https://react.dev/learn)
