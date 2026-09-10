---
title: 声明式 UI 与组件模型
description: UI = f(state)：从手写 DOM 到组件树，后端视角的前端范式转换
level: basic
core: true
---

## 命令式 vs 声明式：一次范式转换

命令式（jQuery 时代）：状态变了，**你**去找对应的 DOM 改——
`$('#count').text(n)`。状态散落在 DOM 里，改十处状态要记十处 DOM。

声明式（React）：**UI 是状态的函数**——

```jsx
function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>
    {count}
  </button>;
}
```

你只描述「状态为 count 时界面长什么样」，状态变化后界面怎么
更新由框架推导。全部状态集中在组件里，DOM 只是状态的投影——
这是前端复杂度得以管理的根基，也和后端「期望状态 vs 实际状态」
的调谐思想（K8s 控制循环）异曲同工。

## 组件：返回 UI 的函数

- **组件就是函数**：入参是 props（父组件传入的只读数据），
  返回值是 UI 描述（JSX）
- **JSX 不是模板**：它编译为函数调用（`createElement`），
  所以 `if`、`map`、三元表达式直接可用——JS 的能力就是它的能力
- **组件树**：组件嵌套组合成树，数据经 props 自上而下流动
  （单向数据流），事件经回调自下而上通知

## 对后端读者的三个锚点

| 前端概念       | 类比后端                    | 关键差异                 |
| ---------- | ----------------------- | -------------------- |
| props      | 构造器注入的不可变配置             | 每次父组件重渲染都会传新的        |
| state      | 对象的成员变量                 | 赋值不触发更新，必须用 setter   |
| 渲染（re-render）| 「重新执行组件函数重新生成 UI 描述」    | 便宜：只是生成描述，真正改 DOM 的是框架 |

心智模型转变的最大一处：**组件函数会被反复执行**（每次状态变化都
重跑），函数体里不能有副作用——副作用（请求、订阅、DOM 操作）
必须交给 useEffect 这类专门入口（见
[Hooks 心智模型](/react/basic/core/02-hooks-mental/)）。

## 要点备忘

- UI = f(state)：改状态，不改 DOM——DOM 是框架推导的结果
- 组件是函数、props 是只读入参、state 是触发更新的内部状态
- 单向数据流：数据向下、事件向上，跨层级共享用状态提升或上下文
- 组件函数每次渲染都会重跑，纯函数纪律是性能与正确性的前提

## 延伸阅读

- [React 官方文档 · Describing the UI](https://react.dev/learn/describing-the-ui)
