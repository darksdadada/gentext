const { contextBridge, ipcRenderer } = require('electron')

/**
 * Electron Preload 脚本
 * 
 * 【重要】后端连接点说明：
 * ============================================
 * 此文件通过 contextBridge 安全地暴露 API 给渲染进程
 * 前端通过 window.electronAPI 调用这些方法
 * ============================================
 */

contextBridge.exposeInMainWorld('electronAPI', {
  // 应用信息
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getPlatform: () => ipcRenderer.invoke('get-platform'),
  
  // ============================================
  // 【后端连接点】AI API 接口
  // ============================================
  // 所有 AI 调用通过 IPC 传递到主进程处理
  // API Key 在主进程管理，前端无法访问
  
  // 风格提取
  extractStyle: (texts) => ipcRenderer.invoke('api:extract-style', { texts }),
  
  // 框架生成
  generateFrameworks: (styleAnalysis, topic) => 
    ipcRenderer.invoke('api:generate-frameworks', { styleAnalysis, topic }),
  
  // 文案生成
  generateCopywriting: (styleAnalysis, topic, framework) => 
    ipcRenderer.invoke('api:generate-copywriting', { styleAnalysis, topic, framework }),
  
  // 文案修改
  reviseCopywriting: (styleAnalysis, topic, framework, currentCopywriting, feedback) => 
    ipcRenderer.invoke('api:revise-copywriting', { 
      styleAnalysis, topic, framework, currentCopywriting, feedback 
    }),
  
  // 本地存储
  store: {
    get: (key) => {
      try {
        const data = localStorage.getItem(key)
        return data ? JSON.parse(data) : null
      } catch {
        return null
      }
    },
    set: (key, value) => {
      localStorage.setItem(key, JSON.stringify(value))
    },
    delete: (key) => {
      localStorage.removeItem(key)
    }
  }
})

console.log('Electron preload script loaded')
