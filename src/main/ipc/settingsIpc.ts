import { ipcMain } from 'electron'
import { settingsStore } from '../settings/store'

const RECENT_NOTES_LIMIT = 20

export function registerSettingsIpc(): void {
  ipcMain.handle('settings:getFavorites', () => settingsStore.get('favorites'))

  ipcMain.handle('settings:toggleFavorite', (_e, notePath: string) => {
    const favorites = settingsStore.get('favorites')
    const next = favorites.includes(notePath)
      ? favorites.filter((p) => p !== notePath)
      : [...favorites, notePath]
    settingsStore.set('favorites', next)
    return next
  })

  ipcMain.handle('settings:getRecentNotes', () => settingsStore.get('recentNotes'))

  ipcMain.handle('settings:pushRecentNote', (_e, notePath: string) => {
    const recents = settingsStore.get('recentNotes').filter((p) => p !== notePath)
    recents.unshift(notePath)
    const capped = recents.slice(0, RECENT_NOTES_LIMIT)
    settingsStore.set('recentNotes', capped)
    return capped
  })

  ipcMain.handle('settings:getAppearance', () => ({
    theme: settingsStore.get('theme'),
    fontFamily: settingsStore.get('fontFamily'),
    fontSize: settingsStore.get('fontSize'),
    allowRemoteImages: settingsStore.get('allowRemoteImages')
  }))

  ipcMain.handle('settings:setTheme', (_e, theme: 'light' | 'dark') => {
    settingsStore.set('theme', theme)
    return theme
  })

  ipcMain.handle('settings:setFontFamily', (_e, fontFamilyId: string) => {
    settingsStore.set('fontFamily', fontFamilyId)
    return fontFamilyId
  })

  ipcMain.handle('settings:setFontSize', (_e, size: number) => {
    settingsStore.set('fontSize', size)
    return size
  })

  ipcMain.handle('settings:setAllowRemoteImages', (_e, value: boolean) => {
    settingsStore.set('allowRemoteImages', value)
    return value
  })
}
