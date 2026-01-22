"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, ChevronRight, Download, Save, Loader2 } from "lucide-react"
import { downloadFileById, downloadFile } from "@/lib/api"
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

interface PPTStreamingViewerProps {
  onComplete?: (fileId?: string, fileName?: string) => void
  onClose?: () => void
}

export function PPTStreamingViewer({ onComplete, onClose }: PPTStreamingViewerProps) {
  const [slides, setSlides] = useState<Slide[]>([])
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [isGenerating, setIsGenerating] = useState(true)
  const [generationProgress, setGenerationProgress] = useState({ totalPages: 0, completedPages: 0 })
  const [statusMessage, setStatusMessage] = useState('准备生成PPT...')
  const [fileId, setFileId] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const slideEndRef = useRef<HTMLDivElement>(null)

  // 自动滚动到当前幻灯片底部
  useEffect(() => {
    if (slideEndRef.current && slides[currentSlideIndex]?.isGenerating) {
      slideEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [slides, currentSlideIndex])

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

  // 暴露方法供外部调用
  useEffect(() => {
    // 这个方法会被父组件通过ref调用
    (window as any).__pptViewerUpdate = {
      onStatus: (message: string) => {
        setStatusMessage(message)
      },
      onPage: (data: { pageNumber: number, title?: string, status: 'start' | 'complete' }) => {
        if (data.status === 'start') {
          updateSlide(data.pageNumber, {
            title: data.title || '未命名',
            isGenerating: true,
            isComplete: false
          })
        } else if (data.status === 'complete') {
          updateSlide(data.pageNumber, {
            isGenerating: false,
            isComplete: true
          })
        }
      },
      onContent: (data: { pageNumber: number, content: SlideContent }) => {
        appendContentToSlide(data.pageNumber, data.content)
      },
      onProgress: (data: { totalPages: number, completedPages: number }) => {
        setGenerationProgress(data)
      },
      onComplete: (data: { fileId?: string, fileName?: string }) => {
        setIsGenerating(false)
        setFileId(data.fileId || null)
        setFileName(data.fileName || null)
        setStatusMessage('生成完成！')
        onComplete?.(data.fileId, data.fileName)
        toast.success('PPT生成成功！', { id: 'ppt-complete' })
      },
      onError: (error: string) => {
        setIsGenerating(false)
        setStatusMessage('生成失败')
        toast.error(error, { id: 'ppt-error' })
      }
    }
  }, [onComplete])

  const handleDownload = async () => {
    if (!fileId && !fileName) {
      toast.error('文件信息不存在，无法下载')
      return
    }
    try {
      if (fileId) {
        // 使用文件ID下载
        await downloadFileById(fileId)
        toast.success('文件下载已开始', { id: 'download' })
      } else if (fileName) {
        // 如果只有文件名，尝试通过文件名下载
        toast.error('文件ID不存在，请等待生成完成', { id: 'download-error' })
      }
    } catch (error) {
      toast.error('下载失败: ' + (error instanceof Error ? error.message : '未知错误'), { id: 'download-error' })
    }
  }

  const currentSlide = slides[currentSlideIndex]
  const progressPercentage = generationProgress.totalPages > 0
    ? (generationProgress.completedPages / generationProgress.totalPages) * 100
    : 0

  return (
    <div className="flex flex-col h-full bg-background">
      {/* 顶部工具栏 */}
      <div className="flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">PPT生成中</h2>
          {isGenerating && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{statusMessage}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {fileId && (
            <>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                下载
              </Button>
            </>
          )}
          {onClose && (
            <Button variant="outline" size="sm" onClick={onClose}>
              关闭
            </Button>
          )}
        </div>
      </div>

      {/* 进度条 */}
      {isGenerating && generationProgress.totalPages > 0 && (
        <div className="px-4 py-2 border-b bg-muted/30">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-muted-foreground">
              生成进度: {generationProgress.completedPages} / {generationProgress.totalPages} 页
            </span>
            <span className="text-sm font-medium">{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      )}

      {/* 主内容区 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 幻灯片导航 */}
        {slides.length > 0 && (
          <div className="w-48 border-r bg-muted/30 overflow-y-auto p-2">
            <div className="space-y-1">
              {slides.map((slide, index) => (
                <div
                  key={slide.id}
                  className={`p-2 rounded cursor-pointer transition-colors ${
                    index === currentSlideIndex
                      ? 'bg-primary text-primary-foreground'
                      : slide.isComplete
                      ? 'bg-card hover:bg-accent'
                      : slide.isGenerating
                      ? 'bg-yellow-100 dark:bg-yellow-900/20'
                      : 'bg-card hover:bg-accent'
                  }`}
                  onClick={() => setCurrentSlideIndex(index)}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">第 {slide.pageNumber} 页</span>
                    {slide.isGenerating && (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    )}
                    {slide.isComplete && (
                      <span className="text-xs">✓</span>
                    )}
                  </div>
                  <div className="text-xs mt-1 truncate">{slide.title}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 当前幻灯片显示 */}
        <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-y-auto">
          {currentSlide ? (
            <Card className="w-full max-w-5xl aspect-video bg-white shadow-2xl">
              <div className="h-full p-12 flex flex-col">
                {/* 幻灯片标题 */}
                <h1 className="text-4xl font-bold mb-8 text-center">{currentSlide.title}</h1>

                {/* 幻灯片内容 */}
                <div className="flex-1 space-y-4 overflow-y-auto">
                  {currentSlide.content.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center text-muted-foreground">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                        <p>正在生成内容...</p>
                      </div>
                    </div>
                  ) : (
                    currentSlide.content.map((item, index) => {
                      const paddingLeft = (item.level || 0) * 24 + 16
                      return (
                        <div
                          key={index}
                          className="animate-in fade-in slide-in-from-left-2 duration-300"
                          style={{ paddingLeft: `${paddingLeft}px` }}
                        >
                          {item.type === 'title' && (
                            <h2 className="text-3xl font-semibold">{item.text}</h2>
                          )}
                          {item.type === 'subtitle' && (
                            <h3 className="text-2xl font-medium text-muted-foreground">{item.text}</h3>
                          )}
                          {item.type === 'bullet' && (
                            <div className="flex items-start gap-2">
                              <span className="mt-1">•</span>
                              <p className="text-lg">{item.text}</p>
                            </div>
                          )}
                          {item.type === 'text' && (
                            <p className="text-base">{item.text}</p>
                          )}
                        </div>
                      )
                    })
                  )}
                  {currentSlide.isGenerating && (
                    <div ref={slideEndRef} className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">正在生成...</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ) : (
            <div className="text-center text-muted-foreground">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
              <p>等待生成第一页...</p>
            </div>
          )}

          {/* 页面导航按钮 */}
          {slides.length > 1 && (
            <div className="flex items-center gap-4 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
                disabled={currentSlideIndex === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                上一页
              </Button>
              <span className="text-sm text-muted-foreground">
                {currentSlideIndex + 1} / {slides.length}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentSlideIndex(Math.min(slides.length - 1, currentSlideIndex + 1))}
                disabled={currentSlideIndex === slides.length - 1}
              >
                下一页
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
