"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface SlidePreviewProps {
  slideNumber: number
  viewMode: "slides" | "notes"
  onViewModeChange: (mode: "slides" | "notes") => void
}

export function SlidePreview({ slideNumber, viewMode, onViewModeChange }: SlidePreviewProps) {
  return (
    <div className="w-full max-w-5xl space-y-4">
      <div className="flex gap-2 justify-center">
        <Button
          variant={viewMode === "slides" ? "default" : "outline"}
          size="sm"
          onClick={() => onViewModeChange("slides")}
        >
          演示文稿
        </Button>
        <Button
          variant={viewMode === "notes" ? "default" : "outline"}
          size="sm"
          onClick={() => onViewModeChange("notes")}
        >
          演讲稿
        </Button>
      </div>

      <Card className="overflow-hidden shadow-2xl">
        {viewMode === "slides" ? (
          <div className="aspect-video bg-gradient-to-br from-blue-50 to-cyan-50 p-12">
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
              <h1 className="text-5xl font-bold text-foreground">
                {slideNumber === 1 ? "AI驱动的演示文稿" : `第 ${slideNumber} 页内容`}
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl">
                {slideNumber === 1
                  ? "专业、美观、高效的PPT生成平台"
                  : "这里是幻灯片的主要内容，由AI智能生成，结构清晰，重点突出。"}
              </p>
            </div>
          </div>
        ) : (
          <div className="aspect-video bg-card p-12 overflow-auto">
            <div className="prose prose-sm max-w-none">
              <h3 className="text-lg font-semibold mb-4">演讲稿 - 第 {slideNumber} 页</h3>
              <p className="text-muted-foreground leading-relaxed">
                各位观众大家好，接下来我将为大家介绍这一页的内容。
                这部分主要讲述了...（此处为AI生成的演讲稿内容，帮助演讲者更好地呈现幻灯片内容）
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                通过这个案例我们可以看到...重点要强调的是... 最后总结一下本页的核心观点...
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
