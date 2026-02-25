import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ProgressBar from '@/components/ProgressBar'
import ThemeToggle from '@/components/ThemeToggle'

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
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('gentext-storage');
                  if (theme) {
                    var parsed = JSON.parse(theme);
                    var themeValue = parsed.state?.theme;
                    if (themeValue === 'dark' || (themeValue === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                      document.documentElement.classList.add('dark');
                    }
                  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-950 transition-colors duration-300">
          <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-colors duration-300">
            <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
              <h1 className="text-xl font-bold text-gray-800 dark:text-white">
                <span className="text-primary-600 dark:text-primary-400">文案</span>创作加速器
              </h1>
              <div className="flex items-center gap-4">
                <nav className="hidden sm:flex items-center gap-4">
                  <a href="/" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors font-medium">
                    首页
                  </a>
                  <a href="/create-style" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    风格创建
                  </a>
                </nav>
                <ThemeToggle />
              </div>
            </div>
          </header>
          <ProgressBar />
          <main className="max-w-6xl mx-auto px-4 py-8 pt-28">
            {children}
          </main>
          <footer className="border-t border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 mt-auto transition-colors duration-300">
            <div className="max-w-6xl mx-auto px-4 py-6 text-center text-gray-500 dark:text-gray-400 text-sm">
              文案创作加速器 - 让创作更高效
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}
