#!/bin/bash

echo "🧹 清理 Next.js 锁文件和缓存..."
echo ""

cd "$(dirname "$0")"

# 删除锁文件
echo "1. 删除 .next/dev/lock..."
rm -rf .next/dev/lock 2>/dev/null

# 删除整个 .next 目录（可选，更彻底）
read -p "是否删除整个 .next 目录？(y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo "2. 删除 .next 目录..."
  rm -rf .next
  echo "✅ 已删除 .next 目录"
else
  echo "2. 跳过删除 .next 目录"
fi

# 检查并关闭占用端口的进程
PORT=4000
if lsof -ti:${PORT} >/dev/null 2>&1; then
  echo "3. 发现端口 ${PORT} 被占用，正在关闭..."
  lsof -ti:${PORT} | xargs kill -9 2>/dev/null
  sleep 1
  echo "✅ 已关闭占用进程"
else
  echo "3. 端口 ${PORT} 未被占用"
fi

echo ""
echo "✅ 清理完成！"
echo ""
echo "现在可以运行："
echo "  pnpm dev"
echo ""
