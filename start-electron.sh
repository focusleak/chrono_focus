#!/bin/bash
# 启动 Electron 应用

cd "$(dirname "$0")"

# 设置环境变量
export NODE_ENV=development

# 启动 Vite 开发服务器（后台运行）
echo "Starting Vite dev server..."
pnpm dev &
VITE_PID=$!

# 等待 Vite 启动
echo "Waiting for Vite to start..."
sleep 3

# 启动 Electron
echo "Starting Electron..."
npx electron electron/main.ts

# 清理
echo "Stopping Vite dev server..."
kill $VITE_PID 2>/dev/null
