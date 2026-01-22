"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Sparkles, Search, Zap, Upload, FileText } from "lucide-react"
import { toast } from "sonner"
import { generateOutlineFromFileStream } from "@/lib/api"

const SUGGESTED_TOPICS = [
  "公司年会策划方案",
  "市场调研的重要性与方法探讨",
  "安全培训",
  "简单高效的文案策划技巧",
  "自我介绍技巧",
  "校园文化节活动方案",
  "心理健康与压力管理",
  "年终工作总结"
]

const MAX_CHARACTERS = 10000
// 支持的文件扩展名（与后端解析能力保持一致：.docx 和 .txt）
const SUPPORTED_FILE_TYPES = ["docx", "txt"]

export function DocumentGenerator() {
  const router = useRouter()
  const pathname = usePathname()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadedFileRef = useRef<File | null>(null) // 保存上传的文件引用
  // 输入框内容，刷新页面后清空
  const [content, setContent] = useState("")
  const [deepThink, setDeepThink] = useState(false)
  const [webSearch, setWebSearch] = useState(false)
  const [expandMode, setExpandMode] = useState<"consistent" | "expand">("consistent")
  const [isGenerating, setIsGenerating] = useState(false)
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)
  
  // 组件挂载时清除 sessionStorage，确保刷新后内容为空
  useEffect(() => {
    sessionStorage.removeItem('documentGeneratorContent')
  }, [])
  
  // 保存输入内容到 sessionStorage（仅在当前会话中保留，刷新后清空）
  useEffect(() => {
    if (content) {
      sessionStorage.setItem('documentGeneratorContent', content)
    } else {
      sessionStorage.removeItem('documentGeneratorContent')
    }
  }, [content])
  
  // 监听路由变化：当离开 workspace 页面时清除 sessionStorage
  useEffect(() => {
    // 如果当前不在 workspace 页面，清除存储
    if (pathname && !pathname.includes('/workspace')) {
      sessionStorage.removeItem('documentGeneratorContent')
      // 清空内容状态（如果组件仍在挂载）
      setContent("")
    }
  }, [pathname])
  
  // 组件卸载时清理
  useEffect(() => {
    return () => {
      // 组件卸载时，如果不在 workspace 页面，清除存储
      if (pathname && !pathname.includes('/workspace')) {
        sessionStorage.removeItem('documentGeneratorContent')
      }
    }
  }, [pathname])

  const characterCount = content.length

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    if (!fileExtension || !SUPPORTED_FILE_TYPES.includes(fileExtension)) {
      toast.error(`不支持的文件类型。支持的类型：${SUPPORTED_FILE_TYPES.join('、')}`)
      return
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      toast.error("文件大小不能超过10MB")
      return
    }

    // 保存文件引用，用于后续上传
    uploadedFileRef.current = file
    setUploadedFileName(file.name)
    
    // 文件已上传，自动触发生成大纲
    toast.success(`文件 ${file.name} 已上传，正在生成大纲...`)
    
    // 自动调用生成函数
    await handleGenerate()
  }

  const handleGenerate = async () => {
    // 必须上传文件或输入文本才能生成大纲
    if (!uploadedFileRef.current && !uploadedFileName && !content.trim()) {
      toast.error("请上传文档文件或输入文本内容")
      return
    }

    setIsGenerating(true)
    try {
      // 准备文件
      let fileToUpload: File
      if (uploadedFileRef.current) {
        fileToUpload = uploadedFileRef.current
      } else if (fileInputRef.current?.files && fileInputRef.current.files.length > 0) {
        fileToUpload = fileInputRef.current.files[0]
      } else {
        // 如果用户只输入了文本，创建临时文本文件
        if (content.trim()) {
          const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
          fileToUpload = new File([blob], 'content.txt', { type: 'text/plain' })
        } else {
          throw new Error('请上传文档文件或输入文本内容')
        }
      }
      
      console.log('🚀 开始从文档生成大纲（流式）...')
      console.log('📝 请求参数:', {
        generate_mode: expandMode,
        fileName: fileToUpload.name
      })
      
      // 将文件转换为 base64 并保存到 sessionStorage，以便在工作台页面使用
      const reader = new FileReader()
      reader.onload = async (e) => {
        const base64 = e.target?.result as string
        const fileData = {
          name: fileToUpload.name,
          type: fileToUpload.type,
          size: fileToUpload.size,
          data: base64,
          generateMode: expandMode
        }
        sessionStorage.setItem('pendingDocumentFile', JSON.stringify(fileData))
        
        // 跳转到工作台页面
        const params = new URLSearchParams({
          mode: 'document',
          generateFromFile: 'true'
        })
        router.push(`/workspace?${params.toString()}`)
      }
      reader.onerror = () => {
        toast.error('文件读取失败', { id: 'generate-outline' })
        setIsGenerating(false)
      }
      reader.readAsDataURL(fileToUpload)
    } catch (error) {
      console.error('准备生成大纲失败:', error)
      const errorMessage = error instanceof Error ? error.message : '生成失败，请重试'
      toast.error(errorMessage, { id: 'generate-outline' })
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* 生成选项 */}
      <RadioGroup value={expandMode} onValueChange={(value) => setExpandMode(value as "consistent" | "expand")}>
        <div className="flex gap-4">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="consistent" id="consistent" />
            <Label htmlFor="consistent" className="cursor-pointer">与原文一致</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="expand" id="expand" />
            <Label htmlFor="expand" className="cursor-pointer">适当扩写(生成PPT时间稍长)</Label>
          </div>
        </div>
      </RadioGroup>

      {/* 文本输入区域 */}
      <div className="relative">
        <Textarea
          placeholder="请在此粘贴文本内容或导入文档，将自动将您的文本转换成PPT"
          className="h-[203px] pr-4 pb-20 pt-4 pl-4 resize-none text-base overflow-y-auto"
          value={content}
          onChange={(e) => {
            const newContent = e.target.value
            if (newContent.length <= MAX_CHARACTERS) {
              setContent(newContent)
            } else {
              toast.warning(`内容不能超过${MAX_CHARACTERS}字`)
            }
          }}
        />
        {/* 字符计数 */}
        <div className="absolute bottom-4 right-4 text-sm text-muted-foreground">
          {characterCount}/{MAX_CHARACTERS}
        </div>
        {/* 操作按钮 */}
        <div className="absolute left-4 bottom-4 flex flex-wrap gap-2">
          <Button
            variant={deepThink ? "default" : "outline"}
            size="sm"
            onClick={() => setDeepThink(!deepThink)}
            className={
              deepThink ? "bg-gradient-to-r from-[var(--tech-gradient-start)] to-[var(--tech-gradient-end)]" : ""
            }
          >
            <Zap className="h-4 w-4 mr-1" />
            深度思考（R1）
          </Button>
          <Button
            variant={webSearch ? "default" : "outline"}
            size="sm"
            onClick={() => setWebSearch(!webSearch)}
            className={
              webSearch ? "bg-gradient-to-r from-[var(--tech-gradient-start)] to-[var(--tech-gradient-end)]" : ""
            }
          >
            <Search className="h-4 w-4 mr-1" />
            联网搜索
          </Button>
        </div>
      </div>

      {/* 文档导入区域 */}
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          导入文档(建议导入10000字以内的文档)
        </p>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".docx,.txt"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            选择文件
          </Button>
          {uploadedFileName && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>{uploadedFileName}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setUploadedFileName(null)
                  uploadedFileRef.current = null
                  setContent("")
                  if (fileInputRef.current) {
                    fileInputRef.current.value = ""
                  }
                }}
                className="h-6 px-2"
              >
                清除
              </Button>
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          支持 Word 文档 (.docx) 和 文本文件 (.txt)
        </p>
      </div>

      {/* 生成按钮 */}
      <Button
        size="lg"
        className="w-full bg-gradient-to-r from-[var(--tech-gradient-start)] via-[var(--tech-gradient-mid)] to-[var(--tech-gradient-end)] text-white text-base font-semibold hover:opacity-90 transition-opacity"
        onClick={handleGenerate}
        disabled={isGenerating || (!content.trim() && !uploadedFileName)}
      >
        {isGenerating ? (
          <>
            <Sparkles className="h-5 w-5 mr-2 animate-spin" />
            生成中...
          </>
        ) : (
          <>
            <Sparkles className="h-5 w-5 mr-2" />
            生成PPT
          </>
        )}
      </Button>

      {/* 常用主题推荐 */}
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          常用主题推荐：
        </p>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_TOPICS.map((topic) => (
            <Badge
              key={topic}
              variant="secondary"
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors bg-secondary/30"
              onClick={() => {
                setContent(topic)
                router.push(`/workspace?mode=document&topic=${encodeURIComponent(topic)}`)
              }}
            >
              {topic}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )
}
