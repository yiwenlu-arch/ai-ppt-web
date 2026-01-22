"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { MembershipSidebar } from "@/components/membership-sidebar"
import { WelfareCodeContent } from "@/components/welfare-code-content"
import { CouponsContent } from "@/components/coupons-content"
import { SubscriptionContent } from "@/components/subscription-content"
import { AccountSecurityContent } from "@/components/account-security-content"
import { MembershipMainContent } from "@/components/membership-main-content"
import { ArrowLeft, User } from "lucide-react"
import { Button } from "@/components/ui/button"

function MembershipContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"welfare" | "coupons" | "subscription" | "security">("welfare")
  const [userInfo, setUserInfo] = useState<{
    username: string
    userType: string
  }>({
    username: "用户名",
    userType: "普通用户"
  })

  useEffect(() => {
    const tab = searchParams.get("tab") as "welfare" | "coupons" | "subscription" | "security" | null
    if (tab && ["welfare", "coupons", "subscription", "security"].includes(tab)) {
      setActiveTab(tab)
    }

    // 从localStorage获取用户信息
    const storedUserInfo = localStorage.getItem('user_info')
    if (storedUserInfo) {
      try {
        const user = JSON.parse(storedUserInfo)
        setUserInfo({
          username: user.username || "用户名",
          userType: user.userType === "vip" ? "VIP用户" : "普通用户"
        })
      } catch (e) {
        console.error("Failed to parse user info", e)
      }
    }
  }, [searchParams])

  const renderContent = () => {
    // 如果没有选择tab，显示主页面
    if (!searchParams.get("tab")) {
      return <MembershipMainContent />
    }

    switch (activeTab) {
      case "welfare":
        return <WelfareCodeContent />
      case "coupons":
        return <CouponsContent />
      case "subscription":
        return <SubscriptionContent />
      case "security":
        return <AccountSecurityContent />
      default:
        return <MembershipMainContent />
    }
  }

  return (
    <>
      {/* Top Bar */}
      <div className="border-b bg-background">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/workspace" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span>返回工作台</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{userInfo.username}</span>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--tech-gradient-start)] to-[var(--tech-gradient-end)] flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex min-h-[calc(100vh-8rem)]">
        <MembershipSidebar activeTab={activeTab} />
        {renderContent()}
      </div>
    </>
  )
}

export default function MembershipPage() {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-muted-foreground">加载中...</div>
        </div>
      }>
        <MembershipContent />
      </Suspense>
    </div>
  )
}
