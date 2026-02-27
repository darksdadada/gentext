/**
 * API 服务层
 * 
 * 【重要】后端连接点说明：
 * ============================================
 * 本文件包含所有与后端服务器通信的接口
 * 如需对接后端，只需修改 BASE_URL 和各接口实现
 * ============================================
 */

// ============================================
// 【后端连接点 1】API 基础地址配置
// ============================================
// 当前：直接调用阿里云千问API（前端直连）
// 后端优化后：改为你的后端服务器地址
// 示例：const BASE_URL = 'https://your-backend.com/api'

const API_CONFIG = {
  // 阿里云千问API地址（当前使用）
  DASHSCOPE_BASE_URL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  
  // 本地Next.js API路由（当前使用）
  LOCAL_API_BASE: '/api',
  
  // 【后端优化时修改】未来后端服务器地址
  // BACKEND_BASE_URL: 'https://your-backend.com/api',
}

// ============================================
// 【后端连接点 2】API Key 配置
// ============================================
// 当前：API Key 写在前端（仅适合个人使用）
// 后端优化后：API Key 应存储在后端服务器
// 安全建议：生产环境必须将 API Key 移至后端

const getApiKey = () => {
  // 【后端优化时删除】前端不应暴露API Key
  return process.env.NEXT_PUBLIC_DASHSCOPE_API_KEY || 'sk-4561661278024ff4bcd1844225834ea8'
  
  // 【后端优化时使用】从后端获取API Key
  // return await fetch('/api/config/api-key').then(r => r.json())
}

// ============================================
// 【后端连接点 3】风格提取接口
// ============================================
// 功能：将用户输入的文案发送给AI，提取风格特征
// 当前：通过 Next.js API 路由调用阿里云千问
// 后端优化：可替换为你的后端服务

export async function extractStyle(texts: string[]): Promise<{ styleAnalysis: string }> {
  // 【当前实现】使用本地 API 路由
  const response = await fetch(`${API_CONFIG.LOCAL_API_BASE}/extract-style`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ texts }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || '风格提取失败')
  }

  return response.json()

  // 【后端优化示例】
  // const response = await fetch(`${API_CONFIG.BACKEND_BASE_URL}/extract-style`, {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Authorization': `Bearer ${userToken}`, // 用户认证
  //   },
  //   body: JSON.stringify({ texts }),
  // })
}

// ============================================
// 【后端连接点 4】框架生成接口
// ============================================
// 功能：根据风格和主题生成3个备选框架
// 当前：通过 Next.js API 路由调用阿里云千问
// 后端优化：可替换为你的后端服务

export async function generateFrameworks(
  styleAnalysis: string,
  topic: string
): Promise<{ frameworks: Array<{ id: string; title: string; content: string }> }> {
  // 【当前实现】使用本地 API 路由
  const response = await fetch(`${API_CONFIG.LOCAL_API_BASE}/generate-frameworks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ styleAnalysis, topic }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || '框架生成失败')
  }

  return response.json()

  // 【后端优化示例】
  // const response = await fetch(`${API_CONFIG.BACKEND_BASE_URL}/generate-frameworks`, {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Authorization': `Bearer ${userToken}`,
  //   },
  //   body: JSON.stringify({ styleAnalysis, topic }),
  // })
}

// ============================================
// 【后端连接点 5】文案生成接口
// ============================================
// 功能：根据框架生成完整文案
// 当前：通过 Next.js API 路由调用阿里云千问
// 后端优化：可替换为你的后端服务

export async function generateCopywriting(
  styleAnalysis: string,
  topic: string,
  framework: string
): Promise<{ copywriting: string }> {
  // 【当前实现】使用本地 API 路由
  const response = await fetch(`${API_CONFIG.LOCAL_API_BASE}/generate-copywriting`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ styleAnalysis, topic, framework }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || '文案生成失败')
  }

  return response.json()

  // 【后端优化示例】
  // const response = await fetch(`${API_CONFIG.BACKEND_BASE_URL}/generate-copywriting`, {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Authorization': `Bearer ${userToken}`,
  //   },
  //   body: JSON.stringify({ styleAnalysis, topic, framework }),
  // })
}

// ============================================
// 【后端连接点 6】文案修改接口
// ============================================
// 功能：根据用户反馈修改文案
// 当前：通过 Next.js API 路由调用阿里云千问
// 后端优化：可替换为你的后端服务

export async function reviseCopywriting(
  styleAnalysis: string,
  topic: string,
  framework: string,
  currentCopywriting: string,
  feedback: string
): Promise<{ copywriting: string }> {
  // 【当前实现】使用本地 API 路由
  const response = await fetch(`${API_CONFIG.LOCAL_API_BASE}/revise-copywriting`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      styleAnalysis,
      topic,
      framework,
      currentCopywriting,
      feedback
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || '文案修改失败')
  }

  return response.json()

  // 【后端优化示例】
  // const response = await fetch(`${API_CONFIG.BACKEND_BASE_URL}/revise-copywriting`, {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     'Authorization': `Bearer ${userToken}`,
  //   },
  //   body: JSON.stringify({
  //     styleAnalysis,
  //     topic,
  //     framework,
  //     currentCopywriting,
  //     feedback
  //   }),
  // })
}

// ============================================
// 【后端连接点 7】用户认证接口（预留）
// ============================================
// 功能：用户登录、注册、Token管理
// 当前：未实现，使用本地存储
// 后端优化：实现完整的用户认证系统

export const authAPI = {
  // 【后端实现时添加】
  // login: async (email: string, password: string) => { ... }
  // register: async (email: string, password: string) => { ... }
  // logout: async () => { ... }
  // refreshToken: async () => { ... }
}

// ============================================
// 【后端连接点 8】用户数据同步接口（预留）
// ============================================
// 功能：云端同步用户的风格库
// 当前：未实现，使用本地存储
// 后端优化：实现数据云端同步

export const syncAPI = {
  // 【后端实现时添加】
  // syncStyles: async (styles: Style[]) => { ... }
  // getStyles: async () => { ... }
  // deleteStyle: async (id: string) => { ... }
}

export { API_CONFIG }
