# 🎯 最终解决方案：使用 nvm 管理 Node.js

## 问题根源

你的 Node.js 安装在系统目录 `/usr/local/bin/node`，这导致了系统级的权限问题。即使使用 `sudo` 也无法解决，因为 npm 本身也有权限问题。

## 最佳解决方案：使用 nvm（推荐）

nvm 会将 Node.js 安装到用户目录，完全避免权限问题。

### 步骤1：安装 nvm

```bash
# 下载并安装 nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
```

### 步骤2：重新加载 shell 配置

```bash
# 重新加载 zsh 配置
source ~/.zshrc

# 或者关闭终端重新打开
```

### 步骤3：验证 nvm 安装

```bash
nvm --version
```

应该看到版本号，例如：`0.39.0`

### 步骤4：安装 Node.js（使用 nvm）

```bash
# 安装 Node.js 20（LTS 版本）
nvm install 20

# 使用 Node.js 20
nvm use 20

# 验证安装
node --version
npm --version
```

### 步骤5：安装 pnpm（使用 npm）

```bash
# 使用 npm 安装 pnpm（现在不会有权限问题）
npm install -g pnpm

# 验证安装
pnpm --version
```

### 步骤6：重新安装项目依赖

```bash
cd /Users/luyiwen/Desktop/ai-ppt-website

# 清理旧的依赖
rm -rf node_modules package-lock.json pnpm-lock.yaml

# 重新安装
pnpm install
```

### 步骤7：启动前端服务器

```bash
cd /Users/luyiwen/Desktop/ai-ppt-website
pnpm dev
```

现在应该可以成功启动了！🎉

## 如果 nvm 安装失败

### 替代方案A：使用 Homebrew 安装 Node.js

```bash
# 安装 Homebrew（如果还没有）
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 使用 Homebrew 安装 Node.js
brew install node

# 验证安装
node --version
npm --version
```

### 替代方案B：直接使用项目本地的 Next.js

```bash
cd /Users/luyiwen/Desktop/ai-ppt-website

# 使用项目本地的 next（不需要全局安装）
./node_modules/.bin/next dev -p 4000 -H 127.0.0.1
```

或者修改 `package.json`：

```json
"dev": "./node_modules/.bin/next dev -p 4000 -H 127.0.0.1"
```

## 验证步骤

安装完成后，验证：

```bash
# 检查 Node.js 路径（应该不是 /usr/local/bin/node）
which node

# 检查 npm 路径
which npm

# 检查 pnpm 路径
which pnpm

# 都应该指向用户目录，例如：
# /Users/luyiwen/.nvm/versions/node/v20.x.x/bin/node
```

## 为什么 nvm 能解决问题？

1. **用户级安装**：nvm 将 Node.js 安装到 `~/.nvm/`，不需要系统权限
2. **版本管理**：可以轻松切换不同版本的 Node.js
3. **避免权限冲突**：不会与系统级安装冲突
4. **更安全**：不需要使用 sudo

## 设置 nvm 为默认

安装 nvm 后，每次打开新终端都需要运行 `nvm use 20`。

可以添加到 `~/.zshrc` 自动加载：

```bash
echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.zshrc
echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"' >> ~/.zshrc
echo '[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"' >> ~/.zshrc
echo 'nvm use 20' >> ~/.zshrc

# 重新加载
source ~/.zshrc
```

## 如果仍然有问题

如果使用 nvm 后仍然有问题，请提供：
1. `which node` 的输出
2. `node --version` 的输出
3. `pnpm dev` 的完整错误信息
