---
title: 用户与权限体系
description: 多用户模型、用户与用户组、ugo 权限位、ACL 精细化授权与 sudo 提权
level: basic
---

## 多用户模型

Linux 是天生多用户系统：内核通过 **UID（用户 ID）** 和 **GID（组 ID）** 区分
身份，`/etc/passwd` 存用户、`/etc/group` 存组。进程/文件归属都记录为 uid/gid，
名字（root、alice）只是给人看的映射。

```bash
id              # 查看当前身份 uid/gid/所属组
id alice        # 查看 alice 的 uid/gid
cat /etc/passwd # 用户列表（含虚拟系统用户）
```

- **root（UID=0）**：超级用户，无视绝大多数权限检查。
- **每个用户至少属于一个主组**，可额外加入若干附加组（`usermod -aG docker alice`）。

## ugo 权限位

上篇已讲 rwx 含义，这里补结构化的查看与修改：

```text
-rwxr-xr--  1 alice  dev  4096 Sep 5 10:00 run.sh
 │└┬┘└┬┘└┬┘
 │ │  │  └─ 其他人 other：r--
 │ │  └──── 所属组 group：r-x
 │ └─────── 所有者 owner：rwx
 └───────── 类型（- 普通文件、d 目录、l 链接）
```

```bash
chmod 755 file     # owner=rwx group=r-x other=r-x
chmod u+x,g-w file # 符号法：给属主加执行、组去掉写
chown user:group f # 改属主/属组
chmod -R g+w dir   # 递归
```

**目录权限的坑**：目录的 `r`（能否列出）与 `x`（能否进入）分离。能读却不能
进去（`r--`）、能进去却不能列（`--x`）是两种常见困惑。

## 特殊位（回顾速记）

| 位 | 作用 |
|---|---|
| setuid (u+s) | 执行者临时获得文件**属主**权限 |
| setgid (g+s) | 目录内新文件继承目录**属组** |
| sticky (+t) | 目录内只有属主/root 能删自己的文件（如 /tmp） |

## ACL：超越 ugo 的精细化授权

ugo 只有三档（owner/group/other），要给特定用户单独授权就得靠 ACL：

```bash
setfacl -m u:bob:rwx file   # 给 bob 单独授权
setfacl -m g:team:r-- file  # 给 team 组只读
getfacl file                 # 查看 ACL
ls -l file   # 有 ACL 时最后会多一个 "+" 号
```

**排查顺序**：`Permission denied` 时，先看 `ls -l` 的 ugo 位，再看 `getfacl`，
必要时 `ls -Z` 检查 SELinux（安全上下文另一层）。

## sudo：最小化提权

`sudo` 让普通用户临时以 root（或指定用户）执行命令，避免长期持有 root shell：

```bash
sudo -l          # 看自己能 sudo 什么
sudo -u postgres psql ...   # 以 postgres 身份执行
visudo           # 编辑 /etc/sudoers（必须用 visudo，防语法错误锁死）
```

原则：**能不用 root 就不用，能用最小权限就不用 sudo**。`sudo -l` 是审计一台
机器"谁能干什么"的第一入口。

## 小结

- 身份靠 uid/gid，权限分 owner/group/other 三档，特殊位补强。
- 精细化授权用 ACL（`setfacl`/`getfacl`），`ls -l` 末尾 `+` 号提示存在 ACL。
- 提权用 sudo，原则最小化；排障顺序 ugo → ACL → SELinux。

## 延伸阅读

- [Linux 用户与权限（man 手册）](https://linux.die.net/man/1/chmod)