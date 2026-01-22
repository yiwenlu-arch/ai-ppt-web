/**
 * API 配置和工具函数
 */

// 后端 API 基础 URL
// 从环境变量获取，如果没有配置则使用默认值
// Next.js 项目使用 process.env.NEXT_PUBLIC_* 来暴露环境变量到客户端
// 如果环境变量未设置，自动检测当前访问的服务器地址（支持局域网访问）
function getApiBaseUrl(): string {
  // 优先使用环境变量
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL
  }
  
  // 如果未配置环境变量，自动检测当前访问的服务器地址
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname
    // 如果是 localhost 或 127.0.0.1，使用默认值
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000'
    }
    // 否则使用当前访问的服务器地址（支持局域网访问）
    return `http://${hostname}:5000`
  }
  
  // 服务端渲染时使用默认值
  return 'http://localhost:5000'
}

const API_BASE_URL = getApiBaseUrl()

/**
 * 模板信息接口
 */
export interface TemplateInfo {
  pptx_id: string
  file_name: string
  title: string
  download_url: string
  theme_color: string
  page_size: number
  priority: number
}

/**
 * 模板查询响应
 */
export interface TemplateListResponse {
  code: number
  message: string
  data: TemplateInfo[]
}

/**
 * 获取模板封面五宫格图URL
 * @param pptx_id 模板ID
 * @returns 封面图URL
 */
export function getTemplateThumbnailUrl(pptx_id: string): string {
  return `https://ysg-aippt.oss-cn-hangzhou.aliyuncs.com/pptx-templates/thumbnails/${pptx_id}.png`
}

/**
 * 获取模板页面预览图URL
 * @param pptx_id 模板ID
 * @param pageNumber 页码（从1开始）
 * @returns 页面预览图URL
 */
export function getTemplatePagePreviewUrl(pptx_id: string, pageNumber: number): string {
  return `https://ysg-aippt.oss-cn-hangzhou.aliyuncs.com/pptx-templates/preview-images/${pptx_id}/page_${pageNumber}.png`
}

/**
 * PPT生成响应（外部API）
 */
export interface GeneratePPTExternalResponse {
  code: number
  message: string
  data: {
    file_id: string
    file_name: string
    local_file?: {
      id: string
      name: string
      path: string
      size: number
      date: string
      time: string
    }
  }
}

/**
 * 生成 PPT 的请求参数
 */
export interface GeneratePPTRequest {
  topic: string
  audience?: string
  tone?: string
  scene?: string
  deepThink?: boolean
  webSearch?: boolean
  outline?: OutlineResponse['data']
  templateId?: string
}

/**
 * 生成 PPT
 * @param params 生成参数
 * @returns Promise<Blob> PPT 文件的 Blob 对象
 */
export async function generatePPT(params: GeneratePPTRequest): Promise<Blob> {
  try {
    // 使用环境变量配置的 API 基础 URL，拼接 API 端点
    const apiUrl = `${API_BASE_URL}/api/generate-ppt`
    
    // 调试信息（开发环境）
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 调用 API:', apiUrl)
      console.log('📝 请求参数:', {
        topic: params.topic,
        audience: params.audience,
        tone: params.tone,
        scene: params.scene,
        templateId: params.templateId,
        hasOutline: !!params.outline,
      })
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic: params.topic,
        audience: params.audience,
        tone: params.tone,
        scene: params.scene,
        outline: params.outline,
        templateId: params.templateId,
      }),
    })

    if (!response.ok) {
      // 尝试解析错误信息
      let errorMessage = '生成 PPT 失败'
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorMessage
      } catch {
        errorMessage = `服务器错误: ${response.status} ${response.statusText}`
      }
      throw new Error(errorMessage)
    }

    // 返回文件 Blob
    const blob = await response.blob()
    return blob
  } catch (error) {
    // 更详细的错误处理
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(`无法连接到后端服务器 (${API_BASE_URL})。请确保后端服务正在运行。`)
    }
    if (error instanceof Error) {
      throw error
    }
    throw new Error('网络错误，请检查后端服务是否运行')
  }
}

