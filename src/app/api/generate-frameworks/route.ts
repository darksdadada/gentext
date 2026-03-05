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

async function callAPI(prompt: string, systemPrompt: string, temperature = 0.7): Promise<string> {
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
      temperature,
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
    const { styleAnalysis, topic } = await request.json()
    
    if (!styleAnalysis || !topic) {
      return NextResponse.json(
        { error: '请提供风格分析和主题' },
        { status: 400 }
      )
    }

    const prompt = `你是一位真实的视频内容创作者，正在为自己的新视频策划文案框架。你要像真人一样思考，而不是像AI一样套模板。

## 已有的文案风格分析
${styleAnalysis}

## 新的主题
${topic}

请根据以上风格分析，为新主题生成3个不同角度的解读思路与文案框架。每个框架需要包含：
1. **解读角度**：从什么角度切入这个主题（要具体、接地气，不要抽象概念）
2. **核心观点**：想要传达的核心信息（要有真实洞察，不是空话套话）
3. **文案框架**：详细的段落结构规划（开头、主体、结尾的具体内容方向）

## 重要原则
- **贴近现实**：内容要扎根真实生活，用真实的场景、案例、感受来支撑观点
- **比喻克制**：比喻只是调味料，不是主菜。比喻要自然贴切、点到为止，让人会心一笑即可。绝不要用比喻来强行构建整个叙事框架，更不要为了凑比喻而编造牵强的内容
- **真人语感**：想象你是原视频作者本人，用他的口吻和思维方式来思考这个新主题。要像朋友聊天一样自然，不要像写论文或做报告
- **言之有物**：每句话都要有信息量，避免正确的废话和空洞的升华
- **各有特色**：三个框架要从完全不同的角度切入，给用户真正的选择空间

请用以下格式输出，方便解析：

===框架1===
【解读角度】
（内容）

【核心观点】
（内容）

【文案框架】
（内容）

===框架2===
【解读角度】
（内容）

【核心观点】
（内容）

【文案框架】
（内容）

===框架3===
【解读角度】
（内容）

【核心观点】
（内容）

【文案框架】
（内容）`

    const content = await withRetry(async () => {
      return await callAPI(
        prompt,
        '你是一位真实的视频内容创作者，有着丰富的创作经验。你擅长像真人一样思考，用接地气的方式表达观点，避免AI式的套路和过度比喻。你的文案让人感觉是朋友在聊天，而不是在看一篇精心包装的文章。',
        0.8
      )
    })
    
    const frameworks = parseFrameworks(content)
    
    return NextResponse.json({ frameworks })
  } catch (error) {
    console.error('Generate frameworks error:', error)
    const errorMessage = error instanceof Error ? error.message : '框架生成失败，请稍后重试'
    return NextResponse.json(
      { error: `网络连接不稳定，请重试。错误: ${errorMessage}` },
      { status: 500 }
    )
  }
}

function parseFrameworks(content: string) {
  const frameworks = []
  const parts = content.split(/===框架[123]===/)
  
  for (let i = 1; i < parts.length; i++) {
    const part = parts[i].trim()
    if (part) {
      frameworks.push({
        id: `framework-${i}`,
        title: `解读思路 ${i}`,
        content: part
      })
    }
  }
  
  if (frameworks.length === 0) {
    frameworks.push(
      { id: 'framework-1', title: '解读思路 1', content: content }
    )
  }
  
  return frameworks
}
