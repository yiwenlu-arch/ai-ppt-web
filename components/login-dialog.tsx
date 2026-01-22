"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Sparkles, X, Smartphone } from "lucide-react"
import Link from "next/link"
import { signInWithPassword, signUp } from "@/lib/supabase-auth"

interface LoginDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultMode?: "account" | "phone"
}

export function LoginDialog({ open, onOpenChange, defaultMode = "account" }: LoginDialogProps) {
  const [loginMode, setLoginMode] = useState<"account" | "phone">(defaultMode)
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")
  const [agreed, setAgreed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async () => {
    if (!agreed) {
      alert("请先同意《用户协议》和《隐私政策》")
      return
    }

    if (isRegister) {
      // 注册
      if (!email || !password) {
        alert("请输入邮箱和密码")
        return
      }
    } else {
      // 登录
      if (!email || !password) {
        alert("请输入邮箱和密码")
        return
      }
    }

    setIsLoading(true)
    try {
      let result
      
      if (isRegister) {
        // 注册
        result = await signUp(email, password, {
          username: username || undefined,
          phone: phone || undefined,
        })
      } else {
        // 登录
        result = await signInWithPassword(email, password)
      }
      
      if (!result.success) {
        throw new Error(result.message || '操作失败')
      }
      
      console.log(isRegister ? "注册成功" : "登录成功", result.data)
      
      // 登录成功后关闭弹窗
      onOpenChange(false)
      
      // 刷新页面以更新用户状态
      window.location.reload()
    } catch (error) {
      console.error(isRegister ? "注册失败" : "登录失败", error)
      alert(error instanceof Error ? error.message : (isRegister ? "注册失败" : "登录失败，请检查邮箱和密码"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden" showCloseButton={false}>
        {/* Top Bar */}
        <div className="bg-muted/50 px-6 py-2 border-b">
          <p className="text-sm text-muted-foreground">
            {isRegister ? "注册" : "登录"}
          </p>
        </div>

        {/* Header */}
        <DialogHeader className="px-6 pt-4 pb-4 border-b">
          <div className="flex items-center justify-between">
            {/* Logo and Name */}
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--tech-gradient-start)] to-[var(--tech-gradient-end)]">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold">AiPPT制作师</span>
            </div>
            
            {/* Right side: Close Button */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Title */}
          <div className="text-center">
            <h2 className="text-2xl font-bold">
              {isRegister ? "注册账号" : "邮箱登录"}
            </h2>
          </div>

          {/* Input Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="请输入邮箱"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 text-base"
              />
            </div>
            
            {isRegister && (
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="用户名（可选）"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-12 text-base"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="请输入密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 text-base"
              />
            </div>
          </div>

          {/* Login/Register Button */}
          <Button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-[var(--tech-gradient-start)] via-[var(--tech-gradient-mid)] to-[var(--tech-gradient-end)] text-white hover:opacity-90 transition-opacity"
          >
            {isLoading ? (isRegister ? "注册中..." : "登录中...") : (isRegister ? "注册" : "登录")}
          </Button>
          
          {/* Switch between Login and Register */}
          <div className="text-center text-sm text-muted-foreground">
            {isRegister ? (
              <span>
                已有账号？{" "}
                <button
                  onClick={() => setIsRegister(false)}
                  className="text-primary hover:underline"
                >
                  立即登录
                </button>
              </span>
            ) : (
              <span>
                还没有账号？{" "}
                <button
                  onClick={() => setIsRegister(true)}
                  className="text-primary hover:underline"
                >
                  立即注册
                </button>
              </span>
            )}
          </div>

          {/* Social Login Options */}
          <div className="flex items-center justify-center gap-4 pt-2">
            <button
              className="flex items-center justify-center w-10 h-10 rounded-full border border-border hover:bg-muted transition-colors"
              title="微信登录"
              onClick={() => {
                // TODO: 实现微信登录
                alert("微信登录功能开发中")
              }}
            >
              <svg className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.042-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.598-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 3.336c-1.693-.077-3.668.514-5.18 1.83-1.63 1.353-2.555 3.61-1.714 6.073.578 1.713 1.7 3.06 3.152 3.815a.595.595 0 0 1 .282.636l-.119.455c-.032.12-.1.23-.19.316a.304.304 0 0 1-.324.064l-1.622-.596a.84.84 0 0 0-.71.044 9.476 9.476 0 0 1-3.518.665c-.2 0-.4-.01-.6-.025-4.122-.306-7.384-3.226-7.632-6.782-.217-3.127 2.288-5.834 5.602-6.418a9.54 9.54 0 0 1 1.62-.14h.002c.276 0 .543.027.811.042-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838.276.02.55.05.81.09-1.12 1.807-1.645 3.903-1.55 5.98z" />
              </svg>
            </button>
            <button
              className="flex items-center justify-center w-10 h-10 rounded-full border border-border hover:bg-muted transition-colors"
              title="支付宝登录"
              onClick={() => {
                // TODO: 实现支付宝登录
                alert("支付宝登录功能开发中")
              }}
            >
              <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21.714 2.431H2.286A2.286 2.286 0 0 0 0 4.717v14.566a2.286 2.286 0 0 0 2.286 2.286h19.428A2.286 2.286 0 0 0 24 19.283V4.717a2.286 2.286 0 0 0-2.286-2.286zm-1.714 16H4v-2.857h16v2.857zm0-5.714H4V9.857h16v2.857zm0-5.714H4V4.143h16v2.857z" />
              </svg>
            </button>
            <button
              className="flex items-center justify-center w-10 h-10 rounded-full border border-border hover:bg-muted transition-colors"
              title="手机号登录"
              onClick={() => setLoginMode("phone")}
            >
              <Smartphone className="w-5 h-5" />
            </button>
          </div>

          {/* Terms and Conditions */}
          <div className="flex items-center justify-center gap-2 pt-2">
            <Checkbox
              id="agree-terms"
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(checked === true)}
            />
            <label
              htmlFor="agree-terms"
              className="text-sm text-muted-foreground cursor-pointer"
            >
              我已同意
              <Link href="/terms" className="text-primary hover:underline mx-1">
                《用户协议》
              </Link>
              <Link href="/privacy" className="text-primary hover:underline mx-1">
                《隐私政策》
              </Link>
            </label>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
