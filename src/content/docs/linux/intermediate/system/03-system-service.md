---
title: 系统服务与 systemd
description: systemd 单元、service 文件编写、启停自启与日志 journalctl
level: intermediate
---

## systemd：现代 Linux 的服务管家

systemd（PID 1）负责启动、监督、管理系统的服务和各种"单元（unit）"。几乎
所有主流发行版都在用，管服务是它的核心场景。

```bash
systemctl status nginx      # 看服务状态
systemctl start/stop nginx  # 启动/停止
systemctl restart nginx     # 重启
systemctl enable nginx      # 开机自启
systemctl disable nginx     # 取消自启
systemctl list-units --type=service  # 列服务
```

## unit 文件在哪里

- 系统包自带：`/usr/lib/systemd/system/xxx.service`
- 用户自定义：`/etc/systemd/system/xxx.service`（优先级更高）

## 编写一个 service

```ini
[Unit]
Description=My App
After=network.target          # 在网络就绪后启动

[Service]
User=app
WorkingDirectory=/opt/myapp
ExecStart=/opt/myapp/start.sh
Restart=on-failure             # 失败自动重启
RestartSec=5

[Install]
WantedBy=multi-user.target     # 开机启动目标
```

写完后：

```bash
systemctl daemon-reload    # 重新加载 unit 配置
systemctl start myapp
systemctl enable myapp     # 开机自启
systemctl status myapp
```

## 核心概念

- **unit 类型**：`service`（服务）、`timer`（定时，替代 cron）、`target`（运行
  级别组，如 multi-user.target）。
- **依赖关系**：`After=`（顺序）、`Requires=`（强依赖）、`Wants=`（弱依赖）。
- **Restart 策略**：`on-failure`（失败重启）、`always`（总是重启），配合
  `RestartSec` 防抖。

## 查日志：journalctl

systemd 统一收集服务日志（journal），不在传统 `/var/log/syslog`：

```bash
journalctl -u nginx            # 只看 nginx 日志
journalctl -u nginx -f         # 实时跟踪（tail -f 等价）
journalctl -u nginx --since "10 min ago"
journalctl -p err              # 只看错误级别
```

## 小结

- 管服务用 systemctl start/stop/enable/status。
- 自定义 service 放 `/etc/systemd/system/`，改后 daemon-reload。
- 日志用 journalctl -u 服务名 -f 实时跟踪。

## 延伸阅读

- [systemd 官方文档](https://systemd.io/)