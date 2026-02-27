/**
 * Electron API 类型声明
 * 
 * 【重要】后端连接点说明：
 * ============================================
 * 此文件定义了 Electron 环境下 window.electronAPI 的类型
 * ============================================
 */

interface ElectronAPI {
  // 应用信息
  getAppVersion: () => Promise<string>
  getPlatform: () => Promise<string>
  
  // AI API 接口
  extractStyle: (texts: string[]) => Promise<{ styleAnalysis: string }>
  generateFrameworks: (styleAnalysis: string, topic: string) => Promise<{
    frameworks: Array<{ id: string; title: string; content: string }>
  }>
  generateCopywriting: (styleAnalysis: string, topic: string, framework: string) => Promise<{
    copywriting: string
  }>
  reviseCopywriting: (
    styleAnalysis: string,
    topic: string,
    framework: string,
    currentCopywriting: string,
    feedback: string
  ) => Promise<{ copywriting: string }>
  
  // 本地存储
  store: {
    get: (key: string) => any
    set: (key: string, value: any) => void
    delete: (key: string) => void
  }
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}

export {}
