import Link from "next/link"
import { QrCode } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/50 dark:bg-muted/20">
      <div className="container mx-auto py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 网站导航 */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">网站导航</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-foreground transition-colors">
                  网站首页
                </Link>
              </li>
              <li>
                <Link href="/workspace" className="hover:text-foreground transition-colors">
                  工作台
                </Link>
              </li>
              <li>
                <Link href="/templates" className="hover:text-foreground transition-colors">
                  模版中心
                </Link>
              </li>
              <li>
                <Link href="/membership" className="hover:text-foreground transition-colors">
                  会员中心
                </Link>
              </li>
              <li>
                <Link href="/feedback" className="hover:text-foreground transition-colors">
                  意见反馈
                </Link>
              </li>
              <li>
                <Link href="/tutorial" className="hover:text-foreground transition-colors">
                  使用教程
                </Link>
              </li>
              <li>
                <Link href="/survey" className="hover:text-foreground transition-colors">
                  问卷调查
                </Link>
              </li>
            </ul>
          </div>

          {/* 法律与条款 */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">法律与条款</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/privacy" className="hover:text-foreground transition-colors">
                  隐私政策
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-foreground transition-colors">
                  用户协议
                </Link>
              </li>
              <li>
                <Link href="/algorithm-filing" className="hover:text-foreground transition-colors">
                  模型算法备案信息
                </Link>
              </li>
              <li>
                <Link href="/membership-terms" className="hover:text-foreground transition-colors">
                  会员服务条款
                </Link>
              </li>
            </ul>
          </div>

          {/* 联系我们 */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground">联系我们</h4>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">扫一扫，添加客服微信</p>
              <div className="flex justify-start md:justify-start">
                <div className="bg-white p-3 rounded-lg border-2 border-border inline-block">
                  {/* 客服微信二维码 placeholder - 实际使用时需要替换为真实的二维码图片 */}
                  <div className="w-32 h-32 bg-muted flex items-center justify-center rounded">
                    <QrCode className="h-20 w-20 text-muted-foreground/50" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>备案号: XXXXXXXXXX</p>
        </div>
      </div>
    </footer>
  )
}
