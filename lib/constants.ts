/**
 * 受众枚举
 */
export const AUDIENCE_OPTIONS = [
  { value: "general", label: "大众" },
  { value: "investor", label: "投资者" },
  { value: "business", label: "商业" },
  { value: "student", label: "学生" },
  { value: "teacher", label: "教师" },
  { value: "boss", label: "老板" },
  { value: "interviewer", label: "面试官" },
  { value: "employee", label: "员工" },
  { value: "colleague", label: "同事同行" },
  { value: "visitor", label: "在线访客" },
  { value: "member", label: "组员" },
] as const

/**
 * 场景枚举
 */
export const SCENE_OPTIONS = [
  { value: "general", label: "通用" },
  { value: "analysis", label: "分析报告" },
  { value: "teaching", label: "教学课件" },
  { value: "research", label: "研究报告" },
  { value: "speech", label: "公众演讲" },
  { value: "media", label: "在线媒体" },
  { value: "announcement", label: "公告" },
  { value: "promotion", label: "宣传材料" },
  { value: "academic", label: "学术会议" },
  { value: "project-report", label: "项目汇报" },
  { value: "introduction", label: "个人介绍" },
  { value: "business-plan", label: "商业计划书" },
  { value: "solution", label: "解决方案" },
  { value: "product", label: "产品介绍" },
  { value: "meeting", label: "会议流程" },
  { value: "annual-plan", label: "年度计划" },
  { value: "annual-summary", label: "年度总结" },
  { value: "health", label: "健康科普" },
  { value: "financial", label: "财务报告" },
  { value: "project-plan", label: "项目计划书" },
  { value: "blog", label: "商业博文" },
] as const

/**
 * 语气枚举
 */
export const TONE_OPTIONS = [
  { value: "default", label: "默认" },
  { value: "professional", label: "专业" },
  { value: "motivational", label: "励志" },
  { value: "humorous", label: "幽默" },
  { value: "friendly", label: "亲切" },
  { value: "confident", label: "自信" },
  { value: "gentle", label: "温柔" },
] as const

/**
 * 获取受众标签
 */
export function getAudienceLabel(value: string): string {
  const option = AUDIENCE_OPTIONS.find(opt => opt.value === value)
  return option?.label || "大众"
}

/**
 * 获取场景标签
 */
export function getSceneLabel(value: string): string {
  const option = SCENE_OPTIONS.find(opt => opt.value === value)
  return option?.label || "通用"
}

/**
 * 获取语气标签
 */
export function getToneLabel(value: string): string {
  const option = TONE_OPTIONS.find(opt => opt.value === value)
  return option?.label || "默认"
}
