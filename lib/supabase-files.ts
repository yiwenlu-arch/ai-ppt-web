import { supabase } from './supabase'

/**
 * 获取文件列表
 */
export async function getFiles(options?: {
  page?: number
  limit?: number
  tab?: 'files' | 'trash'
  search?: string
}) {
  const {
    page = 1,
    limit = 20,
    tab = 'files',
    search = '',
  } = options || {}

  try {
    // 获取当前用户
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return {
        success: false,
        message: '未登录',
        data: null,
      }
    }

    // 构建查询
    let query = supabase
      .from('ppt_files')
      .select('*')
      .eq('status', tab === 'trash' ? 'trash' : 'active')
      .order('created_at', { ascending: false })

    // 搜索
    if (search) {
      query = query.ilike('name', `%${search}%`)
    }

    // 分页
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await query
      .range(from, to)
      .select('*', { count: 'exact' })

    if (error) {
      return {
        success: false,
        message: error.message,
        data: null,
      }
    }

    return {
      success: true,
      data: {
        files: data || [],
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      },
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || '获取文件列表失败',
      data: null,
    }
  }
}

/**
 * 上传文件
 */
export async function uploadFile(file: File, metadata?: {
  name?: string
  topic?: string
  audience?: string
  tone?: string
  scene?: string
  generation_mode?: string
}) {
  try {
    // 获取当前用户
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return {
        success: false,
        message: '未登录',
        data: null,
      }
    }

    // 生成文件路径
    const fileName = `${Date.now()}-${file.name}`
    const filePath = `${user.id}/${fileName}`

    // 上传到 Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('ppt-files')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) {
      return {
        success: false,
        message: uploadError.message,
        data: null,
      }
    }

    // 插入数据库记录
    const { data: fileRecord, error: dbError } = await supabase
      .from('ppt_files')
      .insert({
        user_id: user.id,
        name: metadata?.name || file.name.replace('.pptx', ''),
        original_name: file.name,
        file_path: filePath,
        file_size: file.size,
        mime_type: file.type,
        topic: metadata?.topic,
        audience: metadata?.audience,
        tone: metadata?.tone,
        scene: metadata?.scene,
        generation_mode: metadata?.generation_mode,
      })
      .select()
      .single()

    if (dbError) {
      // 如果数据库插入失败，删除已上传的文件
      await supabase.storage.from('ppt-files').remove([filePath])
      return {
        success: false,
        message: dbError.message,
        data: null,
      }
    }

    return {
      success: true,
      data: fileRecord,
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || '上传文件失败',
      data: null,
    }
  }
}

/**
 * 下载文件（获取签名 URL）
 */
export async function getFileDownloadUrl(fileId: string, expiresIn: number = 3600) {
  try {
    // 获取文件记录
    const { data: fileRecord, error: fileError } = await supabase
      .from('ppt_files')
      .select('*')
      .eq('id', fileId)
      .single()

    if (fileError || !fileRecord) {
      return {
        success: false,
        message: '文件不存在',
        data: null,
      }
    }

    // 创建签名 URL
    const { data: signedUrl, error: urlError } = await supabase.storage
      .from('ppt-files')
      .createSignedUrl(fileRecord.file_path, expiresIn)

    if (urlError) {
      return {
        success: false,
        message: urlError.message,
        data: null,
      }
    }

    return {
      success: true,
      data: {
        url: signedUrl.signedUrl,
        file: fileRecord,
      },
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || '获取下载链接失败',
      data: null,
    }
  }
}

/**
 * 删除文件（移动到回收站）
 */
export async function deleteFile(fileId: string) {
  try {
    const { error } = await supabase
      .from('ppt_files')
      .update({
        status: 'trash',
        deleted_at: new Date().toISOString(),
      })
      .eq('id', fileId)

    if (error) {
      return {
        success: false,
        message: error.message,
      }
    }

    return {
      success: true,
      message: '文件已移动到回收站',
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || '删除文件失败',
    }
  }
}

/**
 * 恢复文件
 */
export async function restoreFile(fileId: string) {
  try {
    const { error } = await supabase
      .from('ppt_files')
      .update({
        status: 'active',
        deleted_at: null,
      })
      .eq('id', fileId)
      .eq('status', 'trash')

    if (error) {
      return {
        success: false,
        message: error.message,
      }
    }

    return {
      success: true,
      message: '文件已恢复',
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || '恢复文件失败',
    }
  }
}

/**
 * 永久删除文件
 */
export async function permanentDeleteFile(fileId: string) {
  try {
    // 获取文件记录
    const { data: fileRecord } = await supabase
      .from('ppt_files')
      .select('*')
      .eq('id', fileId)
      .single()

    if (!fileRecord) {
      return {
        success: false,
        message: '文件不存在',
      }
    }

    // 删除 Storage 中的文件
    const { error: storageError } = await supabase.storage
      .from('ppt-files')
      .remove([fileRecord.file_path])

    if (storageError) {
      console.error('删除 Storage 文件失败:', storageError)
    }

    // 删除数据库记录
    const { error: dbError } = await supabase
      .from('ppt_files')
      .update({
        status: 'deleted',
      })
      .eq('id', fileId)

    if (dbError) {
      return {
        success: false,
        message: dbError.message,
      }
    }

    return {
      success: true,
      message: '文件已永久删除',
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || '永久删除文件失败',
    }
  }
}

/**
 * 重命名文件
 */
export async function renameFile(fileId: string, newName: string) {
  try {
    const { error } = await supabase
      .from('ppt_files')
      .update({ name: newName })
      .eq('id', fileId)

    if (error) {
      return {
        success: false,
        message: error.message,
      }
    }

    return {
      success: true,
      message: '文件已重命名',
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || '重命名文件失败',
    }
  }
}
