#!/bin/bash

echo "🔍 前端启动问题诊断和测试"
echo "================================"
echo ""

cd "$(dirname "$0")"

echo "1️⃣ 测试：使用 sudo 启动（验证是否是权限问题）"
echo "   执行: sudo pnpm dev"
echo "   如果成功 → 是权限问题"
echo "   如果失败 → 可能是其他系统问题"
echo ""
read -p "按 Enter 继续测试，或 Ctrl+C 退出..."

echo ""
echo "2️⃣ 测试：使用 npx 直接启动"
echo "   执行: npx next dev -p 4000 -H 127.0.0.1"
echo ""
read -p "按 Enter 继续测试，或 Ctrl+C 退出..."

echo ""
echo "3️⃣ 测试：检查防火墙设置"
echo "   请手动检查：系统设置 > 网络 > 防火墙"
echo "   确保没有阻止 Node.js"
echo ""

echo "4️⃣ 如果以上都不行，尝试修复权限："
echo "   sudo chown -R $(whoami) ."
echo ""
