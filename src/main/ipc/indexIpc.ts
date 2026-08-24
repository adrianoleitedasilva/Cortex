import { ipcMain } from 'electron'
import { vaultIndex } from '../index/vaultIndex'

export function registerIndexIpc(): void {
  ipcMain.handle('index:getTags', () => vaultIndex.getAllTags())
  ipcMain.handle('index:getNotesByTag', (_e, tag: string) => vaultIndex.getNotesByTag(tag))
  ipcMain.handle('index:getBacklinks', (_e, notePath: string) => vaultIndex.getBacklinks(notePath))
  ipcMain.handle('index:getBrokenLinks', (_e, notePath: string) => vaultIndex.getBrokenLinks(notePath))
}
