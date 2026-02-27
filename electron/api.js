/**
 * Electron 主进程 API 处理模块
 * 
 * 【重要】后端连接点说明：
 * ============================================
 * 此文件运行在 Electron 主进程，处理所有 AI API 调用
 * API Key 在此处管理，前端无法直接访问
 * ============================================
 */

const { ipcMain } = require('electron')
const OpenAI = require('openai')

// ============================================
// 【后端连接点 1】API 配置
// ============================================
const API_CONFIG = {
  // 阿里云千问 API 配置
  DASHSCOPE_API_KEY: process.env.DASHSCOPE_API_KEY || 'sk-4561661278024ff4bcd1844225834ea8',
  DASHSCOPE_BASE_URL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  MODEL: 'qwen-plus',
  TIMEOUT: 120000,
}

// 初始化 OpenAI 客户端（兼容阿里云千问）
const client = new OpenAI({
  apiKey: API_CONFIG.DASHSCOPE_API_KEY,
  baseURL: API_CONFIG.DASHSCOPE_BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
})

// 重试机制
async function withRetry(fn, maxRetries = 3) {
  let lastError = null
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      console.log(`Attempt ${i + 1} failed:`, error.message)
      
      if (i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1000
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }
  
  throw lastError
}

// ============================================
// 【后端连接点 2】风格提取 API
// ============================================
ipcMain.handle('api:extract-style', async (event, { texts }) => {
  const prompt = `你是一位专业的视频内容分析师。请分析以下视频文案的风格特点。

## 文案内容
${texts.map((t, i) => `文案${i + 1}：\n${t}`).join('\n\n')}

请从以下维度分析文案风格：
1. 语言风格（口语化程度、用词特点、句式结构）
2. 叙事结构（开头方式、内容组织、结尾特点）
3. 情感表达（情感基调、情感渲染方式）
4. 节奏特点（长短句搭配、停顿节奏、信息密度）
5. 目标受众（受众画像、沟通方式）
6. 独特标识（口头禅、特色表达、个人风格）

请用简洁的要点形式输出分析结果，便于后续参考。`

  const completion = await withRetry(async () => {
    return await client.chat.completions.create({
      model: API_CONFIG.MODEL,
      messages: [
        {
          role: 'system',
          content: '你是一位专业的视频内容分析师，擅长分析文案风格特点。'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
    })
  })

  return { styleAnalysis: completion.choices[0]?.message?.content || '' }
})

// ============================================
// 【后端连接点 3】框架生成 API
// ============================================
ipcMain.handle('api:generate-frameworks', async (event, { styleAnalysis, topic }) => {
  const prompt = `你是一位真实的视频内容创作者，正在为自己的新视频规划内容框架。

## 你的文案风格
${styleAnalysis}

## 新视频主题
${topic}

请根据你的风格特点，为新主题设计3个不同角度的内容框架。

要求：
1. **风格一致**：框架要符合你的写作风格，像你自己写的
2. **角度多样**：三个框架要有不同的切入角度或叙事方式
3. **结构清晰**：每个框架包含开头、主体、结尾三部分
4. **比喻克制**：比喻只是调味料，点到为止。绝不要用比喻强行构建整个叙事

请用以下JSON格式输出（只输出JSON，不要其他内容）：
{
  "frameworks": [
    {
      "id": "1",
      "title": "框架标题（简短概括这个框架的特点）",
      "content": "开头：...\n主体：...\n结尾：..."
    },
    ...
  ]
}`

  const completion = await withRetry(async () => {
    return await client.chat.completions.create({
      model: API_CONFIG.MODEL,
      messages: [
        {
          role: 'system',
          content: '你是一位真实的视频内容创作者，有着丰富的创作经验。你总是用JSON格式输出内容。'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.8,
      response_format: { type: 'json_object' }
    })
  })

  const content = completion.choices[0]?.message?.content || '{"frameworks":[]}'
  return JSON.parse(content)
})

// ============================================
// 【后端连接点 4】文案生成 API
// ============================================
ipcMain.handle('api:generate-copywriting', async (event, { styleAnalysis, topic, framework }) => {
  const prompt = `你是一位真实的视频内容创作者，正在根据自己规划的框架撰写文案。

## 你的文案风格
${styleAnalysis}

## 视频主题
${topic}

## 内容框架
${framework}

请根据以上信息，撰写一篇完整的视频文案。

要求：
1. **风格一致**：文案要符合你的风格特点，像你自己写的
2. **框架遵循**：按照框架的结构展开，但可以灵活调整
3. **自然流畅**：文案要像在跟朋友聊天，不要有AI味
4. **比喻克制**：比喻只是调味料，点到为止。绝不要用比喻强行构建整个叙事

请直接输出文案内容，不需要额外的说明。`

  const completion = await withRetry(async () => {
    return await client.chat.completions.create({
      model: API_CONFIG.MODEL,
      messages: [
        {
          role: 'system',
          content: '你是一位真实的视频内容创作者，有着丰富的创作经验。'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
    })
  })

  return { copywriting: completion.choices[0]?.message?.content || '' }
})

// ============================================
// 【后端连接点 5】文案修改 API
// ============================================
ipcMain.handle('api:revise-copywriting', async (event, { styleAnalysis, topic, framework, currentCopywriting, feedback }) => {
  const prompt = `你是一位真实的视频内容创作者，正在根据用户反馈修改自己的文案。

## 文案风格分析
${styleAnalysis || '无'}

## 视频主题
${topic || '无'}

## 原始文案框架
${framework || '无'}

## 当前文案内容
${currentCopywriting}

## 用户的修改意见
${feedback}

请根据用户的修改意见，对当前文案进行修改。要求：
1. **认真对待反馈**：仔细理解用户的修改意见，针对性地进行调整
2. **风格一致**：保持原有的文案风格，像原视频作者本人写的
3. **保留优点**：保留当前文案中用户没有提出问题的部分
4. **自然流畅**：修改后的文案要自然连贯，不要有拼凑感
5. **比喻克制**：比喻只是调味料，点到为止。绝不要用比喻强行构建整个叙事

请直接输出修改后的完整文案内容，不需要额外的说明。`

  const completion = await withRetry(async () => {
    return await client.chat.completions.create({
      model: API_CONFIG.MODEL,
      messages: [
        {
          role: 'system',
          content: '你是一位真实的视频内容创作者，有着丰富的创作经验。你擅长根据用户反馈修改文案，保持风格一致的同时满足用户需求。'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
    })
  })

  return { copywriting: completion.choices[0]?.message?.content || '' }
})

console.log('Electron API handlers registered')

module.exports = { API_CONFIG }
