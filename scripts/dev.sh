#!/usr/bin/env bash
# ascension 本地开发启动脚本
# 用法: ./scripts/dev.sh [--install] [--port 4321] [--no-open]
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

# ---------- 参数解析 ----------
AUTO_INSTALL=0
OPEN_BROWSER=1
PORT=4321
while [[ $# -gt 0 ]]; do
  case "$1" in
    --install)  AUTO_INSTALL=1; shift ;;
    --no-open)  OPEN_BROWSER=0;  shift ;;
    --port)
      PORT="$2"
      shift 2
      ;;
    -h|--help)
      echo "Usage: $0 [--install] [--port N] [--no-open]"
      echo "  --install    启动前自动 pnpm install"
      echo "  --port N     指定端口 (默认 4321)"
      echo "  --no-open    启动后不自动打开浏览器"
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
if ! pnpm exec playwright install --dry-run chromium 2>/dev/null | grep -q "already installed"; then
  echo "[INFO] Mermaid 构建需要 playwright chromium，执行安装 ..."
  pnpm exec playwright install chromium || echo "[WARN] chromium 安装失败，本地 build 时 Mermaid 图表可能无法渲染（dev 模式不受影响）"
fi

# ---------- 提示 ----------
URL="http://localhost:${PORT}"
echo "=============================================="
echo "  Ascension 开发环境"
echo "  地址: $URL"
echo "  目录: $ROOT_DIR"
echo "  Ctrl+C 停止服务"
echo "=============================================="

# ---------- 打开浏览器 ----------
if [[ "$OPEN_BROWSER" -eq 1 ]]; then
  # 给 dev server 一点启动时间再打开
  (sleep 3 && open "$URL") &
fi

# ---------- 启动 ----------
exec pnpm dev --port "$PORT" --host
