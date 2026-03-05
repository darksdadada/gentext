'use client'

import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/useAppStore'
import { CreationRecord } from '@/types'

export default function HistoryPage() {
  const router = useRouter()
  const { creationRecords, loadFromCreationRecord, deleteStyle } = useAppStore()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleLoadRecord = (record: CreationRecord) => {
    loadFromCreationRecord(record)
    router.push('/result')
  }

  const handleDeleteRecord = (id: string) => {
    if (confirm('确定要删除这条创作记录吗？')) {
      const updatedRecords = creationRecords.filter(r => r.id !== id)
      useAppStore.setState({ creationRecords: updatedRecords })
    }
  }

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + '...'
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
          创作历史记录
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          查看和管理你的所有创作记录
        </p>
      </div>

      {creationRecords.length === 0 ? (
        <div className="card text-center py-16">
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">
            暂无创作记录
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            开始你的第一次创作，记录将自动保存在这里
          </p>
          <button
            onClick={() => router.push('/')}
            className="btn-primary"
          >
            开始创作
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {creationRecords.map((record) => (
            <div
              key={record.id}
              className="card hover:shadow-md transition-all duration-200 cursor-pointer group"
              onClick={() => handleLoadRecord(record)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-3 py-1 rounded-full text-sm font-medium">
                      {record.styleName}
                    </span>
                    <span className="text-gray-400 dark:text-gray-500 text-sm">
                      {record.versions.length} 次修改
                    </span>
                  </div>
                  
                  <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2 text-lg">
                    {record.topic}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                    {truncateText(record.finalCopywriting, 150)}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      创建于 {formatDate(record.createdAt)}
                    </span>
                    {record.updatedAt !== record.createdAt && (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        更新于 {formatDate(record.updatedAt)}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleLoadRecord(record)
                    }}
                    className="p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors opacity-0 group-hover:opacity-100"
                    title="继续编辑"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteRecord(record.id)
                    }}
                    className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    title="删除记录"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {creationRecords.length > 0 && (
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          共 {creationRecords.length} 条创作记录
        </div>
      )}
    </div>
  )
}
