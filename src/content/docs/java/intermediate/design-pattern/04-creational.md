---
title: 建造者与原型
description: 建造者治构造参数失控，原型用克隆代替重造——创建型里"步骤"与"复制"两门手艺
level: intermediate
---

## 为什么创建型单独成类

`new` 把**"用什么"和"怎么造"焊死在一起**：`new MySqlOrderDao()`
意味着换实现必须改调用方。创建型模式统一在做一件事——**把对象构造
的过程封装起来，让调用方只表达"要什么"**。

单例（管唯一）与工厂（管选型）已独立成篇，本篇收尾剩下的两门手艺：
**建造者管"一步步怎么造"，原型管"复制一个现成的"**。

## 建造者（Builder）

**参数多、可选参数多、构造顺序有约束**的场景：

```java
// 灾难现场：重叠构造器——第 4 个 boolean 是什么来着？
new HttpRequest("api", 5000, true, false, null, "gzip", null, 3);

// 建造者：可读 + 可选参数自由组合 + 一次 build 校验
HttpRequest req = HttpRequest.builder()
    .url("https://api")
    .timeout(Duration.ofSeconds(5))
    .retry(3)
    .build();
```

建造者的结构是一对搭档：**Builder 持有所有待定参数（链式 setter 只
改自己），build() 一次性校验并生成不可变目标对象**。把校验放在
build() 而不是每个 setter，是"先攒齐再说"——避免半成品对象到处流窜。

Java 生态把它内化成了日常语法：

- **Lombok `@Builder`**：注解生成整套模板代码；
- **StringBuilder**：名字就叫建造者——append 是攒步骤，toString 是
  build；
- **Stream**：中间操作惰性攒流水线，collect 时一次性产出；
- `OkHttp Request.Builder`、`WebClient.builder()`、Protobuf 的
  message builder——**客户端配置类几乎标配建造者**。

与工厂的分工一句话：**工厂关心"造哪个"，建造者关心"怎么一步步造"**。
工厂解决选型问题，建造者解决参数爆炸问题，两者常叠加使用
（工厂返回一个 Builder，让你接着攒参数）。

**record 是它的近亲对手**：字段 ≤ 5 个、全必填、不可变——record 一行
搞定；可选参数一多、校验一复杂，建造者才值得请出来。判断标准不是
"哪个高级"，是**参数要不要挑着填**。

## 原型（Prototype）

**克隆已有对象代替从头构造**——构造昂贵（DB 查询、大对象初始化）或
初始状态难再现时，复制是更便宜的造法：

```java
class Report implements Cloneable {
    private List<Row> data;   // 100w 行，来自慢查询
    @Override
    public Report clone() {
        Report r = (Report) super.clone();   // 浅拷贝！
        r.data = new ArrayList<>(this.data); // 需要深拷贝的字段手动复制
        return r;
    }
}
```

**浅拷贝 vs 深拷贝是必考细节**：`super.clone()` 只复制引用——内部
可变对象仍然共享，改克隆体会污染原型。需要深拷贝的字段必须手动复制
（或对字段也递归 clone）。

Cloneable 是 JDK 设计失败的经典案例：接口是空的、`clone()` 却在
Object 里、语义全靠约定。工程上更稳的替代：

```java
// ① 拷贝构造器：语义明确，不依赖魔法
new Report(existing);

// ② 序列化 round-trip：一次深拷贝到位（性能换正确性）
JSON.parseObject(JSON.toJson(source), Report.class);
```

注意 **Spring 的 prototype scope 同名不同义**：它是"每次 getBean 新
建一个"，与克隆无关——容器管的是"造几个"，原型模式管的是"怎么复制"。

## 小结

- 建造者治"参数爆炸"：链式攒参数、build() 统一校验；record 是轻量
  场景的替代，按"可选参数多不多"二选一。
- 原型治"构造昂贵"：浅深拷贝的分界在内部可变对象；工程上优先拷贝
  构造器或序列化 round-trip，慎用 Cloneable。
- 创建型四篇合起来看：单例管唯一、工厂管选型、建造者管步骤、原型
  管复制——Spring 容器是它们全部的工业化版本。
