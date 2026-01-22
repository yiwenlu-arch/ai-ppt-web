"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Sparkles, Search, Zap, FileText, Layout } from "lucide-react"
import { AUDIENCE_OPTIONS, SCENE_OPTIONS, TONE_OPTIONS, getAudienceLabel, getSceneLabel, getToneLabel } from "@/lib/constants"
import { DocumentGenerator } from "@/components/document-generator"

const SUGGESTED_TOPICS = [
  "公司年会策划方案",
  "市场调研的重要性与方法探讨",
  "安全培训",
  "简单高效的文案策划技巧",
  "自我介绍技巧",
  "校园文化节活动方案",
  "心理健康与压力管理",
  "年终工作总结"
]

export function HeroSection() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("theme")
  const [topic, setTopic] = useState("")
  const [audience, setAudience] = useState("general") // 默认值：大众
  const [tone, setTone] = useState("default") // 默认值：默认
  const [scenario, setScenario] = useState("general") // 默认值：通用
  const [deepThink, setDeepThink] = useState(false)
  const [webSearch, setWebSearch] = useState(false)

  const handleGenerate = () => {
    const params = new URLSearchParams({
      topic: topic || "输入需要生成的PPT主题",
      audience,
      tone,
      scenario,
      deepThink: deepThink.toString(),
      webSearch: webSearch.toString(),
    })
    router.push(`/workspace?${params}`)
  }

  return (
    <section className="relative overflow-hidden border-b">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-cyan-50/30 to-background -z-10" />

      <div className="container mx-auto py-20 md:py-28">
        <div className="mx-auto max-w-4xl text-center space-y-8">
          {/* Hero heading */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-balance">AI一键生成专业精美PPT</h1>
            <p className="text-lg md:text-xl text-muted-foreground text-pretty max-w-3xl mx-auto">
              只需输入您的想法，AI智能助手即可为您生成结构完整、设计精美的演示文稿。支持一键导出，多种模板选择，让您专注于内容创作。
            </p>
          </div>

          {/* Generation form */}
          <div className="mx-auto max-w-[984px]">
            <div className="rounded-2xl border bg-card p-6 shadow-lg space-y-4">
              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="theme" className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    主题生成PPT
                  </TabsTrigger>
                  <TabsTrigger value="document" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    文档生成PPT
                  </TabsTrigger>
                  <TabsTrigger 
                    value="template" 
                    className="flex items-center gap-2"
                    onClick={(e) => {
                      e.preventDefault()
                      router.push('/templates')
                    }}
                  >
                    <Layout className="h-4 w-4" />
                    模版生成PPT
                  </TabsTrigger>
                </TabsList>

                {/* 主题生成PPT */}
                <TabsContent value="theme" className="space-y-4 mt-4">
              {/* 输入区域 + 左下角高级选项 */}
              <div className="relative">
                <Textarea
                  placeholder="输入需要生成的PPT主题，比如工作总结"
                  className="min-h-[203px] pr-4 pb-20 pt-4 pl-4 resize-none text-base"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
                <div className="absolute left-4 bottom-4 flex flex-wrap gap-2">
                  <Button
                    variant={deepThink ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDeepThink(!deepThink)}
                    className={
                      deepThink ? "bg-gradient-to-r from-[var(--tech-gradient-start)] to-[var(--tech-gradient-end)]" : ""
                    }
                  >
                    <Zap className="h-4 w-4 mr-1" />
                    深度思考（R1）
                  </Button>
                  <Button
                    variant={webSearch ? "default" : "outline"}
                    size="sm"
                    onClick={() => setWebSearch(!webSearch)}
                    className={
                      webSearch ? "bg-gradient-to-r from-[var(--tech-gradient-start)] to-[var(--tech-gradient-end)]" : ""
                    }
                  >
                    <Search className="h-4 w-4 mr-1" />
                    联网搜索
                  </Button>
                </div>
              </div>

              {/* Configuration */}
              <div className="flex flex-wrap gap-3 justify-start">
                <Select value={audience} onValueChange={setAudience}>
                  <SelectTrigger>
                    <SelectValue>
                      {audience ? `受众：${getAudienceLabel(audience)}` : "受众"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {AUDIENCE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger>
                    <SelectValue>
                      {tone ? `语气：${getToneLabel(tone)}` : "语气"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {TONE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={scenario} onValueChange={setScenario}>
                  <SelectTrigger>
                    <SelectValue>
                      {scenario ? `场景：${getSceneLabel(scenario)}` : "场景"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {SCENE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-[var(--tech-gradient-start)] via-[var(--tech-gradient-mid)] to-[var(--tech-gradient-end)] text-white text-base font-semibold hover:opacity-90 transition-opacity"
                onClick={handleGenerate}
              >
                <Sparkles className="h-5 w-5 mr-2" />
                生成PPT
              </Button>

              {/* Suggested topics */}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  常用主题推荐：
                </p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_TOPICS.map((suggested) => (
                    <Badge
                      key={suggested}
                      variant="secondary"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors bg-secondary/30"
                      onClick={() => {
                        const params = new URLSearchParams({
                          topic: suggested,
                          audience,
                          tone,
                          scenario,
                          deepThink: deepThink.toString(),
                          webSearch: webSearch.toString(),
                        })
                        router.push(`/workspace?${params}`)
                      }}
                    >
                      {suggested}
                    </Badge>
                  ))}
                </div>
              </div>
                </TabsContent>

                {/* 文档生成PPT */}
                <TabsContent value="document" className="mt-4">
                  <DocumentGenerator />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
