"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Ticket } from "lucide-react"

interface Coupon {
  id: string
  amount: number
  description: string
  condition: string
  timeLeft: string
  status: "available" | "used" | "expired"
}

export function CouponsContent() {
  const [coupons, setCoupons] = useState<Coupon[]>([])

  useEffect(() => {
    // TODO: 从API获取优惠券列表
    // 模拟数据
    setCoupons([
      {
        id: "1",
        amount: 20,
        description: "满169元立减20元(开学季限时特惠)",
        condition: "满169元可用",
        timeLeft: "71:58:59",
        status: "available"
      },
      {
        id: "2",
        amount: 20,
        description: "问卷调查",
        condition: "无门槛",
        timeLeft: "06:59:59",
        status: "available"
      }
    ])
  }, [])

  const handleUseCoupon = (couponId: string) => {
    // TODO: 实现使用优惠券逻辑
    console.log("使用优惠券", couponId)
    // 可以跳转到会员购买页面并应用优惠券
  }

  return (
    <div className="flex-1 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Title */}
        <div>
          <h1 className="text-3xl font-bold mb-2">可用优惠券</h1>
        </div>

        {/* Coupons List */}
        <div className="space-y-4">
          {coupons.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Ticket className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">暂无可用优惠券</p>
              </CardContent>
            </Card>
          ) : (
            coupons.map((coupon) => (
              <Card key={coupon.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex items-center">
                    {/* Left: Amount */}
                    <div className="w-32 bg-gradient-to-br from-[var(--tech-gradient-start)] to-[var(--tech-gradient-end)] text-white p-6 flex flex-col items-center justify-center">
                      <div className="text-3xl font-bold">{coupon.amount}</div>
                      <div className="text-sm mt-1">元</div>
                    </div>

                    {/* Center: Description */}
                    <div className="flex-1 p-6">
                      <h3 className="font-semibold text-lg mb-1">{coupon.description}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{coupon.condition}</p>
                      <div className="flex items-center gap-2 text-sm text-orange-600">
                        <span>仅剩</span>
                        <span className="font-mono font-bold">{coupon.timeLeft}</span>
                      </div>
                    </div>

                    {/* Right: Action Button */}
                    <div className="p-6">
                      <Button
                        onClick={() => handleUseCoupon(coupon.id)}
                        className="bg-gradient-to-r from-[var(--tech-gradient-start)] to-[var(--tech-gradient-end)] text-white hover:opacity-90"
                      >
                        去使用
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
