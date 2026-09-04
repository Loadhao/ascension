---
title: 镜像与容器常用命令
description: Docker 高频命令速查：镜像拉取构建、容器运行管理、日志与调试
level: basic
core: true
---

## 镜像命令速查

| 命令 | 作用 | 示例 |
|---|---|---|
| `docker pull` | 拉取镜像 | `docker pull nginx:1.27` |
| `docker images` | 列出本地镜像 | `docker images` |
| `docker rmi` | 删除镜像 | `docker rmi nginx:1.27` |
| `docker build` | 从 Dockerfile 构建 | `docker build -t myapp:v1 .` |
| `docker tag` | 打标签 | `docker tag myapp:v1 repo/myapp:v1` |
| `docker push` | 推送到仓库 | `docker push repo/myapp:v1` |
| `docker save / load` | 导出 / 导入镜像文件 | `docker save -o app.tar myapp:v1` |
| `docker history` | 查看镜像分层历史 | `docker history myapp:v1` |

## 容器命令速查

| 命令 | 作用 | 示例 |
|---|---|---|
| `docker run` | 创建并启动容器 | `docker run -d -p 8080:80 --name web nginx` |
| `docker ps` | 列出运行中容器 | `docker ps -a`（含已停止） |
| `docker stop / start / restart` | 停止 / 启动 / 重启 | `docker stop web` |
| `docker rm` | 删除容器 | `docker rm -f web`（强制删运行中） |
| `docker exec` | 进入运行中容器 | `docker exec -it web sh` |
| `docker logs` | 查看日志 | `docker logs -f --tail 100 web` |
| `docker inspect` | 查看容器元数据 | `docker inspect web` |
| `docker stats` | 实时资源占用 | `docker stats` |
| `docker cp` | 容器内外拷文件 | `docker cp web:/etc/nginx/nginx.conf .` |

## docker run 关键参数

```bash
docker run \
  -d \                # 后台运行（detached）
  --name web \        # 容器名
  -p 8080:80 \        # 端口映射 宿主:容器
  -v data:/var/lib/mysql \   # 挂载数据卷
  -e MYSQL_ROOT_PASSWORD=secret \  # 环境变量
  --restart=unless-stopped \  # 开机/异常自启策略
  nginx:1.27
```

| 参数 | 说明 |
|---|---|
| `-d` | 后台运行；不加则前台占住终端 |
| `-p 宿主:容器` | 端口映射，`-P` 随机映射所有 EXPOSE 端口 |
| `-v` | 挂载卷：`具名卷`、`/宿主路径:/容器路径`、`匿名卷` |
| `-e` | 环境变量，配置注入的标准方式 |
| `--rm` | 容器退出后自动删除（一次性任务常用） |
| `--restart` | `no` / `on-failure` / `always` / `unless-stopped` |

## 清理资源

```bash
docker system df                # 查看磁盘占用
docker container prune          # 删除所有已停止容器
docker image prune -a           # 删除未使用镜像
docker volume prune             # 删除未使用卷
docker system prune -a --volumes  # 一把梭（注意别删有用卷）
```

## 要点备忘

- `-it` 通常连用：`-i` 保持 stdin 打开，`-t` 分配伪终端，进容器必备
- `docker run` 每次都创建**新容器**；重复启动同一容器用 `docker start`
- `docker exec` 与 `docker attach` 区别：exec 是新开一个进程，attach 是接入主进程（exit 会把容器带崩，一般用 exec）
