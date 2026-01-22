"use client"

import { Card } from "@/components/ui/card"
import { useEffect, useState } from "react"

// 6个精美模版
const TEMPLATES = [
  {
    id: 1,
    title: "线上问诊家庭化",
    image: "/templates/template-1-online-consultation.jpg",
  },
  {
    id: 2,
    title: "第一阶段工作计划",
    image: "/templates/template-2-work-plan.jpg",
  },
  {
    id: 3,
    title: "青少年心理教育",
    image: "/templates/template-3-psychology-education.jpg",
  },
  {
    id: 4,
    title: "元旦新玩法",
    image: "/templates/template-4-new-year.jpg",
  },
  {
    id: 5,
    title: "交通与文旅产业",
    image: "/templates/template-5-tourism.jpg",
  },
  {
    id: 6,
    title: "品牌策划定位",
    image: "/templates/template-6-brand-positioning.jpg",
  },
]

export function TemplateShowcase() {
  const [scrollPosition, setScrollPosition] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setScrollPosition((prev) => (prev + 1) % (TEMPLATES.length * 320))
    }, 50)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="py-16 md:py-24 border-t">
      <div className="container mx-auto">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">精美模版</h2>
          <p className="text-muted-foreground text-lg">精选专业设计模板，满足各种场景需求</p>
        </div>

        <div className="relative overflow-hidden">
          <div
            className="flex gap-4 transition-transform duration-100 ease-linear"
            style={{ transform: `translateX(-${scrollPosition}px)` }}
          >
            {[...TEMPLATES, ...TEMPLATES].map((template, index) => (
              <Card
                key={`${template.id}-${index}`}
                className="flex-shrink-0 w-[300px] overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="aspect-video relative bg-muted">
                  <img
                    src={template.image || "/placeholder.svg"}
                    alt={template.title}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-center">{template.title}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
