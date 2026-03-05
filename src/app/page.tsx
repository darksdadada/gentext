'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/useAppStore'
import { Style } from '@/types'

export default function HomePage() {
  const router = useRouter()
  const { styles, deleteStyle, setCurrentStyle, setCurrentTopic, resetForNewCreation } = useAppStore()
  const [selectedStyle, setSelectedStyle] = useState<Style | null>(null)
  const [topic, setTopic] = useState('')
  const [showTopicInput, setShowTopicInput] = useState(false)
  const [expandedStyle, setExpandedStyle] = useState<string | null>(null)

  const handleSelectStyle = (style: Style) => {
    setSelectedStyle(style)
    setShowTopicInput(true)
  }

  const handleDeleteStyle = (id: string) => {
    if (confirm('确定要删除这个风格吗？')) {
      deleteStyle(id)
      if (selectedStyle?.id === id) {
        setSelectedStyle(null)
        setShowTopicInput(false)
      }
    }
  }

  const handleProceed = () => {
    if (!selectedStyle || !topic.trim()) return
    
    resetForNewCreation()
    setCurrentStyle(selectedStyle)
    setCurrentTopic(topic.trim())
    router.push('/generate')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-3">
          <span className="text-primary-600 dark:text-primary-400">文案创作</span>加速器
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          选择一个已保存的文案风格，开始创作新主题文案
        </p>
      </div>

      {styles.length === 0 ? (
        <div className="card text-center py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-transparent dark:from-primary-950/20 pointer-events-none" />
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/50 dark:to-primary-800/30 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <svg className="w-12 h-12 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">
              开始你的创作之旅
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
              创建你的第一个文案风格，AI将学习你的写作特点，帮你快速生成同风格的新文案
            </p>
            <button
              onClick={() => router.push('/create-style')}
              className="btn-primary px-8 py-4 text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                创建第一个风格
              </span>
            </button>
            <div className="mt-10 grid grid-cols-3 gap-6 max-w-lg mx-auto">
              <div className="text-center">
                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <span className="text-primary-600 dark:text-primary-400 font-bold">1</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">输入文案</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <span className="text-primary-600 dark:text-primary-400 font-bold">2</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">AI分析风格</p>
              </div>
              <div className="text-center">
                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <span className="text-primary-600 dark:text-primary-400 font-bold">3</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">生成新文案</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {styles.map((style) => (
              <div
                key={style.id}
                className={`card cursor-pointer transition-all duration-200 ${
                  selectedStyle?.id === style.id
                    ? 'ring-2 ring-primary-500 dark:ring-primary-400 border-primary-200 dark:border-primary-800 shadow-lg'
                    : 'hover:shadow-md hover:border-gray-200 dark:hover:border-gray-600'
                }`}
                onClick={() => handleSelectStyle(style)}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-100 truncate flex-1">
                    {style.name}
                  </h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteStyle(style.id)
                    }}
                    className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 ml-2 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  创建于 {formatDate(style.createdAt)}
                </p>
                
                <div className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  <span className="font-medium">{style.sourceTexts.length}</span> 个源文案
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setExpandedStyle(expandedStyle === style.id ? null : style.id)
                  }}
                  className="text-primary-600 dark:text-primary-400 text-sm hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-1 transition-colors"
                >
                  {expandedStyle === style.id ? '收起分析' : '查看风格分析'}
                  <svg 
                    className={`w-4 h-4 transition-transform duration-200 ${expandedStyle === style.id ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {expandedStyle === style.id && (
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <div className="text-sm text-gray-600 dark:text-gray-300 max-h-48 overflow-y-auto whitespace-pre-wrap">
                      {style.styleAnalysis}
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            <div
              className="card cursor-pointer transition-all duration-200 hover:shadow-md border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 flex items-center justify-center min-h-[180px]"
              onClick={() => router.push('/create-style')}
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">创建新风格</p>
              </div>
            </div>
          </div>

          {showTopicInput && selectedStyle && (
            <div className="card border-primary-200 dark:border-primary-800">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-gray-700 dark:text-gray-300">
                  已选择风格：<span className="font-medium text-primary-600 dark:text-primary-400">{selectedStyle.name}</span>
                </span>
              </div>
              
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                输入新文案主题
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && topic.trim()) {
                    handleProceed()
                  }
                }}
                placeholder="例如：如何高效学习一门新技能、城市独居青年的生活状态..."
                className="input-field mb-4"
                autoFocus
              />
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setSelectedStyle(null)
                    setShowTopicInput(false)
                    setTopic('')
                  }}
                  className="btn-secondary"
                >
                  取消
                </button>
                <button
                  onClick={handleProceed}
                  disabled={!topic.trim()}
                  className="btn-primary flex items-center gap-2"
                >
                  下一步：生成框架
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
