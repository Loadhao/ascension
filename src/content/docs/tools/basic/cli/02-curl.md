---
title: curl：命令行 HTTP 请求
description: -X/-d/-H/other 核心参数、调试接口三板斧、后续管道接 jq 的姿势
level: basic
---

不打开浏览器，也能带各种 header、参数、认证直接验证一个接口。curl 覆盖
了 HTTP 调试九成日常。

## 核心参数

```bash
curl https://api.example.com/users        # 默认 GET，打印响应体
curl -i https://api.example.com/users     # -i 显示响应头
curl -v https://api.example.com/users     # -v 全部细节（握手/headers/体）
curl -X POST https://api.example.com/users -d '{"name":"a"}' -H 'Content-Type: application/json'
curl -X PUT ... -H 'Authorization: Bearer xxx'
curl -u user:pass https://...              # 基础认证
curl -k https://...                        # 忽略证书（自签测试）
```

关键记忆：`-X` 指定方法（但默认就能 POST），`-d` 带请求体，`-H` 加一个
header，`-i/-v` 看细节。

## 调试三板斧

1. **确认通的**：`-v` 看握手+状态码，先排除网络/证书问题。
2. **带上要测的头**：认证、超时 `--max-time 5`、跟随重定向 `-L`。
3. **只留响应**：`-s` 静默掉进度条，接 `-o -` 或管道处理。

```bash
# 只拿响应码
curl -s -o /dev/null -w '%{http_code}\n' https://api.example.com/health

# 把响应交给 jq 解析
curl -s https://api.example.com/users | jq '.data[] | .name'
```

## 小结

- 常用 `-X / -d / -H / -i / -v / -u / -k`，加上 `-s` 静默、`-L` 跳转。
- HTTP 调试思路：`-v` 排错 → `-H` 补场景 → 管道接 jq 读结果。
- 与 jq 搭配，curl 就是一台不依赖 GUI 的接口调试台。