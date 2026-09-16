---
title: 类型转换与相等判断
description: ToPrimitive/ToNumber/ToBoolean 的完整规则、== 的算法步骤、经典翻车题的原理解析
level: basic
core: true
---

`[] == false` 是 true、`{} + []` 是 0、`NaN !== NaN`——这些"JS 奇葩
行为"的根源只有一个：**隐式类型转换的规则没有被系统理解**。本篇把
ToPrimitive/ToNumber/ToBoolean 的转换链路一次讲透。

## 三大转换方向

| 转换 | 触发场景 | 规则 |
| --- | --- | --- |
| ToBoolean | if(x)、`!x`、`&&`/`\|\|` | 只有 6 个假值：false/0/""/null/undefined/NaN |
| ToNumber | 算术运算、`==` | null→0, undefined→NaN, ""→0, "12"→12 |
| ToString | 字符串拼接、模板字符串 | null→"null", undefined→"undefined" |

- **假值只有 6 个**，其他全是真值——包括 `[]`（空数组是真值！）、
  `"0"`（字符串 0 是真值！）、`new Boolean(false)`（对象是真值！）
  ——这三条是高频陷阱。

## ToPrimitive：对象变原始值

对象参与算术或 `==` 时，需要先**转换为原始值**——ToPrimitive 的
查找顺序：

1. `Symbol.toPrimitive(hint)` ——如果定义了，优先调用；
2. `valueOf()` ——返回原始值则用之；
3. `toString()` ——valueOf 不行就调这个。

```javascript
[] + [];       // "" —— [].toString() = ""，两个空串拼接
[] + {};       // "[object Object]"
{} + [];       // 0 —— {} 被解析为空代码块！+[] = ToNumber([]) = 0
[1] + [2];     // "12" —— "1" + "2" = "12"（字符串拼接！）
```

- **`{} + []` 的 0** 是解析器的锅：行首的 `{` 被当成空代码块而非
  对象——`({}) + []` 才是 `"[object Object]"`。

## `==` 的算法：为什么 `[] == false` 是 true

`==` 的比较规则（简化版）：

1. 类型相同 → 直接比较（NaN ≠ NaN，引用比地址）；
2. null == undefined → true；
3. 数字 vs 字符串 → 字符串转数字；
4. **布尔值 → 先转数字**（true→1, false→0）；
5. **对象 vs 原始值 → 对象先 ToPrimitive**；
6. 其他 → false。

`[] == false` 的推导：false → 0（步骤 4）；[] → "" → 0（步骤 5 +
ToNumber）→ 0 == 0 → **true**。

**实践纪律**：永远用 `===`，只在 `x == null` 时用 `==`（同时匹配
null 和 undefined 的简写）。

## 高频追问速答

- **为什么 `"0" == false` 是 true 但 `"0" && false` 是 false？**
  前者走 ToNumber（"0"→0, false→0，相等）；后者走 ToBoolean
  （"0" 是非空字符串 = 真值）——**ToNumber 和 ToBoolean 是独立
  的规则**。
- **`NaN == NaN` 为什么是 false？** NaN 的定义就是"不等于任何值
  包括自身"——判断 NaN 用 `Number.isNaN()`。
- **`Object.is` 和 `===` 的区别？** Object.is 认为 NaN === NaN
  为 true，+0 === -0 为 false——语义更精确但日常用 === 即可。

## 小结

- 三大转换：ToBoolean（6 个假值）、ToNumber（null→0/undefined→
  NaN）、ToPrimitive（valueOf → toString 降级链）。
- `==` 的算法：布尔先转数字、对象先 ToPrimitive——`[] == false`
  的推导就是这条链。
- 实践：**永远 `===`，唯一的例外是 `x == null`**。
