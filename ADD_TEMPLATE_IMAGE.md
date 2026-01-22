# 添加模板预览图片指南

## 当前状态

"年终总结商务汇报"模板目前使用 `/professional-report-template.jpg` 作为临时预览图片。

## 如何添加自定义预览图片

### 方法1：从PPT文件提取第一页（推荐）

1. 打开您的PPT文件：`互联网年终总结商务汇报.pptx`
2. 在PowerPoint中，选择第一页幻灯片
3. 导出为图片：
   - 文件 → 另存为 → 选择格式为 JPG 或 PNG
   - 或者：文件 → 导出 → 更改文件类型 → 图片 → PNG/JPG
4. 将导出的图片重命名为 `business-year-end-template.jpg`
5. 将图片复制到 `/Users/luyiwen/Desktop/ai-ppt-website/public/` 目录

### 方法2：使用截图工具

1. 打开PPT文件的第一页
2. 使用截图工具（如 macOS 的 Cmd+Shift+4）截取第一页
3. 保存为 `business-year-end-template.jpg`
4. 将图片复制到 `/Users/luyiwen/Desktop/ai-ppt-website/public/` 目录

### 方法3：使用在线工具

1. 使用在线PPT转图片工具（如 https://www.ilovepdf.com/ppt-to-jpg）
2. 上传PPT文件，选择只转换第一页
3. 下载图片并重命名为 `business-year-end-template.jpg`
4. 将图片复制到 `/Users/luyiwen/Desktop/ai-ppt-website/public/` 目录

## 更新代码

添加图片后，更新模板选择器代码：

```typescript
{ id: "business-year-end", name: "年终总结商务汇报", image: "/business-year-end-template.jpg", isTemplateFile: true },
```

## 图片要求

- **格式**：JPG 或 PNG
- **尺寸**：建议 16:9 比例（如 1920x1080 或 1280x720）
- **文件大小**：建议小于 500KB
- **文件名**：`business-year-end-template.jpg`

## 当前临时方案

目前使用 `/professional-report-template.jpg` 作为临时预览图片，功能正常，但显示的不是实际模板的预览图。

添加自定义图片后，前端会自动显示新的预览图（无需重启服务器，刷新页面即可）。
