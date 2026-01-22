import { SiteHeader } from "@/components/site-header"
import { TemplatesContent } from "@/components/templates-content"

export default function TemplatesPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader currentPage="templates" showUser />
      <TemplatesContent />
    </div>
  )
}
