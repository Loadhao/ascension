---
title: 摘要、签名与防重放
description: 接口级安全的密码学积木：哈希、HMAC、非对称签名的分工与防重放三件套
level: intermediate
core: true
---

## 本篇的定位

[HTTPS](/network/basic/http/02-https-tls/) 已保证传输加密、
[密码存储](/network/basic/http/08-password-storage/)已讲口令哈希；
本篇讲剩余一块：**开放 API 场景**（服务间调用、开放平台）如何用
密码学积木自证请求可信——它不替代 HTTPS，而是解决「传输之外」
的三个问题：**身份可信、内容没改、包没有被重放**。

## 积木分工：三种工具三种职责

| 工具           | 特性                | 用途                |
| ------------ | ----------------- | ----------------- |
| 摘要（SHA-256）  | 单向、雪崩效应           | 完整性指纹，不可逆         |
| HMAC（带密钥摘要）  | 双方共享密钥才能算出        | 对称场景的防篡改 + 身份证明   |
| 非对称签名（RSA/ECDSA） | 私钥签、公钥验       | 密钥分发更容易，可抵赖性更弱    |

对称（HMAC）快但密钥要双端保管；非对称验签方只持有公钥，泄露面小，
代价是性能差一个数量级——**内部高频调用常用 HMAC，开放平台对三方
常用签名**。

## 一个标准的签名流程

```text
canonical = method + path + 排序后的参数 + timestamp + nonce
sign = HMAC-SHA256(secret, canonical)          // 或私钥签名
请求携带： sign + timestamp + nonce + 业务参数
```

服务端同样构造 canonical 再算一遍比对——**参数排序规范化**是关键，
顺序不一致两边算出的就不同，这也是对接时最常见的联调事故。

## 防重放三件套

签名防「改」，不防「原样重发」——抓包重放一条合法转账请求，签名
依然有效。补三件：

1. **timestamp**：服务端拒绝偏离当前时间 ±5 分钟的请求
2. **nonce**：每次请求一个随机值，服务端在时间窗内记录去重
   （Redis SETNX，过期自动清理）
3. **流水号 + 幂等**：业务层兜底，重复请求落库只生效一次（MQ 场景
   的幂等思想见[消息可靠性](/middleware/intermediate/reliability/01-message-reliability/)）

## 要点备忘

- 摘要管完整、HMAC 管防篡改+身份、非对称签名管开放场景验签
- 签名 = 规范化串的 HMAC：参数排序规范是联调事故第一名
- 防重放 = 时间窗 + nonce 去重 + 业务幂等，三层缺一不可
- 密钥进配置中心/KMS 不进代码库；轮换方案要在设计期就画好

## 延伸阅读

- [OWASP · API Security（认证与防重放）](https://owasp.org/www-project-api-security/)
