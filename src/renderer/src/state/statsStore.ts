import { create } from 'zustand'

interface StatsState {
  wordCount: number
  charCount: number
  lineCount: number
  setStats: (text: string, lineCount: number) => void
  clear: () => void
}

function countWords(text: string): number {
  const trimmed = text.trim()
  return trimmed ? trimmed.split(/\s+/).length : 0
}

export const useStatsStore = create<StatsState>((set) => ({
  wordCount: 0,
  charCount: 0,
  lineCount: 0,
  setStats: (text, lineCount) => set({ wordCount: countWords(text), charCount: text.length, lineCount }),
  clear: () => set({ wordCount: 0, charCount: 0, lineCount: 0 })
}))
