import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"

export function FinalCTA() {
  return (
    <section className="py-20 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-cyan-50/50 to-background -z-10" />

      <div className="container mx-auto text-center space-y-8">
        <div className="space-y-4 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold whitespace-nowrap">
            像他们一样，从此轻松驾驭每一次展示
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground text-pretty">
            无需设计经验，不用熬夜加班，让AI帮你快速生成专业、美观、有说服力的PPT。今天就开始你的高效演示之旅。
          </p>
        </div>

        <Button
          asChild
          size="lg"
          className="text-lg px-8 py-6 bg-gradient-to-r from-[var(--tech-gradient-start)] via-[var(--tech-gradient-mid)] to-[var(--tech-gradient-end)] text-white hover:opacity-90"
        >
          <Link href="/workspace">
            <Sparkles className="h-5 w-5 mr-2" />
            免费生成我的第一份AiPPT
          </Link>
        </Button>
      </div>
    </section>
  )
}
