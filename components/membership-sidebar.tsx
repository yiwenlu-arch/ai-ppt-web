"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Pencil, ChevronRight, Gift, Ticket, CreditCard, Shield, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"

interface MembershipSidebarProps {
  activeTab: "welfare" | "coupons" | "subscription" | "security"
}

export function MembershipSidebar({ activeTab }: MembershipSidebarProps) {
  const router = useRouter()
  const [userInfo, setUserInfo] = useState<{
    username: string
    userType: string
    avatar: string | null
  }>({
    username: "用户名称",
    userType: "普通用户",
    avatar: null
  })

  useEffect(() => {
    // 从localStorage获取用户信息
    const storedUserInfo = localStorage.getItem('user_info')
    if (storedUserInfo) {
      try {
        const user = JSON.parse(storedUserInfo)
        setUserInfo({
          username: user.username || "用户名称",
          userType: user.userType === "vip" ? "VIP用户" : "普通用户",
          avatar: user.avatar || null
        })
      } catch (e) {
        console.error("Failed to parse user info", e)
      }
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_info')
    router.push('/')
  }

  const menuItems = [
    { id: "welfare", label: "福利码", icon: Gift, href: "/membership?tab=welfare" },
    { id: "coupons", label: "优惠券", icon: Ticket, href: "/membership?tab=coupons" },
    { id: "subscription", label: "订阅管理", icon: CreditCard, href: "/membership?tab=subscription" },
    { id: "security", label: "账号与安全", icon: Shield, href: "/membership?tab=security" },
  ]

  return (
    <aside className="w-64 border-r border-border bg-muted/30">
      <div className="p-6">
        {/* User Profile Card */}
        <Card className="p-4 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
              {userInfo.avatar ? (
                <img src={userInfo.avatar} alt={userInfo.username} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[var(--tech-gradient-start)] to-[var(--tech-gradient-end)] flex items-center justify-center text-white font-semibold">
                  {userInfo.username.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{userInfo.username}</span>
                <Pencil className="h-3 w-3 text-muted-foreground cursor-pointer hover:text-primary" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">{userInfo.userType}</p>
            </div>
          </div>
        </Card>

        {/* Navigation Menu */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <Link key={item.id} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full justify-between ${isActive ? "bg-primary text-primary-foreground" : ""}`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            )
          })}
          
          {/* Logout Button */}
          <Button
            variant="ghost"
            className="w-full justify-between text-destructive hover:text-destructive hover:bg-destructive/10 mt-4"
            onClick={handleLogout}
          >
            <div className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              <span>退出登录</span>
            </div>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </nav>
      </div>
    </aside>
  )
}
