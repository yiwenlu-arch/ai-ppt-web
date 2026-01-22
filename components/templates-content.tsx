"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Search, Eye, Home, FolderOpen, Layout, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { getTemplates, searchTemplates, getTemplateThumbnailUrl, getTemplatePagePreviewUrl, type TemplateInfo } from "@/lib/api"
import { toast } from "sonner"

// 分类接口
interface Category {
  id: string
  name: string
}

export function TemplatesContent() {
  const router = useRouter()
  
  // 状态管理
  const [templates, setTemplates] = useState<TemplateInfo[]>([])
  const [categories, setCategories] = useState<Category[]>([{ id: "all", name: "全部模板" }])
  const [activeCategory, setActiveCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [pageNumber, setPageNumber] = useState("1")
  const [isSearching, setIsSearching] = useState(false)
  const [previewTemplate, setPreviewTemplate] = useState<TemplateInfo | null>(null)
  const [previewPage, setPreviewPage] = useState(1)
  
  // 无限滚动相关
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // 从模板数据中提取分类
  const extractCategories = useCallback((templateList: TemplateInfo[]) => {
    const categoryMap = new Map<string, string>()
    
    templateList.forEach((template) => {
      // 尝试从模板对象中提取分类信息
      // 支持多种可能的字段名：primary_id/primary_name, category_id/category_name, category等
      const templateAny = template as any
      const categoryId = templateAny.primary_id || templateAny.category_id || templateAny.category?.id
      const categoryName = templateAny.primary_name || templateAny.category_name || templateAny.category?.name
      
      if (categoryId && categoryName && !categoryMap.has(categoryId)) {
        categoryMap.set(categoryId, categoryName)
      }
    })
    
    const extractedCategories: Category[] = [{ id: "all", name: "全部模板" }]
    categoryMap.forEach((name, id) => {
      extractedCategories.push({ id, name })
    })
    
    return extractedCategories
  }, [])

  // 加载模板列表
  const loadTemplates = useCallback(async (
    page: string = "1",
    category: string = "all",
    keyword: string = "",
    append: boolean = false
  ) => {
    try {
      setLoading(!append) // 追加时不显示加载状态

      let response
      if (keyword.trim()) {
        // 搜索模式
        response = await searchTemplates(keyword, page)
        setIsSearching(true)
      } else {
        // 查询模式
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
          // 提取分类（仅在非追加模式下）
          const extractedCategories = extractCategories(response.data)
          setCategories(extractedCategories)
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
  }, [extractCategories])

  // 初始加载
  useEffect(() => {
    loadTemplates("1", activeCategory, searchQuery)
    setPageNumber("1")
  }, [activeCategory]) // 分类变化时重新加载

  // 搜索处理
  const handleSearch = useCallback(() => {
    if (searchQuery.trim()) {
      // 搜索时清空分类筛选
      setActiveCategory("all")
      loadTemplates("1", "all", searchQuery.trim())
      setPageNumber("1")
    } else {
      // 清空搜索，恢复分类筛选
      loadTemplates("1", activeCategory, "")
      setPageNumber("1")
    }
  }, [searchQuery, activeCategory, loadTemplates])

  // 无限滚动：加载更多
  useEffect(() => {
    if (!hasMore || loading || isSearching) return

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const nextPage = (parseInt(pageNumber) + 1).toString()
          setPageNumber(nextPage)
          loadTemplates(nextPage, activeCategory, searchQuery, true)
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
  }, [hasMore, loading, pageNumber, activeCategory, searchQuery, isSearching, loadTemplates])

  // 使用模板
  const handleUseTemplate = (template: TemplateInfo) => {
    // 跳转到工作台，传递templateId
    router.push(`/workspace?templateId=${template.pptx_id}`)
  }

  // 预览模板
  const handlePreviewTemplate = (template: TemplateInfo) => {
    setPreviewTemplate(template)
    setPreviewPage(1) // 重置到第一页
  }

  // 预览翻页
  const handlePreviewPageChange = (direction: "prev" | "next") => {
    if (!previewTemplate) return
    
    const totalPages = previewTemplate.page_size || 1
    if (direction === "prev") {
      setPreviewPage(prev => Math.max(1, prev - 1))
    } else {
      setPreviewPage(prev => Math.min(totalPages, prev + 1))
    }
  }

  // 获取分类名称
  const getCategoryName = (template: TemplateInfo) => {
    const templateAny = template as any
    const categoryId = templateAny.primary_id || templateAny.category_id || templateAny.category?.id
    if (!categoryId) return ""
    const category = categories.find(c => c.id === categoryId)
    return category?.name || ""
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Left Sidebar */}
      <aside className="w-64 border-r border-border bg-muted/30">
        <div className="p-6">
          <div className="space-y-2">
            <nav className="space-y-2">
              <Link href="/workspace">
                <Button variant="ghost" className="w-full justify-start">
                  <Home className="h-4 w-4 mr-2" />
                  工作台
                </Button>
              </Link>
              <Link href="/library">
                <Button variant="ghost" className="w-full justify-start">
                  <FolderOpen className="h-4 w-4 mr-2" />
                  文件库
                </Button>
              </Link>
              <Button variant="default" className="w-full justify-start">
                <Layout className="h-4 w-4 mr-2" />
                模版中心
              </Button>
            </nav>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        <div className="container py-8 pl-8">
          {/* Page Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">选择PPT模板</h1>
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="搜索模板..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch()
                  }
                }}
                className="pl-12 h-12 text-base"
              />
              <Button 
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={handleSearch}
              >
                搜索
              </Button>
            </div>
          </div>

          {/* Category Navigation */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? "default" : "outline"}
                onClick={() => setActiveCategory(category.id)}
                className="rounded-full"
              >
                {category.name}
              </Button>
            ))}
          </div>

          {/* Template Grid */}
          {loading && templates.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
              <span className="text-muted-foreground">加载模板中...</span>
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {searchQuery ? "暂无数据" : "暂无模板"}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                {templates.map((template) => {
                  const categoryName = getCategoryName(template)
                  return (
                    <Card key={template.pptx_id} className="group overflow-hidden hover:shadow-xl transition-all duration-300">
                      <div className="relative aspect-[3/2] overflow-hidden bg-muted">
                        <img
                          src={getTemplateThumbnailUrl(template.pptx_id)}
                          alt={template.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg"
                          }}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            onClick={() => handlePreviewTemplate(template)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            预览
                          </Button>
                        </div>
                        {categoryName && (
                          <Badge className="absolute top-3 right-3 bg-background/90 text-foreground">
                            {categoryName}
                          </Badge>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium text-sm mb-3 line-clamp-1">{template.title}</h3>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 bg-transparent"
                            onClick={() => handlePreviewTemplate(template)}
                          >
                            预览
                          </Button>
                          <Button 
                            size="sm" 
                            className="flex-1 bg-gradient-to-r from-[var(--tech-gradient-start)] to-[var(--tech-gradient-end)] text-white"
                            onClick={() => handleUseTemplate(template)}
                          >
                            使用
                          </Button>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
              
              {/* 无限滚动触发器 */}
              {hasMore && (
                <div ref={loadMoreRef} className="flex items-center justify-center py-4">
                  {loading && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>加载更多...</span>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Preview Modal */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{previewTemplate?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="aspect-[16/9] bg-muted rounded-lg overflow-hidden relative">
              {previewTemplate && (
                <>
                  <img
                    src={getTemplatePagePreviewUrl(previewTemplate.pptx_id, previewPage)}
                    alt={`${previewTemplate.title} - 第${previewPage}页`}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg"
                    }}
                  />
                  {/* 翻页按钮 */}
                  {previewTemplate.page_size > 1 && (
                    <>
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                        onClick={() => handlePreviewPageChange("prev")}
                        disabled={previewPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background"
                        onClick={() => handlePreviewPageChange("next")}
                        disabled={previewPage >= (previewTemplate.page_size || 1)}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </>
              )}
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                {previewTemplate && previewTemplate.page_size > 1 && (
                  <span className="text-sm text-muted-foreground">
                    第 {previewPage} / {previewTemplate.page_size} 页
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                {previewTemplate && previewTemplate.page_size > 1 && (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handlePreviewPageChange("prev")}
                      disabled={previewPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      上一页
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handlePreviewPageChange("next")}
                      disabled={previewPage >= previewTemplate.page_size}
                    >
                      下一页
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </>
                )}
                <Button 
                  className="bg-gradient-to-r from-[var(--tech-gradient-start)] to-[var(--tech-gradient-end)] text-white"
                  onClick={() => {
                    if (previewTemplate) {
                      handleUseTemplate(previewTemplate)
                      setPreviewTemplate(null)
                    }
                  }}
                >
                  使用此模板
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
