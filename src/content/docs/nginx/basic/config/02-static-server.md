---
title: 静态文件与日志服务
description: root/alias 与 try_files、gzip 压缩、access/error 日志与 log_format
level: basic
core: true
---

## 静态资源：root 与 alias 的分工

```nginx
server {
    listen 80;
    server_name example.com;

    root   /var/www/site;            # 全局根目录
    index  index.html;

    location /static/ {
        alias /opt/assets/;          # 把 /static/ 映射到 /opt/assets/
    }
}
```

**root 与 alias 的差异就是要命的细节**：

- `root /var/www/site`：`/img/a.png` → `/var/www/site/img/a.png`
  （**root 拼上完整 URI**）。
- `alias /opt/assets/`：`/static/a.png` → `/opt/assets/a.png`
  （**alias 只替换前缀 `/static/` 部分**）。

两者混用想当然，会得到 404 或错文件——先默认用 root，确实需要"前缀替换"
再上 alias。

## try_files：优雅地走"找不到再降级"

```nginx
location / {
    try_files $uri $uri/ /index.html;   # 匹配不到 → 回退到 index.html
}
```

SPA（Vue/React 前端路由）全靠它：刷新 `/user/1`，Nginx 找不到真实文件，
回退返回 `index.html`，让前端路由接管。**不配这条，SPA 刷新就 404**。

## 内容压缩：gzip

```nginx
http {
    gzip  on;
    gzip_types text/plain text/css application/javascript application/json;
    gzip_min_length 1k;        # 小于 1k 不压，避免"压了更大"
}
```

只对有意义的类型压缩；JSON/JS/CSS 必压，图片一般交给 `image/webp`
等本身已压缩的格式。

## 日志：access 与 error

```nginx
http {
    log_format main '$remote_addr - $remote_user [$time_local] '
                    '"$request" $status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent"';
    access_log /var/log/nginx/access.log main;
    error_log  /var/log/nginx/error.log warn;
}
```

- **access_log**：每次请求记一条，配合 `log_format` 自定义字段。
- **error_log**：运维定位错误，告警级别 `debug/info/notice/warn/error`。

排查线上问题时，先用 access log 看请求到了没、回了什么码，再决定是否把
error log 级别调高看内部错误——这是最省时的第一落点。

## 小结

- root 拼完整 URI、alias 只替换前缀，混用是 404 高发区。
- SPA 必须配 `try_files ... /index.html`，否则前端路由刷新即 404。
- gzip 对文本类大促；access/error 双日志是联排的第一落点。