# 替代启动方案（如果 nvm 不可用）

## 方案1：使用项目本地的 Next.js（最简单）

不需要全局安装，直接使用项目中的 Next.js：

```bash
cd /Users/luyiwen/Desktop/ai-ppt-website

# 确保依赖已安装
pnpm install

# 使用项目本地的 next
./node_modules/.bin/next dev -p 4000 -H 127.0.0.1
```

或者创建一个启动脚本：

```bash
# 创建 start-local.sh
cat > start-local.sh << 'EOF'
#!/bin/bash
cd "$(dirname "$0")"
./node_modules/.bin/next dev -p 4000 -H 127.0.0.1
EOF

chmod +x start-local.sh
./start-local.sh
```

## 方案2：修改 package.json 使用本地 next

编辑 `package.json`：

```json
{
  "scripts": {
    "dev": "./node_modules/.bin/next dev -p 4000 -H 127.0.0.1"
  }
}
```

然后运行：
```bash
pnpm dev
```

## 方案3：使用 yarn 替代 pnpm

```bash
# 安装 yarn（如果还没有）
npm install -g yarn

# 使用 yarn 安装依赖
cd /Users/luyiwen/Desktop/ai-ppt-website
yarn install

# 启动
yarn dev
```

## 方案4：使用 Docker（如果安装了 Docker）

```bash
cd /Users/luyiwen/Desktop/ai-ppt-website

# 创建 Dockerfile（如果还没有）
cat > Dockerfile << 'EOF'
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install -g pnpm && pnpm install
COPY . .
EXPOSE 4000
CMD ["pnpm", "dev", "--", "-p", "4000", "-H", "0.0.0.0"]
EOF

# 构建并运行
docker build -t ai-ppt-frontend .
docker run -p 4000:4000 ai-ppt-frontend
```

## 推荐顺序

1. **首先尝试方案1**（使用本地 Next.js）- 最简单
2. 如果不行，尝试**方案2**（修改 package.json）
3. 如果还不行，使用**nvm 方案**（见 FINAL_SOLUTION.md）
