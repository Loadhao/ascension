---
title: Composition API 与逻辑复用
description: setup 的运行时机、组合式函数复用逻辑、为什么它取代了 mixin
level: basic
core: true
---

## 从 Options 到 Composition

Options API（Vue 2 风格）把代码按「类型」归堆：data 一堆、methods
一堆、computed 一堆——**一个功能的状态与方法被拆到多处**。组件
大了以后，「这个状态被哪些方法改」要靠人肉跳转。

Composition API（Vue 3 主推）按「**功能**」组织：一个功能的
状态、计算、副作用写在一起，甚至抽成独立函数：

```js
// useMouse.js —— 组合式函数：逻辑复用的载体
import { ref, onMounted, onUnmounted } from 'vue';

export function useMouse() {
  const x = ref(0), y = ref(0);
  function update(e) { x.value = e.pageX; y.value = e.pageY; }
  onMounted(() => window.addEventListener('mousemove', update));
  onUnmounted(() => window.removeEventListener('mousemove', update));
  return { x, y };       // 状态 + 生命周期打包复用
}
```

## setup 与 `<script setup>`

组件实例创建时执行 setup：此时「组件实例正在初始化」这一上下文
存在，**生命周期钩子（onMounted 等）必须在此时同步注册**——异步
回调里注册会失联。

- `<script setup>` 是 setup 的编译糖：顶层变量自动暴露给模板，
  组件导入即注册（无需 components 选项）
- 响应式状态用 `ref`/`reactive`（机制见
  [响应式系统](/vue/basic/core/01-reactivity/)），computed 做派生
  （有缓存），watch 显式监听副作用

## 为什么组合式函数优于 mixin

| 维度      | mixin                    | 组合式函数            |
| ------- | ------------------------ | ---------------- |
| 数据来源    | 属性混入组件，**来源不明**          | 显式 import，一眼看清   |
| 命名冲突    | 多个 mixin 撞名静默覆盖           | 作用域隔离，解构改名即解    |
| 类型推导    | this 上的属性 TS 很难推          | 普通 JS 函数，完整类型    |

组合式函数本质是**普通函数**：调用它得到响应式状态与方法，复用
成本回到函数组合这最朴素的层次——这也是 React Hooks 解决的同
一个问题（mixins/HOC 的历史坑），两边答案殊途同归。

## 要点备忘

- 按功能组织代码取代按选项类型归堆；组合式函数是复用的最小单元
- 生命周期钩子必须同步注册在 setup 上下文里
- mixin 三宗罪：来源不明、命名冲突、类型缺失——新代码别再用
- computed 派生缓存、watch 显式副作用：能推导的状态别存储

## 延伸阅读

- [Vue 官方文档 · 组合式函数](https://cn.vuejs.org/guide/reusability/composables.html)
