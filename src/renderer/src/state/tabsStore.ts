import { create } from 'zustand'
import { useListsStore } from './listsStore'

interface TabsState {
  openPaths: string[]
  activePath: string | null
  dirty: Record<string, boolean>
  openTab: (path: string) => void
  closeTab: (path: string) => void
  setActive: (path: string) => void
  setDirty: (path: string, value: boolean) => void
  renameTab: (oldPath: string, newPath: string) => void
  closeAll: () => void
}

export const useTabsStore = create<TabsState>((set, get) => ({
  openPaths: [],
  activePath: null,
  dirty: {},

  openTab: (path) => {
    set((s) => ({
      openPaths: s.openPaths.includes(path) ? s.openPaths : [...s.openPaths, path],
      activePath: path
    }))
    void useListsStore.getState().pushRecent(path)
  },

  closeTab: (path) => {
    const { openPaths, activePath } = get()
    const idx = openPaths.indexOf(path)
    if (idx === -1) return
    const nextPaths = openPaths.filter((p) => p !== path)
    let nextActive = activePath
    if (activePath === path) {
      nextActive = nextPaths[idx] ?? nextPaths[idx - 1] ?? null
    }
    set((s) => {
      const dirty = { ...s.dirty }
      delete dirty[path]
      return { openPaths: nextPaths, activePath: nextActive, dirty }
    })
  },

  setActive: (path) => set({ activePath: path }),
  setDirty: (path, value) => set((s) => ({ dirty: { ...s.dirty, [path]: value } })),

  renameTab: (oldPath, newPath) => {
    set((s) => {
      const dirty = { ...s.dirty }
      if (oldPath in dirty) {
        dirty[newPath] = dirty[oldPath]
        delete dirty[oldPath]
      }
      return {
        openPaths: s.openPaths.map((p) => (p === oldPath ? newPath : p)),
        activePath: s.activePath === oldPath ? newPath : s.activePath,
        dirty
      }
    })
  },

  closeAll: () => set({ openPaths: [], activePath: null, dirty: {} })
}))
