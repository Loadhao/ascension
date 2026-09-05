---
title: JVM 运行时数据区
description: 线程私有区与共享区的划分、OOM 高发区与排查要点
level: advanced
core: true
---

## 总体结构

```mermaid
flowchart TB
    subgraph JVM[JVM 运行时数据区]
        direction TB
        subgraph Private[线程私有（随线程生灭）]
            PC[程序计数器<br/>当前字节码行号]
            Stack[虚拟机栈<br/>栈帧：局部变量表 / 操作数栈]
            Native[本地方法栈<br/>native 方法服务]
        end
        subgraph Shared[线程共享]
            Heap[堆 Heap<br/>对象实例 / 数组]
            Meta[方法区 / 元空间<br/>类信息 / 常量 / 静态变量]
        end
    end
```

## 各区域要点

| 区域 | 线程 | OutOfMemory 类型 | 要点 |
|---|---|---|---|
| 程序计数器 | 私有 | 唯一不会 OOM 的区域 | 字节码解释器靠它恢复执行位置 |
| 虚拟机栈 | 私有 | `StackOverflowError` | 递归过深是主因；`-Xss` 调大小 |
| 本地方法栈 | 私有 | SOE / OOM | 服务 native 方法，HotSpot 与虚拟机栈合一 |
| 堆 | 共享 | `Java heap space` | `-Xms`/`-Xmx`；GC 主战场 |
| 元空间 | 共享 | `Metaspace` | 使用本地内存；动态生成类（CGLib）易溢出 |

## 对象创建流程（类加载到分配）

```mermaid
sequenceDiagram
    autonumber
        participant J as JVM
        participant L as 类加载器
        participant H as 堆
        J->>L: 检查类是否已加载
        L-->>J: 加载/复用类信息
        J->>H: 分配内存（指针碰撞 / 空闲列表）
        J->>H: 初始化零值
        J->>H: 设置对象头（哈希码 / GC 分代年龄）
        Note over H: 执行 <init> 后对象可用
```

## 要点备忘

- 新对象优先在 **Eden** 分配，TLAB 让分配做到指针碰撞级别的快
- 判断对象可达性用 **GC Roots**（栈帧局部变量、静态变量、常量等），不是引用计数
- `-XX:+HeapDumpOnOutOfMemoryError` 留现场，MAT 分析 dump
- 元空间溢出优先排查：动态代理类是否无限生成、是否大量加载重复类
