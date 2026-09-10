---
title: 定时任务：crontab 与 systemd timer
description: crontab 五字段与经典坑、systemd timer 的补跑能力、分布式环境下防重复执行的三个思路
level: intermediate
core: true
---

"每天凌晨跑对账、每小时清理临时文件"——定时任务是服务端的基本设施。
单机部分（crontab/systemd timer）是运维基本功；一到分布式环境，
"**多台机器都跑了怎么办**"就变成设计题（分布式任务调度篇的入口）。

## crontab：五字段与经典坑

```bash
# 分 时 日 月 周
0 2 * * * /usr/local/bin/backup.sh        # 每天 2 点
*/5 * * * * /usr/local/bin/cleanup.sh     # 每 5 分钟
0 9 * * 1-5 /usr/local/bin/report.sh      # 工作日 9 点
```

三个经典坑：

- **环境变量不继承**：cron 的 PATH 只有 `/usr/bin:/bin`——脚本里
  用绝对路径或显式 source 环境，"手动跑得好好的 cron 就是不执行"
  九成是这个；
- **`%` 要转义**：cron 里 `%` 是换行符，命令中含 `%` 要写 `\%`；
- **输出去哪了**：cron 的 stdout 会发邮件（通常没人收）——显式
  重定向到日志文件，否则排障无门。

## systemd timer：现代替代方案

```ini
# backup.timer
[Timer]
OnCalendar=*-*-* 02:00:00     # 日历型
Persistent=true               # 错过的任务开机后补跑
# OnUnitActiveSec=1h          # 或间隔型：每次激活后 1h

[Install]
WantedBy=timers.target
```

| | crontab | systemd timer |
| --- | --- | --- |
| 错过的任务 | 直接跳过 | **Persistent=true 可补跑** |
| 日志 | 邮件/自重定向 | journalctl 统一（systemd 服务篇） |
| 依赖管理 | 无 | 可声明依赖与顺序 |
| 精度 | 分钟 | 秒 |

- timer 的本质是"定时触发一个 unit"——定时逻辑与执行逻辑分离，
  每次执行有独立的日志与状态（失败可查）。

## 分布式环境：多机重复执行

同一脚本部署在 10 台机器、10 台都配了 cron——**任务执行 10 次**。
三个思路：

1. **指定单机**：只有一台配 cron——单点，机器挂了任务就停；
2. **分布式锁**：脚本开头抢锁（Redis SETNX/TTL，或 DB 乐观锁），抢到
   才执行——简单但锁超时误判是陷阱（幂等篇"锁不等于幂等"）；
3. **任务调度平台**：XXL-JOB/Elastic-Job 统一调度、分片广播、失败
   重试与告警——规模大了的正解（分布式任务调度篇展开）。

外加一条通用纪律：**定时任务必须幂等**（调度平台重试、人工手动触发
都算重复执行——task 表幂等键兜底）。

## 高频追问速答

- **5 字段和 6 字段 crontab 的区别？** Quartz 类调度框架是 6 字段
  （秒 分 时 日 月 周），cron 是 5 字段（分起）——字段含义与
  "日和周互斥"的细节要背准。
- **错过的定时任务怎么处理？** crontab 直接跳过（可配合启动时执行
  一次兜底）；systemd timer 用 `Persistent=true` 补跑——按业务
  语义选：对账补跑有意义，清理类跳过无所谓。
- **定时任务执行时间漂移怎么办？** 任务执行时长超过间隔会堆积——
  单实例锁 + 监控执行时长（慢任务告警），堆积严重的改异步/分片。

## 小结

- crontab 五字段 + 三坑（环境变量/`%` 转义/输出重定向）；
  systemd timer 有补跑与日志优势，现代 Linux 优先。
- 分布式环境下防重复：单机指定 → 分布式锁 → 调度平台，规模决定选型；
  **定时任务必须幂等**是贯穿所有方案的前提。
