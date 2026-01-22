import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { DownloadSection } from "@/components/download-section"

export default function DownloadPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader currentPage="download" />
      <main>
        <DownloadSection />
      </main>
      <SiteFooter />
    </div>
  )
}
