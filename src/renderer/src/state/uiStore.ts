import { create } from 'zustand'

export type SidebarPanel = 'files' | 'search' | 'tags' | 'favorites' | 'recent'

interface UiState {
  sidebarPanel: SidebarPanel
  setSidebarPanel: (panel: SidebarPanel) => void
  rightPanelOpen: boolean
  toggleRightPanel: () => void
  sidebarVisible: boolean
  toggleSidebarVisible: () => void
  iconPickerTarget: string | null
  openIconPicker: (path: string) => void
  closeIconPicker: () => void
}

export const useUiStore = create<UiState>((set) => ({
  sidebarPanel: 'files',
  setSidebarPanel: (panel) => set({ sidebarPanel: panel }),
  rightPanelOpen: true,
  toggleRightPanel: () => set((s) => ({ rightPanelOpen: !s.rightPanelOpen })),
  sidebarVisible: true,
  toggleSidebarVisible: () => set((s) => ({ sidebarVisible: !s.sidebarVisible })),
  iconPickerTarget: null,
  openIconPicker: (path) => set({ iconPickerTarget: path }),
  closeIconPicker: () => set({ iconPickerTarget: null })
}))
