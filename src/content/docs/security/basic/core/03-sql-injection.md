---
title: SQL 注入与参数化
description: 数据为什么能变成代码：预编译生效的原理、MyBatis 的 # 与 $ 之别
level: basic
core: true
---

## 原理：拼接让数据越权成了代码

```java
// 危险：输入直接拼进 SQL
String sql = "SELECT * FROM user WHERE name='" + input + "'";
// input = ' OR '1'='1  →  WHERE name='' OR '1'='1'  →  全表
// input = '; DROP TABLE user; --  →  更狠的堆叠破坏
```

SQL 是一门语言，拼接等于**让用户参与写代码**——注入者借语法结构
改变语义：补引号闭合、加恒真条件、堆叠语句、注释截断。防御思路
因此只有一条正路：**让用户输入永远只是数据，永远不参与语法**。

## 预编译为什么有效

```java
PreparedStatement ps = conn
    .prepareStatement("SELECT * FROM user WHERE name=?");
ps.setString(1, input);   // 输入作为参数绑定，不进语法层
```

参数化查询（预编译）把 SQL 的**结构先定型**再交给数据库，占位符
位置之后只接受「值」：输入里就算有引号、分号，也只是字符串里的
字符，不会被解析成语法。这是治本，不是过滤。

> 常见误区：过滤关键字（黑名单）治标不治本——`OR` 变 `oORr` 的
> 绕过游戏没完没了；编码差异还能骗过过滤器。

## Java 落点：MyBatis 的 # 与 $

- `#{}` → 预编译占位符（ PreparedStatement 参数），**默认用这个**
- `${}` → 字符串**替换**进 SQL，等于手工拼接——动态表名/排序字段
  这类「不能参数化」的场景才用，且必须白名单校验枚举值

```xml
<select id="get">
  SELECT * FROM user WHERE name = #{name}   <!-- 安全 -->
  ORDER BY ${orderColumn}                   <!-- 危险位：必须白名单 -->
</select>
```

LIKE 查询的正确写法是 `LIKE #{kw}` 配合代码侧拼 `%`，而不是
`LIKE '%${kw}%'`。

## 纵深：参数化之外还要做什么

- **最小权限**：应用账号只授业务库的 DML，禁 DDL/管理员权限——
  即便被注入也掀不起桌子
- 报错别回显 SQL 异常原文（注入者靠报错盲注探测结构）
- ORM 不是免死金牌：JPA 也能 `@Query(nativeQuery=true)` 拼接注入

## 要点备忘

- 注入 = 数据参与语法；参数化让结构定型、输入只当值
- MyBatis 默认 `#{}`；`${}` 只给白名单校验过的动态表名/列名
- 黑名单过滤是安慰剂，预编译 + 最小权限才是防线
- 排查口径：全代码库搜 `${` 与字符串拼接 SQL，一处不落

## 延伸阅读

- [OWASP · SQL Injection Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)
