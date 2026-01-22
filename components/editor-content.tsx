"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Undo2, Redo2, Type, ImageIcon, Square, Link2, QrCode, Play, Share2 } from "lucide-react"
import { SlideNavigationPanel } from "@/components/slide-navigation-panel"
import { EditorToolbar } from "@/components/editor-toolbar"
import { Textarea } from "@/components/ui/textarea"

export function EditorContent() {
  const router = useRouter()
  const [currentSlide, setCurrentSlide] = useState(1)
  const [notes, setNotes] = useState("")
  const totalSlides = 12

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push("/workspace")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回工作台
            </Button>
            <input type="text" defaultValue="未命名演示文稿" className="px-3 py-1 text-sm border rounded-md" />
            <div className="flex gap-1">
              <Button variant="ghost" size="icon">
                <Undo2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Redo2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Type className="h-4 w-4 mr-1" />
              文本
            </Button>
            <Button variant="ghost" size="sm">
              <ImageIcon className="h-4 w-4 mr-1" />
              图片
            </Button>
            <Button variant="ghost" size="sm">
              <Square className="h-4 w-4 mr-1" />
              形状
            </Button>
            <Button variant="ghost" size="sm">
              <Link2 className="h-4 w-4 mr-1" />
              链接
            </Button>
            <Button variant="ghost" size="sm">
              <QrCode className="h-4 w-4 mr-1" />
              二维码
            </Button>
            <div className="h-4 w-px bg-border mx-2" />
            <Button variant="ghost" size="sm">
              <Play className="h-4 w-4 mr-1" />
              播放
            </Button>
            <Button
              size="sm"
              className="bg-gradient-to-r from-[var(--tech-gradient-start)] to-[var(--tech-gradient-end)] text-white"
            >
              <Share2 className="h-4 w-4 mr-1" />
              分享导出
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex h-[calc(100vh-4rem)]">
        <SlideNavigationPanel totalSlides={totalSlides} currentSlide={currentSlide} onSlideChange={setCurrentSlide} />

        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 flex items-center justify-center p-8 bg-muted/30">
            <div className="w-full max-w-5xl space-y-4">
              <div className="bg-white shadow-2xl aspect-video rounded-lg overflow-hidden border-2 border-muted">
                <div className="w-full h-full bg-gradient-to-br from-blue-50 to-cyan-50 p-12">
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                    <h1 className="text-5xl font-bold text-foreground">可编辑的幻灯片内容</h1>
                    <p className="text-xl text-muted-foreground max-w-2xl">点击任意元素进行编辑</p>
                  </div>
                </div>
              </div>

              <EditorToolbar />
            </div>
          </div>

          {/* Notes section */}
          <div className="border-t bg-card p-4">
            <div className="container mx-auto max-w-5xl">
              <div className="space-y-2">
                <label className="text-sm font-semibold">备注</label>
                <Textarea
                  placeholder="添加演讲者备注..."
                  className="min-h-[80px] resize-none"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
