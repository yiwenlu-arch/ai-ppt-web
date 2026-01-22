"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Download, Edit, Save, Loader2, ChevronLeft, ChevronRight } from "lucide-react"
import { generatePPTExternal, parsePPTStream, downloadFileById } from "@/lib/api"
import { toast } from "sonner"

interface SlideContent {
  type: 'title' | 'subtitle' | 'bullet' | 'text'
  text: string
  level?: number
  index?: number
}

interface Slide {
  id: string
  pageNumber: number
  title: string
  content: SlideContent[]
  isComplete: boolean
  isGenerating: boolean
}

interface PPTPreviewStreamProps {}

export function PPTPreviewStream({}: PPTPreviewStreamProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // 从sessionStorage获取生成参数（避免URL过长）
  const [generateParams, setGenerateParams] = useState<{
    topic: string
    templateId: string
    audience?: string
    tone?: string
    scenario?: string
    outline?: any
  } | null>(null)
  
  const [slides, setSlides] = useState<Slide[]>([])
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [isGenerating, setIsGenerating] = useState(true)
  const [isEditable, setIsEditable] = useState(false)
  const [generationProgress, setGenerationProgress] = useState({ totalPages: 0, completedPages: 0 })
  const [statusMessage, setStatusMessage] = useState('准备生成PPT...')
  const [fileId, setFileId] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [editingSlideId, setEditingSlideId] = useState<string | null>(null)
  const [editingContentIndex, setEditingContentIndex] = useState<number | null>(null)
  const slideEndRef = useRef<HTMLDivElement>(null)

  // 从sessionStorage读取生成参数
  useEffect(() => {
    try {
      const paramsJson = sessionStorage.getItem('ppt-generate-params')
      if (paramsJson) {
        const params = JSON.parse(paramsJson)
        setGenerateParams(params)
        // 读取后清除，避免重复使用
        sessionStorage.removeItem('ppt-generate-params')
      } else {
        // 如果没有参数，尝试从URL参数获取（兼容旧版本）
        const topic = searchParams.get("topic") || ""
        const templateId = searchParams.get("templateId") || ""
        const outlineJson = searchParams.get("outline")
        if (topic && templateId) {
          setGenerateParams({
            topic,
            templateId,
            outline: outlineJson ? JSON.parse(decodeURIComponent(outlineJson)) : null
          })
        } else {
          toast.error('缺少必要参数，请返回工作台重新生成')
        }
      }
    } catch (error) {
      console.error('读取生成参数失败:', error)
      toast.error('读取生成参数失败，请返回工作台重新生成')
    }
  }, [searchParams])

  // 自动滚动到当前幻灯片底部
  useEffect(() => {
    if (slideEndRef.current && slides[currentSlideIndex]?.isGenerating) {
      slideEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [slides, currentSlideIndex])

  // 更新幻灯片
  const updateSlide = (pageNumber: number, updates: Partial<Slide>) => {
    setSlides(prev => {
      const index = prev.findIndex(s => s.pageNumber === pageNumber)
      if (index >= 0) {
        const newSlides = [...prev]
        newSlides[index] = { ...newSlides[index], ...updates }
        return newSlides
      }
      // 如果不存在，创建新幻灯片
      const newSlide: Slide = {
        id: `slide-${pageNumber}`,
        pageNumber,
        title: updates.title || '未命名',
        content: [],
        isComplete: false,
        isGenerating: true,
        ...updates
      }
      return [...prev, newSlide].sort((a, b) => a.pageNumber - b.pageNumber)
    })
  }

  // 添加内容到幻灯片
  const appendContentToSlide = (pageNumber: number, content: SlideContent) => {
    setSlides(prev => {
      const index = prev.findIndex(s => s.pageNumber === pageNumber)
      if (index >= 0) {
        const newSlides = [...prev]
        newSlides[index] = {
          ...newSlides[index],
          content: [...newSlides[index].content, content]
        }
        return newSlides
      }
      return prev
    })
  }

  // 开始流式生成
  useEffect(() => {
    if (!generateParams || !generateParams.topic || !generateParams.templateId || !generateParams.outline) {
      if (generateParams) {
        // 参数已加载但缺少必要字段
        toast.error('缺少必要参数，请返回工作台重新生成')
      }
      return
    }

    const startGeneration = async () => {
      setIsGenerating(true)
      setIsEditable(false)
      
      try {
        // 步骤1：先调用外部API生成PPT文件
        setStatusMessage('正在调用外部API生成PPT文件...')
        toast.loading('正在生成PPT文件，请稍候...', { id: 'generate-ppt' })
        
        const externalResponse = await generatePPTExternal({
          pptx_id: generateParams.templateId,
          theme: generateParams.topic,
          outline: generateParams.outline,
        })
        
        console.log('📥 外部API响应:', externalResponse)
        
        // 步骤2：如果生成成功，获取文件信息
        if (externalResponse.code === 1 && externalResponse.data) {
          const fileId = externalResponse.data.file_id
          const fileName = externalResponse.data.file_name
          const downloadUrl = externalResponse.data.download_url || null
          const localFile = externalResponse.data.local_file
          
          // 保存文件信息用于下载
          setFileId(fileId)
          setFileName(fileName)
          setDownloadUrl(downloadUrl)
          
          // 步骤3：立即开始流式解析PPT文件（显示实际内容）
          setStatusMessage('正在解析PPT文件...')
          toast.loading('正在解析PPT内容，请稍候...', { id: 'parse-ppt' })
          
          // 构建解析参数：优先使用本地文件，否则使用下载URL
          const parseParams: {
            fileId?: string
            fileUrl?: string
            filePath?: string
          } = {}
          
          if (localFile) {
            // 如果文件已下载到本地，使用本地文件路径
            parseParams.fileId = localFile.id
            parseParams.filePath = localFile.path
          } else if (downloadUrl) {
            // 如果没有本地文件，使用下载URL
            parseParams.fileUrl = downloadUrl
          } else {
            // 如果既没有本地文件也没有下载URL，使用fileId（可能失败）
            parseParams.fileId = fileId
          }
          
          await parsePPTStream(
            parseParams,
            {
              onStatus: (message) => {
                setStatusMessage(message)
              },
              onPage: (data) => {
                if (data.status === 'start') {
                  updateSlide(data.pageNumber, {
                    title: data.title || '未命名',
                    isGenerating: true,
                    isComplete: false
                  })
                  setCurrentSlideIndex(data.pageNumber - 1)
                } else if (data.status === 'complete') {
                  updateSlide(data.pageNumber, {
                    isComplete: true,
                    isGenerating: false
                  })
                }
              },
              onContent: (data) => {
                appendContentToSlide(data.pageNumber, data.content)
              },
              onProgress: (data) => {
                setGenerationProgress(data)
              },
              onComplete: (data) => {
                setIsGenerating(false)
                setIsEditable(true) // 解锁编辑功能
                setStatusMessage('生成完成')
                toast.success('PPT生成完成', { id: 'generate-ppt' })
                toast.dismiss('parse-ppt')
              },
              onError: (error) => {
                console.error('解析PPT失败:', error)
                setIsGenerating(false)
                setStatusMessage('解析PPT失败: ' + error)
                toast.error('解析PPT失败: ' + error, { id: 'parse-ppt' })
              }
            }
          )
        } else {
          // 外部API生成失败
          const errorMessage = externalResponse.message || '外部API生成PPT失败'
          setIsGenerating(false)
          setStatusMessage('生成失败: ' + errorMessage)
          toast.error('生成失败: ' + errorMessage, { id: 'generate-ppt' })
        }
      } catch (error) {
        console.error('调用生成API失败:', error)
        const errorMessage = error instanceof Error ? error.message : '生成失败'
        setIsGenerating(false)
        setStatusMessage('生成失败: ' + errorMessage)
        toast.error('生成失败: ' + errorMessage, { id: 'generate-ppt' })
      }
    }

    startGeneration()
  }, [generateParams])

  // 编辑内容
  const handleEditContent = (slideId: string, contentIndex: number) => {
    if (!isEditable) return
    setEditingSlideId(slideId)
    setEditingContentIndex(contentIndex)
  }

  // 保存编辑
  const handleSaveContent = (slideId: string, contentIndex: number, newText: string) => {
    setSlides(prev => {
      const newSlides = [...prev]
      const slideIndex = newSlides.findIndex(s => s.id === slideId)
      if (slideIndex >= 0 && contentIndex >= 0 && contentIndex < newSlides[slideIndex].content.length) {
        newSlides[slideIndex].content[contentIndex].text = newText
      }
      return newSlides
    })
    setEditingSlideId(null)
    setEditingContentIndex(null)
    toast.success('内容已保存')
  }

  // 下载PPT
  const handleDownload = async () => {
    try {
      if (downloadUrl) {
        // 优先使用外部API返回的下载URL
        window.open(downloadUrl, '_blank')
        toast.success('开始下载PPT')
      } else if (fileId) {
        // 如果没有下载URL，使用fileId从本地文件库下载
        await downloadFileById(fileId)
        toast.success('开始下载PPT')
      } else {
        toast.error('下载链接不可用，请稍后再试')
      }
    } catch (error) {
      console.error('下载失败:', error)
      const errorMessage = error instanceof Error ? error.message : '下载失败'
      toast.error('下载失败: ' + errorMessage)
    }
  }

  // 上一页/下一页
  const goToPreviousSlide = () => {
    setCurrentSlideIndex(prev => Math.max(0, prev - 1))
  }

  const goToNextSlide = () => {
    setCurrentSlideIndex(prev => Math.min(slides.length - 1, prev + 1))
  }

  const currentSlide = slides[currentSlideIndex]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Button variant="ghost" size="sm" onClick={() => router.push("/workspace")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回工作台
          </Button>
          
          <div className="flex items-center gap-4">
            {isGenerating && (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">{statusMessage}</span>
              </div>
            )}
            {generationProgress.totalPages > 0 && (
              <div className="flex items-center gap-2">
                <Progress 
                  value={(generationProgress.completedPages / generationProgress.totalPages) * 100} 
                  className="w-32"
                />
                <span className="text-sm text-muted-foreground">
                  {generationProgress.completedPages}/{generationProgress.totalPages}
                </span>
              </div>
            )}
            {!isGenerating && isEditable && (
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                下载PPT
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="container mx-auto px-4 py-8">
        {slides.length === 0 && isGenerating && (
          <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
              <p className="text-lg text-muted-foreground">{statusMessage}</p>
            </div>
          </div>
        )}

        {slides.length > 0 && currentSlide && (
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={goToPreviousSlide}
                disabled={currentSlideIndex === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                上一页
              </Button>
              
              <div className="text-sm text-muted-foreground">
                第 {currentSlideIndex + 1} 页 / 共 {slides.length} 页
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={goToNextSlide}
                disabled={currentSlideIndex === slides.length - 1}
              >
                下一页
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>

            {/* Slide content */}
            <Card className="overflow-hidden shadow-2xl">
              <div className="aspect-video bg-gradient-to-br from-blue-50 to-cyan-50 p-12">
                <div className="h-full flex flex-col space-y-6">
                  {/* Title */}
                  {currentSlide.title && (
                    <h1 
                      className={`text-5xl font-bold text-foreground ${isEditable && !isGenerating ? 'cursor-text hover:bg-blue-100/50 rounded px-2 py-1' : ''}`}
                      onClick={() => isEditable && !isGenerating && handleEditContent(currentSlide.id, -1)}
                      contentEditable={isEditable && !isGenerating && editingSlideId === currentSlide.id && editingContentIndex === -1}
                      suppressContentEditableWarning
                    >
                      {currentSlide.title}
                    </h1>
                  )}

                  {/* Content */}
                  <div className="flex-1 space-y-4">
                    {currentSlide.content.map((item, index) => {
                      const isEditing = isEditable && !isGenerating && editingSlideId === currentSlide.id && editingContentIndex === index
                      
                      return (
                        <div 
                          key={index}
                          className={`${
                            item.type === 'title' ? 'text-3xl font-semibold' :
                            item.type === 'subtitle' ? 'text-2xl font-medium' :
                            item.type === 'bullet' ? 'text-xl' :
                            'text-lg'
                          } text-foreground ${
                            isEditable && !isGenerating ? 'cursor-text hover:bg-blue-100/50 rounded px-2 py-1' : ''
                          }`}
                          style={{
                            paddingLeft: item.level && item.level > 0 ? `${item.level * 1.5}rem` : '0'
                          }}
                          onClick={() => isEditable && !isGenerating && handleEditContent(currentSlide.id, index)}
                          contentEditable={isEditing}
                          suppressContentEditableWarning
                          onBlur={(e) => {
                            if (isEditing) {
                              handleSaveContent(currentSlide.id, index, e.currentTarget.textContent || '')
                            }
                          }}
                          onKeyDown={(e) => {
                            if (isEditing && e.key === 'Enter') {
                              e.preventDefault()
                              handleSaveContent(currentSlide.id, index, e.currentTarget.textContent || '')
                            }
                          }}
                        >
                          {item.type === 'bullet' && '• '}
                          {item.text}
                        </div>
                      )
                    })}
                  </div>

                  {/* Generating indicator */}
                  {currentSlide.isGenerating && (
                    <div ref={slideEndRef} className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">正在生成内容...</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Slide thumbnails */}
            {slides.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-4">
                {slides.map((slide, index) => (
                  <button
                    key={slide.id}
                    onClick={() => setCurrentSlideIndex(index)}
                    className={`flex-shrink-0 w-24 h-16 rounded border-2 p-2 text-xs text-left ${
                      index === currentSlideIndex
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="truncate font-medium">{slide.title}</div>
                    <div className="text-muted-foreground mt-1">第 {index + 1} 页</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
