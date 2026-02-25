'use client'

import { usePathname } from 'next/navigation'

const steps = [
  { path: '/', label: '选择风格', icon: '1' },
  { path: '/generate', label: '生成框架', icon: '2' },
  { path: '/result', label: '完成文案', icon: '3' },
]

export default function ProgressBar() {
  const pathname = usePathname()
  
  if (pathname === '/create-style') return null
  
  const getCurrentStep = () => {
    if (pathname === '/result') return 2
    if (pathname === '/generate') return 1
    return 0
  }
  
  const currentStep = getCurrentStep()
  
  return (
    <div className="fixed top-16 left-0 right-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.path} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                    index < currentStep
                      ? 'bg-primary-600 text-white'
                      : index === currentStep
                      ? 'bg-primary-600 text-white ring-4 ring-primary-200 dark:ring-primary-900'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {index < currentStep ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.icon
                  )}
                </div>
                <span className={`text-xs mt-1 hidden sm:block ${
                  index <= currentStep 
                    ? 'text-primary-600 dark:text-primary-400 font-medium' 
                    : 'text-gray-400 dark:text-gray-500'
                }`}>
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-16 sm:w-24 md:w-32 h-0.5 mx-2 transition-all duration-300 ${
                  index < currentStep 
                    ? 'bg-primary-600' 
                    : 'bg-gray-200 dark:bg-gray-700'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
