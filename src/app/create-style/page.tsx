'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/useAppStore'
import { Style } from '@/types'

interface TextInput {
  id: string
  value: string
}

export default function CreateStylePage() {
  const router = useRouter()
  const { addStyle } = useAppStore()
  const [texts, setTexts] = useState<TextInput[]>([
    { id: '1', value: '' }
  ])
  const [styleName, setStyleName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const addTextInput = () => {
    setTexts([...texts, { id: Date.now().toString(), value: '' }])
  }

  const removeTextInput = (id: string) => {
    if (texts.length > 1) {
      setTexts(texts.filter(t => t.id !== id))
    }
  }

  const updateText = (id: string, value: string) => {
    setTexts(texts.map(t => t.id === id ? { ...t, value } : t))
  }

  const handleSubmit = async () => {
    const validTexts = texts.filter(t => t.value.trim().length > 0)
    
    if (validTexts.length === 0) {
      setError('请至少输入一个文案')
      return
    }

    if (!styleName.trim()) {
      setError('请为风格命名')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/extract-style', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          texts: validTexts.map(t => t.value)
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '风格提取失败')
      }

      const newStyle: Style = {
        id: Date.now().toString(),
        name: styleName.trim(),
        createdAt: new Date().toISOString(),
        sourceTexts: validTexts.map(t => t.value),
        styleAnalysis: data.styleAnalysis
      }

      addStyle(newStyle)
      setSuccess(true)
      setTimeout(() => {
        router.push('/')
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : '风格提取失败')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => router.push('/')}
          className="text-gray-600 hover:text-gray-800 flex items-center gap-1 text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          返回首页
        </button>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-3 text-primary-600">
          视频文案风格提取
        </h2>
        <p className="text-gray-600">
          输入一个或多个视频文案，AI将自动分析并提取文案风格特征
        </p>
      </div>

      <div className="card mb-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            风格名称
          </label>
          <input
            type="text"
            value={styleName}
            onChange={(e) => setStyleName(e.target.value)}
            placeholder="例如：科技测评风、情感故事风、知识科普风..."
            className="input-field"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">
              视频文案（至少输入一个）
            </label>
            <button
              onClick={addTextInput}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              添加更多文案
            </button>
          </div>

          {texts.map((text, index) => (
            <div key={text.id} className="relative">
              <div className="flex items-start gap-2">
                <span className="text-sm text-gray-500 mt-3 w-16 shrink-0">
                  文案 {index + 1}
                </span>
                <textarea
                  value={text.value}
                  onChange={(e) => updateText(text.id, e.target.value)}
                  placeholder="粘贴你的视频文案内容..."
                  className="textarea-field flex-1 min-h-[150px]"
                />
                {texts.length > 1 && (
                  <button
                    onClick={() => removeTextInput(text.id)}
                    className="text-gray-400 hover:text-red-500 mt-3"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          风格创建成功！正在跳转到首页...
        </div>
      )}

      <div className="flex justify-center">
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="btn-primary px-8 py-3 text-lg flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              正在分析风格...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              提取文案风格
            </>
          )}
        </button>
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card text-center">
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-800 mb-2">输入文案</h3>
          <p className="text-sm text-gray-600">粘贴一个或多个视频文案</p>
        </div>

        <div className="card text-center">
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-800 mb-2">AI分析</h3>
          <p className="text-sm text-gray-600">智能提取文案风格特征</p>
        </div>

        <div className="card text-center">
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-800 mb-2">保存风格</h3>
          <p className="text-sm text-gray-600">风格存入库中随时复用</p>
        </div>
      </div>
    </div>
  )
}
