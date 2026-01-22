import { supabase } from './supabase'

/**
 * 用户登录（邮箱密码）
 */
export async function signInWithPassword(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return {
        success: false,
        message: error.message,
        data: null,
      }
    }

    // 获取用户资料
    const profile = await getUserProfile(data.user.id)

    return {
      success: true,
      message: '登录成功',
      data: {
        token: data.session?.access_token,
        user: {
          ...data.user,
          ...profile,
        },
      },
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || '登录失败',
      data: null,
    }
  }
}

/**
 * 用户注册
 */
export async function signUp(email: string, password: string, options?: {
  username?: string
  phone?: string
}) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: options?.username,
          phone: options?.phone,
        },
      },
    })

    if (error) {
      return {
        success: false,
        message: error.message,
        data: null,
      }
    }

    // 创建用户资料
    if (data.user) {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: data.user.id,
          username: options?.username,
          phone: options?.phone,
        })

      if (profileError) {
        console.error('创建用户资料失败:', profileError)
      }
    }

    return {
      success: true,
      message: '注册成功',
      data: {
        token: data.session?.access_token,
        user: data.user,
      },
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || '注册失败',
      data: null,
    }
  }
}

/**
 * 用户登出
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      return {
        success: false,
        message: error.message,
      }
    }
    return {
      success: true,
      message: '登出成功',
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || '登出失败',
    }
  }
}

/**
 * 获取当前用户
 */
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error || !user) {
      return null
    }
    return user
  } catch (error) {
    console.error('获取当前用户失败:', error)
    return null
  }
}

/**
 * 获取用户资料
 */
export async function getUserProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      return null
    }
    return data
  } catch (error) {
    console.error('获取用户资料失败:', error)
    return null
  }
}

/**
 * 监听认证状态变化
 */
export function onAuthStateChange(callback: (user: any) => void) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user || null)
  })
}
