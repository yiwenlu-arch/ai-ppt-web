# 模板中心页面开发方案

## 当前状态

### 已有功能
- ✅ 模板中心页面路由：`/app/templates/page.tsx`
- ✅ 模板内容组件：`/components/templates-content.tsx`（使用mock数据）
- ✅ 模板查询API：`/api/templates/list`（后端已实现）
- ✅ 模板搜索API：`/api/templates/search`（后端已实现）
- ✅ 模板选择器组件：`/components/template-selector.tsx`（已使用真实API）
- ✅ 模板图片URL生成函数：`getTemplateThumbnailUrl`、`getTemplatePagePreviewUrl`

### 需要改造
- ❌ 模板中心页面目前使用mock数据
- ❌ 需要改为调用真实的PPTX模板列表查询接口

## 接口信息

### 模板列表查询接口

**后端接口**：`POST /api/templates/list`

**请求参数**：
```typescript
{
  page_number?: string      // 页码，默认"1"
  primary_id?: string       // 分类ID，不传或"all"表示全部
  exclude_pptx_without_tags?: string  // "1"表示只返回有标签的模板
}
```

**响应格式**：
```typescript
{
  code: number              // 1表示成功
  message: string
  data: TemplateInfo[]     // 模板列表
}

interface TemplateInfo {
  pptx_id: string          // 模板ID
  pptx_name: string         // 模板名称
  primary_id: string        // 分类ID
  primary_name: string      // 分类名称
  page_size: number         // 页数
  priority: number          // 优先级
}
```

### 模板搜索接口

**后端接口**：`POST /api/templates/search`

**请求参数**：
```typescript
{
  keyword: string           // 搜索关键词
  page_number?: string      // 页码
  exclude_pptx_without_tags?: string  // "1"表示只返回有标签的模板
}
```

**响应格式**：与列表查询相同

### 模板图片URL

**封面图**：
```
https://ysg-aippt.oss-cn-hangzhou.aliyuncs.com/pptx-templates/thumbnails/{pptx_id}.png
```

**页面预览图**：
```
https://ysg-aippt.oss-cn-hangzhou.aliyuncs.com/pptx-templates/preview-images/{pptx_id}/page_{pageNumber}.png
```

## 设计方案

### 方案概述

将现有的 `templates-content.tsx` 组件改造为使用真实API，参考 `template-selector.tsx` 的实现方式。

### 功能需求

1. **模板列表展示**
   - 网格布局展示模板（3-4列）
   - 显示模板封面图
   - 显示模板名称和分类
   - 支持分页加载

2. **分类筛选**
   - 根据 `primary_id` 和 `primary_name` 动态生成分类
   - 支持"全部模板"选项
   - 点击分类切换模板列表

3. **搜索功能**
   - 搜索框输入关键词
   - 调用搜索接口
   - 显示搜索结果

4. **模板预览**
   - 点击"预览"按钮打开预览对话框
   - 显示模板封面图或多页预览
   - 支持翻页查看

5. **使用模板**
   - 点击"使用"按钮
   - 跳转到工作台，传递 `templateId` 参数
   - 工作台自动选中该模板

### 页面布局

```
┌─────────────────────────────────────────┐
│  导航栏（SiteHeader）                    │
├──────────┬──────────────────────────────┤
│          │  模板中心标题                 │
│  左侧    │  搜索框                      │
│  侧边栏  │  分类标签（全部、分类1、2...）│
│          │                              │
│  - 工作台│  ┌────┐ ┌────┐ ┌────┐ ┌────┐│
│  - 文件库│  │模板│ │模板│ │模板│ │模板││
│  - 模板  │  └────┘ └────┘ └────┘ └────┘│
│   中心   │  ┌────┐ ┌────┐ ┌────┐ ┌────┐│
│          │  │模板│ │模板│ │模板│ │模板││
│          │  └────┘ └────┘ └────┘ └────┘│
│          │                              │
│          │  分页控件                    │
└──────────┴──────────────────────────────┘
```

## 需要确认的信息

### 1. 分类处理方式

**问题**：模板数据中的 `primary_id` 和 `primary_name` 是动态的，如何展示分类？

**选项A**：动态生成分类列表
- 从第一页模板数据中提取所有唯一的 `primary_id` 和 `primary_name`
- 动态生成分类按钮
- 优点：自动适应数据
- 缺点：可能分类不完整（如果第一页没有所有分类）

**选项B**：固定分类列表
- 使用固定的分类列表（如：全部、党政教育、培训汇报等）
- 通过 `primary_id` 筛选
- 优点：分类清晰
- 缺点：需要知道所有可能的分类ID

**选项C**：先查询所有分类
- 调用接口获取所有分类列表
- 然后根据分类筛选模板
- 优点：最准确
- 缺点：需要额外的分类查询接口

