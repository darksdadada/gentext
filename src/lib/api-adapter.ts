/**
 * API 适配层
 * 
 * 【重要】后端连接点说明：
 * ============================================
 * 此文件自动检测运行环境，选择正确的 API 调用方式：
 * - Electron 环境：通过 IPC 调用主进程 API
 * - Web 环境：通过 HTTP 调用 Next.js API 路由
 * ============================================
 */

// 检测是否在 Electron 环境中
const isElectron = typeof window !== 'undefined' && window.electronAPI

// ============================================
// 【后端连接点 1】风格提取 API
// ============================================
export async function extractStyle(texts: string[]): Promise<{ styleAnalysis: string }> {
  if (isElectron && window.electronAPI) {
    // Electron 环境：通过 IPC 调用主进程
    return window.electronAPI.extractStyle(texts)
  } else {
    // Web 环境：通过 HTTP 调用 API 路由
    const response = await fetch('/api/extract-style', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texts }),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || '风格提取失败')
    }
    
    return response.json()
  }
}

// ============================================
// 【后端连接点 2】框架生成 API
// ============================================
export async function generateFrameworks(
  styleAnalysis: string,
  topic: string
): Promise<{ frameworks: Array<{ id: string; title: string; content: string }> }> {
  if (isElectron && window.electronAPI) {
    return window.electronAPI.generateFrameworks(styleAnalysis, topic)
  } else {
    const response = await fetch('/api/generate-frameworks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ styleAnalysis, topic }),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || '框架生成失败')
    }
    
    return response.json()
  }
}

// ============================================
// 【后端连接点 3】文案生成 API
// ============================================
export async function generateCopywriting(
  styleAnalysis: string,
  topic: string,
  framework: string
): Promise<{ copywriting: string }> {
  if (isElectron && window.electronAPI) {
    return window.electronAPI.generateCopywriting(styleAnalysis, topic, framework)
  } else {
    const response = await fetch('/api/generate-copywriting', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ styleAnalysis, topic, framework }),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || '文案生成失败')
    }
    
    return response.json()
  }
}

// ============================================
// 【后端连接点 4】文案修改 API
// ============================================
export async function reviseCopywriting(
  styleAnalysis: string,
  topic: string,
  framework: string,
  currentCopywriting: string,
  feedback: string
): Promise<{ copywriting: string }> {
  if (isElectron && window.electronAPI) {
    return window.electronAPI.reviseCopywriting(
      styleAnalysis, topic, framework, currentCopywriting, feedback
    )
  } else {
    const response = await fetch('/api/revise-copywriting', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        styleAnalysis, topic, framework, currentCopywriting, feedback
      }),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || '文案修改失败')
    }
    
    return response.json()
  }
}

// 导出环境检测
export { isElectron }
