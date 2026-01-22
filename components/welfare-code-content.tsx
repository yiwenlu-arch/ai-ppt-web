"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Gift } from "lucide-react"
import { QrCode } from "lucide-react"

export function WelfareCodeContent() {
  const [code, setCode] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!code.trim()) {
      alert("请输入福利码")
      return
    }

    setIsSubmitting(true)
    try {
      // TODO: 实现福利码验证API调用
      // const response = await fetch('/api/welfare-code', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ code })
      // })
      
      // 模拟提交
      await new Promise(resolve => setTimeout(resolve, 1000))
      alert("福利码兑换成功！")
      setCode("")
    } catch (error) {
      console.error("兑换失败", error)
      alert("兑换失败，请检查福利码是否正确")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex-1 p-8">
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-12">
          <div className="text-center space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">福利码</h1>
              <p className="text-muted-foreground">既是惊喜,也是一份温暖的关怀</p>
            </div>

            {/* Gift Box Image Placeholder */}
            <div className="flex justify-center my-8">
              <div className="relative w-48 h-48 bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 rounded-2xl flex items-center justify-center shadow-lg">
                <Gift className="w-24 h-24 text-pink-600" />
                <div className="absolute inset-0 bg-gradient-to-br from-pink-400/20 to-blue-400/20 rounded-2xl animate-pulse" />
              </div>
            </div>

            {/* Input Field */}
            <div className="space-y-4">
              <Input
                type="text"
                placeholder="请输入福利码,迎接惊喜"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                className="h-12 text-base text-center"
              />
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-[var(--tech-gradient-start)] via-[var(--tech-gradient-mid)] to-[var(--tech-gradient-end)] text-white hover:opacity-90"
              >
                {isSubmitting ? "处理中..." : "确定"}
              </Button>
            </div>

            {/* Footer Info */}
            <div className="pt-8 space-y-4 border-t">
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
        </CardContent>
      </Card>
    </div>
  )
}
