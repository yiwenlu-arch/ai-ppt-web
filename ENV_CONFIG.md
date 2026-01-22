# 环境变量配置说明

## API 基础 URL 配置

项目使用 `process.env.NEXT_PUBLIC_API_URL` 作为后端 API 的基础 URL。

### 配置方法

#### Next.js 环境变量配置

1. 在项目根目录创建 `.env.local` 文件（推荐，不会被提交到 Git）：
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

2. 或者创建 `.env` 文件：
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

3. 生产环境配置：
```env
NEXT_PUBLIC_API_URL=https://your-api-server.com
```

### 环境变量文件示例

创建 `.env.local` 文件：
```env
# 后端 API 基础 URL
# 开发环境
NEXT_PUBLIC_API_URL=http://localhost:5000

# 生产环境（部署时使用）
# NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

### 使用说明

- **Next.js 规则**：环境变量必须以 `NEXT_PUBLIC_` 开头才能在客户端代码中访问
- 修改环境变量后需要**重启开发服务器**
- `.env.local` 文件会被 Git 忽略（已在 `.gitignore` 中），适合存储敏感信息
- `.env` 文件会被提交到 Git，只适合存储非敏感配置

### 默认值

如果未配置 `NEXT_PUBLIC_API_URL`，代码会使用默认值：`http://localhost:5000`

### 验证配置

在浏览器控制台运行：
```javascript
console.log(process.env.NEXT_PUBLIC_API_URL)
```

或者在代码中：
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
console.log('API Base URL:', API_BASE_URL)
```

### 文件优先级

Next.js 会按以下顺序加载环境变量：
1. `.env.local` (最高优先级，所有环境)
2. `.env.development` (开发环境)
3. `.env.production` (生产环境)
4. `.env` (所有环境，最低优先级)

### 注意事项

- ⚠️ 只有以 `NEXT_PUBLIC_` 开头的变量才会暴露到浏览器
- ⚠️ 不要在 `NEXT_PUBLIC_` 变量中存储敏感信息（如 API Key）
- ⚠️ 修改环境变量后必须重启 `npm run dev`
