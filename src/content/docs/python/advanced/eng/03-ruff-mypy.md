---
title: ruff 与 mypy
description: ruff 一统 lint/format、mypy 静态类型检查、CI 质量门禁
level: advanced
---

## ruff：一个工具结束格式之争

ruff（Rust 实现）用二进制替换了 flake8 + isort + black + pyupgrade
一整个工具链，快到能当保存时钩子跑：

```bash
uvx ruff check .            # lint：未用导入、可疑写法、风格问题
uvx ruff check --fix .      # 能自动修的直接修
uvx ruff format .           # 格式化：black 风格，不吵
```

配置进 pyproject.toml 单一事实源：

```toml
[tool.ruff]
target-version = "py312"
line-length = 100

[tool.ruff.lint]
select = ["E", "F", "I", "UP", "B"]   # pycodestyle / pyflakes / import排序 / 语法升级 / 常见bug
# E501 关掉行长 lint（交给 format 管），避免和 formatter 打架
ignore = ["E501"]

[tool.ruff.format]
quote-style = "double"
```

`UP` 规则组是宝藏：自动提示旧写法的新形态（`Optional[X]` → `X | None`、
`typing.List` → `list`）。`B`（bugbear）能抓真 bug 级别的写法
（可变默认参数这类）。

**format 与 lint 分工**：format 只管排版不做价值判断（black 哲学——
格式没有讨论空间），lint 管代码质量。两者冲突的规则（如行长）关掉
lint 侧交给 format。

## mypy：类型标注的执法者

[typing](/python/intermediate/stdlib/04-typing/) 标注写完只是"立了法"，
mypy 才是执法：

```bash
uvx mypy src/
```

```python
def scale(items: list[int], factor: int) -> list[int]:
    return [i * factor for i in items]

scale(["a"], 2)        # mypy: Argument 1 has incompatible type "list[str]"
```

严格度渐进收紧（不追求一步 strict）：

```toml
[tool.mypy]
python_version = "3.12"
warn_unused_ignores = true
check_untyped_defs = true        # 没标注的函数体也检查
disallow_untyped_defs = true     # 新代码必须全标注（可按目录覆盖）
```

老项目按目录灰度：`[[tool.mypy.overrides]] module = "legacy.*",
ignore_errors = true`，新代码全严格。

## CI 串成门禁

```yaml
# .github/workflows/ci.yml 的核心三行
- run: uv sync
- run: uvx ruff check . && uvx ruff format --check .
- run: uvx mypy src/ && uv run pytest
```

本地 pre-commit 挡一遍 + CI 兜底：lint → format → type → test，
任何一环红了不予合并。**质量工具的价值在于"不是人盯"**——
风格不再 review 时讨论，类型错误进不了主干。

## 工具链分工总结

| 关注点 | 工具 | 一句话 |
| ---- | ---- | ---- |
| 风格与排版 | ruff format | 无争论，直接格式化 |
| 代码坏味道 | ruff check | 能修的 `--fix`，能抓 bug 的开 B 规则 |
| 类型正确性 | mypy | 签名的执法者，边界值（None、字面量）高价值 |
| 行为正确性 | pytest | 见 [pytest](/python/advanced/eng/02-pytest/) |

## 小结

- ruff = lint + format 二合一，配置进 pyproject.toml，UP 规则自动提示
  新语法；lint 与 format 冲突的规则关 lint 侧。
- mypy 渐进收紧：先 `check_untyped_defs`，新目录 `disallow_untyped_defs`，
  老代码 overrides 灰度。
- 本地保存即跑 ruff，CI 全量门禁：check → format --check → mypy → pytest。
