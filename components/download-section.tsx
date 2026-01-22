"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Smartphone, QrCode } from "lucide-react"

export function DownloadSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-cyan-50/30 to-background -z-10" />

      <div className="container mx-auto py-20 md:py-28">
        <div className="mx-auto max-w-5xl space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              下载<span className="bg-gradient-to-r from-[var(--tech-gradient-start)] via-[var(--tech-gradient-mid)] to-[var(--tech-gradient-end)] bg-clip-text text-transparent">AiPPT制作师</span>移动端
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              随时随地创建、编辑和演示您的PPT。AI智能助手在您手中，让创作不受地点限制。
            </p>
          </div>

          {/* Download Options */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-center text-foreground">
              选择您的平台下载
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Android Card */}
              <Card className="shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="text-center pb-4">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-[var(--tech-gradient-start)] to-[var(--tech-gradient-end)] flex items-center justify-center">
                      <Smartphone className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">Android 客户端下载</CardTitle>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    适用于安卓手机和平板设备
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-center">
                    <div className="bg-white p-4 rounded-lg border-2 border-border">
                      {/* QR Code placeholder - 实际使用时需要替换为真实的二维码图片 */}
                      <div className="w-48 h-48 bg-muted flex items-center justify-center rounded">
                        <QrCode className="h-32 w-32 text-muted-foreground/50" />
                      </div>
                    </div>
                  </div>
                  <p className="text-center text-sm text-muted-foreground">
                    手机扫描二维码下载
                  </p>
                </CardContent>
              </Card>

              {/* iOS Card */}
              <Card className="shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="text-center pb-4">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-[var(--tech-gradient-start)] to-[var(--tech-gradient-end)] flex items-center justify-center">
                      <svg
                        className="h-6 w-6 text-white"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C1.79 15.25 2.18 8.13 9.5 7.9c1.15.13 2.1.56 3.05 1.28.74.59 1.96.59 2.7 0 1.12-.89 2.47-1.26 3.8-1.36 2.87-.23 5.4 1.13 6.98 3.19-6.24 3.74-6.3 10.56-.98 11.27zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                      </svg>
                    </div>
                    <CardTitle className="text-xl">iOS 客户端下载</CardTitle>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    适用于iPhone 和iPad 设备
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-center">
                    <div className="bg-white p-4 rounded-lg border-2 border-border">
                      {/* QR Code placeholder - 实际使用时需要替换为真实的二维码图片 */}
                      <div className="w-48 h-48 bg-muted flex items-center justify-center rounded">
                        <QrCode className="h-32 w-32 text-muted-foreground/50" />
                      </div>
                    </div>
                  </div>
                  <p className="text-center text-sm text-muted-foreground">
                    手机扫描二维码下载
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
