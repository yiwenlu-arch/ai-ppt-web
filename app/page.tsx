import { HeroSection } from "@/components/hero-section"
import { FeatureCards } from "@/components/feature-cards"
import { TargetAudience } from "@/components/target-audience"
import { TemplateShowcase } from "@/components/template-showcase"
import { UserReviews } from "@/components/user-reviews"
import { FinalCTA } from "@/components/final-cta"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader currentPage="home" />

      <main>
        <HeroSection />
        <FeatureCards />
        <TargetAudience />
        <TemplateShowcase />
        <UserReviews />
        <FinalCTA />
      </main>

      <SiteFooter />
    </div>
  )
}
