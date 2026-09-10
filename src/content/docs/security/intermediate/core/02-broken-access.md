---
title: 越权与访问控制
description: 认证之后才是重点：水平/垂直/未授权三类越权与 RBAC 落地
level: intermediate
core: true
---

## 认证 ≠ 授权

认证（Authentication）回答「你是谁」，授权（Authorization）回答
「**你能动什么**」。线上高频安全工单里，越权常年霸榜——因为它
不是框架漏洞，而是**每个业务接口自己写出来的**：登录校验统一做了，
数据归属校验却漏了。

## 三类越权，一个案例看清

系统里 A 用户（id=1）只能看自己的订单：

| 类型   | 攻击动作                       | 漏洞本质                  |
| ---- | -------------------------- | --------------------- |
| 水平越权 | 把 URL 里 `orderId=1001` 改成 `1002`（别人的） | 只校验了登录，没校验**资源归属** |
| 垂直越权 | 普通用户直接请求 `/admin/delete`   | 只做了登录校验，没做**角色校验**   |
| 未授权  | 不带凭证直接访问内部接口               | 接口裸奔，网关/拦截器漏配       |

水平越权最隐蔽：接口功能完全正常，测试全绿——**只有改自己的
资源 ID 才能测出来**。自动化安全测试和 code review 都难以兜住，
只能靠编码纪律。

## 防御：把归属校验变成肌肉记忆

```java
// 错误：信任前端传来的 userId
orderService.get(param.getUserId(), orderId);

// 正确：userId 一律取自登录态，再校验归属
Long userId = currentUser();                      // 从认证上下文取
Order order = orderService.get(orderId);
if (!order.getUserId().equals(userId)) {
    throw new ForbiddenException();               // 归属校验
}
```

- **服务端权威**：userId/角色只从登录态取，前端传的一律不信任
- 数据层兜底：查询条件强制带 owner（`WHERE id=? AND user_id=?`），
  即便漏了应用层校验也拿不走别人的数据
- RBAC 管角色权限（谁能进管理接口）：权限校验放服务端注解/拦截器
  统一切面，不散落在前端路由——前端菜单隐藏只是体验，不是控制
- 数据权限（能看哪些行）在 RBAC 之上还要按组织/归属过滤，两套都要

## 要点备忘

- 越权三类：水平（同级别人）、垂直（跨角色）、未授权（裸奔）
- 修法一条主线：身份取自登录态 + 资源归属校验 + 角色切面统一拦
- 前端隐藏按钮不是权限控制；接口层没有校验就是没有校验
- 测试用例要包含「改别人的 ID」这类反例，验收标准写进模板

## 延伸阅读

- [OWASP · Broken Access Control](https://owasp.org/Top10/A01_2021-Broken_Access_Control/)
