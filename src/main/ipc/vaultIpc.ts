import { ipcMain, dialog, BrowserWindow } from 'electron'
import { settingsStore } from '../settings/store'
import { startWatching } from '../index/vaultWatcher'
import type { VaultState } from '../../shared/types'

function getState(): VaultState {
  return {
    currentVaultPath: settingsStore.get('currentVaultPath')
  }
}

async function setCurrentVault(vaultPath: string): Promise<VaultState> {
  settingsStore.set('currentVaultPath', vaultPath)
  await startWatching(vaultPath)
  return getState()
}

export function registerVaultIpc(): void {
  ipcMain.handle('vault:getState', () => getState())

  ipcMain.handle('vault:selectFolder', async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender) ?? undefined
    const result = await dialog.showOpenDialog(win as BrowserWindow, {
      title: 'Selecionar ou criar pasta do vault',
      properties: ['openDirectory', 'createDirectory']
    })
    if (result.canceled || result.filePaths.length === 0) return getState()
    return setCurrentVault(result.filePaths[0])
  })

  ipcMain.handle('vault:setCurrent', (_e, vaultPath: string) => setCurrentVault(vaultPath))
}
