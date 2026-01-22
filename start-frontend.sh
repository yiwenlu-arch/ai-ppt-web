#!/bin/bash

# 前端服务器启动脚本

echo "🚀 正在启动前端服务器..."
echo ""

# 进入前端目录
cd "$(dirname "$0")"

# 检查依赖是否安装
if [ ! -d "node_modules" ]; then
  echo "⚠️  检测到 node_modules 不存在，正在安装依赖..."
  pnpm install
  echo ""
fi

# 检查 .env.local 文件
if [ ! -f ".env.local" ]; then
  echo "⚠️  警告：未找到 .env.local 文件"
  echo "   正在创建默认配置..."
  echo "NEXT_PUBLIC_API_URL=http://localhost:5000" > .env.local
  echo "✅ 已创建 .env.local 文件"
  echo ""
fi

# 检查端口占用（尝试多个端口）
PORT=3002
for port in 3002 3003 3004 3005; do
  if ! lsof -Pi :${port} -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    PORT=${port}
    break
  fi
done

if lsof -Pi :${PORT} -sTCP:LISTEN -t >/dev/null 2>&1 ; then
  echo "⚠️  警告：端口 ${PORT} 已被占用"
  echo "   正在查找占用进程..."
  lsof -ti:${PORT} | xargs kill -9 2>/dev/null
  sleep 1
  echo "   已尝试关闭占用进程"
  echo ""
fi

# 启动服务器
echo "✅ 启动前端服务器..."
echo "   访问地址: http://localhost:${PORT}"
echo "   后端API: http://localhost:5000"
echo ""
echo "按 Ctrl+C 停止服务器"
echo ""

# 使用环境变量指定端口和主机
PORT=${PORT} HOSTNAME=127.0.0.1 pnpm dev
