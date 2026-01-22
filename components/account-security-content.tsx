"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PasswordInput } from "@/components/ui/password-input"
import { Checkbox } from "@/components/ui/checkbox"
import { Phone, Shield, Lock, MessageCircle, CreditCard, X } from "lucide-react"

interface AccountBinding {
  phone: { value: string; bound: boolean }
  wechat: { bound: boolean }
  alipay: { bound: boolean }
}

export function AccountSecurityContent() {
  const [accountBinding, setAccountBinding] = useState<AccountBinding>({
    phone: { value: "176****6775", bound: true },
    wechat: { bound: false },
    alipay: { bound: false }
  })
  const [passwordSet, setPasswordSet] = useState(false)
  
  // Dialog states
  const [setPasswordDialogOpen, setSetPasswordDialogOpen] = useState(false)
  const [changePasswordDialogOpen, setChangePasswordDialogOpen] = useState(false)
  const [cancelAccountDialogOpen, setCancelAccountDialogOpen] = useState(false)
  const [cancelAccountStep, setCancelAccountStep] = useState(1) // 1: notice, 2: confirm
  
  // Password form states
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [oldPassword, setOldPassword] = useState("")
  const [changeNewPassword, setChangeNewPassword] = useState("")
  const [changeConfirmPassword, setChangeConfirmPassword] = useState("")
  
  // Cancel account states
  const [cancelConfirmText, setCancelConfirmText] = useState("")
  const [cancelAgreed, setCancelAgreed] = useState(false)

  useEffect(() => {
    // 从localStorage获取用户信息
    const storedUserInfo = localStorage.getItem('user_info')
    if (storedUserInfo) {
      try {
        const user = JSON.parse(storedUserInfo)
        if (user.phone) {
          const maskedPhone = user.phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2")
          setAccountBinding(prev => ({
            ...prev,
            phone: { value: maskedPhone, bound: true }
          }))
        }
      } catch (e) {
        console.error("Failed to parse user info", e)
      }
    }
  }, [])

  const handleBindWechat = () => {
    // TODO: 实现微信绑定
    alert("微信绑定功能开发中")
  }

  const handleBindAlipay = () => {
    // TODO: 实现支付宝绑定
    alert("支付宝绑定功能开发中")
  }

  const handleSetPassword = () => {
    if (!newPassword || !confirmPassword) {
      alert("请输入密码")
      return
    }
    if (newPassword !== confirmPassword) {
      alert("两次输入的密码不一致")
      return
    }
    if (newPassword.length < 6) {
      alert("密码长度不能少于6位")
      return
    }
    // TODO: 实现设置密码API
    console.log("设置密码", newPassword)
    setPasswordSet(true)
    setSetPasswordDialogOpen(false)
    setNewPassword("")
    setConfirmPassword("")
    alert("密码设置成功")
  }

  const handleChangePassword = () => {
    if (!oldPassword || !changeNewPassword || !changeConfirmPassword) {
      alert("请填写所有字段")
      return
    }
    if (changeNewPassword !== changeConfirmPassword) {
      alert("两次输入的新密码不一致")
      return
    }
    if (changeNewPassword.length < 6) {
      alert("新密码长度不能少于6位")
      return
    }
    // TODO: 实现修改密码API
    console.log("修改密码")
    setChangePasswordDialogOpen(false)
    setOldPassword("")
    setChangeNewPassword("")
    setChangeConfirmPassword("")
    alert("密码修改成功")
  }

  const handleCancelAccount = () => {
    if (cancelAccountStep === 1) {
      if (!cancelAgreed) {
        alert("请先同意并充分理解以上内容")
        return
      }
      setCancelAccountStep(2)
    } else {
      if (cancelConfirmText !== "我确认要注销") {
        alert('请输入"我确认要注销"')
        return
      }
      // TODO: 实现注销账号API
      console.log("注销账号")
      alert("账号注销成功")
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_info')
      window.location.href = '/'
    }
  }

  return (
    <>
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Account Binding Management */}
          <Card>
            <CardHeader>
              <CardTitle>账号绑定管理</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Phone Binding */}
              <div className="flex items-center justify-between py-3 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">绑定手机号</div>
                    <div className="text-sm text-muted-foreground">
                      {accountBinding.phone.bound ? accountBinding.phone.value : "未绑定"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {accountBinding.phone.bound && (
                    <span className="text-sm text-green-600">已绑定</span>
                  )}
                </div>
              </div>

              {/* WeChat Binding */}
              <div className="flex items-center justify-between py-3 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <MessageCircle className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">绑定微信</div>
                    <div className="text-sm text-muted-foreground">
                      {accountBinding.wechat.bound ? "已绑定" : "未绑定"}
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBindWechat}
                  disabled={accountBinding.wechat.bound}
                >
                  {accountBinding.wechat.bound ? "已绑定" : "绑定"}
                </Button>
              </div>

              {/* Alipay Binding */}
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">绑定支付宝</div>
                    <div className="text-sm text-muted-foreground">
                      {accountBinding.alipay.bound ? "已绑定" : "未绑定"}
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBindAlipay}
                  disabled={accountBinding.alipay.bound}
                >
                  {accountBinding.alipay.bound ? "已绑定" : "绑定"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle>安全</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Login Password */}
              <div className="flex items-center justify-between py-3 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">登录密码</div>
                    <div className="text-sm text-muted-foreground">
                      {passwordSet ? "已设置" : "未设置"}
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (passwordSet) {
                      setChangePasswordDialogOpen(true)
                    } else {
                      setSetPasswordDialogOpen(true)
                    }
                  }}
                >
                  管理
                </Button>
              </div>

              {/* Cancel Account */}
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">注销账号</div>
                    <div className="text-sm text-muted-foreground">注销后无法恢复</div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    setCancelAccountDialogOpen(true)
                    setCancelAccountStep(1)
                  }}
                >
                  注销
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Set Password Dialog */}
      <Dialog open={setPasswordDialogOpen} onOpenChange={setSetPasswordDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>设置登录密码</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="set-password">输入密码</Label>
              <PasswordInput
                id="set-password"
                placeholder="输入密码"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="set-confirm-password">确认密码</Label>
              <PasswordInput
                id="set-confirm-password"
                placeholder="再次输入密码"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <Button
              onClick={handleSetPassword}
              className="w-full bg-gradient-to-r from-[var(--tech-gradient-start)] via-[var(--tech-gradient-mid)] to-[var(--tech-gradient-end)] text-white hover:opacity-90"
            >
              确定
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={changePasswordDialogOpen} onOpenChange={setChangePasswordDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>修改登录密码</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="old-password">输入旧密码</Label>
              <PasswordInput
                id="old-password"
                placeholder="输入旧密码"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="change-new-password">设置新密码</Label>
              <PasswordInput
                id="change-new-password"
                placeholder="输入密码"
                value={changeNewPassword}
                onChange={(e) => setChangeNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="change-confirm-password">确认密码</Label>
              <PasswordInput
                id="change-confirm-password"
                placeholder="再次输入密码"
                value={changeConfirmPassword}
                onChange={(e) => setChangeConfirmPassword(e.target.value)}
              />
            </div>
            <Button
              onClick={handleChangePassword}
              className="w-full bg-gradient-to-r from-[var(--tech-gradient-start)] via-[var(--tech-gradient-mid)] to-[var(--tech-gradient-end)] text-white hover:opacity-90"
            >
              确定
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Account Dialog - Step 1: Notice */}
      <Dialog open={cancelAccountDialogOpen && cancelAccountStep === 1} onOpenChange={(open) => {
        if (!open) {
          setCancelAccountDialogOpen(false)
          setCancelAccountStep(1)
          setCancelAgreed(false)
        }
      }}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>注销账号</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-3 text-sm">
              <p className="font-semibold">注销账号须知:</p>
              <div className="space-y-2 pl-4">
                <p className="font-semibold text-orange-600">【重要提醒】</p>
                <p>账号注销操作不可逆，请您在注销前备份好相关数据，并仔细阅读以下内容。如有疑问，请联系客服协助处理。</p>
                
                <p className="font-semibold mt-4">1. 账号注销后，您将永久失去以下内容：</p>
                <p>账号注销后，您的账号及账号内的所有内容、信息将被永久删除，且无法恢复。即使您使用相同的手机号或第三方账号重新注册，也无法恢复原有账号的任何内容或信息。具体包括但不限于：</p>
                <p>(1) 无法使用该账号登录；</p>
                <p>(2) 账号内的个人资料和历史信息将被删除（包括但不限于用户ID、昵称、用户数据等）；</p>
                <p>(3) 账号内正在使用的增值服务将失效（如VIP会员、虚拟货币等），且无法就上述增值服务提出任何退款或补偿要求。</p>
                
                <p className="font-semibold mt-4">2. 账号注销的限制：</p>
                <p>如您的账号处于投诉、举报或被国家有权机关调查的状态，或您的账号涉及诉讼、仲裁等争议，我们有权在不经您同意的情况下终止注销流程。</p>
                
                <p className="font-semibold mt-4">3. 账号注销后的责任：</p>
                <p>账号注销并不代表您注销前的账号行为和相关责任得到豁免或减轻。</p>
                
                <p className="font-semibold mt-4">4. 账号注销后的数据处理：</p>
                <p>我们将按照法律法规的要求，在合理期限内删除您的账号相关信息及内容。</p>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-4 border-t">
              <Checkbox
                id="cancel-agree"
                checked={cancelAgreed}
                onCheckedChange={(checked) => setCancelAgreed(checked === true)}
              />
              <Label htmlFor="cancel-agree" className="cursor-pointer">
                我已同意并充分理解以上内容
              </Label>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setCancelAccountDialogOpen(false)
                  setCancelAgreed(false)
                }}
              >
                取消
              </Button>
              <Button
                onClick={handleCancelAccount}
                disabled={!cancelAgreed}
                className="bg-gradient-to-r from-[var(--tech-gradient-start)] to-[var(--tech-gradient-end)] text-white hover:opacity-90"
              >
                下一步
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Account Dialog - Step 2: Confirm */}
      <Dialog open={cancelAccountDialogOpen && cancelAccountStep === 2} onOpenChange={(open) => {
        if (!open) {
          setCancelAccountDialogOpen(false)
          setCancelAccountStep(1)
          setCancelConfirmText("")
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>提示</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <p className="font-semibold">注销意味着:</p>
              <ul className="space-y-2 pl-4">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <span>账号永久失效</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <span>个人资料、记录全部清空</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <span>无法使用原有身份登录</span>
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                输入"我确认要注销"后,点击下方【确认注销】按钮
              </p>
              <Input
                placeholder="请输入"
                value={cancelConfirmText}
                onChange={(e) => setCancelConfirmText(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setCancelAccountDialogOpen(false)
                  setCancelAccountStep(1)
                  setCancelConfirmText("")
                }}
              >
                取消
              </Button>
              <Button
                onClick={handleCancelAccount}
                disabled={cancelConfirmText !== "我确认要注销"}
                className="bg-gray-500 text-white hover:bg-gray-600"
              >
                确认注销
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