**请确认**：选择哪种方式？或者是否有分类查询接口？

### 2. 分页方式

**问题**：如何实现分页？

**选项A**：传统分页
- 显示页码按钮（1, 2, 3...）
- 点击页码加载对应页
- 优点：用户可跳转到任意页
- 缺点：需要知道总页数

**选项B**：无限滚动
- 滚动到底部自动加载下一页
- 优点：体验流畅
- 缺点：无法快速跳转

**选项C**：加载更多按钮
- 显示"加载更多"按钮
- 点击加载下一页
- 优点：用户可控
- 缺点：需要多次点击

**请确认**：选择哪种分页方式？

### 3. 每页显示数量

**问题**：每页显示多少个模板？

**当前API**：后端接口返回的数据数量由外部API决定

**建议**：
- 网格布局：3列（移动端1列，平板2列，桌面3-4列）
- 每页显示：12-16个模板（4行×3列或4行×4列）

**请确认**：每页显示多少个模板合适？

### 4. 模板预览功能

**问题**：预览对话框显示什么内容？

**选项A**：只显示封面图
- 简单，加载快
- 缺点：无法查看内页

**选项B**：显示多页预览
- 可以翻页查看模板的多个页面
- 需要调用 `getTemplatePagePreviewUrl` 获取各页预览图
- 优点：信息完整
- 缺点：需要加载多张图片

**选项C**：显示封面图 + 缩略图列表
- 封面图大图显示
- 下方显示所有页面的缩略图
- 点击缩略图切换大图
- 优点：平衡体验和性能

**请确认**：选择哪种预览方式？

### 5. 模板选择后的行为

**问题**：点击"使用"按钮后，如何跳转到工作台？

**当前实现**：
```typescript
router.push(`/workspace?templateId=${templateId}`)
```

**需要确认**：
- 跳转后，工作台是否自动选中该模板？
- 是否需要自动填充主题或其他信息？
- 是否需要显示提示信息？

### 6. 空状态处理

**问题**：没有模板或搜索无结果时显示什么？

**建议**：
- 显示友好的空状态提示
- 提供"返回"或"清除筛选"按钮

**请确认**：空状态的文案和样式要求？

### 7. 加载状态

**问题**：加载模板列表时如何显示？

**建议**：
- 显示骨架屏（Skeleton）
- 或显示加载动画
- 显示加载提示文字

**请确认**：使用哪种加载状态？

### 8. 错误处理

**问题**：接口调用失败时如何处理？

**建议**：
- 显示错误提示
- 提供重试按钮
- 记录错误日志

**请确认**：错误提示的文案和样式？

## 技术实现细节

### 组件结构

```
TemplatesContent
├── 左侧侧边栏（导航）
├── 主内容区
│   ├── 标题和搜索框
│   ├── 分类标签
│   ├── 模板网格
│   │   └── TemplateCard（每个模板卡片）
│   └── 分页控件
└── 预览对话框
    └── TemplatePreview（模板预览）
```

### 状态管理

```typescript
const [templates, setTemplates] = useState<TemplateInfo[]>([])
const [loading, setLoading] = useState(false)
const [selectedCategory, setSelectedCategory] = useState("all")
const [searchKeyword, setSearchKeyword] = useState("")
const [currentPage, setCurrentPage] = useState(1)
const [previewTemplate, setPreviewTemplate] = useState<TemplateInfo | null>(null)
const [categories, setCategories] = useState<Category[]>([]) // 动态分类列表
```

### API调用

使用已有的 `getTemplates` 和 `searchTemplates` 函数：
```typescript
import { getTemplates, searchTemplates, getTemplateThumbnailUrl, getTemplatePagePreviewUrl } from "@/lib/api"
```

## 开发步骤（确认后执行）

1. **改造 TemplatesContent 组件**
   - 移除mock数据
   - 集成真实API调用
   - 实现分类筛选
   - 实现搜索功能
   - 实现分页加载

2. **优化模板卡片组件**
   - 使用真实的模板数据
   - 使用真实的图片URL
   - 优化加载和错误处理

3. **实现预览功能**
   - 根据选择的预览方式实现
   - 支持多页预览（如果选择）

4. **优化用户体验**
   - 添加加载状态
   - 添加空状态
   - 添加错误处理
   - 优化响应式布局

5. **测试和优化**
   - 测试各种场景
   - 优化性能
   - 修复bug

## 请确认以下信息

1. **分类处理方式**：选项A/B/C？
2. **分页方式**：选项A/B/C？
3. **每页显示数量**：建议12-16个，是否同意？
4. **模板预览方式**：选项A/B/C？
5. **模板选择后的行为**：是否需要自动选中？
6. **空状态文案**：是否有特定要求？
7. **加载状态样式**：骨架屏/加载动画/其他？
8. **错误提示文案**：是否有特定要求？

确认以上信息后，我将开始实现。
