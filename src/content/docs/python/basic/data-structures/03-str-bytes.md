---
title: str 与 bytes：两种序列与编码
description: Unicode 码点序列 vs 原始字节序列、encode/decode 方向记忆、UnicodeDecodeError 排查与"永远 UTF-8"纪律
level: basic
core: true
---

`UnicodeDecodeError` 大概是 Python 新手最常撞见、面试最爱问的报错——
根源只有一个：**没分清 str 和 bytes 是两种东西**。Python 3 把这条界线
划得非常清楚，理解它，编码问题从此不再是玄学。

## 一张对照表

| | str | bytes |
| --- | --- | --- |
| 装的是什么 | **字符（Unicode 码点）** | **原始字节（0-255）** |
| 字面量 | `'中文'` | `b'\xe4\xb8\xad'` |
| 迭代一次得到 | 一个字符 | 一个整数（字节值） |
| 存在哪儿 | 只在内存里 | 内存、磁盘、网络 |

关键认知：**str 是"抽象字符"，bytes 是"具体存储"**。字符要落磁盘、走网络，
必须先变成字节；字节要给人看、做字符串处理，必须先解读成字符——
解读时用哪种对照表（编码），就是所有问题的来源。

## encode 与 decode：方向别记反

```python
s = "中文"
b = s.encode("utf-8")    # str → bytes：编码（3 个字节：\xe4\xb8\xad）
s2 = b.decode("utf-8")   # bytes → str：解码
```

- 方向记忆：**encode 是把"人类可读"编码成"机器可存"**，decode 反之；
- 同一串字节用不同编码解读会得到不同字符（甚至报错）——
  `b'\xe4\xb8\xad'` 按 UTF-8 是"中文"的前两个……不对，按 GBK 解就是乱码
  "涓枃"。**字节没有含义，编码赋予含义**。

## UnicodeDecodeError 的标准排查

报错 `UnicodeDecodeError: 'gbk' codec can't decode ...` 的翻译：
**你用了 GBK 这张对照表去读一段不是 GBK 写的字节**。三步定位：

1. 找到出错点：几乎都在 `open()` 读文件或 `recv()` 收网络数据后；
2. 确认数据真正的编码（问来源：谁写的这段字节、用什么写的）；
3. `open(path, encoding="utf-8")` 显式指定——**Python 永远不要依赖
   默认编码**（Windows 下 `locale.getpreferredencoding()` 是 GBK，
   Linux 是 UTF-8，同一份代码跨平台行为不同就是踩的这里）。

## 与中间件的衔接：边界上只有 bytes

- 网络传输：TCP 收到的永远是 bytes，HTTP 框架帮你 decode 成 str（见网络
  篇的报文与编码）；
- 文件与 JSON：`json.dumps` 出 str（再 encode 上网），读回来先 decode；
- 数据库：连接串里声明 charset（`charset=utf8mb4`），驱动负责转换——
  MySQL 存储层的 utf8mb4 与 emoji 问题见 MySQL 篇。

一句话：**str 只活在你的程序里，跨出进程边界的全是 bytes**。

## 高频追问速答

- **Python 3 为什么取消 bytes 的隐式转换？** Python 2 的 str/unicode 混用
  是事故重灾区；Python 3 强制显式 encode/decode，边界清晰——类型系统
  替你把关。
- **len() 的区别？** `len('中') == 1`（字符数），`len('中'.encode()) == 3`
  （字节数）——算长度先想清楚要字符数还是字节数（HTTP 的
  Content-Length 是字节数）。
- **UTF-8 和 Unicode 什么关系？** Unicode 是字符集（给每个字符编号），
  UTF-8 是编码方案（编号怎么变字节）；类似的还有 UTF-16/UTF-32，
  互联网事实标准是 UTF-8。

## 小结

- str 装字符、bytes 装字节；encode 出门、decode 进门，方向别反。
- UnicodeDecodeError 三步排查：找出错点 → 确认真编码 → 显式指定；
  永远不依赖系统默认编码。
- 边界上只有 bytes：网络、磁盘、数据库出的进的都是字节，str 只在程序内。
