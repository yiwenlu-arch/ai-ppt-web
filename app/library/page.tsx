import { SiteHeader } from "@/components/site-header"
import { LibraryContent } from "@/components/library-content"

export default function LibraryPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader currentPage="files" showUser />
      <LibraryContent />
    </div>
  )
}
