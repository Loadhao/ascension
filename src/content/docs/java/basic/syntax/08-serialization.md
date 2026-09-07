---
title: 序列化与 serialVersionUID
description: 对象变字节流的那道版本关卡——显式声明的意义、不声明时的哈希生成规则与 InvalidClassException 之谜
level: basic
---

## 先想清楚：serialVersionUID 在把守什么

**序列化**是把对象转成字节流（存磁盘/走网络），**反序列化**是把
字节流还原成对象。JDK 的做法是实现标记接口
`java.io.Serializable`（无任何方法），用 `ObjectOutputStream` /
`ObjectInputStream` 完成转换。

跨 JVM 传输时有一个绕不开的问题：**接收方的类，和序列化时的类，
是同一个版本吗？** 比如字节流是旧类（3 个字段）序列化的，接收方
已升级成新类（4 个字段）——硬着头皮反序列化可能拿到残缺对象。

`serialVersionUID` 就是这道版本关卡：

```java
public class TextVo implements Serializable {
    private static final long serialVersionUID = -6479963612765539614L;
    private int id;
    private String name;
}
```

反序列化时，JVM 拿**字节流里存的版本号**与**本地类的版本号**比对：
一致 → 放行；不一致 → 抛 `InvalidClassException`。与其拿到
错乱的对象，不如 fail-fast。

## 不声明行不行？——行，但危险

不显式声明时，JVM 会**根据类结构自动计算**一个版本号：对包名、
类名、继承关系、非私有的方法与属性、参数、返回值等诸多因子做
哈希，生成 64 位字段（默认算法，也可换 SHA/MD 类摘要算法）。

问题在于：**结构一变，版本号就变**。加一个字段、改一个方法
签名，自动版本号立刻不同——昨天序列化存盘的数据，今天改完类
就再也读不回来（InvalidClassException）。旧版本节点滚动升级
期间，新旧版本互相反序列化也会炸。

所以最佳实践是：**实现 Serializable 就显式声明**。结构兼容的
改动（加字段）不 bump 版本号，反序列化时新字段取默认值，旧
数据照常恢复；结构破坏性改动才主动改版本号，明确拒绝旧数据。

## 什么时候真正需要它

| 场景 | 需要版本控制吗 |
|---|---|
| RPC 框架用 JDK 序列化传输 DTO（如 Dubbo hessian2 底层同理） | **是**——服务滚动升级时新旧版本共存 |
| HttpSession / Redis session 序列化持久化 | **是**——重启后要能恢复 |
| 深拷贝技巧（序列化再反序列化） | 否——同 JVM 同版本，随便玩 |
| 纯 JSON 接口（Jackson/Fastjson） | 无此机制——JSON 序列化不带版本号，靠字段名匹配 |

一个常见困惑：**为什么"对象转 JSON"也叫序列化？** 广义上，
序列化 = 把对象转成可存储/可传输的格式。字节流序列化（JDK
原生）面向底层传输与存储，带类型与版本信息；JSON 序列化面向
跨平台数据交换，文本格式、自描述、无版本关卡。TCP 只传字节，
JSON 字符串传输前按 UTF-8 编码成字节数组，接收端再解码——
两种序列化最终殊途同归。

## JDK 源码里的示范

`HashSet` 的声明是标准姿势——JDK 集合类全部显式声明，因为
集合对象常被序列化（session、缓存），绝不能让自动哈希随 JDK
版本结构微调而漂移：

```java
public class HashSet<E> extends AbstractSet<E>
        implements Set<E>, Cloneable, java.io.Serializable {
    @java.io.Serial
    static final long serialVersionUID = -5024744406713321676L;
    private transient HashMap<E,Object> map;   // transient：不参与序列化
}
```

注意 `transient`——标记"此字段不进字节流"（map 内部结构不直接
序列化，HashSet 用 writeObject 自定义了序列化形式，只存元素
列表）。这与 serialVersionUID 是一对搭档：一个管版本，一个管
内容的取舍。

顺带：`@Serial` 注解（JDK 14+）让编译器帮你校验"这个字段真的
被序列化机制认识"。IDEA 开启 Inspections 中的 "Serializable
class without serialVersionUID" 后，光标放在类名上即可一键
生成。

## 小结

- serialVersionUID 是 JDK 序列化的版本关卡：不一致即
  InvalidClassException，宁拒不错。
- 不声明时按类结构自动哈希——结构一动版本就漂移，跨版本场景
  必炸；显式声明 + 兼容性变更不 bump，是滚动升级的生存前提。
- JSON 序列化无此机制，字段名匹配即可；transient 控制字段
  是否入流。

## 延伸阅读

- [深入解析serialVersionUID原理及其使用场景——如果我是枫，CSDN](https://blog.csdn.net/qq_51634677/article/details/131387091)——本篇母本
- [Java 序列化规范 · Oracle](https://docs.oracle.com/en/java/javase/17/docs/specs/serialization/)（Versioning of Serializable Objects 一节）
- 站内关联：[Redis 缓存 session 的序列化陷阱] ——见 redis 方向使用进阶笔记
