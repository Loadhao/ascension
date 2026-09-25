---
title: 泛化调用与无损上下线
description: 不依赖接口 jar 的 $invoke 怎么配、代价是什么；上线先不注册、下线先摘流量的完整链路与 QoS 命令
level: advanced
---

## 问题：网关要转发 RPC，但不能依赖所有业务的接口 jar

[Dubbo 架构与 SPI](/java/advanced/dubbo/01-architecture/)讲的是
"角色与扩展点"，[集群容错与流量治理](/java/advanced/dubbo/02-governance/)
讲的是"调用失败了怎么办"。本篇是两头之外、生产最容易出事的两件事：

1. **调用方手上没有接口 jar**（网关、测试平台、跨语言代理）——泛化调用；
2. **调用方在，服务端要重启**——发布那一刻的丢请求问题，即无损上下线。

## 一、泛化调用：把「类型」换成「字符串 + Map」

正常引用要求 `setInterface(HelloService.class)`，编译期就得有这个类。
泛化模式改成**接口全限定名字符串 + `GenericService`**：

```java
ReferenceConfig<GenericService> ref = new ReferenceConfig<>();
ref.setApplication(new ApplicationConfig("generic-consumer"));
ref.setRegistry(new RegistryConfig("zookeeper://127.0.0.1:2181"));
ref.setInterface("com.x.api.HelloService");   // 字符串，不是 Class
ref.setGeneric("true");                       // 声明泛化模式
GenericService svc = ref.get();

// 方法名、参数类型数组、实参数组 —— 三段必须与提供者签名严格对齐
Object r = svc.$invoke("sayHello",
    new String[]{"java.lang.String"}, new Object[]{"dubbo"});
```

`$invoke(方法名, 参数类型名数组, 实参数组)` 里那个**类型数组是签名的一部分**：
写 `"String"` 而不是 `"java.lang.String"`，方法找不到，报的是
`NoSuchMethodException`——**编译期不会告诉你**，因为整条链路没有类型。

POJO 在泛化模式下用 `Map` 表达：入参给一个 key 为字段名的 Map，
返回值也是 Map。**这带来两个隐性成本**：嵌套对象的字段名一改，
调用静默变成 `null`；泛型信息（`List<Contract>` 里到底装什么）
只能靠 Map 还原，复杂结构建议改用 `bean` / `protobuf-json` 等
其他 generic 模式或退回普通引用。

### 用在哪、什么时候别用

| 场景 | 合适吗 | 原因 |
|---|---|---|
| API 网关把 HTTP 转 RPC | ✅ | 网关不可能打包全公司的接口 jar |
| 服务测试平台 / Mock 回放 | ✅ | 界面填参数，运行期拼调用 |
| 跨语言代理、协议转换 | ✅ | 只要能拿到接口元数据即可 |
| 普通业务代码里"少写一层依赖" | ❌ | 用编译期类型换字符串，纯亏 |

最后一行值得强调：**泛化调用把类型检查从编译期挪到了线上**。
还有一个安全面：网关一旦接受"接口名 + 方法名"由外部传入，
就等于把反射调用开放到了网络边界——**必须做接口/方法白名单**，
否则就是一个通用的内网方法调用入口。

## 二、无损上线：先起来，但先别接流量

一个新提供者刚启动时最脆弱：**解释执行 + JIT 还没预热、本地缓存没装填、
连接池没建**（见 [JIT 即时编译](/java/advanced/jvm/06-jit/)）。
此刻注册上去，负载均衡会把它当成一个健康节点打上满流量。

Dubbo 侧的两个开关（官方部署文档给的就是这套组合）：

```properties
# 不自动注册（-1 表示延迟到手动触发）
dubbo.provider.delay=-1
# 或：注册但不发布，等手动 online
dubbo.application.manual-register=true
```

然后由**发布脚本 / K8s 就绪探针确认没问题后**手动放开：

```bash
curl http://127.0.0.1:22222/online        # 可带正则只放开部分服务
```

`22222` 是 Dubbo 内置 **QoS 服务**的默认 HTTP/telnet 端口，
它同时是在线诊断入口（`ls` 看已订阅/已发布的服务、`online`/`offline`
控制发布状态）。

还有一个常被忽略的**渐进放量**参数：`warmup`。新节点上线后不是一步
吃满权重，而是在预热窗口内按时间线性提升被选中的概率——
它解决的是"接了流量但还跑不快"，和 `delay` 解决的"根本不该接流量"
是两件事，别混。窗口长度随版本默认值不同，按自己版本的参数表设。

## 三、无损下线：摘流量必须发生在关端口之前

进程直接退出会丢请求，因为**注册中心摘除节点、消费者收到推送并
重建连接，这几步都需要时间**。正确顺序是四步：

```mermaid
flowchart LR
    A["① 摘除注册<br/>offline / gracefulShutdown"] --> B["② 等消费者感知并停止路由<br/>注册中心推送 + 重连"]
    B --> C["③ 等在途请求跑完<br/>此期间不再接新请求"]
    C --> D["④ 关端口、退出进程"]

    class A hl
    classDef hl stroke-width:1.5px
```

