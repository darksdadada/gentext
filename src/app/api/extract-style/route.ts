import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

const API_KEY = process.env.DASHSCOPE_API_KEY || 'sk-4561661278024ff4bcd1844225834ea8'
const BASE_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1'

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

async function callAPI(prompt: string, systemPrompt: string): Promise<string> {
  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: 'qwen-plus',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
    }),
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  const data = await response.json()
  return data.choices[0]?.message?.content || ''
}

export async function POST(request: NextRequest) {
  try {
    const { texts } = await request.json()
    
    if (!texts || !Array.isArray(texts) || texts.length === 0) {
      return NextResponse.json(
        { error: '请提供至少一个文案' },
        { status: 400 }
      )
    }

    const combinedText = texts.map((t: string, i: number) => `【文案${i + 1}】\n${t}`).join('\n\n')
    
    const prompt = `你是一位专业的文案分析师。请分析以下${texts.length}个视频文案，提取出它们的共同风格特征。

${combinedText}

请从以下几个维度详细分析这些文案的风格特征，并以结构化的方式输出：

1. **语言风格**：分析文案的语言特点（如口语化程度、用词习惯、句式结构等）
2. **情感基调**：分析文案传递的情感色彩（如幽默、严肃、温暖、激励等）
3. **叙事结构**：分析文案的叙事方式和结构特点（如开头方式、转折技巧、结尾特点等）
4. **表达技巧**：分析文案使用的修辞手法和表达技巧（如比喻、排比、设问等）
5. **节奏韵律**：分析文案的节奏感和韵律特点
6. **受众定位**：分析文案的目标受众特征
7. **核心风格关键词**：用3-5个关键词概括这种风格

请确保分析结果能够指导后续生成同风格的新文案。`

    const styleAnalysis = await withRetry(async () => {
      return await callAPI(
        prompt,
        '你是一位专业的文案分析师，擅长分析各类视频文案的风格特征，并能够提炼出可复用的风格模板。'
      )
    })
    
    return NextResponse.json({ styleAnalysis })
  } catch (error) {
    console.error('Extract style error:', error)
    const errorMessage = error instanceof Error ? error.message : '风格提取失败，请稍后重试'
    return NextResponse.json(
      { error: `网络连接不稳定，请重试。错误: ${errorMessage}` },
      { status: 500 }
    )
  }
}
