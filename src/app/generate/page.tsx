'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/useAppStore'
import { Framework } from '@/types'

export default function GeneratePage() {
  const router = useRouter()
  const { 
    currentStyle, 
    currentTopic, 
    frameworks, 
    setFrameworks, 
    updateFramework,
    setSelectedFramework,
    setFinalCopywriting,
    clearHistory,
    promptConfig
  } = useAppStore()
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!currentStyle || !currentTopic) {
      router.push('/')
      return
    }
  }, [currentStyle, currentTopic, router])

  const generateFrameworks = async () => {
    if (!currentStyle || !currentTopic) return
    
    setIsLoading(true)
    setError('')
    setFrameworks([])
    
    try {
      const userPrompt = promptConfig.generateFrameworks.userPromptTemplate
        .replace('{styleAnalysis}', currentStyle.styleAnalysis)
        .replace('{topic}', currentTopic)

      const response = await fetch('/api/generate-frameworks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          styleAnalysis: currentStyle.styleAnalysis,
          topic: currentTopic,
          systemPrompt: promptConfig.generateFrameworks.systemPrompt,
          userPrompt: userPrompt
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '框架生成失败')
      }

      setFrameworks(data.frameworks)
    } catch (err) {
      setError(err instanceof Error ? err.message : '框架生成失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectFramework = (framework: Framework) => {
    const updatedFramework = frameworks.find(f => f.id === framework.id)
    if (updatedFramework) {
      setSelectedFramework(updatedFramework)
      setFinalCopywriting('')
      clearHistory()
      router.push('/result')
    }
  }

  if (!currentStyle || !currentTopic) {
    return null
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => router.push('/')}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 flex items-center gap-1 text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回首页
        </button>
      </div>

      <div className="card mb-6">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 dark:text-gray-400">当前风格：</span>
            <span className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-3 py-1 rounded-full font-medium">
              {currentStyle.name}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500 dark:text-gray-400">主题：</span>
            <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full">
              {currentTopic}
            </span>
          </div>
        </div>
      </div>

      {frameworks.length === 0 && (
        <div className="card text-center py-12">
          <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
            准备生成文案框架
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            AI将根据「{currentStyle.name}」风格和「{currentTopic}」主题，生成3个不同角度的解读思路与文案框架
          </p>
          <button
            onClick={generateFrameworks}
            disabled={isLoading}
            className="btn-primary px-8 py-3 text-lg"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                正在生成框架...
              </span>
            ) : (
              '开始生成框架'
            )}
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {frameworks.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
              选择一个框架
            </h2>
            <button
              onClick={generateFrameworks}
              disabled={isLoading}
              className="btn-secondary text-sm flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              重新生成
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {frameworks.map((framework) => (
              <div key={framework.id} className="card flex flex-col h-full">
                <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center text-sm">
                    {framework.id.split('-')[1]}
                  </span>
                  {framework.title}
                </h3>
                
                <textarea
                  value={framework.content}
                  onChange={(e) => updateFramework(framework.id, e.target.value)}
                  className="textarea-field flex-1 min-h-[300px] text-sm mb-4"
                  placeholder="框架内容..."
                />
                
                <button
                  onClick={() => handleSelectFramework(framework)}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  选择此框架
                </button>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            提示：您可以直接在文本框中修改框架内容，修改后点击"选择此框架"继续
          </div>
        </>
      )}
    </div>
  )
}
