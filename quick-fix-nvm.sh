#!/bin/bash

echo "🚀 快速修复：使用 nvm 安装 Node.js"
echo "=================================="
echo ""

# 检查是否已安装 nvm
if [ -s "$HOME/.nvm/nvm.sh" ]; then
  echo "✅ nvm 已安装"
  source "$HOME/.nvm/nvm.sh"
else
  echo "📥 正在安装 nvm..."
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
  
  # 加载 nvm
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
  [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
fi

echo ""
echo "📦 安装 Node.js 20..."
nvm install 20
nvm use 20

echo ""
echo "📦 安装 pnpm..."
npm install -g pnpm

echo ""
echo "✅ 安装完成！"
echo ""
echo "现在可以运行："
echo "  cd /Users/luyiwen/Desktop/ai-ppt-website"
echo "  pnpm install"
echo "  pnpm dev"
echo ""
