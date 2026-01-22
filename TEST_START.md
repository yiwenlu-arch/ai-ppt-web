# 前端启动测试指南

## 当前问题

所有端口都报 EPERM 权限错误，这是 macOS 系统级别的权限问题。

## 立即测试（按顺序尝试）

### 测试1：使用 sudo（快速验证是否是权限问题）

```bash
cd /Users/luyiwen/Desktop/ai-ppt-website
sudo pnpm dev
```

**如果这个能成功**，说明确实是权限问题，继续看下面的修复方案。

**如果这个也失败**，可能是其他系统问题。

### 测试2：检查防火墙

1. 打开 **系统设置** > **网络** > **防火墙**
2. 点击 **选项**
3. 确保没有阻止 Node.js 或终端应用
4. 或者临时关闭防火墙测试

### 测试3：使用不同的启动方式

```bash
cd /Users/luyiwen/Desktop/ai-ppt-website

# 方式1：直接指定参数
npx next dev -p 4000 -H 127.0.0.1

# 方式2：使用环境变量
HOSTNAME=127.0.0.1 PORT=4000 npx next dev
```

### 测试4：检查是否有其他 Node 进程占用

```bash
# 查看所有 Node 进程
ps aux | grep node

# 如果有其他 Next.js 进程，关闭它们
killall node
```

然后重新尝试：
```bash
cd /Users/luyiwen/Desktop/ai-ppt-website
pnpm dev
```

## 如果 sudo 能成功

### 修复方案A：修复项目目录权限

```bash
cd /Users/luyiwen/Desktop
sudo chown -R $(whoami) ai-ppt-website
```

然后重新尝试：
```bash
cd /Users/luyiwen/Desktop/ai-ppt-website
pnpm dev
```

### 修复方案B：修复 npm/pnpm 全局权限

```bash
# 修复 npm 权限
sudo chown -R $(whoami) $(npm config get prefix)/{lib/node_modules,bin,share}

# 如果使用 pnpm
sudo chown -R $(whoami) ~/.pnpm-store
```

### 修复方案C：使用 nvm 管理 Node.js（推荐）

如果权限问题持续存在，建议使用 nvm：

```bash
# 安装 nvm（如果还没有）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 重新加载 shell
source ~/.zshrc

# 安装并使用 Node.js
nvm install 20
nvm use 20

# 重新安装依赖
cd /Users/luyiwen/Desktop/ai-ppt-website
rm -rf node_modules
pnpm install

# 尝试启动
pnpm dev
```

## 临时解决方案

如果以上都不行，可以：

1. **使用 sudo 启动**（不推荐，但可以临时使用）：
   ```bash
   sudo pnpm dev
   ```

2. **或者使用 Docker**（如果安装了 Docker）：
   ```bash
   docker run -it -p 8080:3000 -v $(pwd):/app -w /app node:20 pnpm dev
   ```

## 请先执行测试1

**最重要**：先执行测试1（使用 sudo），告诉我结果：
- 如果 sudo 能成功 → 是权限问题，使用修复方案A/B
- 如果 sudo 也失败 → 可能是其他系统问题，需要进一步排查
