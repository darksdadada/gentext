import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AppState, Style, Framework, CopywritingVersion, CreationRecord, PromptConfig, DEFAULT_PROMPT_CONFIG } from '@/types'

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      styles: [],
      currentStyle: null,
      currentTopic: '',
      frameworks: [],
      selectedFramework: null,
      finalCopywriting: '',
      copywritingHistory: [],
      theme: 'system',
      creationRecords: [],
      currentRecordId: null,
      promptConfig: DEFAULT_PROMPT_CONFIG,

      setStyles: (styles: Style[]) => set({ styles }),
      
      addStyle: (style: Style) => set((state) => ({ 
        styles: [...state.styles, style] 
      })),
      
      updateStyle: (id: string, updates: Partial<Style>) => set((state) => ({
        styles: state.styles.map((s) => 
          s.id === id ? { ...s, ...updates } : s
        )
      })),
      
      deleteStyle: (id: string) => set((state) => ({ 
        styles: state.styles.filter((s) => s.id !== id) 
      })),
      
      setCurrentStyle: (style: Style | null) => set({ currentStyle: style }),
      
      setCurrentTopic: (topic: string) => set({ currentTopic: topic }),
      
      setFrameworks: (frameworks: Framework[]) => set({ frameworks }),
      
      updateFramework: (id: string, content: string) => set((state) => ({
        frameworks: state.frameworks.map((f) => 
          f.id === id ? { ...f, content } : f
        )
      })),
      
      setSelectedFramework: (framework: Framework | null) => set({ 
        selectedFramework: framework 
      }),
      
      setFinalCopywriting: (text: string) => set({ finalCopywriting: text }),
      
      addToHistory: (content: string, feedback?: string) => set((state) => ({
        copywritingHistory: [
          {
            id: Date.now().toString(),
            content,
            createdAt: new Date().toISOString(),
            feedback
          },
          ...state.copywritingHistory
        ].slice(0, 20)
      })),
      
      restoreFromHistory: (id: string) => {
        const history = get().copywritingHistory.find(h => h.id === id)
        if (history) {
          set({ finalCopywriting: history.content })
        }
      },
      
      clearHistory: () => set({ copywritingHistory: [] }),
      
      setTheme: (theme: 'light' | 'dark' | 'system') => set({ theme }),
      
      reset: () => set({
        currentStyle: null,
        currentTopic: '',
        frameworks: [],
        selectedFramework: null,
        finalCopywriting: '',
        copywritingHistory: [],
        currentRecordId: null,
      }),

      resetForNewCreation: () => set({
        frameworks: [],
        selectedFramework: null,
        finalCopywriting: '',
        copywritingHistory: [],
        currentRecordId: null,
      }),

      addCreationRecord: (record: CreationRecord) => set((state) => ({
        creationRecords: [record, ...state.creationRecords].slice(0, 100)
      })),

      updateCreationRecord: (id: string, updates: Partial<CreationRecord>) => set((state) => ({
        creationRecords: state.creationRecords.map(r => 
          r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
        )
      })),

      getCreationRecord: (id: string) => {
        return get().creationRecords.find(r => r.id === id)
      },

      setCurrentRecordId: (id: string | null) => set({ currentRecordId: id }),

      loadFromCreationRecord: (record: CreationRecord) => {
        const style = get().styles.find(s => s.id === record.styleId)
        set({
          currentStyle: style || null,
          currentTopic: record.topic,
          frameworks: [{ id: 'framework-1', title: '已选框架', content: record.framework }],
          selectedFramework: { id: 'framework-1', title: '已选框架', content: record.framework },
          finalCopywriting: record.finalCopywriting,
          copywritingHistory: record.versions,
          currentRecordId: record.id,
        })
      },

      setPromptConfig: (config: PromptConfig) => set({ promptConfig: config }),

      updatePromptConfig: (key: keyof PromptConfig, value: Partial<PromptConfig[keyof PromptConfig]>) => set((state) => ({
        promptConfig: {
          ...state.promptConfig,
          [key]: {
            ...state.promptConfig[key],
            ...value
          }
        }
      })),
    }),
    {
      name: 'gentext-storage',
      partialize: (state) => ({ 
        styles: state.styles,
        theme: state.theme,
        creationRecords: state.creationRecords,
        promptConfig: state.promptConfig 
      }),
    }
  )
)
