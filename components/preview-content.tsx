"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, RefreshCw, Layout, Edit, Share2, ThumbsUp, ThumbsDown, Download } from "lucide-react"
import { SlideNavigationPanel } from "@/components/slide-navigation-panel"
import { SlidePreview } from "@/components/slide-preview"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

export function PreviewContent() {
  const router = useRouter()
  const [currentSlide, setCurrentSlide] = useState(1)
  const [viewMode, setViewMode] = useState<"slides" | "notes">("slides")
  const [showFeedback, setShowFeedback] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [feedback, setFeedback] = useState("")

  const totalSlides = 12

  const handleLike = () => {
    alert("感谢您的评价！")
  }

  const handleDislike = () => {
    setShowFeedback(true)
  }

  const submitFeedback = () => {
    setShowFeedback(false)
    setFeedback("")
    alert("感谢您的反馈！我们会持续改进。")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto flex h-16 items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => router.push("/workspace")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回工作台
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">用户中心</span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex h-[calc(100vh-4rem)]">
        <SlideNavigationPanel totalSlides={totalSlides} currentSlide={currentSlide} onSlideChange={setCurrentSlide} />

        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 flex items-center justify-center p-8 bg-muted/30">
            <SlidePreview slideNumber={currentSlide} viewMode={viewMode} onViewModeChange={setViewMode} />
          </div>

          {/* Bottom actions */}
          <div className="border-t bg-card p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-1" />
                  重新生成
                </Button>
                <Button variant="outline" size="sm">
                  <Layout className="h-4 w-4 mr-1" />
                  切换模版
                </Button>
              </div>

              <div className="flex gap-2">
                <Button size="sm" onClick={() => router.push("/editor")}>
                  <Edit className="h-4 w-4 mr-1" />
                  PPT编辑
                </Button>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-[var(--tech-gradient-start)] to-[var(--tech-gradient-end)] text-white"
                  onClick={() => setShowShare(true)}
                >
                  <Share2 className="h-4 w-4 mr-1" />
                  分享导出
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4">
              <span className="text-sm text-muted-foreground">您对生成的PPT效果满意吗？</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleLike}>
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  满意
                </Button>
                <Button variant="outline" size="sm" onClick={handleDislike}>
                  <ThumbsDown className="h-4 w-4 mr-1" />
                  不满意
                </Button>
              </div>
            </div>

            <div className="text-center text-xs text-muted-foreground">以上内容由AI生成</div>
          </div>
        </main>
      </div>

      {/* Feedback Dialog */}
      <Dialog open={showFeedback} onOpenChange={setShowFeedback}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>意见反馈</DialogTitle>
            <DialogDescription>请告诉我们您不满意的地方，我们会持续改进</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="请描述您遇到的问题或建议..."
              className="min-h-[120px]"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowFeedback(false)}>
                取消
              </Button>
              <Button onClick={submitFeedback}>提交反馈</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={showShare} onOpenChange={setShowShare}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>分享导出</DialogTitle>
            <DialogDescription>选择分享或下载方式</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">分享链接</h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value="https://aippt.com/share/abc123"
                  className="flex-1 px-3 py-2 text-sm border rounded-md bg-muted"
                />
                <Button size="sm">复制</Button>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold">下载文件</h4>
              <div className="flex flex-col gap-2">
                <Button variant="outline" className="justify-start bg-transparent">
                  <Download className="h-4 w-4 mr-2" />
                  下载PPT文件
                </Button>
                <Button variant="outline" className="justify-start bg-transparent">
                  <Download className="h-4 w-4 mr-2" />
                  下载演讲稿
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
