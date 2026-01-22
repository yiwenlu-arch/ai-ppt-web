import { Suspense } from "react"
import { WorkspaceContent } from "@/components/workspace-content"
import { SiteHeader } from "@/components/site-header"

export default function WorkspacePage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader currentPage="workspace" showUser />
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-muted-foreground">加载中...</div>
        </div>
      }>
        <WorkspaceContent />
      </Suspense>
    </div>
  )
}
