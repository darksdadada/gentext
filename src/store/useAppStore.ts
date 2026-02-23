import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AppState, Style, Framework } from '@/types'

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      styles: [],
      currentStyle: null,
      currentTopic: '',
      frameworks: [],
      selectedFramework: null,
      finalCopywriting: '',

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
      
      reset: () => set({
        currentStyle: null,
        currentTopic: '',
        frameworks: [],
        selectedFramework: null,
        finalCopywriting: '',
      }),
    }),
    {
      name: 'gentext-storage',
      partialize: (state) => ({ styles: state.styles }),
    }
  )
)
