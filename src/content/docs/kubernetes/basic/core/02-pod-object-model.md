---
title: Pod 与对象模型
description: 为什么最小调度单元是 Pod 而不是容器：Label、Namespace 与「一切皆资源」
level: basic
core: true
---

## Pod：容器的「逻辑主机」

Pod 是 Kubernetes 的**最小调度单元**——调度、扩缩容、重建都以 Pod
为单位，而不是容器。一个 Pod 里可以有一个或多个容器，它们：

- 共享同一个**网络命名空间**：同一个 IP、同一个端口空间，容器间用
  `localhost` 互访（由一个 `pause` 基础容器持有这些命名空间）
- 可共享**存储卷**（Volume 挂给 Pod 内多个容器）
- 同生共死：一起调度到同一节点、一起重建

什么时候放同一个 Pod？**寄生关系**：主容器 + 伴生容器（日志收集
sidecar、初始化 init 容器）。需要独立扩缩容的就必须拆成不同 Pod。

## 一切皆资源：对象与 spec/status

Pod、Deployment、Service……都是 API **资源对象**，统一结构：

```yaml
apiVersion: apps/v1        # 属于哪个 API 组/版本
kind: Deployment           # 对象类型
metadata:
  name: web
  labels:
    app: web               # 标签：任意键值对，检索与关联全靠它
spec:                      # 期望状态：你要什么
  replicas: 3
  selector:
    matchLabels: { app: web }
  template:
    metadata:
      labels: { app: web }
    spec:                  # Pod 模板：每个副本长什么样
      containers:
        - name: nginx
          image: nginx:1.27
status:                    # 实际状态：系统填的，只读
  readyReplicas: 3
```

控制循环的闭环就在 `spec` 与 `status` 之间：控制器盯着 status，
向 spec 收敛。

## Label 与 Selector：松耦合的关联方式

Kubernetes 里对象之间**不靠名字硬绑定**，靠标签查询：
Deployment 用 `selector.matchLabels` 认领自己管哪些 Pod，
Service 用 selector 决定流量转发给哪些 Pod。
改个 Pod 的 label，它可能同时脱离 Deployment 和 Service——
排障时要常查「selector 能不能选中目标」。

## Namespace：资源分组隔离

Namespace 把集群资源划成逻辑分区（如 `prod`/`staging`），

- 作用域：对象名只在同一 Namespace 内唯一
- 权限与配额（RBAC、ResourceQuota）按 Namespace 授予
- 注意：Node 这类**集群级对象**不属于任何 Namespace

## 要点备忘

- 最小调度/扩缩/重建单位是 Pod；`pause` 容器持有共享命名空间
- spec 是期望（你写），status 是现实（系统填），控制器在两者间调谐
- 对象关联靠 Label/Selector 查询，不靠名字引用——改标签即改归属
- Namespace 是分组隔离手段，不是硬安全边界（网络隔离要另配策略）

## 延伸阅读

- [Kubernetes 官方文档 · Pod](https://kubernetes.io/zh-cn/docs/concepts/workloads/pods/)
