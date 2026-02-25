import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AppState, Style, Framework, CopywritingVersion } from '@/types'

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

      setStyles: (styles: Style[]) => set({ styles }),
      
      addStyle: (style: Style) => set((state) => ({ 
        styles: [...state.styles, style] 
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
      }),
    }),
    {
      name: 'gentext-storage',
      partialize: (state) => ({ 
        styles: state.styles,
        theme: state.theme 
      }),
    }
  )
)
