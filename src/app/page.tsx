'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/useAppStore'
import { Style } from '@/types'

export default function HomePage() {
  const router = useRouter()
  const { styles, deleteStyle, setCurrentStyle, setCurrentTopic } = useAppStore()
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
        <h2 className="text-3xl font-bold text-gray-800 mb-3">
          文案创作
        </h2>
        <p className="text-gray-600">
          选择一个已保存的文案风格，开始创作新主题文案
        </p>
      </div>

      {styles.length === 0 ? (
        <div className="card text-center py-16">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-gray-800 mb-3">
            还没有文案风格
          </h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            创建你的第一个文案风格，开始使用AI加速文案创作
          </p>
          <button
            onClick={() => router.push('/create-style')}
            className="btn-primary px-8 py-3 text-lg"
          >
            创建第一个风格
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {styles.map((style) => (
              <div
                key={style.id}
                className={`card cursor-pointer transition-all duration-200 ${
                  selectedStyle?.id === style.id
                    ? 'ring-2 ring-primary-500 border-primary-200'
                    : 'hover:shadow-md'
                }`}
                onClick={() => handleSelectStyle(style)}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-800 truncate flex-1">
                    {style.name}
                  </h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteStyle(style.id)
                    }}
                    className="text-gray-400 hover:text-red-500 ml-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                
                <p className="text-xs text-gray-500 mb-3">
                  创建于 {formatDate(style.createdAt)}
                </p>
                
                <div className="text-sm text-gray-600 mb-3">
                  <span className="font-medium">{style.sourceTexts.length}</span> 个源文案
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setExpandedStyle(expandedStyle === style.id ? null : style.id)
                  }}
                  className="text-primary-600 text-sm hover:text-primary-700 flex items-center gap-1"
                >
                  {expandedStyle === style.id ? '收起分析' : '查看风格分析'}
                  <svg 
                    className={`w-4 h-4 transition-transform ${expandedStyle === style.id ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {expandedStyle === style.id && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="text-sm text-gray-600 max-h-48 overflow-y-auto whitespace-pre-wrap">
                      {style.styleAnalysis}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {showTopicInput && selectedStyle && (
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-gray-700">
                  已选择风格：<span className="font-medium text-primary-600">{selectedStyle.name}</span>
                </span>
              </div>
              
              <label className="block text-sm font-medium text-gray-700 mb-2">
                输入新文案主题
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="例如：如何高效学习一门新技能、城市独居青年的生活状态..."
                className="input-field mb-4"
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
