import { ipcMain } from 'electron'
import { vaultIndex } from '../index/vaultIndex'

export function registerSearchIpc(): void {
  ipcMain.handle('search:query', (_e, text: string) => vaultIndex.search(text))
}
