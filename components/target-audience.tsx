import { Card, CardContent } from "@/components/ui/card"

const AUDIENCES = [
  {
    title: "教育工作者",
    description: "制作教学课件、学术报告、研究成果展示等教育场景。",
    image: "/teacher-classroom.png",
  },
  {
    title: "医护工作者",
    description: "快速准备病例汇报、学术分享、健康科普等专业场景。",
    image: "/medical-professional-with-presentation.jpg",
  },
  {
    title: "商务人士",
    description: "快速准备会议汇报、项目提案、商务演示等专业场景。",
    image: "/business-professional-presenting.jpg",
  },
  {
    title: "职场新人",
    description: "轻松应对工作报告、晋升答辩、项目总结等职场场景。",
    image: "/young-professional-at-work.jpg",
  },
]

export function TargetAudience() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-background to-accent/20">
      <div className="container mx-auto">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">适用人群</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            无论您是教育工作者、医护人员、商务人士还是职场新人，AiPPT都能满足您的需求
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {AUDIENCES.map((audience) => (
            <Card key={audience.title} className="overflow-hidden group hover:shadow-xl transition-all">
              <div className="aspect-video relative overflow-hidden bg-muted">
                <img
                  src={audience.image || "/placeholder.svg"}
                  alt={audience.title}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-6 space-y-2">
                <h3 className="text-xl font-semibold">{audience.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{audience.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
