#!/usr/bin/env bash
# ascension 本地开发启动脚本
# 用法: ./scripts/dev.sh [--install] [--port 4321] [--no-open] [--restart]
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

# ---------- 参数解析 ----------
AUTO_INSTALL=0
OPEN_BROWSER=1
RESTART=0
PORT=4321
while [[ $# -gt 0 ]]; do
  case "$1" in
    --install)  AUTO_INSTALL=1; shift ;;
    --no-open)  OPEN_BROWSER=0;  shift ;;
    --restart)  RESTART=1;       shift ;;
    --port)
      PORT="$2"
      shift 2
      ;;
    -h|--help)
      echo "Usage: $0 [--install] [--port N] [--no-open] [--restart]"
      echo "  --install    启动前自动 pnpm install"
      echo "  --port N     指定端口 (默认 4321)"
      echo "  --no-open    启动后不自动打开浏览器"
      echo "  --restart    若已有 dev 服务则先停止再启动"
      exit 0
      ;;
    *)
      echo "未知参数: $1" >&2; exit 1 ;;
  esac
done

# ---------- 环境检查 ----------
check_cmd() {
  if ! command -v "$1" &>/dev/null; then
    echo "[ERROR] 未找到命令: $1，请到 https://$1.io 或通过包管理器安装" >&2
    exit 1
  fi
}
check_cmd node
check_cmd pnpm

# ---------- 依赖检查 ----------
if [[ ! -d node_modules ]]; then
  echo "[INFO] node_modules 不存在，执行 pnpm install ..."
  pnpm install
elif [[ "$AUTO_INSTALL" -eq 1 ]]; then
  echo "[INFO] 执行 pnpm install ..."
  pnpm install
fi

# ---------- Mermaid 渲染依赖检查 ----------
CHROMIUM_DIR="$(pnpm exec playwright install --dry-run chromium 2>/dev/null \
  | awk '/playwright chromium v/{p=1} p && /Install location:/{print $3; exit}')"
if [[ -n "$CHROMIUM_DIR" && ! -d "$CHROMIUM_DIR" ]]; then
  echo "[INFO] Mermaid 构建需要 playwright chromium，执行安装 ..."
  pnpm exec playwright install chromium \
    || echo "[WARN] chromium 安装失败，本地 build 时 Mermaid 图表可能无法渲染（dev 模式不受影响）"
fi

# ---------- 从 astro.config.mjs 读取 base 路径 ----------
BASE_PATH="$(grep -E "^[[:space:]]*base:[[:space:]]*['\"]" astro.config.mjs \
  | head -1 \
  | sed -E "s/.*base:[[:space:]]*['\"]([^'\"]+)['\"].*/\1/")"
BASE_PATH="${BASE_PATH:-/}"

# ---------- 地址 ----------
URL="http://localhost:${PORT}${BASE_PATH}"

# ---------- 已有 dev 服务处理 ----------
DEV_STATUS="$(pnpm exec astro dev status 2>/dev/null || true)"
if echo "$DEV_STATUS" | grep -q "Dev server running"; then
  RUNNING_PORT="$(echo "$DEV_STATUS" | sed -nE 's/.*localhost:([0-9]+).*/\1/p' | head -1)"
  if [[ "$RESTART" -eq 1 ]]; then
    echo "[INFO] 停止已有 dev 服务 (pid $(echo "$DEV_STATUS" | sed -nE 's/.*pid ([0-9]+).*/\1/p')) ..."
    pnpm exec astro dev stop
  elif [[ "$RUNNING_PORT" == "$PORT" ]]; then
    echo "=============================================="
    echo "  Ascension 开发环境（已在运行）"
    echo "  地址: $URL"
    echo "  目录: $ROOT_DIR"
    echo "  使用 --restart 可重启服务"
    echo "=============================================="
    if [[ "$OPEN_BROWSER" -eq 1 ]]; then
      open "$URL"
    fi
    exit 0
  else
    echo "[WARN] 已有 dev 服务运行在端口 ${RUNNING_PORT}，将尝试在端口 ${PORT} 启动 ..."
  fi
fi

# ---------- 提示 ----------
echo "=============================================="
echo "  Ascension 开发环境"
echo "  地址: $URL"
echo "  目录: $ROOT_DIR"
echo "  Ctrl+C 停止服务"
echo "=============================================="

# ---------- 启动 ----------
DEV_ARGS=(--port "$PORT" --host)
if [[ "$OPEN_BROWSER" -eq 1 ]]; then
  DEV_ARGS+=(--open)
fi

exec pnpm dev "${DEV_ARGS[@]}"
