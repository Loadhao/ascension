---
title: 数据卷与持久化
description: 具名卷、绑定挂载、tmpfs 的区别与选择，容器数据不丢失的正确姿势
level: intermediate
---

## 三种挂载方式

| 类型 | 写法 | 数据位置 | 典型用途 |
|---|---|---|---|
| 具名卷 volume | `-v data:/var/lib/mysql` | Docker 管理（`/var/lib/docker/volumes/`） | 数据库等生产数据 |
| 绑定挂载 bind mount | `-v /host/path:/container/path` | 宿主任意目录 | 开发热加载、配置文件 |
| 匿名卷 | `-v /container/path` | Docker 自动分配 | 防镜像内数据被写层污染 |
| tmpfs | `--tmpfs /app/cache` | 内存 | 临时敏感数据 |

新语法推荐 `--mount`，语义更明确：

```bash
docker run --mount type=volume,source=data,target=/var/lib/mysql mysql
docker run --mount type=bind,source=$(pwd)/conf,target=/etc/nginx/conf.d nginx
```

## 选择决策

```mermaid
flowchart TD
    A[需要持久化数据?] --> -- 否 --> B[tmpfs 或不挂载]
    A -- 是 --> C{宿主直接编辑文件?}
    C -- 是：配置/代码热更 --> D[bind mount]
    C -- 否：数据库/制品 --> E[具名卷<br/>性能好、可备份、跨平台]
```

- **生产数据一律用具名卷**：Docker 统一管理，不受宿主目录权限干扰，`docker volume` 命令可备份迁移
- **开发期源码热加载用 bind mount**：配合 `nodemon`/`vite` 立即生效
- 数据库同时挂卷（数据）与 bind（配置）是常见组合

## 卷管理命令

```bash
docker volume ls                       # 列出所有卷
docker volume inspect data             # 查看卷详情（真实路径等）
docker volume create data              # 显式创建
docker volume rm data                  # 删除（容器占用时会失败）
docker volume prune                    # 清理无用卷

# 备份：借一个容器把卷内容 tar 出来
docker run --rm -v data:/src -v $(pwd):/dst alpine \
  tar czf /dst/data-backup.tar.gz -C /src .
```

## 易踩的坑

- bind mount 挂载目录会**遮盖**镜像内同路径内容：挂空目录到 `/etc/nginx` 会把配置全盖掉
- 具名卷首次挂载时若目标目录非空，Docker 会把镜像内该目录内容**预填充**进卷（bind mount 不会）
- 卷权限：容器内用户 UID 与宿主文件属主不一致时会出现 `Permission denied`，可在 Dockerfile 中 `USER` 对齐或挂载后 `chown`
- MySQL 初始化脚本约定放 `/docker-entrypoint-initdb.d/`，首次启动自动执行

## 要点备忘

- 容器可写层随容器删除而消失，`docker rm` 前先想数据在哪
- `docker rm -v` 会顺带删除匿名卷（具名卷不受影响）——防匿名卷堆积的清理习惯
- 备份具名卷 = 起个临时容器 tar；恢复就是反向操作