/**
 * 下载文件
 * @param blob 文件 Blob 对象
 * @param filename 文件名
 */
export function downloadFile(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}

/**
 * 生成大纲的响应结构
 */
export interface OutlineResponse {
  success: boolean
  data?: {
    title: string
    subtitle?: string
    slides: Array<{
      type: 'title' | 'content'
      title: string
      subtitle?: string
      items?: string[]
    }>
  }
  rawMarkdown?: string // 原始Markdown格式的大纲
  message?: string
}

/**
 * 生成大纲
 * @param params 生成参数
 * @returns Promise<OutlineResponse> 大纲结构（包含原始Markdown）
 */
/**
 * 流式生成大纲（SSE）
 * @param params 生成参数
 * @param onStatus 状态更新回调
 * @param onContent 内容更新回调
 * @param onParsed 解析完成回调
 * @param onError 错误回调
 */
export async function generateOutlineStream(
  params: GeneratePPTRequest,
  callbacks: {
    onStatus?: (message: string) => void
    onContent?: (text: string) => void
    onParsed?: (data: OutlineResponse['data']) => void
    onError?: (error: string) => void
  }
): Promise<void> {
  try {
    const apiUrl = `${API_BASE_URL}/api/generate-outline-stream`
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic: params.topic,
        audience: params.audience,
        tone: params.tone,
        scene: params.scene,
      }),
    })

    if (!response.ok) {
      // 尝试解析错误响应体，获取更详细的错误信息
      let errorMessage = `HTTP error! status: ${response.status}`
      try {
        // 尝试读取响应体（可能是JSON）
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json()
          if (errorData.message) {
            errorMessage = errorData.message
          } else if (errorData.error) {
            errorMessage = errorData.error
          }
        } else {
          // 如果不是JSON，尝试读取文本
          const text = await response.text()
          if (text) {
            errorMessage = text
          }
        }
      } catch (parseError) {
        // 如果无法解析响应，使用默认错误信息
        console.warn('无法解析错误响应:', parseError)
      }
      throw new Error(errorMessage)
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('无法读取响应流')
    }

    const decoder = new TextDecoder('utf-8')
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        // 处理剩余的 buffer
        if (buffer.trim()) {
          const lines = buffer.split('\n\n')
          for (const line of lines) {
            if (line.trim() && line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))
                if (data.type === 'content') {
                  callbacks.onContent?.(data.text)
                }
              } catch (parseError) {
                console.error('解析SSE数据失败:', parseError)
              }
            }
          }
        }
        break
      }

      // 解码数据，确保正确处理 UTF-8
      const chunk = decoder.decode(value, { stream: true })
      buffer += chunk
      
      // 按 \n\n 分割 SSE 消息
      const messages = buffer.split('\n\n')
      // 保留最后一个不完整的消息在 buffer 中
      buffer = messages.pop() || ''

      for (const message of messages) {
        if (message.trim() && message.startsWith('data: ')) {
          try {
            const data = JSON.parse(message.slice(6))
            
            switch (data.type) {
              case 'status':
                callbacks.onStatus?.(data.message)
                break
              case 'content':
                // 确保 text 是字符串且不为空
                if (data.text && typeof data.text === 'string') {
                  callbacks.onContent?.(data.text)
                }
                break
              case 'parsed':
                callbacks.onParsed?.(data.data)
                break
              case 'error':
                callbacks.onError?.(data.message)
                break
            }
          } catch (parseError) {
            console.error('解析SSE数据失败:', parseError, '原始数据:', message.substring(0, 100))
          }
        }
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '生成大纲时发生错误'
    callbacks.onError?.(errorMessage)
    throw error
  }
}

/**
 * 从文档流式生成大纲（SSE）
 * @param file 文档文件
 * @param generateMode 生成模式: 'expand' 或 'consistent'
 * @param callbacks 回调函数
 */
