"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"
import { LoginDialog } from "@/components/login-dialog"

interface SiteHeaderProps {
  currentPage?: "home" | "workspace" | "files" | "templates" | "download" | "membership"
  showUser?: boolean
}

export function SiteHeader({ currentPage = "home", showUser = false }: SiteHeaderProps) {
  const [loginDialogOpen, setLoginDialogOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center px-4">
        {/* Logo 和产品名称 - 最左侧 */}
        <div className="flex items-center gap-2 flex-shrink-0 mr-auto">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--tech-gradient-start)] to-[var(--tech-gradient-end)]">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">AiPPT制作师</span>
          </Link>
        </div>

        {/* 功能入口 - 居中 */}
        <nav className="hidden md:flex items-center gap-6 flex-1 justify-center">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              currentPage === "home" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            首页
          </Link>
          <Link
            href="/workspace"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              currentPage === "workspace" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            工作台
          </Link>
          <Link
            href="/library"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              currentPage === "files" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            文件库
          </Link>
          <Link
            href="/templates"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              currentPage === "templates" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            模版中心
          </Link>
          <Link
            href="/download"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              currentPage === "download" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            客户端下载
          </Link>
          <Link
            href="/membership"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              currentPage === "membership" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            开通会员
          </Link>
        </nav>

        {/* 用户中心 - 居右 */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {showUser ? (
            <Button variant="outline" size="sm">
              用户中心
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => setLoginDialogOpen(true)}>
                登录
              </Button>
              <Button
                size="sm"
                className="bg-gradient-to-r from-[var(--tech-gradient-start)] to-[var(--tech-gradient-end)] text-white hover:opacity-90"
              >
                注册
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
    <LoginDialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen} />
    </>
  )
}
