import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"

const REVIEWS = [
  {
    name: "林老师",
    role: "高中物理教师 · 使用3个月",
    avatar: "/avatars/review-teacher.png",
    rating: 5,
    review:
      '以前备一节《电磁感应》PPT要花整个周末。现在用AiPPT制作家，输入知识点就能自动生成PPT，备课时间节省60%，学生课堂专注度明显提升——抽象物理概念终于"活"了起来。',
  },
  {
    name: "梁主任",
    role: "主任医师 · 使用5个月",
    avatar: "/avatars/review-doctor.png",
    rating: 5,
    review:
      '给公众做医学科普最难的是"翻译"——把复杂的医学原理讲得既准确又易懂。AiPPT制作家能一键将我的专业内容转化成生动的比喻，还能推荐接地气的案例。上次健康讲座，我半小时就做好了往常需打磨一天的PPT，现场听众反馈"第一次完全听懂了"。',
  },
  {
    name: "李经理",
    role: "销售经理 · 使用4个月",
    avatar: "/avatars/review-sales.png",
    rating: 5,
    review:
      '以前季度汇报PPT是我的噩梦，至少熬两个晚上。用AiPPT制作家后，我只需输入核心数据和观点，10分钟生成初稿，再用30分钟微调。上周的汇报，老板第一次夸我"重点突出，视觉专业"。我终于能准时下班了。',
  },
  {
    name: "Alex",
    role: "产品经理 · 使用6个月",
    avatar: "/avatars/review-pm.png",
    rating: 5,
    review:
      '最怕老板说"要更有创意一点"。AiPPT制作家能根据我的主题生成我没想过的逻辑结构和呈现角度。它不是一个简单的工具，更像一个思维伙伴，帮我打开了思路，现在创意会议我总能提出让人眼前一亮的方案。',
  },
]

export function UserReviews() {
  return (
    <section className="py-16 md:py-24 bg-accent/20">
      <div className="container mx-auto">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">用户真实评价</h2>
          <p className="text-muted-foreground text-lg">听听他们怎么说</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {REVIEWS.map((review) => (
            <Card key={review.name} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  {/* 头像 */}
                  <div className="h-12 w-12 rounded-full bg-muted overflow-hidden flex items-center justify-center">
                    <img
                      src={review.avatar || "/placeholder-user.jpg"}
                      alt={review.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <div>
                      <p className="font-semibold">{review.name}</p>
                      <p className="text-sm text-muted-foreground">{review.role}</p>
                    </div>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">{review.review}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
