"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Check, Loader2, Search } from "lucide-react"
import { getTemplates, searchTemplates, getTemplateThumbnailUrl, type TemplateInfo } from "@/lib/api"
import { toast } from "sonner"

// 模板分类选项（暂时不分类，所有都显示全部模板）
const CATEGORIES = [
  { label: "全部模板", value: "all" },
  // 后续可以添加：{ label: "党政教育", value: "1" }, 等
]

interface TemplateSelectorProps {
  onGenerate: (templateId: string) => void | Promise<void>
  isGenerating?: boolean
  defaultTemplateId?: string
}

// 模板列表缓存（内存缓存）
const templateCache: {
  data: TemplateInfo[]
  timestamp: number
  category: string
} = {
  data: [],
  timestamp: 0,
  category: ""
}

const CACHE_DURATION = 5 * 60 * 1000 // 5分钟缓存

export function TemplateSelector({ onGenerate, isGenerating = false, defaultTemplateId }: TemplateSelectorProps) {
  const [selected, setSelected] = useState<string>(defaultTemplateId || "")
  const [templates, setTemplates] = useState<TemplateInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [searchKeyword, setSearchKeyword] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [hasMore, setHasMore] = useState(true)
  const [pageNumber, setPageNumber] = useState("1")
  const [isSearching, setIsSearching] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // 加载模板列表
  const loadTemplates = useCallback(async (page: string = "1", category: string = "all", keyword: string = "", append: boolean = false, forceRefresh: boolean = false) => {
    try {
      setLoading(!append) // 追加时不显示加载状态

      let response
      if (keyword.trim()) {
        // 搜索模式
        response = await searchTemplates(keyword, page)
        setIsSearching(true)
      } else {
        // 查询模式
        // 检查缓存（除非强制刷新）
        const now = Date.now()
        if (
          !forceRefresh &&
          !append &&
          templateCache.data.length > 0 &&
          templateCache.category === category &&
          now - templateCache.timestamp < CACHE_DURATION
        ) {
          setTemplates(templateCache.data)
          setLoading(false)
          return
        }

        // 强制刷新时清除缓存
        if (forceRefresh) {
          templateCache.data = []
          templateCache.timestamp = 0
          templateCache.category = ""
        }

        // exclude_pptx_without_tags: "1" 表示只返回有标签的模板（只有这些模板才能执行生成接口）
        response = await getTemplates({
          page_number: page,
          primary_id: category === "all" ? undefined : category,
          exclude_pptx_without_tags: "1"
        })
        setIsSearching(false)
      }

      if (response.code === 1 && response.data) {
        if (append) {
          setTemplates(prev => [...prev, ...response.data])
        } else {
          setTemplates(response.data)
          // 更新缓存
          if (!keyword.trim() && category === "all") {
            templateCache.data = response.data
            templateCache.timestamp = Date.now()
            templateCache.category = category
          }
        }

        // 检查是否还有更多数据
        setHasMore(response.data.length > 0)
      } else {
        if (!append) {
          setTemplates([])
        }
        setHasMore(false)
      }
    } catch (error) {
      console.error("加载模板失败:", error)
      toast.error("加载模板失败，请稍后重试")
      if (!append) {
        setTemplates([])
      }
      setHasMore(false)
    } finally {
      setLoading(false)
    }
  }, [])

  // 监听defaultTemplateId变化，更新selected状态
  useEffect(() => {
    if (defaultTemplateId && defaultTemplateId !== selected) {
      console.log('🔄 TemplateSelector: 更新默认模板ID:', defaultTemplateId)
      setSelected(defaultTemplateId)
    }
  }, [defaultTemplateId, selected])

  // 初始加载
  useEffect(() => {
    loadTemplates("1", selectedCategory, searchKeyword)
    setPageNumber("1")
  }, [selectedCategory]) // 分类变化时重新加载

  // 搜索处理
  const handleSearch = useCallback(() => {
    if (searchKeyword.trim()) {
      loadTemplates("1", "all", searchKeyword.trim())
      setPageNumber("1")
    } else {
      loadTemplates("1", selectedCategory, "")
      setPageNumber("1")
    }
  }, [searchKeyword, selectedCategory, loadTemplates])

  // 无限滚动：加载更多
  useEffect(() => {
    if (!hasMore || loading || isSearching) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const nextPage = (parseInt(pageNumber) + 1).toString()
          setPageNumber(nextPage)
          loadTemplates(nextPage, selectedCategory, searchKeyword, true)
        }
      },
      { threshold: 0.1 }
    )

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current)
    }

    return () => {
      if (observerRef.current && loadMoreRef.current) {
        observerRef.current.unobserve(loadMoreRef.current)
      }
    }
  }, [hasMore, loading, pageNumber, selectedCategory, searchKeyword, isSearching, loadTemplates])

  // 选择模板
  const handleSelectTemplate = (pptxId: string) => {
    console.log('📌 TemplateSelector: 用户选择了模板:', pptxId)
    setSelected(pptxId)
    // 通知父组件更新selectedTemplateId（如果父组件需要）
    // 注意：这里不直接调用父组件的方法，因为selected状态已经更新，父组件可以通过defaultTemplateId prop来同步
  }

  // 生成PPT
  const handleGenerate = () => {
    const templateIdToUse = selected || defaultTemplateId
    console.log('🚀 TemplateSelector: 准备生成PPT，使用的模板ID:', templateIdToUse, 'selected:', selected, 'defaultTemplateId:', defaultTemplateId)
    if (!templateIdToUse) {
      toast.error("请先选择一个模板")
      return
    }
    onGenerate(templateIdToUse)
  }

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">选择模版</h3>
        </div>

        {/* 搜索和分类筛选 */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索模板..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch()
                }
              }}
              className="pl-9"
            />
          </div>
          {searchKeyword && (
            <Button variant="outline" onClick={handleSearch}>
              搜索
            </Button>
          )}
        </div>

        {/* 模板列表 */}
        {loading && templates.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">加载模板中...</span>
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {searchKeyword ? "未找到相关模板" : "暂无模板"}
          </div>
        ) : (
          <div className="max-h-[450px] overflow-y-auto overflow-x-hidden pr-2 template-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {templates.map((template) => (
                <div
                  key={template.pptx_id}
                  className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                    selected === template.pptx_id
                      ? "border-primary shadow-lg"
                      : "border-transparent hover:border-muted-foreground/30"
                  }`}
                  onClick={() => handleSelectTemplate(template.pptx_id)}
                >
                  <div className="aspect-video bg-muted relative">
                    {/* 懒加载图片 - 使用封面五宫格图 */}
                    <img
                      src={template.pptx_id ? getTemplateThumbnailUrl(template.pptx_id) : "/placeholder.svg"}
                      alt={template.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        // 图片加载失败时使用占位符
                        e.currentTarget.src = "/placeholder.svg"
                      }}
                    />
                    {loading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    )}
                  </div>
                  <div className="p-3 bg-card">
                    <p className="text-sm font-medium text-center">{template.title}</p>
                    <p className="text-xs text-muted-foreground text-center mt-1">
                      {template.page_size} 页
                    </p>
                  </div>
                  {selected === template.pptx_id && (
                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                      <Check className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 无限滚动触发器 - 已移除，改为使用滚动条显示所有模板 */}

        {/* 生成按钮 */}
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => {
              // 清除搜索关键词和选中状态
              setSearchKeyword("")
              setSelected("")
              // 强制刷新模板列表
              loadTemplates("1", selectedCategory, "", false, true)
              setPageNumber("1")
              toast.success("模板列表已刷新")
            }}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                刷新中...
              </>
            ) : (
              "刷新"
            )}
          </Button>
          <Button
            size="lg"
            className="flex-1 bg-gradient-to-r from-[var(--tech-gradient-start)] to-[var(--tech-gradient-end)] text-white"
            onClick={handleGenerate}
            disabled={isGenerating || (!selected && !defaultTemplateId)}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                生成中...
              </>
            ) : (
              "智能生成PPT"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
