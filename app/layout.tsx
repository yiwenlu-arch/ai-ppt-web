import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/sonner"
import Script from "next/script"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AiPPT - AI一键生成专业精美PPT",
  description:
    "只需输入您的想法，AI智能助手即可为您生成结构完整、设计精美的演示文稿。支持一键导出，多种模板选择，让您专注于内容创作。",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <body className={`font-sans antialiased`}>
        {/* ✅ 方案 1：HTML 中直接引入 WPS SDK v1.1.19（推荐，最简单，零配置） */}
        {/* 引入v1.1.19离线SDK，纯内网地址，加载优先级最高 */}
        {/* 使用 strategy="beforeInteractive" 确保在页面交互前加载，Next.js 会自动注入到 <head> */}
        {/* 注意：Server Component 中不能使用 onLoad/onError，组件内会自动检查 SDK 是否加载 */}
        {/* 注意：请将 v1.1.19 SDK 文件部署到 /static/wps/wpsonline.js */}
        <Script
          src="/static/wps/wpsonline.js"
          strategy="beforeInteractive"
        />
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
