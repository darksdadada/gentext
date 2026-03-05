'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/useAppStore'
import { CreationRecord } from '@/types'

export default function ResultPage() {
  const router = useRouter()
  const { 
    currentStyle, 
    currentTopic, 
    selectedFramework,
    finalCopywriting,
    setFinalCopywriting,
    copywritingHistory,
    addToHistory,
    restoreFromHistory,
    currentRecordId,
    addCreationRecord,
    updateCreationRecord,
    promptConfig
  } = useAppStore()
  
  const [isLoading, setIsLoading] = useState(false)
  const [isRevising, setIsRevising] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [editableCopywriting, setEditableCopywriting] = useState('')
  const [feedback, setFeedback] = useState('')
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    if (!currentStyle || !currentTopic || !selectedFramework) {
      router.push('/')
      return
    }
    
    if (finalCopywriting) {
      setEditableCopywriting(finalCopywriting)
    }
  }, [currentStyle, currentTopic, selectedFramework, finalCopywriting, router])

  const saveToRecord = useCallback((content: string, versions: typeof copywritingHistory) => {
    if (!currentStyle || !currentTopic || !selectedFramework) return

    const recordData: Partial<CreationRecord> = {
      styleId: currentStyle.id,
      styleName: currentStyle.name,
      topic: currentTopic,
      framework: selectedFramework.content,
      finalCopywriting: content,
      versions: versions,
      updatedAt: new Date().toISOString()
    }

    if (currentRecordId) {
      updateCreationRecord(currentRecordId, recordData)
    } else {
      const newRecord: CreationRecord = {
        id: Date.now().toString(),
        ...recordData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      } as CreationRecord
      addCreationRecord(newRecord)
      useAppStore.setState({ currentRecordId: newRecord.id })
    }
  }, [currentStyle, currentTopic, selectedFramework, currentRecordId, addCreationRecord, updateCreationRecord])

  const generateCopywriting = useCallback(async () => {
    if (!currentStyle || !currentTopic || !selectedFramework) return
    
    setIsLoading(true)
    setError('')
    
    try {
      const userPrompt = promptConfig.generateCopywriting.userPromptTemplate
        .replace('{styleAnalysis}', currentStyle.styleAnalysis)
        .replace('{topic}', currentTopic)
        .replace('{framework}', selectedFramework.content)

      const response = await fetch('/api/generate-copywriting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          styleAnalysis: currentStyle.styleAnalysis,
          topic: currentTopic,
          framework: selectedFramework.content,
          systemPrompt: promptConfig.generateCopywriting.systemPrompt,
          userPrompt: userPrompt
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '文案生成失败')
      }

      setFinalCopywriting(data.copywriting)
      setEditableCopywriting(data.copywriting)
      addToHistory(data.copywriting, '初始生成')
      
      const newHistory = [
        {
          id: Date.now().toString(),
          content: data.copywriting,
          createdAt: new Date().toISOString(),
          feedback: '初始生成'
        }
      ]
      saveToRecord(data.copywriting, newHistory)
    } catch (err) {
      setError(err instanceof Error ? err.message : '文案生成失败')
    } finally {
      setIsLoading(false)
    }
  }, [currentStyle, currentTopic, selectedFramework, setFinalCopywriting, addToHistory, saveToRecord, promptConfig])

  const reviseCopywriting = useCallback(async () => {
    if (!editableCopywriting.trim() || !feedback.trim()) return
    
    setIsRevising(true)
    setError('')
    
    try {
      const userPrompt = promptConfig.reviseCopywriting.userPromptTemplate
        .replace('{styleAnalysis}', currentStyle?.styleAnalysis || '')
        .replace('{topic}', currentTopic)
        .replace('{framework}', selectedFramework?.content || '')
        .replace('{currentCopywriting}', editableCopywriting)
        .replace('{feedback}', feedback)

      const response = await fetch('/api/revise-copywriting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          styleAnalysis: currentStyle?.styleAnalysis,
          topic: currentTopic,
          framework: selectedFramework?.content,
          currentCopywriting: editableCopywriting,
          feedback: feedback,
          systemPrompt: promptConfig.reviseCopywriting.systemPrompt,
          userPrompt: userPrompt
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '文案修改失败')
      }

      setFinalCopywriting(data.copywriting)
      setEditableCopywriting(data.copywriting)
      addToHistory(data.copywriting, feedback)
      
      const newVersion = {
        id: Date.now().toString(),
        content: data.copywriting,
        createdAt: new Date().toISOString(),
        feedback: feedback
      }
      const newHistory = [newVersion, ...copywritingHistory].slice(0, 20)
      saveToRecord(data.copywriting, newHistory)
      setFeedback('')
    } catch (err) {
      setError(err instanceof Error ? err.message : '文案修改失败')
    } finally {
      setIsRevising(false)
    }
  }, [editableCopywriting, feedback, currentStyle, currentTopic, selectedFramework, setFinalCopywriting, addToHistory, copywritingHistory, saveToRecord, promptConfig])

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(editableCopywriting)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      alert('复制失败，请手动复制')
    }
  }, [editableCopywriting])

  const handleRestore = useCallback((id: string) => {
    restoreFromHistory(id)
    const history = copywritingHistory.find(h => h.id === id)
    if (history) {
      setEditableCopywriting(history.content)
    }
    setShowHistory(false)
  }, [restoreFromHistory, copywritingHistory])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        if (feedback.trim()) {
          reviseCopywriting()
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && !window.getSelection()?.toString()) {
        e.preventDefault()
        handleCopy()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [feedback, reviseCopywriting, handleCopy])

  if (!currentStyle || !currentTopic || !selectedFramework) {
    return null
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => router.push('/generate')}
          className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 flex items-center gap-1 text-sm"
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
            <span className="text-gray-500 dark:text-gray-400">风格：</span>
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

      <div className="card mb-6">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          已选框架
        </h3>
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-sm text-gray-600 dark:text-gray-400 max-h-40 overflow-y-auto whitespace-pre-wrap">
          {selectedFramework.content}
        </div>
      </div>

      {!finalCopywriting && !isLoading && (
        <div className="card text-center py-12">
          <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
            准备生成完整文案
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
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
          <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="animate-spin w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">
            正在生成文案<span className="loading-dots"></span>
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            AI正在根据风格和框架创作中，请稍候...
          </p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {finalCopywriting && !isLoading && (
        <>
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                生成的文案
              </h3>
              <div className="flex items-center gap-2">
                {copywritingHistory.length > 0 && (
                  <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="btn-secondary text-sm flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    历史 ({copywritingHistory.length})
                  </button>
                )}
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
                    copied ? 'text-green-600 dark:text-green-400 border-green-300 dark:border-green-700' : ''
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
            
            {showHistory && copywritingHistory.length > 0 && (
              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg max-h-40 overflow-y-auto">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">点击恢复历史版本</p>
                {copywritingHistory.map((version, index) => (
                  <button
                    key={version.id}
                    onClick={() => handleRestore(version.id)}
                    className="w-full text-left p-2 mb-1 last:mb-0 rounded bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-gray-800 dark:text-gray-200 font-medium">
                        版本 {copywritingHistory.length - index}
                      </span>
                      <span className="text-gray-400 dark:text-gray-500 text-xs">
                        {new Date(version.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {version.feedback && (
                      <p className="text-gray-500 dark:text-gray-400 text-xs mt-1 truncate">
                        {version.feedback}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            )}
            
            <textarea
              value={editableCopywriting}
              onChange={(e) => setEditableCopywriting(e.target.value)}
              className="textarea-field min-h-[300px] text-base leading-relaxed mb-4"
              placeholder="文案内容..."
            />
          </div>

          <div className="card mt-6">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              修改意见
              <span className="text-xs font-normal text-gray-400 dark:text-gray-500 ml-2">
                Ctrl+Enter 快速提交
              </span>
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              输入您对文案的修改意见，AI将根据您的反馈进行调整
            </p>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="textarea-field min-h-[100px] text-sm mb-4"
              placeholder="例如：开头可以更吸引人一些、中间部分太长了需要精简、结尾可以加一个行动号召..."
            />
            <div className="flex justify-end">
              <button
                onClick={reviseCopywriting}
                disabled={isRevising || !feedback.trim()}
                className="btn-primary flex items-center gap-2"
              >
                {isRevising ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    正在修改...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    进行修改
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <button
              onClick={() => router.push('/')}
              className="btn-primary flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              返回首页
            </button>
          </div>

          <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            提示：您可以直接在文本框中编辑文案内容，也可以输入修改意见让AI帮您调整
          </div>
        </>
      )}
    </div>
  )
}
