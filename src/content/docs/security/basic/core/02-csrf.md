---
title: CSRF：伪造请求
description: 浏览器会自动带 Cookie——CSRF 的前提、与 XSS 的区别、三层防御
level: basic
core: true
---

## 原理：借你的身份，发他的请求

CSRF（跨站请求伪造）不偷凭证——**凭证自己送上门**。用户登录 A 站
后 Cookie 还在，浏览器访问恶意页面 B 时，B 里一条对 A 的请求会
**自动携带 A 的 Cookie**（这是浏览器的标准行为），A 分不清请求
来自用户本人还是伪装页面：

```html
<!-- 恶意页面 B 中的一段，用户访问即触发 -->
<img src="https://bank.com/transfer?to=attacker&amount=1000">
```

GET 改状态的接口最容易中招；POST 也能被自动提交的表单或 fetch 打出来。

## 前提与三问

CSRF 成立要同时满足：**Cookie 类认证**（凭证自动附带）+ **接口
对来源不设防** + **关键操作无二次确认**。这也是为什么前后端分离
用 Authorization 头带 token 的架构天然免疫大部分 CSRF——头不会
被浏览器自动附加。

与 XSS 的区别：XSS 偷凭证、注入代码执行；CSRF **不需要拿到凭证**，
借浏览器自动附带直接发请求。防 XSS 防「代码进站」，防 CSRF 防
「请求冒名」。

## 防御：三层递进

| 手段              | 原理                              | 注意                    |
| --------------- | ------------------------------- | --------------------- |
| SameSite Cookie | 浏览器不在跨站请求附带 Cookie（Lax 默认够用）    | 老浏览器/嵌入式 WebView 需验证  |
| CSRF Token      | 表单/头里带服务端下发的随机 token，跨站伪造者拿不到   | token 与会话绑定、一次或短期有效  |
| 二次确认            | 转账等高危操作要求密码/验证码                 | 兜底，用户体验代价换安全 |

Referer 校验可作为辅助（检查请求来源页），但 Referer 可被策略隐藏，
不能当唯一防线。

## 要点备忘

- CSRF 的根是「浏览器自动带 Cookie」+「服务端只认凭证不认来源」
- 防御优先级：SameSite → CSRF Token → 高危二次确认，层层叠加
- token 认证架构（Authorization 头）基本免疫 CSRF，但把 token 暴露
  给 JS 则换来 XSS 风险——安全不是免费的，是交换
- 状态变更接口统一 POST/PUT/DELETE，别用 GET 改数据

## 延伸阅读

- [OWASP · CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
