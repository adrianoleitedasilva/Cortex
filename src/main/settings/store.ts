import Store from 'electron-store'

export interface SettingsSchema {
  currentVaultPath: string | null
  theme: 'light' | 'dark'
  fontFamily: string
  fontSize: number
  favorites: string[]
  recentNotes: string[]
  allowRemoteImages: boolean
}

export const settingsStore = new Store<SettingsSchema>({
  defaults: {
    currentVaultPath: null,
    theme: 'dark',
    fontFamily: 'jetbrains-mono',
    fontSize: 14,
    favorites: [],
    recentNotes: [],
    allowRemoteImages: false
  }
})
