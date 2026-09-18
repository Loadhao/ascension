---
title: 代码规范工具链：Lint 与 Format
description: ESLint 管质量与 Prettier 管风格的分工、配置层级与插件生态、Husky 与 lint-staged 的提交闸门、编辑器实时到 CI 兜底的三道闸、--no-verify 的绕过问题
level: intermediate
---

「ESLint 和 Prettier 有什么区别？为什么两个都要？」——答案背后是一套
**代码质量的自动化防线**：编辑器实时提示、提交钩子拦截、CI 兜底，三道
闸各司其职。这篇把工具链的分工与闸门讲清。

## Lint 与 Format：管的两码事

两者最容易被混为一谈，分工其实是正交的：

| | ESLint | Prettier |
| --- | --- | --- |
| 管什么 | **代码质量**：bug 隐患、反模式、最佳实践 | **代码风格**：缩进、引号、换行、空格 |
| 典型规则 | no-unused-vars、eqeqeq、no-await-in-loop | 单引号、行宽 80、尾逗号 |
| 能自动修吗 | 部分可 `--fix` | 几乎全部 |

历史纠葛一句话：Prettier 出现前 ESLint 也有风格规则（eslint-plugin-
prettier 反向把 Prettier 塞进 ESLint），两个工具在格式问题上重叠开战，
最终社区和解方案是 **`eslint-config-prettier`**——用配置关掉 ESLint 里
所有与格式相关的规则，风格问题完全让给 Prettier，ESLint 专注质量。

「为什么格式要自动化」的两条理由：省掉 code review 里全部的格式争论
（review 只看逻辑），以及消除手工格式化造成的 git diff 噪音——纯格式
提交会淹没真正的逻辑变更。

## 配置：规则、插件与继承

ESLint 的配置模型三层积木：**规则**（单条检查）、**插件**
（eslint-plugin-*，带来一批新规则，如 react、vue 专属规则）、**可共享
配置**（eslint-config-*，用 extends 一键继承 preset）。工程惯例：
继承一个成熟 preset（如 eslint:recommended 或大厂规范包），再局部
覆盖团队特有规则——从零手写规则表是反模式。

## 三道闸：问题拦得越早，修得越便宜

```mermaid
flowchart LR
    A["编辑器实时红线<br/>写的时候就报"] --> B["pre-commit 钩子<br/>提交前拦截"]
    B --> C["CI 流水线<br/>merge 前兜底"]
```

- **第一道（编辑器）**：ESLint/Prettier 的编辑器插件实时标红、保存
  自动格式化——成本最低的修复时机；
- **第二道（提交钩子）**：**Husky** 挂载 git pre-commit 钩子，跑
  **lint-staged**——只对**暂存区文件**执行 lint + format（全量跑太慢，
  增量才是工程化的正解）；
- **第三道（CI）**：本地钩子可以被 `git commit --no-verify` 绕过，
  所以 CI 必须再跑一遍完整检查做兜底——「本地闸门是体验，CI 闸门
  才是保证」。

三道闸的设计哲学与[前端错误监控](/js/intermediate/web/11-error-monitoring/)
的分层同构：问题发现得越早（写代码时 > 提交时 > 线上），修复成本越低。

## 高频追问

**ESLint 能替代 Prettier 吗？** 理论上 ESLint 也有格式规则，但格式化
性能与覆盖度远不如专业工具，双工具正交分工是社区终局方案。

**`--fix` 能全自动吗？** ESLint 只敢自动修「语义无损」的规则（删多余
分号）；涉及语义的（no-unused-vars 的删除建议可能改变行为）只能提示
人工处理——这也是 lint 自动修不能省 code review 的原因。

**规范落不了地怎么办？** 十有八九是只有「文档规范」没有「工具闸门」。
可执行的规范才有约束力：规则进配置、闸门进钩子、例外用行内注释
（`eslint-disable-next-line` + 理由）显式声明，而不是「下次注意」。

## 小结

- ESLint 管质量、Prettier 管风格，`eslint-config-prettier` 关闭重叠
  规则是和解方案。
- 配置三层积木：规则、插件、可共享配置；工程惯例是继承 preset 再覆盖。
- 三道闸：编辑器实时 → Husky+lint-staged 提交拦截 → CI 兜底；
  `--no-verify` 能绕过本地，绕不过 CI。
- 可执行的规范才是规范：例外走显式 disable 注释，不走口头约定。

## 延伸阅读

- [ESLint 官方：配置文件](https://eslint.org/docs/latest/use/configure/)
- [Prettier 官方：与 ESLint 的关系](https://prettier.io/docs/en/integrating-with-linters)
- [lint-staged：只跑暂存文件](https://github.com/lint-staged/lint-staged)