export async function generateOutlineFromFileStream(
  file: File,
  generateMode: 'expand' | 'consistent',
  callbacks: {
    onStatus?: (message: string) => void
    onContent?: (text: string) => void
    onParsed?: (data: OutlineResponse['data']) => void
    onError?: (error: string) => void
  }
): Promise<void> {
  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    const apiUrl = `${API_BASE_URL}/api/generate-outline-from-file-stream`
    
    // 构造FormData
    const formData = new FormData()
    formData.append('file', file)
    formData.append('generate_mode', generateMode)
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      body: formData,
    })
    
    if (!response.ok) {
      // 尝试解析错误响应体
      let errorMessage = `HTTP error! status: ${response.status}`
      try {
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json()
          if (errorData.message) {
            errorMessage = errorData.message
          }
        }
      } catch (parseError) {
        console.warn('无法解析错误响应:', parseError)
      }
      throw new Error(errorMessage)
    }
    
    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('无法读取响应流')
    }
    
    const decoder = new TextDecoder('utf-8')
    let buffer = ''
    
    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        // 处理剩余的 buffer
        if (buffer.trim()) {
          const lines = buffer.split('\n\n')
          for (const line of lines) {
            if (line.trim() && line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))
                // 处理SSE事件
                switch (data.type) {
                  case 'status':
                    callbacks.onStatus?.(data.message)
                    break
                  case 'content':
                    if (data.text && typeof data.text === 'string') {
                      callbacks.onContent?.(data.text)
                    }
                    break
                  case 'parsed':
                    callbacks.onParsed?.(data.data)
                    break
                  case 'error':
                    callbacks.onError?.(data.message)
                    break
                }
              } catch (parseError) {
                console.error('解析SSE数据失败:', parseError)
              }
            }
          }
        }
        break
      }
      
      // 解码数据
      const chunk = decoder.decode(value, { stream: true })
      buffer += chunk
      
      // 按 \n\n 分割 SSE 消息
      const messages = buffer.split('\n\n')
      buffer = messages.pop() || ''
      
      for (const message of messages) {
        if (message.trim() && message.startsWith('data: ')) {
          try {
            const data = JSON.parse(message.slice(6))
            // 处理SSE事件
            switch (data.type) {
              case 'status':
                callbacks.onStatus?.(data.message)
                break
              case 'content':
                if (data.text && typeof data.text === 'string') {
                  callbacks.onContent?.(data.text)
                }
                break
              case 'parsed':
                callbacks.onParsed?.(data.data)
                break
              case 'error':
                callbacks.onError?.(data.message)
                break
            }
          } catch (parseError) {
            console.error('解析SSE数据失败:', parseError, '原始数据:', message.substring(0, 100))
          }
        }
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '生成大纲时发生错误'
    callbacks.onError?.(errorMessage)
    throw error
  }
}


export async function generateOutline(params: GeneratePPTRequest): Promise<OutlineResponse> {
  try {
    const apiUrl = `${API_BASE_URL}/api/generate-outline`
    
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 调用生成大纲 API:', apiUrl)
      console.log('📝 请求参数:', params)
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic: params.topic,
        audience: params.audience,
        tone: params.tone,
        scene: params.scene,
        deepThink: params.deepThink || false,
      }),
    })

    if (!response.ok) {
      let errorMessage = '生成大纲失败'
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorMessage
      } catch {
        errorMessage = `服务器错误: ${response.status} ${response.statusText}`
      }
      throw new Error(errorMessage)
    }

    const result: OutlineResponse = await response.json()
    if (!result.success || !result.data) {
      throw new Error(result.message || '生成大纲失败')
    }

    return result
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(`无法连接到后端服务器 (${API_BASE_URL})。请确保后端服务正在运行。`)
    }
    if (error instanceof Error) {
      throw error
    }
    throw new Error('网络错误，请检查后端服务是否运行')
  }
}

/**
 * 健康检查
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`)
    return response.ok
  } catch {
    return false
  }
}

/**
 * 文件信息接口
 */
export interface FileInfo {
  id: string
  name: string
  date: string
  time: string
  pages: number
  size: number
  path?: string
}

/**
 * 文件列表响应
 */
export interface FileListResponse {
  success: boolean
  data: {
    files: FileInfo[]
    total: number
    page: number
    limit: number
    totalPages: number
  }
  message?: string
}

