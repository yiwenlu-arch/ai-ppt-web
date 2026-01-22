import { Suspense } from "react"
import { PPTPreviewEditor } from "@/components/ppt-preview-editor"

export default function PPTPreviewEditorPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    }>
      <PPTPreviewEditor />
    </Suspense>
  )
}
