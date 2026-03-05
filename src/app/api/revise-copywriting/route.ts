import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const getApiKey = () => {
  const apiKey = process.env.DASHSCOPE_API_KEY
  if (!apiKey) {
    throw new Error('DASHSCOPE_API_KEY 环境变量未配置，请在 .env.local 文件中设置')
  }
  return apiKey
}

const createClient = () => {
  return new OpenAI({
    apiKey: getApiKey(),
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    timeout: 120000,
  })
}

async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  let lastError: Error | null = null
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error
      console.log(`Attempt ${i + 1} failed:`, error)
      
      if (i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1000
        console.log(`Retrying in ${delay}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }
  
  throw lastError
}

export async function POST(request: NextRequest) {
  try {
    const { styleAnalysis, topic, framework, currentCopywriting, feedback } = await request.json()
    
    if (!currentCopywriting || !feedback) {
      return NextResponse.json(
        { error: '请提供当前文案和修改意见' },
        { status: 400 }
      )
    }

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

    const client = createClient()
    const completion = await withRetry(async () => {
      return await client.chat.completions.create({
        model: 'qwen-plus',
        messages: [
          {
            role: 'system',
            content: '你是一位真实的视频内容创作者，有着丰富的创作经验。你擅长根据用户反馈修改文案，保持风格一致的同时满足用户需求。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
      })
    })

    const copywriting = completion.choices[0]?.message?.content || ''
    
    return NextResponse.json({ copywriting })
  } catch (error) {
    console.error('Revise copywriting error:', error)
    const errorMessage = error instanceof Error ? error.message : '文案修改失败，请稍后重试'
    return NextResponse.json(
      { error: `网络连接不稳定，请重试。错误: ${errorMessage}` },
      { status: 500 }
    )
  }
}
