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

## location 选择优先级一次走完（深入）

location 匹配是 Nginx 配置第一难的拦路虎，很多人背规则还是踩"匹配到不该
匹配的块"。用一个请求来逐步判定：

```nginx
server {
    location = /a { return 200 "精确"; }        # ① 精确匹配
    location ^~ /img/ { return 200 "前缀/不查正"; } # ② 前缀，且不查正则
    location /img/logo.png { return 200 "前缀"; }  # ③ 通用前缀
    location ~* \.png$     { return 200 "正则"; }  # ④ 正则（忽略大小写）
    location /            { return 200 "兜底"; }   # ⑤ 通用前缀兜底
}
```

| 请求 | 命中谁 | 为什么 |
|---|---|---|
| `/a` | ① | 精确匹配（`=`）优先级最高 |
| `/img/logo.png` | ② | `^~` 前缀命中后**不再查正则**，直接用它 |
| `/banner/bg.png` | ④ | 无 `^~` 前缀命中 → 正则最高 |
| `/about` | ⑤ | 只有通用前缀，取最长匹配 |

**排序一口气记住**：

```text
精确(=) > ^~ 前缀(不再查正) > 正则(~ / ~*) > 最长通用前缀
```

**两个高频踩坑：**

1. **正则会在"最长前缀之后"再试**——所以默认情况下，前缀写再长也会被
   命中它的正则"踹开"。想要"前缀说了算"得用 `^~`。
2. **顺序决定正则胜负**：正则匹配不按前缀长短、而按**书写顺序**，先写先赢。
   正则多时，把更具体的放前面。

判断"请求到底走了哪个 location"，最直接是看 `return 200` 的响应或用
`log_format` 记录 `$uri`；别靠猜。

## 小结

- root 拼完整 URI、alias 只替换前缀，混用是 404 高发区。
- SPA 必须配 `try_files ... /index.html`，否则前端路由刷新即 404。
- gzip 对文本类大促；access/error 双日志是联排的第一落点。