export interface Style {
  id: string
  name: string
  createdAt: string
  sourceTexts: string[]
  styleAnalysis: string
}

export interface Framework {
  id: string
  title: string
  content: string
}

export interface CopywritingVersion {
  id: string
  content: string
  createdAt: string
  feedback?: string
}

export interface CreationRecord {
  id: string
  styleId: string
  styleName: string
  topic: string
  framework: string
  finalCopywriting: string
  versions: CopywritingVersion[]
  createdAt: string
  updatedAt: string
}

export interface PromptConfig {
  extractStyle: {
    systemPrompt: string
    userPromptTemplate: string
  }
  generateFrameworks: {
    systemPrompt: string
    userPromptTemplate: string
  }
  generateCopywriting: {
    systemPrompt: string
    userPromptTemplate: string
  }
  reviseCopywriting: {
    systemPrompt: string
    userPromptTemplate: string
  }
}

export interface AppState {
  styles: Style[]
  currentStyle: Style | null
  currentTopic: string
  frameworks: Framework[]
  selectedFramework: Framework | null
  finalCopywriting: string
  copywritingHistory: CopywritingVersion[]
  theme: 'light' | 'dark' | 'system'
  creationRecords: CreationRecord[]
  currentRecordId: string | null
  promptConfig: PromptConfig
  
  setStyles: (styles: Style[]) => void
  addStyle: (style: Style) => void
  deleteStyle: (id: string) => void
  setCurrentStyle: (style: Style | null) => void
  setCurrentTopic: (topic: string) => void
  setFrameworks: (frameworks: Framework[]) => void
  updateFramework: (id: string, content: string) => void
  setSelectedFramework: (framework: Framework | null) => void
  setFinalCopywriting: (text: string) => void
  addToHistory: (content: string, feedback?: string) => void
  restoreFromHistory: (id: string) => void
  clearHistory: () => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  reset: () => void
  resetForNewCreation: () => void
  addCreationRecord: (record: CreationRecord) => void
  updateCreationRecord: (id: string, updates: Partial<CreationRecord>) => void
  getCreationRecord: (id: string) => CreationRecord | undefined
  setCurrentRecordId: (id: string | null) => void
  loadFromCreationRecord: (record: CreationRecord) => void
  setPromptConfig: (config: PromptConfig) => void
  updatePromptConfig: (key: keyof PromptConfig, value: Partial<PromptConfig[keyof PromptConfig]>) => void
}

export const DEFAULT_PROMPT_CONFIG: PromptConfig = {
  extractStyle: {
    systemPrompt: '你是一位专业的文案分析师，擅长分析各类视频文案的风格特征，并能够提炼出可复用的风格模板。',
    userPromptTemplate: `你是一位专业的文案分析师。请分析以下{textsCount}个视频文案，提取出它们的共同风格特征。

{combinedTexts}

请从以下几个维度详细分析这些文案的风格特征，并以结构化的方式输出：

1. **语言风格**：分析文案的语言特点（如口语化程度、用词习惯、句式结构等）
2. **情感基调**：分析文案传递的情感色彩（如幽默、严肃、温暖、激励等）
3. **叙事结构**：分析文案的叙事方式和结构特点（如开头方式、转折技巧、结尾特点等）
4. **表达技巧**：分析文案使用的修辞手法和表达技巧（如比喻、排比、设问等）
5. **节奏韵律**：分析文案的节奏感和韵律特点
6. **受众定位**：分析文案的目标受众特征
7. **核心风格关键词**：用3-5个关键词概括这种风格

请确保分析结果能够指导后续生成同风格的新文案。`
  },
  generateFrameworks: {
    systemPrompt: '你是一位真实的视频内容创作者，有着丰富的创作经验。你擅长像真人一样思考，用接地气的方式表达观点，避免AI式的套路和过度比喻。你的文案让人感觉是朋友在聊天，而不是在看一篇精心包装的文章。',
    userPromptTemplate: `你是一位真实的视频内容创作者，正在为自己的新视频策划文案框架。你要像真人一样思考，而不是像AI一样套模板。

## 已有的文案风格分析
{styleAnalysis}

## 新的主题
{topic}

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
  },
  generateCopywriting: {
    systemPrompt: '你是一位真实的视频内容创作者，有着丰富的创作经验。你擅长像真人一样写作，用接地气的方式表达观点，避免AI式的套路和过度比喻。你的文案让人感觉是朋友在聊天，而不是在看一篇精心包装的文章。',
    userPromptTemplate: `你是一位真实的视频内容创作者，正在为自己的新视频撰写文案。你要像真人一样写作，而不是像AI一样套模板。

## 文案风格分析
{styleAnalysis}

## 视频主题
{topic}

## 已确定的文案框架
{framework}

请根据以上信息，创作一篇完整的视频文案。

## 核心要求
1. **风格一致**：严格遵循已有的文案风格，像原视频作者本人写的
2. **框架展开**：按照框架的结构进行展开，但不要死板
3. **贴近现实**：用真实的场景、案例、感受来支撑观点，避免空洞
4. **比喻克制**：比喻只是调味料，点到为止。绝不要用比喻强行构建整个叙事，更不要为了凑比喻而编造内容
5. **真人语感**：像朋友聊天一样自然，不要像写论文或做报告
6. **言之有物**：每句话都要有信息量，避免正确的废话和空洞的升华

请直接输出文案内容，不需要额外的说明。`
  },
  reviseCopywriting: {
    systemPrompt: '你是一位真实的视频内容创作者，有着丰富的创作经验。你擅长根据用户反馈修改文案，保持风格一致的同时满足用户需求。',
    userPromptTemplate: `你是一位真实的视频内容创作者，正在根据用户反馈修改自己的文案。

## 文案风格分析
{styleAnalysis}

## 视频主题
{topic}

## 原始文案框架
{framework}

## 当前文案内容
{currentCopywriting}

## 用户的修改意见
{feedback}

请根据用户的修改意见，对当前文案进行修改。要求：
1. **认真对待反馈**：仔细理解用户的修改意见，针对性地进行调整
2. **风格一致**：保持原有的文案风格，像原视频作者本人写的
3. **保留优点**：保留当前文案中用户没有提出问题的部分
4. **自然流畅**：修改后的文案要自然连贯，不要有拼凑感
5. **比喻克制**：比喻只是调味料，点到为止。绝不要用比喻强行构建整个叙事

请直接输出修改后的完整文案内容，不需要额外的说明。`
  }
}
