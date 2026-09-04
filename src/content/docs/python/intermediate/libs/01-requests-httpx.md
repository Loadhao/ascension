---
title: requests 与 httpx
description: Session 连接复用、超时纪律、重试策略、httpx 的同步/异步双模
level: intermediate
---

## requests：同步 HTTP 的舒适区

```python
import requests

resp = requests.get(
    "https://api.github.com/users/psf",
    params={"per_page": 100},        # 查询参数自动编码
    timeout=5,                        # 永远写超时！默认是无限等
)
resp.raise_for_status()               # 4xx/5xx 直接抛异常
data = resp.json()                    # 响应体按 JSON 解析
```

**不传 timeout 的请求等于给生产环境埋雷**——网络抖一下线程就挂死，
这是 requests 最著名的默认行为。团体纪律：timeout 必填，甚至上
lint 检查。

## Session：连接复用与默认值

```python
with requests.Session() as s:
    s.headers["Authorization"] = f"Bearer {token}"   # 会话级默认值
    s.timeout = 5
    for uid in range(100):
        s.get(f"{BASE}/users/{uid}")     # TCP 连接 + TLS 握手复用
```

循环里裸调 `requests.get()` 每次都重建连接——百次请求百次握手。
Session 的连接池让吞吐翻倍，还能挂重试策略：

```python
from requests.adapters import HTTPAdapter, Retry

retry = Retry(total=3, backoff_factor=0.5,       # 指数退避 0.5s/1s/2s
             status_forcelist=[502, 503, 504],   # 哪些状态码值得重试
             allowed_methods=["GET"])            # 只重试幂等方法
s.mount("https://", HTTPAdapter(max_retries=retry))
```

重试纪律：**只重试幂等方法（GET）与明确可重试的状态码**，
POST 重试可能造成重复下单。

## httpx：requests 的现代继任者

API 几乎同构（`import httpx` 替换即可），多出两样关键能力：

```python
# ① 同一客户端，同步异步双模
with httpx.Client() as client: ...           # 同步，用起来和 requests 一样
async with httpx.AsyncClient() as client:   # 异步：asyncio 并发抓取
    results = await asyncio.gather(*[
        client.get(f"{BASE}/users/{uid}") for uid in range(100)
    ])                                       # 并发 100 个请求

# ② 流式响应与 HTTP/2
with client.stream("GET", url) as resp:      # 大文件不全量进内存
    for chunk in resp.iter_bytes(64 * 1024):
        save(chunk)
```

选型：纯脚本/无 asyncio → requests 或 httpx 同步模式；已有 async 事件
循环（FastAPI、高并发爬取）→ httpx AsyncClient。**别在异步代码里调
同步 requests**——一个阻塞调用冻结整个事件循环。

## 小结

- timeout 永远显式传；循环请求必须走 Session 连接复用。
- 重试只给幂等方法 + 明确可重试的状态码，配指数退避。
- httpx 与 requests API 同构，额外提供 AsyncClient 并发与流式响应；
  异步代码里禁用同步 HTTP 客户端。
