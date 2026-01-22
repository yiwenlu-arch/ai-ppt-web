# 🚀 立即启动（最简单方案）

## 问题

系统级 npm 有权限问题，即使使用 `sudo` 也无法解决。

## 解决方案：使用项目本地的 Next.js

我已经修改了 `package.json`，现在使用项目本地的 Next.js，不需要全局权限。

### 步骤1：确保依赖已安装

```bash
cd /Users/luyiwen/Desktop/ai-ppt-website

# 如果 node_modules 不存在，需要安装依赖
# 但安装时可能也会遇到权限问题...
```

### 步骤2：直接使用本地 Next.js（推荐）

如果 `node_modules` 已存在，直接运行：

```bash
cd /Users/luyiwen/Desktop/ai-ppt-website
./node_modules/.bin/next dev -p 4000 -H 127.0.0.1
```

或者使用 pnpm（如果依赖已安装）：

```bash
cd /Users/luyiwen/Desktop/ai-ppt-website
pnpm dev
```

### 如果 node_modules 不存在或需要重新安装

#### 选项A：使用 nvm（最佳长期方案）

```bash
# 安装 nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 重新加载 shell
source ~/.zshrc

# 安装 Node.js
nvm install 20
nvm use 20

# 安装 pnpm
npm install -g pnpm

# 安装项目依赖
cd /Users/luyiwen/Desktop/ai-ppt-website
pnpm install

# 启动
pnpm dev
```

#### 选项B：使用快速修复脚本

```bash
cd /Users/luyiwen/Desktop/ai-ppt-website
./quick-fix-nvm.sh
```

然后：
```bash
pnpm install
pnpm dev
```

## 验证

启动成功后，应该看到：
```
- ready started server on 127.0.0.1:4000
- Local: http://localhost:4000
```

在浏览器访问：**http://localhost:4000**

## 如果仍然失败

请提供：
1. `ls -la node_modules/.bin/next` 的输出
2. `./node_modules/.bin/next --version` 的输出
3. 完整的错误信息