/**
 * 获取文件列表
 */
export async function getFiles(params: {
  page?: number
  limit?: number
  tab?: 'files' | 'trash'
  search?: string
}): Promise<FileListResponse> {
  try {
    // 优先使用 Supabase
    const { getFiles: getFilesFromSupabase } = await import('./supabase-files')
    const result = await getFilesFromSupabase(params)
    
    if (result.success && result.data) {
      // 转换格式以匹配 FileInfo 接口
      const files: FileInfo[] = result.data.files.map((file: any) => ({
        id: file.id,
        name: file.name,
        date: file.date || new Date(file.created_at).toISOString().split('T')[0],
        time: file.time || file.created_at,
        pages: file.page_count || 0,
        size: file.file_size || 0,
        path: file.file_path,
      }))
      
      return {
        success: true,
        data: {
          files,
          total: result.data.total,
          page: result.data.page,
          limit: result.data.limit,
          totalPages: result.data.totalPages,
        },
      }
    }
    
    // 如果用户未登录，返回空列表而不是抛出错误
    if (result.message === '未登录') {
      return {
        success: true,
        data: {
          files: [],
          total: 0,
          page: params.page || 1,
          limit: params.limit || 20,
          totalPages: 0,
        },
      }
    }
    
    // 其他错误，尝试回退到后端 API
    throw new Error(result.message || '获取文件列表失败')
  } catch (error) {
    // 如果 Supabase 未配置或出错，回退到后端 API
    if (error instanceof Error) {
      // 检查是否是 Supabase 配置问题
      const isSupabaseError = 
        error.message.includes('Supabase') || 
        error.message.includes('未配置') ||
        error.message.includes('获取文件列表失败')
      
      if (isSupabaseError) {
        try {
          const queryParams = new URLSearchParams()
          if (params.page) queryParams.append('page', params.page.toString())
          if (params.limit) queryParams.append('limit', params.limit.toString())
          if (params.tab) queryParams.append('tab', params.tab)
          if (params.search) queryParams.append('search', params.search)

          const response = await fetch(`${API_BASE_URL}/api/files?${queryParams}`)
          if (!response.ok) {
            let errorMessage = '获取文件列表失败'
            try {
              const errorData = await response.json()
              errorMessage = errorData.message || errorMessage
            } catch {
              errorMessage = `服务器错误: ${response.status} ${response.statusText}`
            }
            throw new Error(errorMessage)
          }
          return response.json()
        } catch (fallbackError) {
          if (fallbackError instanceof TypeError && fallbackError.message.includes('fetch')) {
            throw new Error(`无法连接到后端服务器 (${API_BASE_URL})。请确保后端服务正在运行。`)
          }
          throw fallbackError
        }
      }
      
      // 如果是未登录错误，返回空列表
      if (error.message === '未登录') {
        return {
          success: true,
          data: {
            files: [],
            total: 0,
            page: params.page || 1,
            limit: params.limit || 20,
            totalPages: 0,
          },
        }
      }
      
      throw error
    }
    throw new Error('网络错误，请检查后端服务是否运行')
  }
}

/**
 * 下载文件
 * @param fileId 文件ID
 * @param filename 可选的文件名，如果不提供则使用 fileId
 */
export async function downloadFileById(fileId: string, filename?: string): Promise<void> {
  try {
    // 优先使用 Supabase
    const { getFileDownloadUrl } = await import('./supabase-files')
    const result = await getFileDownloadUrl(fileId)
    
    if (result.success && result.data) {
      // 使用签名 URL 下载
      const response = await fetch(result.data.url)
      if (!response.ok) {
        throw new Error('下载文件失败')
      }
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename || result.data.file.name || fileId
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      return
    }
    
    throw new Error(result.message || '下载文件失败')
  } catch (error) {
    // 如果 Supabase 未配置，回退到后端 API
    if (error instanceof Error && error.message.includes('Supabase')) {
      const response = await fetch(`${API_BASE_URL}/api/files/${encodeURIComponent(fileId)}/download`)
      if (!response.ok) {
        throw new Error('下载文件失败')
      }
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename || fileId
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      return
    }
    throw error
  }
}

