import { create } from 'zustand'

interface IconAssignmentsState {
  icons: Record<string, string>
  load: () => Promise<void>
  setIcon: (path: string, iconName: string) => Promise<void>
  removeIcon: (path: string) => Promise<void>
}

export const useIconAssignmentsStore = create<IconAssignmentsState>((set) => ({
  icons: {},

  load: async () => {
    try {
      const icons = await window.cortex.icons.get()
      set({ icons })
    } catch {
      // No vault selected yet — nothing to load.
      set({ icons: {} })
    }
  },

  setIcon: async (path, iconName) => {
    const icons = await window.cortex.icons.set(path, iconName)
    set({ icons })
  },

  removeIcon: async (path) => {
    const icons = await window.cortex.icons.remove(path)
    set({ icons })
  }
}))
