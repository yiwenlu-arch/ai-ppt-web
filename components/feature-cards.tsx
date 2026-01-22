import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, FileText, Layout } from "lucide-react"

const FEATURES = [
  {
    icon: Sparkles,
    title: "主题生成PPT",
    description: "输入您的演示主题和简要描述，AI将自动生成完整的PPT结构、内容和设计。",
    href: "/workspace",
  },
  {
    icon: FileText,
    title: "文档生成PPT",
    description: "粘贴文本或导入现有文档（Word、Excel、PPT、PDF等），AI自动提取内容并转换为结构清晰的演示文稿。",
    href: "/workspace?mode=document",
  },
  {
    icon: Layout,
    title: "模版生成PPT",
    description: "选择专业设计模板，AI将根据您的内容自动适配版式，快速生成精美演示文稿。",
    href: "/templates",
  },
]

export function FeatureCards() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {FEATURES.map((feature) => {
            const Icon = feature.icon
            return (
              <Card key={feature.title} className="relative overflow-hidden group hover:shadow-lg transition-shadow">
                <CardContent className="p-6 space-y-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--tech-gradient-start)] to-[var(--tech-gradient-end)]">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors bg-transparent"
                  >
                    <Link href={feature.href}>立即体验</Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
