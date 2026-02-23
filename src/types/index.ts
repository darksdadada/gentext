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

export interface AppState {
  styles: Style[]
  currentStyle: Style | null
  currentTopic: string
  frameworks: Framework[]
  selectedFramework: Framework | null
  finalCopywriting: string
  
  setStyles: (styles: Style[]) => void
  addStyle: (style: Style) => void
  deleteStyle: (id: string) => void
  setCurrentStyle: (style: Style | null) => void
  setCurrentTopic: (topic: string) => void
  setFrameworks: (frameworks: Framework[]) => void
  updateFramework: (id: string, content: string) => void
  setSelectedFramework: (framework: Framework | null) => void
  setFinalCopywriting: (text: string) => void
  reset: () => void
}
