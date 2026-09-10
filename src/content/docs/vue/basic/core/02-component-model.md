---
title: 组件模型与单向数据流
description: SFC 结构、props 下行与事件上行、v-model 语法糖的展开真相
level: basic
core: true
---

## SFC：一个文件一个组件

Vue 单文件组件（.vue）把组件的三要素放在一起，编译期拆开处理：

```vue
<script setup>
import { ref } from 'vue';
const count = ref(0);            // 状态
const emit = defineEmits(['change']);
function inc() {
  count.value++;
  emit('change', count.value);   // 向上通知
}
</script>

<template>
  <button @click="inc">{{ count }}</button>   <!-- 模板编译为渲染函数 -->
</template>

<style scoped>
button { color: teal; }          <!-- scoped：样式只作用于本组件 -->
</style>
```

模板不是字符串：编译为渲染函数并做静态提升等优化——**静态内容
只创建一次**，这是 Vue 渲染开销低的一层原因。

## 单向数据流：props 下行、事件上行

```text
父组件 ──props（只读）──▶ 子组件
父组件 ◀──emit('事件', 参数)── 子组件
```

- 子组件**不能改 props**：数据属于父组件，子组件只读——改了也不
  会同步回去，还会告警。这是防止「数据有两个主人」的护栏
- 子组件要改？向父组件 emit 事件，由数据的所有者改——与
  React 的「数据向下、事件向上」完全同构
- 跨多层的传递用 provide/inject（依赖注入），别把 props 链拉成
  穿山隧道

## v-model：语法糖的展开

```vue
<MyInput v-model="text" />
<!-- 等价展开（Vue 3）： -->
<MyInput :modelValue="text" @update:modelValue="v => text = v" />
```

- `v-model` 就是「传值 + 监听更新事件」两件事的糖——**没有破坏
  单向数据流**：值的修改权仍在父组件手里
- 组件内用 `defineModel()`（3.4+）可以少写样板；多个 v-model 用
  参数区分（`v-model:title`）
- 模板里还有一组渲染糖：`@事件`、`:属性`、条件与列表（v-if/v-for）
  ——本质都是生成渲染函数的 DSL

## 要点备忘

- SFC 三段各司其职，模板编译期优化（静态提升）是性能来源之一
- 单向数据流的本质：**数据只有所有者能改**，子组件走事件申报
- v-model 是「props + 事件」的语法糖，不引入双向绑定的暗流
- provide/inject 解跨层传递， scoped 样式解隔离，都不改变数据流向

## 延伸阅读

- [Vue 官方文档 · 组件基础](https://cn.vuejs.org/guide/essentials/component-basics.html)
