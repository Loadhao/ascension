---
title: pytest 测试
description: assert 重写断言、参数化、fixture 依赖注入、conftest 共享
level: advanced
---

## assert 就够

unittest 是 Java JUnit 的 Python 搬运：`self.assertEqual`、
`setUp/tearDown`、必须继承 TestCase。pytest 的答案——**assert 原样写**，
失败时自动把表达式拆开告诉你中间值：

```python
def test_discount():
    price = apply_discount(100, "vip")
    assert price == 80, f"vip 应打八折，实际 {price}"
# 失败输出：apply_discount(100, 'vip') → 85 之类的中间过程全被展开
```

```python
import pytest

def parse(s: str) -> int | None: ...     # 被测函数

def test_parse_valid():
    assert parse("42") == 42

def test_parse_invalid():
    with pytest.raises(ValueError):     # 断言异常：上下文管理器
        parse("abc")
```

测试发现规则：文件 `test_*.py`、函数 `test_*`——零配置收集。

## 参数化：一次声明 N 个用例

```python
@pytest.mark.parametrize("raw,expected", [
    ("42", 42),
    (" 42 ", 42),          # 空白容忍
    ("0", 0),
    ("-7", -7),
])
def test_parse(raw, expected):
    assert parse(raw) == expected

@pytest.mark.parametrize("raw", ["abc", "", "!@#"])
def test_parse_bad(raw):
    with pytest.raises(ValueError):
        parse(raw)
```

同一段逻辑的合法/非法用例各自成组——**加用例只加数据行**，不再复制
函数。失败的用例在报告里按参数区分。

## fixture：依赖注入的测试版

测试的前置条件（数据库连接、临时目录、客户端实例）声明成 fixture，
按参数名注入：

```python
import pytest

@pytest.fixture
def api_client(tmp_path):               # fixture 可以依赖 fixture
    app.config["DATA_DIR"] = tmp_path   # tmp_path 是内置 fixture：隔离的临时目录
    return TestClient(app)

def test_create_user(api_client):       # 按名字注入，不用继承任何基类
    resp = api_client.post("/users", json={"name": "ada"})
    assert resp.status_code == 201
```

作用域控制构建成本：`@pytest.fixture(scope="session")` 全程只建一次
（重资源如数据库容器）；默认 function 级每测重建（隔离优先）。
**共享 fixture 放 conftest.py**——同目录及子目录的测试自动可见，
不需要 import。

对比 FastAPI 的 Depends（见 [FastAPI](/python/intermediate/libs/03-fastapi/)）：
同一套"声明依赖、框架解析"的思路——测试里注入假实现，就是最朴素的
mock 策略，很多场景根本不需要 mock 库。

## mark：分组与标记

```python
@pytest.mark.slow
def test_full_index_rebuild(): ...

@pytest.mark.skipif(sys.platform == "win32", reason="仅 POSIX")
def test_unix_perms(): ...
```

`pytest -m "not slow"` 跑的时候排除慢测试——**快慢分离**是本地频繁
跑测试的前提。插件生态即插即用：`pytest-cov` 覆盖率、`pytest-xdist`
并行（`-n auto`）。

## 小结

- 裸 assert + `pytest.raises`，失败的中间值自动展开；测试文件/函数按
  test_ 前缀发现。
- 参数化加用例只加数据行；fixture 按名注入、可嵌套，共享放 conftest.py。
- mark 分组过滤（slow/网络/平台），快慢分离保证本地反馈速度。
