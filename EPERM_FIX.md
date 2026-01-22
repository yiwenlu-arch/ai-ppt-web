# EPERM 权限错误修复指南

## 问题

即使使用不同端口和 `127.0.0.1`，Next.js 仍然报错：
```
Error: listen EPERM: operation not permitted 127.0.0.1:3002
```

这是 macOS 系统级别的权限问题。

## 解决方案

### 方案1：使用 sudo（临时解决，不推荐）

```bash
cd /Users/luyiwen/Desktop/ai-ppt-website
sudo pnpm dev
```

**注意**：使用 sudo 可能导致文件权限问题，不推荐长期使用。

### 方案2：检查并修复系统权限（推荐）

#### 步骤1：检查防火墙设置

1. 打开 **系统设置** > **网络** > **防火墙**
2. 确保防火墙没有阻止 Node.js
3. 如果防火墙开启，尝试临时关闭测试

#### 步骤2：检查系统完整性保护（SIP）

```bash
# 检查 SIP 状态
csrutil status
```

如果显示 `System Integrity Protection status: enabled.`，这是正常的。

#### 步骤3：检查端口范围限制

macOS 可能限制了某些端口范围。尝试使用更高的端口：

```bash
cd /Users/luyiwen/Desktop/ai-ppt-website
pnpm dev -- -p 8080 -H 127.0.0.1
```

### 方案3：使用环境变量（推荐尝试）

```bash
cd /Users/luyiwen/Desktop/ai-ppt-website
HOSTNAME=127.0.0.1 PORT=8080 pnpm dev
```

### 方案4：修改 package.json 使用更高端口

编辑 `package.json`，将端口改为 8080 或更高：

```json
"dev": "next dev -p 8080 -H 127.0.0.1"
```

然后运行：
```bash
pnpm dev
```

### 方案5：使用 Docker（如果其他方案都不行）

如果以上方案都不行，可以考虑使用 Docker 运行前端。

## 快速测试

尝试以下命令，看哪个能成功：

```bash
cd /Users/luyiwen/Desktop/ai-ppt-website

# 测试1：端口 8080
pnpm dev -- -p 8080 -H 127.0.0.1

# 测试2：端口 4000
pnpm dev -- -p 4000 -H 127.0.0.1

# 测试3：使用 sudo（不推荐但可以测试）
sudo pnpm dev -- -p 3002 -H 127.0.0.1
```

## 如果使用 sudo 成功

如果使用 sudo 能成功，说明是权限问题。可以：

1. **修复 npm/pnpm 权限**：
```bash
sudo chown -R $(whoami) $(npm config get prefix)/{lib/node_modules,bin,share}
```

2. **或者修复项目目录权限**：
```bash
cd /Users/luyiwen/Desktop/ai-ppt-website
sudo chown -R $(whoami) .
```

## 推荐操作顺序

1. 先尝试方案4（使用端口 8080）
2. 如果不行，尝试方案3（环境变量）
3. 如果还不行，检查防火墙设置
4. 最后才考虑使用 sudo
