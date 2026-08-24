import { create } from 'zustand'

interface SettingsState {
  loaded: boolean
  theme: 'light' | 'dark'
  fontFamilyId: string
  fontSize: number
  allowRemoteImages: boolean
  load: () => Promise<void>
  setTheme: (theme: 'light' | 'dark') => Promise<void>
  setFontFamilyId: (id: string) => Promise<void>
  setFontSize: (size: number) => Promise<void>
  setAllowRemoteImages: (value: boolean) => Promise<void>
}

export const useSettingsStore = create<SettingsState>((set) => ({
  loaded: false,
  theme: 'dark',
  fontFamilyId: 'jetbrains-mono',
  fontSize: 14,
  allowRemoteImages: false,

  load: async () => {
    const appearance = await window.cortex.settings.getAppearance()
    set({
      theme: appearance.theme,
      fontFamilyId: appearance.fontFamily,
      fontSize: appearance.fontSize,
      allowRemoteImages: appearance.allowRemoteImages,
      loaded: true
    })
  },

  setTheme: async (theme) => {
    set({ theme })
    await window.cortex.settings.setTheme(theme)
  },

  setFontFamilyId: async (id) => {
    set({ fontFamilyId: id })
    await window.cortex.settings.setFontFamily(id)
  },

  setFontSize: async (size) => {
    set({ fontSize: size })
    await window.cortex.settings.setFontSize(size)
  },

  setAllowRemoteImages: async (value) => {
    await window.cortex.settings.setAllowRemoteImages(value)
    // CSP can only ever be tightened for an already-loaded document, never relaxed — so
    // enabling/disabling remote images needs a reload to take effect either way.
    window.location.reload()
  }
}))
