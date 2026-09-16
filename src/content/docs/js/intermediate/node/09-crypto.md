---
title: crypto 模块：Node 的加密工具箱
description: 哈希/加密/HMAC 的 Node API 实战——md5 为什么不能用、AES-GCM 加解密、HMAC 盲索引
level: intermediate
core: true
---

密码存储篇讲了"为什么"，本篇讲 **Node 怎么做**：crypto 模块提供的
哈希（不可逆）、加密（可逆）、HMAC（签名）三组 API——API 签名篇的
工具在 Node 层的落地。

## 哈希：单向不可逆

```javascript
const crypto = require("crypto");
// ❌ MD5/SHA1：太短可碰撞——不能用
// ✅ SHA256：通用哈希
const hash = crypto.createHash("sha256").update(data).digest("hex");
// ✅ 密码哈希（慢哈希 + 自动加盐）
crypto.scrypt(password, salt, 64, (err, derived) => { /* derived */ });
```

- **createHash vs scrypt**：普通哈希快（适合数据完整性校验），密码
  哈希**必须慢**（scrypt/bcrypt 防暴力破解——密码存储篇的纪律）；
- digest 编码：`hex`（十六进制）或 `base64`。

## 加密：AES-GCM 可逆

```javascript
const key = crypto.scryptSync(password, salt, 32);  // 32 字节 = AES-256
const iv = crypto.randomBytes(12);                   // 初始化向量（每次不同）
const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
let encrypted = cipher.update(plaintext, "utf8", "hex");
encrypted += cipher.final("hex");
const authTag = cipher.getAuthTag();                 // 完整性校验
```

- **AES-GCM** 是现代加密标准（加密 + 完整性校验一体）——比 CBC
  模式更安全；
- **IV 必须随机**且不重复（同一 key + 同一 IV = 密文可预测）；
- **密钥从密码派生**用 scryptSync（不直接用密码做 key）。

## HMAC：带密钥的哈希

```javascript
const hmac = crypto.createHmac("sha256", secretKey).update(data).digest("hex");
```

- HMAC = 哈希 + 密钥——**只有持有密钥的人才能生成/验证**；
- 场景：API 签名（API 签名篇）、盲索引（敏感数据篇）——**确定性 +
  防穷举**。

## 高频追问速答

- **加密和哈希的区别？** 加密可逆（有密钥能解回），哈希不可逆
  （只能比对）——密码用哈希（不需要解回），敏感字段用加密
  （需要解回来用）。
- **IV 是什么？为什么不能重复？** 初始化向量——让同一明文每次
  加密产生不同密文（防频率分析）；重复 IV + 已知明文 = 密钥
  可被推导。
- **crypto.randomBytes vs Math.random？** Math.random 是伪随机
  （可预测），crypto.randomBytes 是**密码学安全随机**——密钥/
  IV/token 必须用 crypto 生成。

## 小结

- 三组 API：createHash（不可逆校验）、createCipheriv AES-GCM
  （可逆加密）、createHmac（带密钥签名）。
- 密码用 scrypt/bcrypt（慢哈希），数据完整性用 SHA256，盲索引用
  HMAC——**每种场景选对工具**。
- IV 随机不重复、密钥从密码派生、Math.random 不能用于安全——
  三个容易踩的坑。
