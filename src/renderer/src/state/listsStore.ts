import { create } from 'zustand'

interface ListsState {
  favorites: string[]
  recentNotes: string[]
  loadLists: () => Promise<void>
  toggleFavorite: (path: string) => Promise<void>
  pushRecent: (path: string) => Promise<void>
}

export const useListsStore = create<ListsState>((set) => ({
  favorites: [],
  recentNotes: [],

  loadLists: async () => {
    const [favorites, recentNotes] = await Promise.all([
      window.cortex.settings.getFavorites(),
      window.cortex.settings.getRecentNotes()
    ])
    set({ favorites, recentNotes })
  },

  toggleFavorite: async (path) => {
    const favorites = await window.cortex.settings.toggleFavorite(path)
    set({ favorites })
  },

  pushRecent: async (path) => {
    const recentNotes = await window.cortex.settings.pushRecentNote(path)
    set({ recentNotes })
  }
}))