/**
 * 重命名文件
 */
export async function renameFile(fileId: string, newName: string): Promise<{ success: boolean; data: { id: string; name: string } }> {
  try {
    // 优先使用 Supabase
    const { renameFile: renameFileInSupabase } = await import('./supabase-files')
    const result = await renameFileInSupabase(fileId, newName)
    
    if (result.success) {
      return {
        success: true,
        data: { id: fileId, name: newName },
      }
    }
    
    throw new Error(result.message || '重命名失败')
  } catch (error) {
    // 如果 Supabase 未配置，回退到后端 API
    if (error instanceof Error && error.message.includes('Supabase')) {
      const response = await fetch(`${API_BASE_URL}/api/files/${encodeURIComponent(fileId)}/rename`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newName }),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || '重命名失败')
      }
      return response.json()
    }
    throw error
  }
}

/**
 * 删除文件（移动到回收站）
 */
export async function deleteFile(fileId: string): Promise<{ success: boolean; message: string }> {
  try {
    // 优先使用 Supabase
    const { deleteFile: deleteFileInSupabase } = await import('./supabase-files')
    return await deleteFileInSupabase(fileId)
  } catch (error) {
    // 如果 Supabase 未配置，回退到后端 API
    if (error instanceof Error && error.message.includes('Supabase')) {
      const response = await fetch(`${API_BASE_URL}/api/files/${encodeURIComponent(fileId)}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || '删除失败')
      }
      return response.json()
    }
    throw error
  }
}

/**
 * 还原文件
 */
export async function restoreFile(fileId: string): Promise<{ success: boolean; message: string }> {
  try {
    // 优先使用 Supabase
    const { restoreFile: restoreFileInSupabase } = await import('./supabase-files')
    return await restoreFileInSupabase(fileId)
  } catch (error) {
    // 如果 Supabase 未配置，回退到后端 API
    if (error instanceof Error && error.message.includes('Supabase')) {
      const response = await fetch(`${API_BASE_URL}/api/files/${encodeURIComponent(fileId)}/restore`, {
        method: 'POST',
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || '还原失败')
      }
      return response.json()
    }
    throw error
  }
}

/**
 * 永久删除文件
 */
export async function permanentDeleteFile(fileId: string): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE_URL}/api/files/${encodeURIComponent(fileId)}/permanent`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || '永久删除失败')
  }
  return response.json()
}

/**
 * 上传文件
 */
export async function uploadFile(file: File): Promise<{ success: boolean; data: FileInfo; message: string }> {
  try {
    // 优先使用 Supabase
    const { uploadFile: uploadFileToSupabase } = await import('./supabase-files')
    const result = await uploadFileToSupabase(file)
    
    if (result.success && result.data) {
      // 转换格式以匹配 FileInfo 接口
      const fileInfo: FileInfo = {
        id: result.data.id,
        name: result.data.name,
        date: new Date(result.data.created_at).toISOString().split('T')[0],
        time: result.data.created_at,
        pages: result.data.page_count || 0,
        size: result.data.file_size || 0,
        path: result.data.file_path,
      }
      
      return {
        success: true,
        data: fileInfo,
        message: '上传成功',
      }
    }
    
    throw new Error(result.message || '上传失败')
  } catch (error) {
    // 如果 Supabase 未配置，回退到后端 API
    if (error instanceof Error && error.message.includes('Supabase')) {
      const formData = new FormData()
      formData.append('file', file)
      const encodedFilename = encodeURIComponent(file.name)
      const url = `${API_BASE_URL}/api/files/upload?originalFilename=${encodedFilename}`

      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || '上传失败')
      }
      return response.json()
    }
    throw error
  }
}

/**
 * 获取文件详情
 */
export async function getFileDetail(fileId: string): Promise<{ success: boolean; data: FileInfo }> {
  const response = await fetch(`${API_BASE_URL}/api/files/${encodeURIComponent(fileId)}`)
  if (!response.ok) {
    throw new Error('获取文件详情失败')
  }
  return response.json()
}

