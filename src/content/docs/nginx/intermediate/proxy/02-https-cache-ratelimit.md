---
title: HTTPS、缓存与限流
description: TLS 终止与证书配置、代理缓存分级、限流 limit_req/limit_conn、动静分离
level: intermediate
core: true
---

## 一句话讲清 Nginx 的 HTTPS

Nginx 做 **TLS 终止**：把浏览器与 Nginx 之间的连接加密，Nginx 与后端之间
可走 HTTP（内网）。证书用 Let's Encrypt 或私证书：

```nginx
server {
    listen 443 ssl;
    server_name example.com;
    ssl_certificate     /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    location / {
        proxy_pass http://backend;
    }
}
# 加一条 HTTP 跳转
server { listen 80; return 301 https://$host$request_uri; }
```

## 代理缓存：把 Hot 资源挡在外面

```nginx
http {
    proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=mycache:10m
                     max_size=1g inactive=60m;
    server {
        location /api/ {
            proxy_pass http://backend;
            proxy_cache mycache;
            proxy_cache_valid 200 5m;     # 200 响应缓存 5 分钟
            proxy_cache_key "$host$request_uri";
        }
    }
}
```

缓存能大幅给后端降压，但要注意 **cache_key 的鉴别维度**（带上影响结果的
头/参数），否则会串数据。

## 限流：防爆防击穿

```nginx
http {
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    server {
        location /api/ {
            limit_req zone=api burst=20 nodelay;   # 平均 10r/s，可瞬时突发 20
            proxy_pass http://backend;
        }
    }
}
```

- `limit_req`：**请求速率**限量（漏斗模型），`burst` 允许瞬时积攒的余量。
- `limit_conn`：**并发连接**限量（如每个 IP 最多 5 个连接）。
- 超出后返回 `503`——与后端的"过载保护"层级不同：Nginx 在入口就挡住。

## 动静分离

把 `静态资源（css/js/img）` 和 `动态接口（api/）` 用不同的 location 处理：
静态走磁盘 + 强缓存、动态走 proxy_pass——静态不挤占用后端，动态专注业务逻辑。
这是反向代理最常见的性能优化基线。

## 小结

- TLS 终止在 Nginx 收敛证书，浏览器到代理加密、代理到后端内网直连。
- 缓存注意 cache_key 鉴别维度；限流用 limit_req（速率）+ limit_conn（并发）。
- 动静分离：静态磁盘强缓存、动态 proxy_pass，是最省事的性能基线。