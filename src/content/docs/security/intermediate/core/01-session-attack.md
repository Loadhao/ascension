---
title: 会话安全的攻与防
description: token 放哪的攻防交换、会话固定与重放、JWT 失效难题：登录态的暗面
level: intermediate
core: true
---

## 前置：本篇补概念之外的攻防面

[Cookie/Session/JWT](/network/basic/http/04-auth-state/) 已讲清三种
登录态机制怎么工作；本篇讲它们**被怎么打、该怎么防**。

## token 放哪：一场安全交换

| 存放位置          | CSRF 风险             | XSS 风险         | 结论                    |
| ------------- | ------------------- | -------------- | --------------------- |
| Cookie（HttpOnly） | 有（自动附带），需 SameSite/CSRF token | 读不到，偷不走        | 传统 Web 的稳妥解          |
| localStorage  | 基本无（头手动携带）          | **JS 可读**，中 XSS 即丢号 | 前后端分离常用，XSS 防线必须过硬 |

没有两全的位置，只有与自身 XSS 水位匹配的选择——**安全设计常态是
交换而非消灭风险**。

## 三个经典攻击点

**会话固定**：登录前服务端已发的 session id，登录后不换——攻击者
先拿到这个 id，等你登录后拿它直接进你的会话。修法：**登录成功时
强制换发新 id**。

**会话劫持后的纵深**：绑定 UA/IP 指纹做弱校验、敏感操作二次认证、
空闲与绝对过期双计时——单点失守不至于一路畅通。

**JWT 无法主动失效**：签名只保「没被改过」，不保「还有效」。用户
登出、封号、改密码后，已签发的 JWT 在过期前照样能用。缓解：

- 短有效期（分钟级）+ Refresh Token 轮换
- 服务端黑名单/版本号（牺牲一点无状态的纯粹性）
- 关键操作仍回库校验状态，别把 JWT 当免死金牌

## 重放与时效

登录请求被抓包重放是常见突破口：nonce 随机数 + 时间戳 + 签名让
「同一条请求」只能被服务端接受一次（防重放细节见
[API 签名与防重放](/security/intermediate/core/03-api-signature/)）。

## 要点备忘

- Cookie vs localStorage：CSRF 风险与 XSS 风险的交换，按 XSS 水位选
- 登录成功必换 session id（防固定）；双计时管理会话寿命
- JWT 的注销/封号是工程题不是算法题：短有效期 + 服务端失效手段
- 敏感操作永远二次确认，登录态只是第一道门

## 延伸阅读

- [OWASP · Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
