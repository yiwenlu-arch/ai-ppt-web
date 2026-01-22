# 故障排查指南

## 点击"智能生成PPT"时出现错误

### 常见错误和解决方案

#### 1. 错误：`无法连接到后端服务器`

**原因**：后端服务器没有运行

**解决方案**：
```bash
# 1. 进入后端目录
cd /Users/luyiwen/Desktop/ai-ppt-backend

# 2. 启动后端服务器
npm start

# 应该看到：
# 🚀 Server is running on http://localhost:5000
```

#### 2. 错误：`CORS 错误` 或 `跨域请求被阻止`

**原因**：后端 CORS 配置问题

**检查**：确保 `server.js` 中有：
```javascript
app.use(cors()); // 允许跨域请求
```

#### 3. 错误：`网络错误，请检查后端服务是否运行`

**可能原因**：
- 后端服务器未启动
- 端口不匹配
- 防火墙阻止

**检查步骤**：

1. **检查后端是否运行**：
```bash
# 在浏览器访问
http://localhost:5000/health

# 应该返回 JSON：
# {"status":"healthy",...}
```

2. **检查环境变量配置**：
   - 确保 `.env.local` 文件存在
   - 内容：`NEXT_PUBLIC_API_URL=http://localhost:5000`
   - 重启前端开发服务器

3. **检查端口**：
   - 后端默认端口：5000
   - 前端默认端口：3000 或 3001
   - 确保端口不冲突

#### 4. 错误：`服务器错误: 500`

**原因**：后端处理请求时出错

**检查**：
- 查看后端终端日志
- 检查 API Key 是否配置
- 检查 `.env` 文件中的配置

#### 5. 错误：`主题（topic）不能为空`

**原因**：前端验证失败

**解决方案**：确保在输入框中输入了 PPT 主题

### 调试步骤

1. **打开浏览器开发者工具**（F12）
2. **查看 Console 标签**，查看详细错误信息
3. **查看 Network 标签**，检查 API 请求：
   - 请求 URL 是否正确
   - 请求状态码
   - 响应内容

4. **检查环境变量**：
```javascript
// 在浏览器控制台运行
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL)
```

### 快速检查清单

- [ ] 后端服务器正在运行（`npm start` 在 `ai-ppt-backend` 目录）
- [ ] 后端端口是 5000
- [ ] `.env.local` 文件存在且配置正确
- [ ] 前端开发服务器已重启（修改环境变量后）
- [ ] 浏览器控制台没有 CORS 错误
- [ ] 网络请求在 Network 标签中可见

### 测试后端连接

在浏览器控制台运行：
```javascript
fetch('http://localhost:5000/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

如果成功，应该看到 `{status: "healthy", ...}`

### 联系支持

如果以上方法都无法解决问题，请提供：
1. 浏览器控制台的完整错误信息
2. 后端服务器的日志输出
3. Network 标签中的请求详情
