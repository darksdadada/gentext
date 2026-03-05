'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/useAppStore'
import { PromptConfig, DEFAULT_PROMPT_CONFIG } from '@/types'

type PromptKey = keyof PromptConfig

const PROMPT_CONFIG: Record<PromptKey, { name: string; description: string; variables: string[] }> = {
  extractStyle: {
    name: '提取风格',
    description: '分析视频文案并提取风格特征',
    variables: ['{textsCount}', '{combinedTexts}']
  },
  generateFrameworks: {
    name: '生成框架',
    description: '根据风格分析生成文案框架',
    variables: ['{styleAnalysis}', '{topic}']
  },
  generateCopywriting: {
    name: '生成文案',
    description: '根据框架生成完整文案',
    variables: ['{styleAnalysis}', '{topic}', '{framework}']
  },
  reviseCopywriting: {
    name: '修改文案',
    description: '根据用户反馈修改文案',
    variables: ['{styleAnalysis}', '{topic}', '{framework}', '{currentCopywriting}', '{feedback}']
  }
}

export default function PromptsPage() {
  const router = useRouter()
  const { promptConfig, updatePromptConfig, setPromptConfig } = useAppStore()
  const [selectedKey, setSelectedKey] = useState<PromptKey>('extractStyle')
  const [hasChanges, setHasChanges] = useState(false)

  const currentPrompt = promptConfig[selectedKey]
  const config = PROMPT_CONFIG[selectedKey]

  const handleSystemPromptChange = (value: string) => {
    updatePromptConfig(selectedKey, { systemPrompt: value })
    setHasChanges(true)
  }

  const handleUserPromptChange = (value: string) => {
    updatePromptConfig(selectedKey, { userPromptTemplate: value })
    setHasChanges(true)
  }

  const handleReset = () => {
    if (confirm('确定要重置所有提示词为默认值吗？')) {
      setPromptConfig(DEFAULT_PROMPT_CONFIG)
      setHasChanges(false)
    }
  }

  const handleResetCurrent = () => {
    if (confirm('确定要重置当前提示词为默认值吗？')) {
      updatePromptConfig(selectedKey, {
        systemPrompt: DEFAULT_PROMPT_CONFIG[selectedKey].systemPrompt,
        userPromptTemplate: DEFAULT_PROMPT_CONFIG[selectedKey].userPromptTemplate
      })
      setHasChanges(true)
    }
  }

  const highlightVariables = (text: string) => {
    const parts = text.split(/(\{[^}]+\})/g)
    return parts.map((part, index) => {
      if (part.match(/^\{[^}]+\}$/)) {
        return <span key={index} className="prompt-variable">{part}</span>
      }
      return part
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
        <h2 className="text-3xl font-bold mb-3 text-gray-800 dark:text-gray-100">
          提示词修改
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          自定义 LLM 调用的系统提示词和用户提示词模板
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="card sticky top-28">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">
              选择功能模块
            </h3>
            <div className="space-y-2">
              {(Object.keys(PROMPT_CONFIG) as PromptKey[]).map((key) => (
                <button
                  key={key}
                  onClick={() => setSelectedKey(key)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                    selectedKey === key
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="font-medium">{PROMPT_CONFIG[key].name}</div>
                  <div className="text-xs mt-1 opacity-70">
                    {PROMPT_CONFIG[key].description}
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleReset}
                className="w-full btn-secondary text-sm"
              >
                重置所有提示词
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                系统提示词
              </h3>
              <button
                onClick={handleResetCurrent}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                重置当前
              </button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              定义 AI 的角色和行为准则
            </p>
            <textarea
              value={currentPrompt.systemPrompt}
              onChange={(e) => handleSystemPromptChange(e.target.value)}
              className="textarea-field min-h-[120px] font-mono text-sm"
              placeholder="输入系统提示词..."
            />
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                用户提示词模板
              </h3>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              定义发送给 AI 的具体任务和上下文
            </p>
            <textarea
              value={currentPrompt.userPromptTemplate}
              onChange={(e) => handleUserPromptChange(e.target.value)}
              className="textarea-field min-h-[300px] font-mono text-sm"
              placeholder="输入用户提示词模板..."
            />
          </div>

          <div className="card bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
            <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              可用变量
            </h3>
            <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
              以下变量会在运行时被替换为实际内容：
            </p>
            <div className="flex flex-wrap gap-2">
              {config.variables.map((variable) => (
                <span key={variable} className="prompt-variable">
                  {variable}
                </span>
              ))}
            </div>
            <div className="mt-4 text-sm text-amber-600 dark:text-amber-400">
              <p className="font-medium mb-2">变量说明：</p>
              <ul className="space-y-1 list-disc list-inside">
                {selectedKey === 'extractStyle' && (
                  <>
                    <li><code className="prompt-variable">{`{textsCount}`}</code> - 文案数量</li>
                    <li><code className="prompt-variable">{`{combinedTexts}`}</code> - 合并后的文案内容</li>
                  </>
                )}
                {selectedKey === 'generateFrameworks' && (
                  <>
                    <li><code className="prompt-variable">{`{styleAnalysis}`}</code> - 风格分析结果</li>
                    <li><code className="prompt-variable">{`{topic}`}</code> - 用户输入的主题</li>
                  </>
                )}
                {selectedKey === 'generateCopywriting' && (
                  <>
                    <li><code className="prompt-variable">{`{styleAnalysis}`}</code> - 风格分析结果</li>
                    <li><code className="prompt-variable">{`{topic}`}</code> - 用户输入的主题</li>
                    <li><code className="prompt-variable">{`{framework}`}</code> - 选定的文案框架</li>
                  </>
                )}
                {selectedKey === 'reviseCopywriting' && (
                  <>
                    <li><code className="prompt-variable">{`{styleAnalysis}`}</code> - 风格分析结果</li>
                    <li><code className="prompt-variable">{`{topic}`}</code> - 用户输入的主题</li>
                    <li><code className="prompt-variable">{`{framework}`}</code> - 选定的文案框架</li>
                    <li><code className="prompt-variable">{`{currentCopywriting}`}</code> - 当前文案内容</li>
                    <li><code className="prompt-variable">{`{feedback}`}</code> - 用户的修改意见</li>
                  </>
                )}
              </ul>
            </div>
          </div>

          {hasChanges && (
            <div className="fixed bottom-6 right-6 bg-primary-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              修改已自动保存
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
