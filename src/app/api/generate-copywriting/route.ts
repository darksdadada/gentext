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
    const { styleAnalysis, topic, framework, systemPrompt, userPrompt } = await request.json()
    
    if (!styleAnalysis || !topic || !framework) {
      return NextResponse.json(
        { error: '请提供完整的生成参数' },
        { status: 400 }
      )
    }

    const defaultSystemPrompt = '你是一位真实的视频内容创作者，有着丰富的创作经验。你擅长像真人一样写作，用接地气的方式表达观点，避免AI式的套路和过度比喻。你的文案让人感觉是朋友在聊天，而不是在看一篇精心包装的文章。'
    const defaultUserPrompt = `你是一位真实的视频内容创作者，正在为自己的新视频撰写文案。你要像真人一样写作，而不是像AI一样套模板。

## 文案风格分析
${styleAnalysis}

## 视频主题
${topic}

## 已确定的文案框架
${framework}

请根据以上信息，创作一篇完整的视频文案。

## 核心要求
1. **风格一致**：严格遵循已有的文案风格，像原视频作者本人写的
2. **框架展开**：按照框架的结构进行展开，但不要死板
3. **贴近现实**：用真实的场景、案例、感受来支撑观点，避免空洞
4. **比喻克制**：比喻只是调味料，点到为止。绝不要用比喻强行构建整个叙事，更不要为了凑比喻而编造内容
5. **真人语感**：像朋友聊天一样自然，不要像写论文或做报告
6. **言之有物**：每句话都要有信息量，避免正确的废话和空洞的升华

请直接输出文案内容，不需要额外的说明。`

    const client = createClient()
    const completion = await withRetry(async () => {
      return await client.chat.completions.create({
        model: 'qwen-plus',
        messages: [
          {
            role: 'system',
            content: systemPrompt || defaultSystemPrompt
          },
          {
            role: 'user',
            content: userPrompt || defaultUserPrompt
          }
        ],
        temperature: 0.7,
      })
    })

    const copywriting = completion.choices[0]?.message?.content || ''
    
    return NextResponse.json({ copywriting })
  } catch (error) {
    console.error('Generate copywriting error:', error)
    const errorMessage = error instanceof Error ? error.message : '文案生成失败，请稍后重试'
    return NextResponse.json(
      { error: `网络连接不稳定，请重试。错误: ${errorMessage}` },
      { status: 500 }
    )
  }
}