/**
 * 模板信息接口
 */
export interface TemplateInfo {
  pptx_id: string
  file_name: string
  title: string
  download_url: string
  theme_color: string
  page_size: number
  priority: number
}

/**
 * 模板查询响应
 */
export interface TemplateListResponse {
  code: number
  message: string
  data: TemplateInfo[]
}

/**
 * PPT生成响应（外部API）
 */
export interface GeneratePPTExternalResponse {
  code: number
  message: string
  data: {
    file_id: string
    file_name: string
    local_file?: {
      id: string
      name: string
      path: string
      size: number
      date: string
      time: string
    }
  }
}

/**
 * 获取模板列表
 * @param params 查询参数
 * @returns Promise<TemplateListResponse>
 */
export async function getTemplates(params: {
  page_number?: string
  primary_id?: string
  exclude_pptx_without_tags?: string
}): Promise<TemplateListResponse> {
  try {
    // exclude_pptx_without_tags: 
    // - '0': 返回所有模板（包括没有标签的）
    // - '1': 只返回有标签的模板（只有这些模板才能执行生成接口）
    // 默认使用 '1'，确保只显示可以用于生成的模板
    const response = await fetch(`${API_BASE_URL}/api/templates/list`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        page_number: params.page_number || '1',
        primary_id: params.primary_id,
        exclude_pptx_without_tags: params.exclude_pptx_without_tags || '1',
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  } catch (error) {
    console.error('获取模板列表失败:', error)
    throw error
  }
}

/**
 * 模糊搜索模板
 * @param keyword 关键词
 * @param page_number 页码
 * @param exclude_pptx_without_tags 是否排除无标签模板（'0': 包含所有, '1': 只包含有标签的）
 * @returns Promise<TemplateListResponse>
 */
export async function searchTemplates(
  keyword: string, 
  page_number: string = '1',
  exclude_pptx_without_tags: string = '1'
): Promise<TemplateListResponse> {
  try {
    // exclude_pptx_without_tags: 
    // - '0': 返回所有模板（包括没有标签的）
    // - '1': 只返回有标签的模板（只有这些模板才能执行生成接口）
    // 默认使用 '1'，确保只搜索可以用于生成的模板
    const response = await fetch(`${API_BASE_URL}/api/templates/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        keyword: keyword.trim(),
        page_number: page_number,
        exclude_pptx_without_tags: exclude_pptx_without_tags,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  } catch (error) {
    console.error('搜索模板失败:', error)
    throw error
  }
}

/**
 * 使用外部API生成PPT
 * @param params 生成参数
 * @returns Promise<GeneratePPTExternalResponse>
 */
export async function generatePPTExternal(params: {
  pptx_id: string
  theme: string
  outline?: any
  project_info?: any
  chapters?: any[]
  user_id?: string
}): Promise<GeneratePPTExternalResponse> {
  try {
    // ✅ 支持标准格式（project_info + chapters）和旧格式（outline）
    const requestBody: any = {
      pptx_id: params.pptx_id,
      theme: params.theme,
    }
    
    if (params.project_info && params.chapters) {
      // 使用标准格式
      requestBody.project_info = params.project_info
      requestBody.chapters = params.chapters
    } else if (params.outline) {
      // 使用旧格式
      requestBody.outline = params.outline
    }
    
    if (params.user_id) {
      requestBody.user_id = params.user_id
    }
    
    const response = await fetch(`${API_BASE_URL}/api/ppt/generate-external`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      // 尝试解析错误响应体
      let errorMessage = `HTTP error! status: ${response.status}`
      try {
        const errorData = await response.json()
        if (errorData.message) {
          errorMessage = errorData.message
        }
      } catch (e) {
        // 如果无法解析JSON，使用默认错误信息
        console.warn('无法解析错误响应:', e)
      }
      throw new Error(errorMessage)
    }

    return response.json()
  } catch (error) {
    console.error('生成PPT失败:', error)
    throw error
  }
}

/**
 * 记录用户删除文件操作
 * @param file_ids 文件ID数组
 * @param user_id 用户ID（可选）
 * @returns Promise<any>
 */
export async function deleteFileExternal(file_ids: string[], user_id?: string): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/files/delete-external`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        file_ids: file_ids,
        user_id: user_id,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    return response.json()
  } catch (error) {
    console.error('记录删除操作失败:', error)
    throw error
  }
}

/**
 * 流式生成PPT
 * @param params 生成参数
 * @param callbacks 回调函数
 */
export async function generatePPTStream(
  params: GeneratePPTRequest,
  callbacks: {
    onStatus?: (message: string) => void
    onPage?: (data: { pageNumber: number, title?: string, status: 'start' | 'complete' }) => void
    onContent?: (data: { pageNumber: number, content: { type: string, text: string, level?: number, index?: number } }) => void
    onProgress?: (data: { totalPages: number, completedPages: number }) => void
    onComplete?: (data: { fileId?: string, fileName?: string }) => void
    onError?: (error: string) => void
  }
): Promise<void> {
  try {
    const apiUrl = `${API_BASE_URL}/api/generate-ppt-stream`
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic: params.topic,
        audience: params.audience,
        tone: params.tone,
        scene: params.scene,
        outline: params.outline,
        templateId: params.templateId,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('无法读取响应流')
    }

    const decoder = new TextDecoder('utf-8')
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        // 处理剩余的 buffer
        if (buffer.trim()) {
          const lines = buffer.split('\n\n')
          for (const line of lines) {
            if (line.trim() && line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))
                handleStreamEvent(data, callbacks)
              } catch (parseError) {
                console.error('解析SSE数据失败:', parseError)
              }
            }
          }
        }
        break
      }

      const chunk = decoder.decode(value, { stream: true })
      buffer += chunk
      
      const messages = buffer.split('\n\n')
      buffer = messages.pop() || ''

      for (const message of messages) {
        if (message.trim() && message.startsWith('data: ')) {
          try {
            const data = JSON.parse(message.slice(6))
            handleStreamEvent(data, callbacks)
          } catch (parseError) {
            console.error('解析SSE数据失败:', parseError, '原始数据:', message.substring(0, 100))
          }
        }
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '生成PPT时发生错误'
    callbacks.onError?.(errorMessage)
    throw error
  }
}

