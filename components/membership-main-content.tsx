"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, FileText, List, FolderOpen, Pencil, Download, Headphones, Check, X } from "lucide-react"
import { MembershipPurchaseDialog } from "@/components/membership-purchase-dialog"
import { QrCode } from "lucide-react"

const membershipBenefits = [
  { icon: FileText, label: "AI生成PPT" },
  { icon: List, label: "AI生成大纲" },
  { icon: FolderOpen, label: "海量PPT模板" },
  { icon: Pencil, label: "PPT编辑" },
  { icon: Download, label: "多格式导入" }
]

const comparisonData = [
  {
    benefit: "AI大纲生成",
    vip: "不限次",
    regular: "限次体验"
  },
  {
    benefit: "AIPPT生成",
    vip: "不限次",
    regular: "限次体验"
  },
  {
    benefit: "PPT编辑",
    vip: "不限次",
    regular: "X"
  },
  {
    benefit: "模版素材下载",
    vip: "不限次",
    regular: "X"
  },
  {
    benefit: "专属客服",
    vip: "24小时内回复",
    regular: "72小时内回复"
  },
  {
    benefit: "大纲下载",
    vip: "不限次",
    regular: "X"
  }
]

const qaData = [
  {
    question: "模板还会更新增加吗?",
    answer: "会啊,我每次都是用的时候可选择的模板都变多了,应该都是原创设计的模板,设计风格很满意!"
  },
  {
    question: "AI生成的PPT能直接用吗,会不会是人工智障?",
    answer: "还可以,生成的大纲逻辑很好,提供了很多有用的思路,具体内容细节肯定还得自己再编辑一下,帮我节省了很多时间。"
  },
  {
    question: "如果遇到问题,能联系到工作人员吗?",
    answer: "前几天遇到了一些问题,就试着联系了在线客服,马上就有人回复并帮我解决了。"
  }
]

export function MembershipMainContent() {
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false)

  return (
    <>
      <div className="flex-1 p-8 space-y-8">
        {/* User Profile Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                <div className="w-full h-full bg-gradient-to-br from-[var(--tech-gradient-start)] to-[var(--tech-gradient-end)] flex items-center justify-center text-white font-semibold text-xl">
                  用
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold">用户名称</span>
                  <Pencil className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-primary" />
                </div>
                <p className="text-sm text-muted-foreground mt-1">普通用户</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI PPT Feature Promotion */}
        <Card className="bg-gradient-to-br from-[var(--tech-gradient-start)] to-[var(--tech-gradient-end)] text-white border-0">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              <div>
                <h2 className="text-3xl font-bold mb-2">AI智能生成PPT</h2>
                <p className="text-lg opacity-90">输入主题一键生成PPT</p>
              </div>

              {/* Comparison Image Placeholder */}
              <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto my-6">
                <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
                  <p className="text-sm mb-2">传统创作</p>
                  <div className="aspect-video bg-white/20 rounded flex items-center justify-center">
                    <Sparkles className="h-12 w-12 opacity-50" />
                  </div>
                </div>
                <div className="bg-white/10 rounded-lg p-4 backdrop-blur">
                  <p className="text-sm mb-2">+AI智能生成PPT</p>
                  <div className="aspect-video bg-white/20 rounded flex items-center justify-center">
                    <FileText className="h-12 w-12 opacity-50" />
                  </div>
                </div>
              </div>

              {/* Feature Icons */}
              <div className="grid grid-cols-5 gap-4 max-w-3xl mx-auto">
                {membershipBenefits.map((benefit, index) => {
                  const Icon = benefit.icon
                  return (
                    <div key={index} className="text-center">
                      <div className="w-12 h-12 mx-auto mb-2 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur">
                        <Icon className="h-6 w-6" />
                      </div>
                      <p className="text-sm">{benefit.label}</p>
                    </div>
                  )
                })}
              </div>

              <Button
                onClick={() => setPurchaseDialogOpen(true)}
                className="mt-6 bg-white text-primary hover:bg-white/90"
                size="lg"
              >
                立即开通会员
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Benefits Comparison Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">权益对比</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-semibold">权益</th>
                    <th className="text-center p-4 font-semibold">VIP用户</th>
                    <th className="text-center p-4 font-semibold">普通用户</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((row, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-4">{row.benefit}</td>
                      <td className="p-4 text-center">
                        {row.vip === "X" ? (
                          <X className="h-5 w-5 mx-auto text-muted-foreground" />
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <Check className="h-5 w-5 text-green-600" />
                            <span>{row.vip}</span>
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {row.regular === "X" ? (
                          <X className="h-5 w-5 mx-auto text-muted-foreground" />
                        ) : (
                          <span className="text-muted-foreground">{row.regular}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Q&A Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">问大家</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {qaData.map((qa, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-xs font-bold">Q</span>
                  </div>
                  <p className="font-medium">{qa.question}</p>
                </div>
                <div className="ml-9 pl-4 border-l-2 border-muted">
                  <p className="text-muted-foreground">{qa.answer}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Footer QR Code */}
        <div className="text-center space-y-4 pt-8 border-t">
          <p className="text-sm text-muted-foreground">
            更多优惠政策,咨询客服发送"活动"了解
          </p>
          <div className="flex justify-center">
            <div className="w-32 h-32 bg-muted flex items-center justify-center rounded-lg border-2 border-border">
              <QrCode className="h-24 w-24 text-muted-foreground/50" />
            </div>
          </div>
        </div>
      </div>

      <MembershipPurchaseDialog open={purchaseDialogOpen} onOpenChange={setPurchaseDialogOpen} />
    </>
  )
}
