# 🚨 立即修复：前端启动 EPERM 错误

## 问题

所有端口都报 `EPERM: operation not permitted` 错误。

## 立即执行（按顺序）

### 步骤1：测试是否是权限问题

在你的终端执行：

```bash
cd /Users/luyiwen/Desktop/ai-ppt-website
sudo pnpm dev
```

**观察结果**：
- ✅ **如果成功启动** → 是权限问题，继续步骤2
- ❌ **如果仍然失败** → 可能是系统其他问题，继续步骤3

### 步骤2：修复权限（如果 sudo 能成功）

```bash
# 修复项目目录权限
cd /Users/luyiwen/Desktop
sudo chown -R $(whoami) ai-ppt-website

# 修复 npm/pnpm 权限
sudo chown -R $(whoami) $(npm config get prefix)/{lib/node_modules,bin,share}

# 重新尝试启动（不使用 sudo）
cd /Users/luyiwen/Desktop/ai-ppt-website
pnpm dev
```

### 步骤3：如果 sudo 也失败

#### 选项A：检查防火墙

1. 打开 **系统设置** > **网络** > **防火墙**
2. 点击 **选项**
3. 确保没有阻止 Node.js
4. 或者临时关闭防火墙测试

#### 选项B：使用 npx 直接启动

```bash
cd /Users/luyiwen/Desktop/ai-ppt-website
npx next dev -p 4000 -H 127.0.0.1
```

#### 选项C：检查是否有其他 Node 进程

```bash
# 查看所有 Node 进程
ps aux | grep node

# 关闭所有 Node 进程（谨慎使用）
killall node

# 重新尝试
cd /Users/luyiwen/Desktop/ai-ppt-website
pnpm dev
```

#### 选项D：使用 nvm（推荐长期方案）

```bash
# 安装 nvm（如果还没有）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 重新加载 shell
source ~/.zshrc

# 安装 Node.js
nvm install 20
nvm use 20

# 重新安装依赖
cd /Users/luyiwen/Desktop/ai-ppt-website
rm -rf node_modules package-lock.json
pnpm install

# 尝试启动
pnpm dev
```

## 临时解决方案

如果以上都不行，可以临时使用 sudo：

```bash
cd /Users/luyiwen/Desktop/ai-ppt-website
sudo pnpm dev
```

**注意**：使用 sudo 可能导致文件权限问题，不推荐长期使用。

## 请先执行步骤1

**最重要**：先执行步骤1（`sudo pnpm dev`），然后告诉我结果：
- 成功还是失败？
- 如果成功，看到了什么输出？

这样我可以提供更精确的解决方案。
