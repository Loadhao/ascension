---
title: Prompt 模板与结构化输出
description: 模板让 prompt 成为可维护的代码资产，结构化输出让模型返回可编程的对象
level: basic
core: true
---

## Prompt 模板：把 prompt 从字符串升级为资产

把 prompt 写死在代码里，遇到三件事就崩：多处复用靠复制粘贴、改一个
词要全文搜索、没法单测。模板把「固定骨架 + 动态变量」拆开，prompt
从此可以评审、可以测试、可以版本化：

```python
from langchain_core.prompts import ChatPromptTemplate

prompt = ChatPromptTemplate.from_messages([
    ("system", "你是{domain}领域的资深评审，只输出问题清单。"),
    ("human", "{question}"),
])

# 变量字典进、标准消息列表出——与具体模型无关
messages = prompt.invoke({
    "domain": "数据库", "question": "分页为什么深了就慢",
})
```

Few-shot 示例与多轮历史用 `MessagesPlaceholder` 占位：运行时把一组
消息（示例对话、历史轮次）整体注入模板的指定位置。

## 结构化输出：从「一段话」到「一个对象」

LLM 默认吐字符串，但下游系统要的是能直接编程的对象——入库、打分、
路由分支都建立在字段上。手工 `json.loads` 有三个坑：模型多输出一句
「好的，以下是 JSON：」就炸、字段缺失没人管、类型错了没人拦。

结构化输出把 schema 交给框架，框架负责「约束生成 + 校验解析」：

```python
from pydantic import BaseModel, Field

class Review(BaseModel):
    rating: int = Field(ge=1, le=5, description="评分")
    sentiment: str = Field(description="positive 或 negative")

structured = model.with_structured_output(Review)
result = structured.invoke("评价：物流很快，东西不错，就是贵")
print(result.rating, result.sentiment)   # 已过校验的类型化对象
```

Agent 场景同理：`create_agent(response_format=...)` 让 agent 跑完后
给出结构化结论，结果取自 `result["structured_response"]`。

## 校验失败怎么办

- 用 Pydantic 的 Field 约束（范围、枚举、description）把「要求」写进
  schema，比在 prompt 里喊「请输出 JSON」可靠得多
- 模型不支持原生结构化输出时，框架退化为「借工具调用抽取」，校验
  不过会把错误回喂给模型重试（ToolStrategy）
- 关键字段给默认值或 Optional，别让一次解析失败打断主流程

## 要点备忘

- 模板 = 固定骨架 + 变量字典，invoke 出标准消息，与模型解耦
- MessagesPlaceholder 专管 few-shot 与历史消息的注入
- 结构化输出 = schema 约束 + 校验解析，产出可直接编程的对象
- 约束交给 schema，不交给措辞——这是 prompt 工程化的分水岭

## 延伸阅读

- [LangChain: Structured output](https://docs.langchain.com/oss/python/langchain/structured-output/)
