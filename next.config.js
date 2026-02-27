/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Electron 静态导出配置
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
