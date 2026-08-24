import { create } from 'zustand'
import type { TreeNode, VaultState } from '../../../shared/types'
import { syncOpenPathsOnRename, syncOpenPathsOnRemove } from '../editor/pathSync'
import { useListsStore } from './listsStore'
import { useIconAssignmentsStore } from './iconAssignmentsStore'
import { useTabsStore } from './tabsStore'
import * as autosave from '../editor/autosave'
import * as editorCache from '../editor/editorCache'

interface VaultStoreState {
  currentVaultPath: string | null
  tree: TreeNode[]
  loading: boolean
  error: string | null
  selectedPath: string | null
  expanded: Record<string, boolean>
  editingPath: string | null

  init: () => Promise<void>
  selectFolder: () => Promise<void>
  refreshTree: () => Promise<void>
  toggleExpanded: (path: string) => void
  setSelected: (path: string | null) => void

  createNoteAt: (parentPath: string) => Promise<void>
  createFolderAt: (parentPath: string) => Promise<void>
  getContextualFolder: () => string
  createNoteInContext: () => Promise<void>
  createFolderInContext: () => Promise<void>
  beginRename: (path: string) => void
  cancelRename: () => void
  commitRename: (oldPath: string, newPath: string) => Promise<void>
  moveItem: (oldPath: string, newParentPath: string) => Promise<void>
  remove: (path: string) => Promise<void>
  reveal: (path: string) => void
}

function basename(p: string): string {
  const idx = p.lastIndexOf('/')
  return idx === -1 ? p : p.slice(idx + 1)
}

function parentOf(p: string): string {
  const idx = p.lastIndexOf('/')
  return idx === -1 ? '' : p.slice(0, idx)
}

function findNode(nodes: TreeNode[], path: string): TreeNode | null {
  for (const node of nodes) {
    if (node.path === path) return node
    if (node.children) {
      const found = findNode(node.children, path)
      if (found) return found
    }
  }
  return null
}

export const useVaultStore = create<VaultStoreState>((set, get) => ({
  currentVaultPath: null,
  tree: [],
  loading: false,
  error: null,
  selectedPath: null,
  expanded: {},
  editingPath: null,

  init: async () => {
    set({ loading: true })
    const state: VaultState = await window.cortex.vault.getState()
    set({ currentVaultPath: state.currentVaultPath })
    if (state.currentVaultPath) await get().refreshTree()
    set({ loading: false })
  },

  selectFolder: async () => {
    await autosave.flushAllPending()
    useTabsStore.getState().closeAll()
    editorCache.clearAllCachedStates()
    const state = await window.cortex.vault.selectFolder()
    set({ currentVaultPath: state.currentVaultPath })
    if (state.currentVaultPath) await get().refreshTree()
    void useListsStore.getState().loadLists()
    void useIconAssignmentsStore.getState().load()
  },

  refreshTree: async () => {
    try {
      const tree = await window.cortex.fs.listTree()
      set({ tree, error: null })
    } catch (err) {
      set({ error: (err as Error).message })
    }
  },

  toggleExpanded: (path) => set((s) => ({ expanded: { ...s.expanded, [path]: !s.expanded[path] } })),
  setSelected: (path) => set({ selectedPath: path }),

  createNoteAt: async (parentPath) => {
    try {
      const newPath = await window.cortex.fs.createFile(parentPath)
      await get().refreshTree()
      set((s) => ({
        expanded: parentPath ? { ...s.expanded, [parentPath]: true } : s.expanded,
        editingPath: newPath,
        selectedPath: newPath
      }))
    } catch (err) {
      set({ error: (err as Error).message })
    }
  },

  createFolderAt: async (parentPath) => {
    try {
      const newPath = await window.cortex.fs.createFolder(parentPath)
      await get().refreshTree()
      set((s) => ({
        expanded: { ...s.expanded, ...(parentPath ? { [parentPath]: true } : {}), [newPath]: true },
        editingPath: newPath
      }))
    } catch (err) {
      set({ error: (err as Error).message })
    }
  },

  getContextualFolder: () => {
    const { selectedPath, tree } = get()
    if (!selectedPath) return ''
    const node = findNode(tree, selectedPath)
    if (!node) return ''
    return node.type === 'folder' ? node.path : parentOf(node.path)
  },

  createNoteInContext: async () => {
    await get().createNoteAt(get().getContextualFolder())
  },

  createFolderInContext: async () => {
    await get().createFolderAt(get().getContextualFolder())
  },

  beginRename: (path) => set({ editingPath: path }),
  cancelRename: () => set({ editingPath: null }),

  commitRename: async (oldPath, newPath) => {
    set({ editingPath: null })
    if (oldPath === newPath) return
    try {
      await window.cortex.fs.rename(oldPath, newPath)
      syncOpenPathsOnRename(oldPath, newPath)
      set((s) => ({ selectedPath: s.selectedPath === oldPath ? newPath : s.selectedPath }))
      await get().refreshTree()
      void useListsStore.getState().loadLists()
      void useIconAssignmentsStore.getState().load()
    } catch (err) {
      set({ error: (err as Error).message })
    }
  },

  moveItem: async (oldPath, newParentPath) => {
    const name = basename(oldPath)
    const newPath = newParentPath ? `${newParentPath}/${name}` : name
    if (newPath === oldPath || newParentPath.startsWith(oldPath)) return
    try {
      await window.cortex.fs.rename(oldPath, newPath)
      syncOpenPathsOnRename(oldPath, newPath)
      set((s) => ({ selectedPath: s.selectedPath === oldPath ? newPath : s.selectedPath }))
      await get().refreshTree()
      void useListsStore.getState().loadLists()
      void useIconAssignmentsStore.getState().load()
    } catch (err) {
      set({ error: (err as Error).message })
    }
  },

  remove: async (path) => {
    try {
      await window.cortex.fs.remove(path)
      syncOpenPathsOnRemove(path)
      set((s) => ({ selectedPath: s.selectedPath === path ? null : s.selectedPath }))
      await get().refreshTree()
      void useListsStore.getState().loadLists()
      void useIconAssignmentsStore.getState().load()
    } catch (err) {
      set({ error: (err as Error).message })
    }
  },

  reveal: (path) => {
    window.cortex.fs.reveal(path)
  }
}))
