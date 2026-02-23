import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '文案创作加速器',
  description: '基于视频文案风格生成新主题文案',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
          <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
              <h1 className="text-xl font-bold text-gray-800">
                <span className="text-primary-600">文案</span>创作加速器
              </h1>
              <nav className="flex items-center gap-4">
                <a href="/" className="text-gray-600 hover:text-primary-600 transition-colors">
                  风格创建
                </a>
                <a href="/create-style" className="text-gray-600 hover:text-primary-600 transition-colors">
                  首页
                </a>
              </nav>
            </div>
          </header>
          <main className="max-w-6xl mx-auto px-4 py-8">
            {children}
          </main>
          <footer className="border-t border-gray-200 bg-white/50 mt-auto">
            <div className="max-w-6xl mx-auto px-4 py-6 text-center text-gray-500 text-sm">
              文案创作加速器 - 让创作更高效
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
