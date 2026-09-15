---
title: 环境变量与配置管理
description: process.env 的特性与陷阱、.env 文件与 dotenv、配置分层策略、敏感配置不入库
level: intermediate
core: true
---

"开发环境和生产的配置怎么分开？"——数据库地址、API 密钥、日志级别
都不该硬编码进代码。Node 的 `process.env` + `.env` 文件 + 配置分层
是入门答案，**敏感配置不入库**是贯穿始终的红线（密码存储篇的密钥
纪律在配置层的延续）。

## process.env：全是字符串

```javascript
console.log(process.env.PORT);        // "3000" —— 字符串！
const port = Number(process.env.PORT) || 3000;   // 显式转换
const debug = process.env.DEBUG === "true";      // 布尔也要比较字符串
```

- **process.env 的值全是字符串**——`PORT=0` 是 `"0"`（truthy！），
  数字/布尔必须显式转换——`if (process.env.DEBUG)` 对 `DEBUG=false`
  也为 true（经典 bug）；
- **读取时机**：进程启动时快照，运行中改环境变量不影响已启动进程。

## .env 文件与 dotenv

```bash
# .env（不入库！.gitignore 里必须有）
DATABASE_URL=postgres://user:pass@host/db
JWT_SECRET=长随机串
PORT=3000
```

```javascript
// 入口文件最顶部（在其他 import 使用环境变量之前）
require("dotenv").config();
```

- **`.env` 不入库**：密钥/密码进 git = 永久泄露（git 历史删了也在）；
- **`.env.example` 入库**：只有键名没有值——团队成员知道要配什么；
- 生产环境不用 .env 文件——用部署平台的环境变量或配置中心
  （Feature Flag 篇同源）。

## 配置分层：覆盖顺序

```text
默认值（代码内） < .env 文件 < 环境变量（部署平台注入）
```

后读的覆盖先读的——**代码内保留合理默认值**（本地能跑），**环境
变量注入差异**（生产覆盖）——十二要素应用（12-Factor）的配置原则。

## 高频追问速答

- **生产环境的密钥怎么管？** 部署平台的环境变量（GitHub Actions
  Secrets/K8s Secret/云密钥管理）——**代码与配置分离**（十二要素
  原则）+ 密钥轮换。
- **配置怎么校验？** 启动时校验必填项（缺失即 fail-fast 报错退出）
  ——带默认值的静默跳过会让生产环境跑在"以为配了其实没配"的状态。
- **多环境（dev/staging/prod）怎么组织？** 分层覆盖而非多文件复制：
  公共默认在代码、差异在环境变量——环境越多，"复制粘贴三份配置"
  的维护成本越爆炸。

## 小结

- process.env 全是字符串——数字/布尔显式转换；读取时快照。
- `.env` 不入库、`.env.example` 入库；生产用部署平台注入——
  敏感配置的红线与密码存储篇同源。
- 配置分层：代码默认值 < .env < 环境变量——启动时 fail-fast 校验
  必填项。
