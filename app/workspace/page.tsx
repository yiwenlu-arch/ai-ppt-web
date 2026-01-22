import { WorkspaceContent } from "@/components/workspace-content"
import { SiteHeader } from "@/components/site-header"

export default function WorkspacePage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader currentPage="workspace" showUser />
      <WorkspaceContent />
    </div>
  )
}
