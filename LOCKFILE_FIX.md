# 修复 Next.js 锁文件和 Lockfile 警告

## 问题1：无法获取锁文件

**错误**：
```
Unable to acquire lock at /Users/luyiwen/Desktop/ai-ppt-website/.next/dev/lock
```

**原因**：之前的 Next.js 进程没有正确关闭，留下了锁文件。

**解决方案**：

### 快速修复

```bash
cd /Users/luyiwen/Desktop/ai-ppt-website
rm -rf .next/dev/lock
pnpm dev
```

### 彻底清理（如果快速修复不行）

```bash
cd /Users/luyiwen/Desktop/ai-ppt-website
rm -rf .next
pnpm dev
```

### 使用清理脚本

```bash
cd /Users/luyiwen/Desktop/ai-ppt-website
./clean-start.sh
```

## 问题2：Lockfile 警告

**警告**：
```
⚠ Warning: Next.js inferred your workspace root, but it may not be correct.
We detected multiple lockfiles...
```

**原因**：在 `/Users/luyiwen/Desktop/` 目录有一个 `package-lock.json`，而项目使用 `pnpm-lock.yaml`，导致 Next.js 混淆。

**解决方案**：

### 方案1：删除 Desktop 目录的 package-lock.json（推荐）

```bash
cd /Users/luyiwen/Desktop
rm package-lock.json
```

### 方案2：在 next.config.mjs 中明确指定根目录（已修复）

我已经更新了 `next.config.mjs`，添加了 `turbo.root` 配置。这应该能消除警告。

### 方案3：忽略警告

这个警告不影响功能，可以忽略。

## 完整修复步骤

```bash
# 1. 清理锁文件
cd /Users/luyiwen/Desktop/ai-ppt-website
rm -rf .next/dev/lock

# 2. 删除 Desktop 目录的 package-lock.json（可选）
cd /Users/luyiwen/Desktop
rm package-lock.json

# 3. 重新启动
cd /Users/luyiwen/Desktop/ai-ppt-website
pnpm dev
```

## 如果仍然有问题

### 检查是否有其他 Next.js 进程

```bash
# 查找 Next.js 进程
ps aux | grep "next dev" | grep -v grep

# 如果找到，关闭它们
killall node
```

### 检查端口占用

```bash
# 检查端口 4000
lsof -i :4000

# 如果被占用，关闭进程
lsof -ti:4000 | xargs kill -9
```

## 预防措施

1. **正确关闭服务器**：使用 `Ctrl+C` 而不是直接关闭终端
2. **避免多个实例**：确保只有一个 `pnpm dev` 在运行
3. **清理锁文件**：如果异常退出，记得清理 `.next/dev/lock`
