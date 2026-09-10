---
title: 文件不可变属性与 capabilities
description: chmod 777 也删不掉的文件（chattr +i）、日志保护的只追加位、capabilities 拆解 root 全能、容器 cap 基线
level: basic
core: true
---

用户与权限篇讲了 ugo/ACL/sudo，但还有一层更"高"的权限：**文件系统属性**
（chattr）和**进程能力**（capabilities）。"root 对 chmod 777 的文件
也删不掉"这类反直觉现象，答案都在这两层——也是容器安全的入口知识。

## chattr：chmod 管不到的属性位

chmod 改的是权限位，chattr 改的是 **inode 上的文件系统属性**——层次更高，
连 root 都受约束：

```bash
chattr +i /etc/resolv.conf    # 不可变（immutable）：不能改、不能删、不能建硬链
lsattr /etc/resolv.conf       # 查看：----i---------
chattr -i /etc/resolv.conf    # 先解锁才能改
chattr +a /var/log/app.log    # 只追加（append-only）：只能写不能删改
```

- **+i 的用途**：锁配置文件（防止脚本/程序误改 resolv.conf、hosts）；
- **+a 的用途**：审计日志保护——日志只能追加不能篡改删除（审计要求）；
- 高频现象：`rm` 报 Operation not permitted、`vim` 报只读——先
  `lsattr` 查属性再怀疑权限，这是排查链路里最容易被忽略的一层。

## capabilities：把 root 拆成零件

传统模型是两分法：**root 全能，普通用户几乎无能**。但"绑 1024 以下
端口"这种事，给 root 太危险、不给又干不了。Linux capabilities 把 root
的特权拆成几十个独立能力位：

- `CAP_NET_BIND_SERVICE`：绑低端口；
- `CAP_NET_RAW`：原始套接字；
- `CAP_SYS_TIME`：改系统时间……

```bash
setcap cap_net_bind_service=+ep /usr/sbin/nginx   # 非-root 运行的 nginx 也能绑 80
getcap /usr/sbin/nginx                            # 查看已授权能力
```

- nginx 以非 root 用户运行却绑 80 端口（生产标配），靠的就是这个
  能力位——**最小授权思想在进程层的落地**（对照 sudo 的命令级最小化）。

## 容器：capabilities 的主战场

Docker 默认**丢弃全部 capabilities 再选择性归还**一小部分——这就是
"容器内 root 不等于真 root"的原因：

- 容器内改系统时间失败：缺 `CAP_SYS_TIME`；
- 容器内挂载失败：缺 `CAP_SYS_ADMIN`（最强大也最危险的能力）；
- 需要 `docker run --cap-add NET_BIND_SERVICE` 按需补——**容器安全
  基线的核心实践**：默认丢弃 + 白名单补齐，而不是"给 root 再收紧"。

## 高频追问速答

- **chattr +i 和 chmod 的层次区别？** chmod 是 VFS 权限位检查，
  chattr 是文件系统 inode 属性——属性检查在权限检查之外，所以 777
  也拦不住 +i。ext4 支持，某些网络文件系统不支持（挂载时报错）。
- **为什么容器里的 root 很多事干不了？** Docker 默认 drop 全部
  capabilities；root 用户名 + 空能力 = 名义 root——这是特性不是 bug。
- **lsattr 看到 i 但要改文件怎么办？** `chattr -i` 解锁（root 可执行），
  改完按需加回——生产变更走流程，别永久解锁。

## 小结

- 权限四层：权限位（chmod）→ ACL → **文件属性（chattr +i/+a）** →
  **进程能力（capabilities）**，层次越高约束越"根本"。
- chattr +i 锁配置、+a 护日志；capabilities 把 root 拆成零件，
  setcap 实现非 root 绑低端口。
- 容器安全基线 = 默认丢弃 capabilities + 白名单按需补——最小授权
  从用户级细化到了能力级。
