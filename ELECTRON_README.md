# 文案创作加速器 - Electron 桌面版

基于 Electron + Next.js 构建的 AI 文案创作工具。

## 快速开始

### 开发模式

```bash
# 安装依赖
npm install

# 启动 Electron 开发模式
npm run electron:dev
```

### 打包发布

```bash
# Windows
npm run electron:build:win

# macOS
npm run electron:build:mac

# Linux
npm run electron:build:linux
```

打包后的文件位于 `dist` 目录。

## 项目结构

```
gentext/
├── electron/              # Electron 主进程
│   ├── main.js           # 主进程入口
│   ├── preload.js        # 预加载脚本
│   └── api.js            # API 处理模块
├── src/                   # Next.js 前端
│   ├── app/              # 页面组件
│   ├── lib/              # 工具库
│   │   └── api-adapter.ts # API 适配层（自动检测环境）
│   └── types/            # 类型定义
├── public/               # 静态资源
└── out/                  # 构建输出（静态文件）
```

## 后端连接点说明

### 概述

本项目已清晰标注所有与后端连接的关键点，方便后续后端优化对接。

### 关键文件

| 文件 | 说明 |
|------|------|
| `electron/api.js` | 主进程 API 处理，包含所有 AI 调用逻辑 |
| `electron/preload.js` | 前端与主进程通信桥梁 |
| `src/lib/api-adapter.ts` | 前端 API 适配层，自动检测运行环境 |
| `src/lib/api.ts` | API 服务层定义 |

### 后端优化步骤

1. **修改 API 地址**
   - 编辑 `src/lib/api.ts` 中的 `API_CONFIG`
   - 将 `BACKEND_BASE_URL` 改为你的后端地址

2. **添加用户认证**
   - 在 `electron/api.js` 中添加认证逻辑
   - 或使用 `src/lib/api.ts` 中预留的 `authAPI`

3. **数据云端同步**
   - 使用 `src/lib/api.ts` 中预留的 `syncAPI`
   - 实现风格库云端存储

### API 连接点列表

```
【后端连接点 1】API 基础地址配置
【后端连接点 2】API Key 配置
【后端连接点 3】风格提取接口
【后端连接点 4】框架生成接口
【后端连接点 5】文案生成接口
【后端连接点 6】文案修改接口
【后端连接点 7】用户认证接口（预留）
【后端连接点 8】用户数据同步接口（预留）
```

## 安全建议

1. **API Key 管理**
   - 开发环境：可使用 `.env.local` 存储
   - 生产环境：必须移至后端服务器

2. **用户数据**
   - 当前使用 localStorage 本地存储
   - 生产环境建议使用后端数据库

## 技术栈

- **前端**: Next.js 14 + React 18 + TypeScript + Tailwind CSS
- **桌面**: Electron 33
- **状态管理**: Zustand
- **AI**: 阿里云千问 (Qwen)

## License

MIT
