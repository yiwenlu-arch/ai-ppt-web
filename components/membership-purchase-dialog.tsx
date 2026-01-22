"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { X, Crown, FileText, List, FolderOpen, Pencil, Download, Headphones, ChevronDown, QrCode } from "lucide-react"
import Link from "next/link"

interface MembershipPurchaseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface MembershipPlan {
  id: string
  name: string
  price: number
  originalPrice: number
  period: string
  dailyPrice: string
  highlight?: boolean
  badge?: string
}

const membershipPlans: MembershipPlan[] = [
  {
    id: "lifetime",
    name: "终身",
    price: 168,
    originalPrice: 499,
    period: "终身",
    dailyPrice: "0.3元/天",
    highlight: true,
    badge: "早买更划算"
  },
  {
    id: "yearly",
    name: "一年",
    price: 108,
    originalPrice: 499,
    period: "一年",
    dailyPrice: "优惠后0.3元/天"
  },
  {
    id: "monthly-continuous",
    name: "连续包月",
    price: 58,
    originalPrice: 499,
    period: "每月",
    dailyPrice: "优惠后0.3元/天"
  },
  {
    id: "monthly",
    name: "一个月",
    price: 68,
    originalPrice: 499,
    period: "一个月",
    dailyPrice: "优惠后0.3元/天"
  }
]

const membershipBenefits = [
  { icon: FileText, label: "AI生成PPT" },
  { icon: List, label: "AI生成大纲" },
  { icon: FolderOpen, label: "海量PPT模板" },
  { icon: Pencil, label: "PPT编辑" },
  { icon: Download, label: "多格式导入" },
  { icon: Headphones, label: "专属客服" }
]

export function MembershipPurchaseDialog({ open, onOpenChange }: MembershipPurchaseDialogProps) {
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan>(membershipPlans[0])
  const [showCouponSelector, setShowCouponSelector] = useState(false)
  const [countdown, setCountdown] = useState({ hours: 23, minutes: 59, seconds: 59 })

  // 模拟倒计时
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        let { hours, minutes, seconds } = prev
        seconds--
        if (seconds < 0) {
          seconds = 59
          minutes--
          if (minutes < 0) {
            minutes = 59
            hours--
            if (hours < 0) {
              hours = 23
            }
          }
        }
        return { hours, minutes, seconds }
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handlePurchase = () => {
    // TODO: 实现购买逻辑
    console.log("购买会员", selectedPlan)
    alert(`正在购买${selectedPlan.name}会员，金额：${selectedPlan.price}元`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto p-0" showCloseButton={false}>
        {/* Header */}
        <div className="bg-gray-800 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full bg-white"></div>
            </div>
            <div>
              <div className="font-medium">用户名称用户名称</div>
              <div className="text-sm text-gray-300">普通用户</div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
            className="text-white hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex">
          {/* Left Sidebar - Benefits */}
          <div className="w-64 border-r p-6 bg-muted/30">
            <div className="flex items-center gap-2 mb-6">
              <Crown className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">会员权益</h3>
            </div>
            <div className="space-y-4">
              {membershipBenefits.map((benefit, index) => {
                const Icon = benefit.icon
                return (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm">{benefit.label}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right Content */}
          <div className="flex-1 p-6 space-y-6">
            {/* Membership Plans */}
            <div className="grid grid-cols-4 gap-4">
              {membershipPlans.map((plan) => (
                <Card
                  key={plan.id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    plan.highlight ? "ring-2 ring-primary bg-primary/5" : ""
                  }`}
                  onClick={() => setSelectedPlan(plan)}
                >
                  <CardContent className="p-4 text-center space-y-3">
                    {plan.badge && (
                      <div className="text-xs bg-yellow-400 text-yellow-900 px-2 py-1 rounded font-semibold">
                        {plan.badge}
                      </div>
                    )}
                    <div className="text-2xl font-bold">{plan.price}元</div>
                    <div className="text-xs text-muted-foreground line-through">
                      原价¥{plan.originalPrice}
                    </div>
                    <div className="text-xs text-muted-foreground">{plan.dailyPrice}</div>
                    <Button
                      size="sm"
                      className={`w-full ${
                        plan.highlight
                          ? "bg-gradient-to-r from-[var(--tech-gradient-start)] to-[var(--tech-gradient-end)] text-white"
                          : ""
                      }`}
                      variant={plan.highlight ? "default" : "outline"}
                    >
                      {plan.highlight ? "限时开放" : "选择"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Countdown and Coupon */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-sm">限时开放:</span>
                <span className="font-mono font-bold text-red-600">
                  {String(countdown.hours).padStart(2, "0")} : {String(countdown.minutes).padStart(2, "0")} : {String(countdown.seconds).padStart(2, "0")}
                </span>
                <span className="text-sm">后即将关闭永久会员套餐</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCouponSelector(!showCouponSelector)}
              >
                选择优惠券
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </div>

            {/* Payment Section */}
            <div className="flex gap-6">
              {/* QR Code */}
              <div className="w-48 h-48 bg-white border-2 border-border rounded-lg flex items-center justify-center">
                <QrCode className="h-32 w-32 text-muted-foreground/50" />
              </div>

              {/* Payment Info */}
              <div className="flex-1 space-y-4">
                <div>
                  <span className="text-sm text-muted-foreground">支付金额: </span>
                  <span className="text-2xl font-bold text-red-600">{selectedPlan.price}元</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">使用</span>
                  <div className="flex gap-2">
                    <div className="w-6 h-6 rounded bg-green-500"></div>
                    <div className="w-6 h-6 rounded bg-blue-500"></div>
                  </div>
                  <span className="text-sm">/支付宝扫码支付</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  支付即视为您已同意
                  <Link href="/member-terms" className="text-primary hover:underline">
                    《会员服务条款》
                  </Link>
                </div>
                <Button
                  onClick={handlePurchase}
                  className="w-full bg-gradient-to-r from-[var(--tech-gradient-start)] to-[var(--tech-gradient-end)] text-white hover:opacity-90"
                >
                  确认支付
                </Button>
              </div>
            </div>

            {/* Notification Bar */}
            <div className="bg-primary/10 text-primary px-4 py-2 rounded-lg flex items-center gap-2 text-sm">
              <div className="w-6 h-6 rounded-full bg-primary/20"></div>
              <span>无名之辈5分钟前购买了年度VIP</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
