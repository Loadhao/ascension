---
title: FastAPI
description: 声明式路由、Pydantic 请求模型、依赖注入 Depends、自动文档
level: intermediate
core: true
---

## 声明式：签名即路由

```python
from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI()

class CreateUser(BaseModel):            # 请求体模型
    name: str = Field(min_length=1)
    email: str
    age: int = Field(ge=0, le=150)      # 约束直接写进声明

@app.post("/users", status_code=201)
def create_user(body: CreateUser):     # 签名即文档即校验
    return {"id": 1, **body.model_dump()}
```

对比 Spring 的注解海（@RequestBody + @Valid + DTO + 全家桶）：
FastAPI 把"请求长什么样"压进**函数签名 + Pydantic 模型**——路由声明、
请求校验、API 文档三件事一次写完。非法请求体在进入函数前就被拦截并
返回 422 结构化错误，函数体里只剩业务。

自动文档是免费赠品：`/docs`（Swagger UI）、`/redoc` 开箱即用，
对前后端联调的效率提升立竿见影。

## 依赖注入：Depends

```python
from fastapi import Depends, HTTPException, Header

async def get_current_user(
    authorization: str = Header(),       # 请求头也是依赖
    db=Depends(get_db),
) -> User:
    if not valid(authorization):
        raise HTTPException(401, "invalid token")
    return User(...)

@app.get("/me")
def me(user: User = Depends(get_current_user)):    # 依赖可嵌套
    return user
```

Depends 的设计精髓：**鉴权、数据库会话、分页参数这类横切关注点
写成函数，按签名声明组合**。依赖可以依赖依赖（get_current_user
依赖 get_db），框架沿依赖图解析并缓存（同一请求内 get_db 只跑一次）。
对比装饰器鉴权（Flask 风格），依赖注入可测试得多——pytest 里直接调用
函数注入假会话（见 [pytest](/python/advanced/eng/02-pytest/)）。

## async：只有 IO 密集值得

```python
@app.get("/aggregate")
async def aggregate():
    results = await asyncio.gather(          # 并发扇出 IO
        client.get(f"{SVC}/a"),
        client.get(f"{SVC}/b"),
    )
    ...

@app.get("/cpu-report")
def report():        # 注意：没有 async——同步路由跑线程池，不堵事件循环
    return heavy_computation()
```

路线纪律：**async 路由里只能放 await 或非阻塞调用**，一个同步阻塞
（requests、time.sleep）就冻结全服务。CPU 密集路由声明为普通 def，
框架自动丢线程池。IO 密集并发用 gather 扇出（HTTP 客户端用 httpx
AsyncClient，见 [requests 与 httpx](/python/intermediate/libs/01-requests-httpx/)）。

## 请求生命周期

```mermaid
flowchart LR
    A[请求] --> B[路由匹配]
    B --> C[解析 Depends 依赖树<br/>鉴权/DB 会话/分页]
    C --> D[Pydantic 校验请求体<br/>失败直接 422]
    D --> E[执行路由函数]
    E --> F[响应模型序列化]
    F --> G[响应]
```

横切的解析在业务前、序列化在业务后——业务函数两头都是强类型世界。

## 小结

- 签名 + Pydantic = 路由 + 校验 + 文档三合一；/docs 免费拿。
- 横切逻辑（鉴权/会话/分页）走 Depends 依赖图，可嵌套可缓存可测试。
- async 路由里禁止阻塞调用；CPU 密集用同步 def 让框架走线程池。
