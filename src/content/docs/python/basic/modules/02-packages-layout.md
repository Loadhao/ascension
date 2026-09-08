---
title: 包与项目布局
description: __init__.py 与包门面、绝对与相对导入、src 布局、pip 与第三方包
level: basic
---

## 包就是带 `__init__.py` 的目录

模块之上是**包（package）**：一个含 `__init__.py` 的目录，把多个模块
组织成命名空间，对应 Java 的包目录：

```text
myapp/
├── myapp/
│   ├── __init__.py        # 包标识（可以为空）
│   ├── core.py
│   └── utils/
│       ├── __init__.py
│       └── text.py
└── main.py
```

```python
from myapp.utils.text import slugify   # 点路径 = 目录层级
```

`__init__.py` 在 import 包时执行，用来做包级初始化或**收敛 API 门面**——
在 `utils/__init__.py` 里写 `from .text import slugify`，用户就能
`from myapp.utils import slugify`，不必知道内部文件结构。这是 Java
没有的自由度：**对外 API 由包作者定义，不强制等于目录结构**。

## 绝对导入与相对导入

包内部互相引用有两种写法：

```python
# myapp/core.py 内部
from myapp.utils.text import slugify   # 绝对导入：从项目根算起（推荐）
from .utils.text import slugify        # 相对导入：. 同级、.. 上级
```

绝对导入长但一眼看出处；相对导入短，挪目录不用改。惯例：**包内用相对
导入，跨包用绝对导入**。注意直接跑脚本会破坏相对导入——
`python myapp/core.py` 报 `attempted relative import`，要用
`python -m myapp.core` 以模块身份运行。

## 项目布局：src 布局是现代默认

```text
myproj/
├── pyproject.toml        # 项目元数据与依赖声明（单一事实源）
├── src/
│   └── myapp/
│       ├── __init__.py
│       └── core.py
└── tests/
    └── test_core.py
```

src 布局的关键收益：`src` 不在 `sys.path` 上，**测试只能通过"安装后的
包" import**，杜绝"本地能跑、装上就坏"的路径巧合。环境与依赖工具链
（venv/uv）见[环境管理与 uv](/python/advanced/eng/01-venv-uv/)。

## pip：装第三方包

Java 有 Maven 中央仓库，Python 对应 PyPI + pip（现代替代：`uv pip install`）：

```bash
pip install requests            # 装进当前环境的 site-packages
pip list                        # 已装清单
pip freeze > requirements.txt   # 导出依赖版本（入库）
```

"当前环境"是关键词：同一个包装到**哪个** site-packages，由激活的虚拟
环境决定——不同项目用不同版本互不干扰，这正是虚拟环境存在的理由。

## 小结

- 包 = 带 `__init__.py` 的目录；`__init__.py` 做包级门面，收敛对外 API。
- 包内相对导入、跨包绝对导入；跑脚本破坏相对导入时用 `python -m`。
- src 布局让测试 import 的是安装后的包；依赖装在环境里，pip/uv 负责安装。