/**
 * 解析PPTX文件并流式返回（后端代理）
 * @param params 解析参数
 * @param callbacks 回调函数
 */
export async function parsePPTStream(
  params: {
    fileId?: string
    fileUrl?: string
    filePath?: string
  },
  callbacks: {
    onStatus?: (message: string) => void
    onPage?: (data: { pageNumber: number, title?: string, status: 'start' | 'complete' }) => void
    onContent?: (data: { pageNumber: number, content: { type: string, text: string, level?: number, index?: number } }) => void
    onProgress?: (data: { totalPages: number, completedPages: number }) => void
    onComplete?: (data: { fileId?: string, totalPages?: number }) => void
    onError?: (error: string) => void
  }
): Promise<void> {
  try {
    const apiUrl = `${API_BASE_URL}/api/parse-ppt-stream`
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileId: params.fileId,
        fileUrl: params.fileUrl,
        filePath: params.filePath,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('无法读取响应流')
    }

    const decoder = new TextDecoder('utf-8')
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        // 处理剩余的 buffer
        if (buffer.trim()) {
          const lines = buffer.split('\n\n')
          for (const line of lines) {
            if (line.trim() && line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))
                handleStreamEvent(data, callbacks)
              } catch (parseError) {
                console.error('解析SSE数据失败:', parseError)
              }
            }
          }
        }
        break
      }

      const chunk = decoder.decode(value, { stream: true })
      buffer += chunk
      
      const messages = buffer.split('\n\n')
      buffer = messages.pop() || ''

      for (const message of messages) {
        if (message.trim() && message.startsWith('data: ')) {
          try {
            const data = JSON.parse(message.slice(6))
            handleStreamEvent(data, callbacks)
          } catch (parseError) {
            console.error('解析SSE数据失败:', parseError, '原始数据:', message.substring(0, 100))
          }
        }
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '解析PPT时发生错误'
    callbacks.onError?.(errorMessage)
    throw error
  }
}

