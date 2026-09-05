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

## run 参数背后：隔离与分层在作怪（深入）

`docker run` 的一堆参数不是摆设，它们对应容器的两个底层事实：**用 namespace
隔离**、**用镜像层 + 可写层运行**。

```text
docker run 启动一个容器
  → 给容器"披上"隔离命名空间：进程(PID)、网络(NET)、文件系统(MNT)、挂载…
  → 打开镜像：以只读层作为基底（镜像分层，见镜像篇）
  → 在只读层之上加一层"可写层"（容器内的写都落在这里）
  → 应用容器的主进程（PID 1）
```

由此看几个参数就不是死记了：

- **`-p 8080:80` = NAT 端口转发**：把宿主 8080 映射到容器内 80。容器有自己的
  网络命名空间，默认没有"宿主可见"的端口，映射才开放出去。
- **容器只在"可写层"写**：容器删了可写层就没——所以独立数据要 `-v` 挂卷。
- **`--name` 不是装饰**：它是对容器的标识，同名再 run 会冲突报错。

## 容器起不来的排障（深入）

`docker run` 立刻退出是最常见困惑，按顺序查：

| 现象 | 根因 | 排查命令 |
|---|---|---|
| `port is already allocated` | 宿主端口被占 | `ss -ltnp` / `lsof -i:8080` |
| `Unable to find image`（离线） | 镜像没拉下来 | `docker pull` 或内网配 mirror |
| `No such image` 名拼错 | tag 打错 | `docker images` |
| run 完立刻退出（exit 0/x≠0） | **主进程结束** → 容器结束 | `docker logs <id>` 看它为什么退出 |
| 后台 `-d` 起来但无响应 | 应用没监听/端口错 | `docker logs` + `docker exec -it <id> sh` 进去看 |

**最反直觉的一条**：容器生命周期 = **主进程（PID 1）生命周期**。你 `run` 一个
`nginx`，它会保持；`run` 一个"跑完就退"的命令（如 `echo hi`）容器当场退出——
不是 docker bug，是主进程结束了。想让它停留就用一个"前台常驻"的命令
（`tail -f /dev/null` 等，仅调试用）。

**排障顺序铁律**：先 `docker logs`（看应用输出）→ `docker ps -a`（看退出码）
→ `docker inspect`（看挂载/端口）。三连下来九成问题能定位。

## 要点备忘

- `-it` 通常连用：`-i` 保持 stdin 打开，`-t` 分配伪终端，进容器必备
- `docker run` 每次都创建**新容器**；重复启动同一容器用 `docker start`
- `docker exec` 与 `docker attach` 区别：exec 是新开一个进程，attach 是接入主进程（exit 会把容器带崩，一般用 exec）