三种触发方式：

```bash
curl http://127.0.0.1:22222/gracefulShutdown   # 注销并通知消费者
curl http://127.0.0.1:22222/offline            # 只摘发布状态，进程继续活着
curl http://127.0.0.1:22222/shutdown           # 关停整个 Dubbo 应用
```

**`kill -15`（SIGTERM）**会走 JVM shutdown hook，Dubbo 自己完成
①②③；**`kill -9` 什么钩子都不跑**——注册中心的临时节点要等会话
超时才消失，这段时间消费者还在往已死的进程发请求，表现为
"发布完有一波连接拒绝"。ZooKeeper 的临时节点与会话超时机制见
[临时节点与选主](/zookeeper/intermediate/coordination/01-ephemeral-election/)。

等待在途请求的时长配置项在不同版本里名字不一样（`shutdown.wait`
一族），**不要照抄别人博客的键名**，用自己版本的参数表核对；
但无论叫什么，它必须小于等于外层编排给的终止窗口，否则被强杀。

### K8s 里必须靠 preStop

Pod 删除时 kubelet 的顺序是：**执行 preStop → 发 SIGTERM**。
如果只在 SIGTERM 里做优雅停机，注册中心摘除与消费者推送
这段时间和进程退出是**重叠**的，还是会丢。官方部署文档给的形态是：

```yaml
lifecycle:
  preStop:
    exec:
      command: ["/bin/sh", "-c",
                "curl http://127.0.0.1:22222/offline; sleep 10"]
```

`sleep` 就是在买第②③步的时间，它要计入
`terminationGracePeriodSeconds`（默认 30s，preStop + SIGTERM 共享这个
预算）。两个配套约束：

- **镜像里 PID 1 必须真的收到信号**。用 shell 包一层 `java -jar` 时，
  SIGTERM 常常只到 shell 而传不到 Java（`docker stop` 只发给 PID 1），
  优雅停机等于没做——容器侧的判断方法见
  [容器里的进程 1](/docker/basic/fundamentals/03-lifecycle/)；
- 就绪探针要与"能不能接流量"对齐，而不是"进程在不在"
  （[探针与生命周期](/kubernetes/intermediate/ops/01-probes-lifecycle/)）。

## 四、上下游一起看：谁在这条链上吃亏

| 位置 | 事件 | 症状 |
|---|---|---|
| 消费者 | 拿到旧地址列表 | 一波 `Failed to invoke`，重试后自愈——**所以重试策略要留**（见治理篇） |
| 提供者 | 在途被强杀 | 请求处理了一半，**写操作不幂等就留下脏数据** |
| 注册中心 | 会话未过期仍保留节点 | 表现为"下线了但还在被调用"，ZK 临时节点靠会话超时收敛 |
| 网关 | 泛化目标下线 | 白名单与目标地址若都走配置，可能两边不一致（配置中心动态刷新见 [Nacos 动态刷新](/java/advanced/springcloud/06-config-center/)） |

## 小结

- 泛化调用 = **类型换成字符串 + Map**：`$invoke(方法名, 参数类型全名数组, 实参)`，
  签名对不齐只在运行期报 `NoSuchMethodException`；用在网关、测试平台、
  跨语言代理，**不要为了少写一层依赖而用**。
- 泛化把反射调用开到了网络边界，**外部可控的接口名/方法名必须白名单**。
- 无损上线：`delay=-1` / `manual-register=true` 先不发布，
  自检通过后 QoS `online`；`warmup` 管的是接流量之后的渐进放量。
- 无损下线四步：**摘注册 → 等消费者感知 → 等在途跑完 → 关端口**；
  `kill -9` 跳过前三步，靠 ZK 会话超时收敛，必有一波拒绝。
- K8s 里优雅停机要放在 **preStop**（SIGTERM 之前），
  `sleep` 买的时间计入 `terminationGracePeriodSeconds`，
  并确认 PID 1 真能收到信号。
- QoS 端口（默认 22222）是这套动作的统一入口：
  `ls` / `online` / `offline` / `gracefulShutdown` / `shutdown`。

## 延伸阅读

- [Dubbo 官方 · 泛化调用（Java SDK tasks/framework/generic）](https://cn.dubbo.apache.org/zh-cn/overview/mannual/java-sdk/tasks/framework/more/generic-call/)
- [Dubbo 官方 · QoS 命令列表（online / offline / gracefulShutdown / shutdown）](https://cn.dubbo.apache.org/zh-cn/overview/mannual/java-sdk/reference-manual/qos/qos-list/)
- [Dubbo 官方 · 在 Kubernetes 上部署（优雅上下线与 preStop）](https://cn.dubbo.apache.org/zh-cn/overview/mannual/java-sdk/tasks/deploy/deploy-on-kubernetes/)