function handleStreamEvent(data: any, callbacks: any) {
  switch (data.type) {
    case 'status':
      callbacks.onStatus?.(data.message)
      break
    case 'page':
      if (data.status === 'start' || data.status === 'complete') {
        callbacks.onPage?.({
          pageNumber: data.pageNumber,
          title: data.title,
          status: data.status
        })
      } else if (data.status === 'content' && data.content) {
        callbacks.onContent?.({
          pageNumber: data.pageNumber,
          content: data.content
        })
      }
      break
    case 'progress':
      callbacks.onProgress?.({
        totalPages: data.totalPages,
        completedPages: data.completedPages
      })
      break
    case 'complete':
      callbacks.onComplete?.({
        fileId: data.fileId,
        fileName: data.fileName,
        downloadUrl: data.downloadUrl,
        totalPages: data.totalPages
      })
      break
    case 'error':
      callbacks.onError?.(data.message)
      break
  }
}

/**
 * 外部API流式生成PPT（SSE）
 * @param params 生成参数
 * @param callbacks 回调函数
 */
export async function generatePPTStreamExternal(
  params: {
    pptx_id: string
    theme: string
    outline?: any
    user_id?: string
  },
  callbacks: {
    onStatus?: (message: string) => void
    onPage?: (data: { pageNumber: number, title?: string, status: 'start' | 'complete' }) => void
    onContent?: (data: { pageNumber: number, content: { type: string, text: string, level?: number, index?: number } }) => void
    onProgress?: (data: { totalPages: number, completedPages: number }) => void
    onComplete?: (data: { fileId?: string, fileName?: string, downloadUrl?: string, totalPages?: number }) => void
    onError?: (error: string) => void
  }
): Promise<void> {
  try {
    const apiUrl = `${API_BASE_URL}/api/generate-ppt-stream-external`
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pptx_id: params.pptx_id,
        theme: params.theme,
        outline: params.outline,
        user_id: params.user_id,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('无法读取响应流')
    }

    const decoder = new TextDecoder('utf-8')
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        // 处理剩余的 buffer
        if (buffer.trim()) {
          const lines = buffer.split('\n\n')
          for (const line of lines) {
            if (line.trim() && line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6))
                handleStreamEvent(data, callbacks)
              } catch (parseError) {
                console.error('解析SSE数据失败:', parseError)
              }
            }
          }
        }
        break
      }

      const chunk = decoder.decode(value, { stream: true })
      buffer += chunk
      
      const messages = buffer.split('\n\n')
      buffer = messages.pop() || ''

      for (const message of messages) {
        if (message.trim() && message.startsWith('data: ')) {
          try {
            const data = JSON.parse(message.slice(6))
            handleStreamEvent(data, callbacks)
          } catch (parseError) {
            console.error('解析SSE数据失败:', parseError, '原始数据:', message.substring(0, 100))
          }
        }
      }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '流式生成PPT时发生错误'
    callbacks.onError?.(errorMessage)
    throw error
  }
}

/**
 * 解析文档文件，提取文本内容
 * @param file 文档文件（.docx 或 .txt）
 * @returns 提取的文本内容
 */
export async function parseDocument(file: File): Promise<string> {
  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    const apiUrl = `${API_BASE_URL}/api/parse-document`
    
    // 构造FormData
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      body: formData,
    })
    
    if (!response.ok) {
      // 尝试解析错误响应体
      let errorMessage = `HTTP error! status: ${response.status}`
      try {
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json()
          errorMessage = errorData.message || errorMessage
        } else {
          const errorText = await response.text()
          errorMessage = errorText || errorMessage
        }
      } catch (e) {
        // 忽略解析错误
      }
      throw new Error(errorMessage)
    }
    
    const data = await response.json()
    if (!data.success) {
      throw new Error(data.message || '解析文档失败')
    }
    
    return data.content || ''
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '解析文档时发生错误'
    throw new Error(errorMessage)
  }
}
