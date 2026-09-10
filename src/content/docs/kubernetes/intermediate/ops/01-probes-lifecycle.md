---
title: 探针与生命周期
description: liveness/readiness/startup 三探针分工：自愈、发布安全与慢启动各自的守门员
level: intermediate
core: true
---

## 三种探针，三个问题

| 探针            | 回答的问题       | 失败后果                          |
| ------------- | ----------- | ----------------------------- |
| livenessProbe | 进程还活着吗？     | **重启容器**（kubelet 杀掉重建）         |
| readinessProbe | 能接流量了吗？     | 从 Service endpoints **摘除**，容器不动 |
| startupProbe  | 启动完成了吗？     | 成功前暂停另两个探针                    |

最常见的误用是把三者混为一谈。记住分工：**liveness 管自愈，
readiness 管流量，startup 管慢启动**。

```yaml
livenessProbe:
  httpGet: { path: /healthz, port: 8080 }
  periodSeconds: 10
  failureThreshold: 3
readinessProbe:
  httpGet: { path: /ready, port: 8080 }
  periodSeconds: 5
startupProbe:
  httpGet: { path: /healthz, port: 8080 }
  failureThreshold: 30       # 30 × 10s = 最多容忍 5 分钟启动
  periodSeconds: 10
```

## 典型事故：探针配错的两种姿势

- **liveness 检查了依赖**（下游数据库连不上就返回失败）：依赖抖动
  → 所有实例被连环重启 → 雪崩。liveness 只该反映**进程自身**是否
  僵死，依赖健康归 readiness
- **没配 startupProbe**：Java 应用冷启动 2 分钟，liveness 在第
  30 秒开始判死 → 启动即重启死循环。慢启动应用配 startupProbe
  兜住启动期

## 健康检查端点怎么设计

- `/healthz`（liveness）：进程在、事件循环没卡死即可，**不碰依赖**
- `/ready`（readiness）：依赖可达、缓存预热完成、正在发布摘流时
  返回失败
- readiness 是**优雅发布**的开关：配合 PreStop 钩子先摘流再退出，
  避免滚动更新时掐断在途请求

## 生命周期钩子与优雅退出

```yaml
lifecycle:
  preStop:
    exec: { command: ["sh", "-c", "sleep 5"] }
terminationGracePeriodSeconds: 30
```

Pod 终止流程：endpoint 摘除（异步）→ 发 SIGTERM → preStop 执行 →
宽限期到强杀 SIGKILL。**摘除与 SIGTERM 并发进行**，注册中心/负载
均衡有滞后——preStop 里 sleep 几秒让在途请求跑完，是优雅退出的
标准操作。

## 要点备忘

- liveness 失败 = 重启，readiness 失败 = 摘流，别把依赖健康塞给
  liveness
- 慢启动应用必配 startupProbe，否则启动期被 liveness 打死循环
- 探针是滚动发布的安全阀：发布事故先查探针阈值与端点实现
- 优雅退出三件套：preStop + 宽限期 + readiness 摘流

## 延伸阅读

- [Kubernetes 官方文档 · 容器探针](https://kubernetes.io/zh-cn/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)
