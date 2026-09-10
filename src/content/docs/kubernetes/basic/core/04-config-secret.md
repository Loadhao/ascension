---
title: ConfigMap 与 Secret
description: 配置与镜像分离的两种载体：环境变量注入与卷挂载的行为差异、Secret 的安全边界
level: basic
core: true
---

## 问题：配置烧进镜像的三宗罪

镜像里硬编码配置，换环境要重打镜像、改配置要重新发布、同一镜像
无法在多环境复用。**十二要素应用**要求配置与代码分离，Kubernetes
给出的载体就是 ConfigMap（明文配置）与 Secret（敏感信息）。

## 两种载体，一个套路

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: web-config
data:
  LOG_LEVEL: "info"                    # 单值
  app.properties: |                    # 整个配置文件
    db.url=postgres://…
---
apiVersion: v1
kind: Secret
metadata:
  name: web-secret
type: Opaque
stringData:                            # 明文写，API 存储时转 base64
  DB_PASSWORD: "s3cret"
```

注入方式二选一（也可并用）：

| 方式      | 行为                          | 注意                    |
| ------- | ----------------------------- | --------------------- |
| 环境变量 env | 容器启动时注入一次                     | **改了 ConfigMap 不会生效**，要重启 Pod |
| 卷挂载 volume | 文件形式挂进容器，**更新后自动同步**（有分钟级延迟） | 应用要支持热读文件；子路径挂载例外不更新 |

选型口诀：**要热更新用卷挂载，简单开关用 env**。

## Secret 的安全边界，别高估

- Secret 的值只是 **base64 编码，不是加密**——能读到 etcd 或有
  API 权限的人就能解码
- 真正的防线是叠加：RBAC 限制谁能读 Secret、启用 etcd 静态加密、
  集群外的密钥管理（Vault / 云 KMS + External Secrets）
- `stringData` 写起来是明文，落库后自动转 base64；
  `data` 则要求你自己先编码

## 使用要点

- 大小上限约 1MB：它是配置，不是文件存储
- `envFrom` 可整包注入，但键名冲突难排查——生产更推荐逐键引用
- Pod 以 `checksum` 注解引用配置（把 ConfigMap 内容 hash 写进
  Pod template），内容一变触发滚动更新——卷挂载之外的「重启生效」解法

## 要点备忘

- ConfigMap 管明文配置、Secret 管敏感值，注入姿势相同
- env 注入不热更新，卷挂载热更新（子路径除外）——按场景选
- base64 ≠ 加密：Secret 的安全靠 RBAC + 静态加密 + 外部 KMS
- 配置变更的生效路径，上线前必须实测（是同步快、还是干脆不生效）

## 延伸阅读

- [Kubernetes 官方文档 · ConfigMap](https://kubernetes.io/zh-cn/docs/concepts/configuration/configmap/)
