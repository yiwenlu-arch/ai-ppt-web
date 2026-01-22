# API 集成说明

## 已完成的集成

### 1. API 工具文件
- **文件**: `lib/api.ts`
- **功能**: 
  - `generatePPT()` - 调用后端 API 生成 PPT
  - `downloadFile()` - 下载生成的 PPT 文件
  - `healthCheck()` - 健康检查

### 2. 修改的组件

#### `components/workspace-content.tsx`
- ✅ 添加了 `handleGeneratePPT` 函数的实际 API 调用
- ✅ 添加了错误处理和加载状态
- ✅ 添加了文件下载功能
- ✅ 使用 toast 显示成功/错误提示

#### `components/template-selector.tsx`
- ✅ 添加了生成中的加载状态显示
- ✅ 支持禁用按钮防止重复提交

#### `app/layout.tsx`
- ✅ 添加了 Toaster 组件用于显示提示消息

## 配置说明

### 环境变量配置

1. 复制环境变量示例文件：
```bash
cp .env.local.example .env.local
```

2. 编辑 `.env.local` 文件，配置后端 API 地址：
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 后端服务器配置

确保后端服务器运行在 `http://localhost:5000`（或你配置的地址）

启动后端：
```bash
cd ai-ppt-backend
npm start
```

## API 调用流程

1. **用户输入主题** → 点击"生成PPT大纲"
2. **生成大纲** → 显示大纲编辑界面
3. **选择模板** → 点击"下一步：选模版"
4. **生成PPT** → 点击"智能生成PPT"按钮
   - 调用 `generatePPT()` API
   - 显示加载提示
   - 下载生成的 PPTX 文件
   - 显示成功/错误提示

## 错误处理

- ✅ 网络错误处理
- ✅ 服务器错误处理
- ✅ 用户友好的错误提示
- ✅ 加载状态显示

## 测试

1. 确保后端服务器运行在 `http://localhost:5000`
2. 启动前端开发服务器：
```bash
npm run dev
```
3. 访问 `http://localhost:3000`
4. 输入主题，选择模板，点击"智能生成PPT"
5. 检查是否成功下载 PPT 文件

## 注意事项

- 确保后端 CORS 配置允许前端域名访问
- 如果后端运行在不同端口，需要更新 `.env.local` 中的 `NEXT_PUBLIC_API_URL`
- 生产环境需要配置实际的后端服务器地址
