"use client"

import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Sparkles } from "lucide-react"
import ReactMarkdown from "react-markdown"

interface OutlineStreamingDisplayProps {
  onComplete?: (data: any) => void
  onError?: (error: string) => void
}

export interface OutlineStreamingDisplayHandle {
  startGeneration: () => void
  handleStatus: (message: string) => void
  handleContent: (text: string) => void
  handleParsed: (data: any) => void
  handleError: (error: string) => void
}

export const OutlineStreamingDisplay = forwardRef<OutlineStreamingDisplayHandle, OutlineStreamingDisplayProps>(
  ({ onComplete, onError }, ref) => {
  const [status, setStatus] = useState<string>("准备中...")
  const [content, setContent] = useState<string>("")
  const [displayContent, setDisplayContent] = useState<string>("") // 用于打字机效果
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [parsedData, setParsedData] = useState<any>(null)
  const contentEndRef = useRef<HTMLDivElement>(null)
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // 自动滚动到底部
  useEffect(() => {
    if (contentEndRef.current) {
      contentEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [displayContent])

  // 直接同步显示内容，不使用打字机效果（最快速度）
  useEffect(() => {
    // 清理之前的定时器
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current)
      typingIntervalRef.current = null
    }

    // 直接同步显示，不使用打字机效果，实现最快速度
    if (displayContent !== content) {
      setDisplayContent(content)
    }

    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current)
        typingIntervalRef.current = null
      }
    }
  }, [content, displayContent])

  // 暴露方法供父组件调用
  const startGeneration = () => {
    setIsGenerating(true)
    setStatus("准备中...")
    setContent("")
    setDisplayContent("")
    setParsedData(null)
  }

  const handleStatus = (message: string) => {
    setStatus(message)
  }

  const handleContent = (text: string) => {
    setContent((prev) => prev + text)
  }

  const handleParsed = (data: any) => {
    setParsedData(data)
    setIsGenerating(false)
    onComplete?.(data)
  }

  const handleError = (error: string) => {
    setIsGenerating(false)
    setStatus("生成失败")
    onError?.(error)
  }

  // 使用useImperativeHandle暴露方法
  useImperativeHandle(ref, () => ({
    startGeneration,
    handleStatus,
    handleContent,
    handleParsed,
    handleError,
  }))

  if (!isGenerating && !content && !parsedData) {
    return null
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isGenerating ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>正在生成大纲...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              <span>AI生成大纲</span>
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 状态栏 */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-medium">状态：</span>
          <span>{status}</span>
        </div>

        {/* 内容预览区域 */}
        {content && (
          <div className="border rounded-lg p-4 bg-muted/30 max-h-[500px] overflow-y-auto">
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown>{displayContent}</ReactMarkdown>
              {isGenerating && (
                <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1" />
              )}
            </div>
            <div ref={contentEndRef} />
          </div>
        )}

        {/* 生成完成提示 */}
        {parsedData && !isGenerating && (
          <div className="text-sm text-green-600 dark:text-green-400">
            ✅ 大纲生成完成！
          </div>
        )}
      </CardContent>
    </Card>
  )
  }
)

OutlineStreamingDisplay.displayName = "OutlineStreamingDisplay"
