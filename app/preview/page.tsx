import { Suspense } from "react"
import { PPTPreviewStream } from "@/components/ppt-preview-stream"

export default function PreviewPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    }>
      <PPTPreviewStream />
    </Suspense>
  )
}
