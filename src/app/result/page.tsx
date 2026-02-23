'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/useAppStore'

export default function ResultPage() {
  const router = useRouter()
  const { 
    currentStyle, 
    currentTopic, 
    selectedFramework,
    finalCopywriting,
    setFinalCopywriting,
    reset
  } = useAppStore()
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [editableCopywriting, setEditableCopywriting] = useState('')

  useEffect(() => {
    if (!currentStyle || !currentTopic || !selectedFramework) {
      router.push('/styles')
      return
    }
    
    if (finalCopywriting) {
      setEditableCopywriting(finalCopywriting)
    }
  }, [currentStyle, currentTopic, selectedFramework, finalCopywriting, router])

  const generateCopywriting = async () => {
    if (!currentStyle || !currentTopic || !selectedFramework) return
    
    setIsLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/generate-copywriting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          styleAnalysis: currentStyle.styleAnalysis,
          topic: currentTopic,
          framework: selectedFramework.content
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '文案生成失败')
      }

      setFinalCopywriting(data.copywriting)
      setEditableCopywriting(data.copywriting)
    } catch (err) {
      setError(err instanceof Error ? err.message : '文案生成失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(editableCopywriting)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      alert('复制失败，请手动复制')
    }
  }

  const handleStartOver = () => {
    reset()
    router.push('/')
  }

  if (!currentStyle || !currentTopic || !selectedFramework) {
    return null
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => router.push('/generate')}
          className="text-gray-600 hover:text-gray-800 flex items-center gap-1 text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回框架选择
        </button>
      </div>

      <div className="card mb-6">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-500">风格：</span>
            <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full font-medium">
              {currentStyle.name}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">主题：</span>
            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
              {currentTopic}
            </span>
          </div>
        </div>
      </div>

      <div className="card mb-6">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          已选框架
        </h3>
        <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600 max-h-40 overflow-y-auto whitespace-pre-wrap">
          {selectedFramework.content}
        </div>
      </div>

      {!finalCopywriting && !isLoading && (
        <div className="card text-center py-12">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            准备生成完整文案
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            AI将根据风格分析和选定框架，生成一篇完整的视频文案
          </p>
          <button
            onClick={generateCopywriting}
            disabled={isLoading}
            className="btn-primary px-8 py-3 text-lg"
          >
            生成完整文案
          </button>
        </div>
      )}

      {isLoading && (
        <div className="card text-center py-12">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="animate-spin w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">
            正在生成文案<span className="loading-dots"></span>
          </h3>
          <p className="text-gray-600">
            AI正在根据风格和框架创作中，请稍候...
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {finalCopywriting && !isLoading && (
        <>
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                生成的文案
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={generateCopywriting}
                  disabled={isLoading}
                  className="btn-secondary text-sm flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  重新生成
                </button>
                <button
                  onClick={handleCopy}
                  className={`btn-secondary text-sm flex items-center gap-1 ${
                    copied ? 'text-green-600 border-green-300' : ''
                  }`}
                >
                  {copied ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      已复制
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      复制
                    </>
                  )}
                </button>
              </div>
            </div>
            
            <textarea
              value={editableCopywriting}
              onChange={(e) => setEditableCopywriting(e.target.value)}
              className="textarea-field min-h-[400px] text-base leading-relaxed"
              placeholder="文案内容..."
            />
          </div>

          <div className="mt-6 flex justify-center gap-4">
            <button
              onClick={handleStartOver}
              className="btn-secondary flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              开始新创作
            </button>
            <button
              onClick={() => router.push('/styles')}
              className="btn-primary flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              返回风格库
            </button>
          </div>

          <div className="mt-6 text-center text-sm text-gray-500">
            提示：您可以直接在文本框中编辑文案内容，然后复制使用
          </div>
        </>
      )}
    </div>
  )
}
