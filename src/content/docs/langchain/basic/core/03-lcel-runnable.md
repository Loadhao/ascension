---
title: LCEL 与 Runnable 协议
description: 用 | 把组件拼成链：统一执行协议带来的流式、并发与降级
level: basic
core: true
---

## LCEL：组件即管道

LCEL（LangChain Expression Language）只做一件事：**所有组件都实现
Runnable 协议，因此都能用 `|` 串起来**，前一步的输出就是下一步的输入：

```python
from langchain_core.output_parsers import StrOutputParser

chain = prompt | model | StrOutputParser()
chain.invoke({"domain": "数据库", "question": "…"})   # 直接得到字符串
```

管道的价值不在语法糖，而在**组合后的整条链依然是 Runnable**——
流式、并发、降级这些能力顺着协议逐级向上传递，不用为组合体单独写。

## Runnable 协议：一套方法全家桶

| 方法             | 作用      | 什么时候用            |
| -------------- | ------- | ----------------- |
| invoke         | 单条执行    | 默认入口              |
| batch          | 一批并发执行  | 批量处理，内置并发度控制      |
| stream         | 流式吐增量   | 面向用户的生成场景         |
| ainvoke/astream | 异步版本    | 高并发服务端            |

常用积木：

- **RunnableLambda**：把普通函数包装成 Runnable，接进管道
- **RunnablePassthrough**：原样透传，常用于「检索结果与原问题一起
  送进 prompt」这类多路场景
- **RunnableParallel**：同一输入分发给多路，输出按 key 合并
- **with_fallbacks**：主模型失败自动切备用模型

## 一条最小 RAG 链

```python
from langchain_core.runnables import RunnablePassthrough

rag_chain = (
    {"context": retriever, "question": RunnablePassthrough()}
    | prompt
    | model
    | StrOutputParser()
)
rag_chain.invoke("什么是两阶段提交？")
```

第一步的 dict 隐式构成 RunnableParallel：context 走检索器，question
原样透传，两路结果按 key 合并成 prompt 的变量字典。
[RAG 概念篇](/ai/intermediate/agent/06-rag/)讲的「检索 → 组上下文 →
生成」，落在代码上就是这条链。

## 1.0 语境：什么时候还写链

- **写链**：确定性流水线——输入整形、RAG 检索段、输出解析；结构
  静态、可整体单测
- **上图**：需要循环（工具重试）、条件分支、中途暂停——交给
  [LangGraph 状态图](/langchain/intermediate/graph/01-state-graph/)
- **Agent**：别用链手搓循环，`create_agent` 开箱即用，本质就是
  LangGraph 图

一句话分工：**链是编译期定型的静态流水线，图才是运行期可变的控制流**。

## 要点备忘

- Runnable 协议是 LCEL 的根：有了统一方法，组合才免费获得流式与并发
- batch 与 with_fallbacks 是生产里最常被忽略的两个免费能力
- dict / sequence 能隐式转 Runnable，写管道时不用层层包装饰器

## 延伸阅读

- [LangChain 官方文档 · Chain](https://docs.langchain.com/oss/python/langchain/)
