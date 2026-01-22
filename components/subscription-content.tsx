"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { DollarSign } from "lucide-react"

export function SubscriptionContent() {
  const [autoRenewal, setAutoRenewal] = useState(true)

  return (
    <div className="flex-1 p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-yellow-600" />
                </div>
                <CardTitle className="text-2xl">自动续费</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Toggle Switch */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <Label htmlFor="auto-renewal" className="text-base font-medium cursor-pointer">
                开启/关闭自动续费
              </Label>
              <Switch
                id="auto-renewal"
                checked={autoRenewal}
                onCheckedChange={setAutoRenewal}
              />
            </div>

            {/* Cancellation Instructions */}
            <div className="space-y-3 pt-4 border-t">
              <h3 className="font-semibold">其他自动续费取消方式:</h3>
              <div className="bg-muted/30 p-4 rounded-lg space-y-2 text-sm">
                <p className="font-medium">打开"支付宝APP" → 点击"我的" → 点击"设置" → 点击"支付设置" → 点击"免密支付/自动扣款" → 选择"武汉优思干科技有限公司" → 点击"关闭服务"</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
