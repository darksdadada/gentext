'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/useAppStore'
import { Style } from '@/types'

export default function StylesPage() {
  const router = useRouter()
  const { styles, deleteStyle, updateStyle, setCurrentStyle, setCurrentTopic, resetForNewCreation } = useAppStore()
  const [selectedStyle, setSelectedStyle] = useState<Style | null>(null)
  const [topic, setTopic] = useState('')
  const [showTopicInput, setShowTopicInput] = useState(false)
  const [expandedStyle, setExpandedStyle] = useState<string | null>(null)
  const [editingStyle, setEditingStyle] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')

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

  const handleEditStyle = (style: Style) => {
    setEditingStyle(style.id)
    setEditContent(style.styleAnalysis)
  }

  const handleSaveEdit = (id: string) => {
    updateStyle(id, { styleAnalysis: editContent })
    setEditingStyle(null)
    if (selectedStyle?.id === id) {
      setSelectedStyle({ ...selectedStyle, styleAnalysis: editContent })
    }
  }

  const handleCancelEdit = () => {
    setEditingStyle(null)
    setEditContent('')
  }

  const handleProceed = () => {
    if (!selectedStyle || !topic.trim()) return
    
    resetForNewCreation()
    const updatedStyle = styles.find(s => s.id === selectedStyle.id) || selectedStyle
    setCurrentStyle(updatedStyle)
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

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-3">
          风格库
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          选择一个已保存的文案风格，开始创作新主题文案
        </p>
      </div>

      {styles.length === 0 ? (
        <div className="card text-center py-12">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">暂无保存的风格</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">请先创建视频文案来提取风格</p>
          <button
            onClick={() => router.push('/create-style')}
            className="btn-primary"
          >
            去创建风格
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
                    ? 'ring-2 ring-primary-500 dark:ring-primary-400 border-primary-200 dark:border-primary-800'
                    : 'hover:shadow-md'
                }`}
                onClick={() => handleSelectStyle(style)}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-800 dark:text-gray-100 truncate flex-1">
                    {style.name}
                  </h3>
                  <div className="flex items-center gap-1 ml-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditStyle(style)
                      }}
                      className="text-gray-400 dark:text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 p-1"
                      title="编辑风格分析"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteStyle(style.id)
                      }}
                      className="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 p-1"
                      title="删除风格"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
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
                  className="text-primary-600 dark:text-primary-400 text-sm hover:text-primary-700 dark:hover:text-primary-300 flex items-center gap-1"
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
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <div className="text-sm text-gray-600 dark:text-gray-300 max-h-60 overflow-y-auto whitespace-pre-wrap">
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

      {editingStyle && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                编辑风格分析
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                您可以直接修改风格分析内容，修改后会立即保存
              </p>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="textarea-field min-h-[400px] text-sm font-mono"
                placeholder="风格分析内容..."
              />
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={handleCancelEdit}
                className="btn-secondary"
              >
                取消
              </button>
              <button
                onClick={() => handleSaveEdit(editingStyle)}
                className="btn-primary flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                保存修改
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
