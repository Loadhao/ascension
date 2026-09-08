---
title: HTTP 基础：报文、方法与状态码
description: 请求响应报文结构、方法语义与幂等性、高频状态码的真实含义、无状态与 Cookie/Session/Token 的接力
level: basic
core: true
---

## 报文长什么样

```text
请求：
POST /api/orders HTTP/1.1          ← 请求行：方法 路径 版本
Host: api.demo.com                 ← 请求头（键值对）
Content-Type: application/json
Content-Length: 27

{"sku":"A1","qty":2}               ← 请求体

响应：
HTTP/1.1 201 Created               ← 状态行：版本 状态码 短语
Content-Type: application/json
Set-Cookie: sid=xxx; HttpOnly      ← 响应头
Location: /api/orders/9527         ← 3xx 时才有意义

{"id":9527}                        ← 响应体
```

读报文的能力是排障基本功：curl -v / 浏览器 Network 面板看到的就是
这个（curl 实操见[命令行工具](/tools/basic/cli/02-curl/)）。

## 方法语义与幂等性

幂等 = 同一请求执行一次与 N 次效果相同。**它是重试安全性的依据**
（网关/客户端敢不敢自动重试就看这个）：

| 方法 | 幂等 | 安全（不改状态） | 说明 |
|---|---|---|---|
| GET | ✓ | ✓ | 查询；参数在 URL |
| POST | ✗ | ✗ | 创建/提交；重试可能重复下单 |
| PUT | ✓ | ✗ | 全量替换（同一份内容写 N 遍无差） |
| DELETE | ✓ | ✗ | 删除（删第二次也是删） |
| PATCH | 视实现 | ✗ | 部分更新 |

## 状态码：高频段位精讲

| 码 | 含义 | 实战要点 |
|---|---|---|
| 200/201/204 | 成功/已创建/无返回体 | REST 语义区分 |
| 301/302 | 永久/临时重定向 | 301 会被浏览器缓存——**误用 301 很难救回**；防开放重定向 |
| 304 Not Modified | 缓存仍有效 | 配 `ETag`/`Last-Modified`，省流量不省请求 |
| 400/401/403 | 参数错/未认证/没权限 | 401 去[登录](/java/intermediate/spring/07-auth-sso/)，403 管鉴权 |
| 404/405 | 资源不存在/方法不支持 | 405 常见于把 POST 打成 GET |
| 499 | **客户端主动断开**（Nginx 特有） | 上游慢、客户端超时先走——高频出现在慢接口告警 |
| 500/502/504 | 服务端错/上游挂/上游超时 | 502 看上游存活，504 看上游耗时（网关视角见[Spring Cloud Gateway](/java/advanced/springcloud/03-gateway/)） |

## 无状态与身份三件套

HTTP 无状态（请求之间互不认识），身份延续靠三层接力：

| 机制 | 存哪 | 特点 |
|---|---|---|
| Cookie | **浏览器**，每次自动带上 | 服务端下发；HttpOnly 防 XSS 读、Secure 走 https |
| Session | **服务端**，Cookie 只存 sid | 集群要共享（粘性路由/集中存储） |
| Token/JWT | 客户端任意位置，请求头携带 | 自包含免查库、无法主动作废需黑名单 |

三者的鉴权链路全貌见[认证与单点登录](/java/intermediate/spring/07-auth-sso/)。

## 长连接：keep-alive

HTTP/1.0 默认每请求一个 TCP 连接（握手/挥手全付）；**1.1 起默认
`Connection: keep-alive`**，一条连接串行跑多个请求——这是
[HTTP 演进](/network/basic/http/03-http-evolution/)的第一步，也是
[TCP 层](/network/basic/tcp/01-three-way-handshake/) TIME_WAIT 减少的
直接受益者。

## 小结

- 报文 = 行 + 头 + 体；GET/PUT/DELETE 幂等、POST 不幂等——重试
  策略的依据。
- 状态码按"谁的问题"记：3xx 路由去哪、4xx 客户端错、502/504 上游
  问题、499 客户端等不及。
- 无状态靠 Cookie/Session/Token 三件套延续身份；keep-alive 让
  建连成本只在首个请求支付。
