import { ipcMain, shell } from 'electron'
import { settingsStore } from '../settings/store'
import * as vaultManager from '../vault/vaultManager'
import * as iconAssignments from '../vault/iconAssignments'

function requireVaultRoot(): string {
  const root = settingsStore.get('currentVaultPath')
  if (!root) throw new Error('Nenhum vault selecionado')
  return root
}

function remapStoredPath(storedPath: string, oldPrefix: string, newPrefix: string): string {
  if (storedPath === oldPrefix) return newPrefix
  if (storedPath.startsWith(`${oldPrefix}/`)) return newPrefix + storedPath.slice(oldPrefix.length)
  return storedPath
}

function syncSettingsOnRename(oldPath: string, newPath: string): void {
  settingsStore.set(
    'favorites',
    settingsStore.get('favorites').map((p) => remapStoredPath(p, oldPath, newPath))
  )
  settingsStore.set(
    'recentNotes',
    settingsStore.get('recentNotes').map((p) => remapStoredPath(p, oldPath, newPath))
  )
}

function syncSettingsOnRemove(removedPath: string): void {
  const stillExists = (p: string): boolean => p !== removedPath && !p.startsWith(`${removedPath}/`)
  settingsStore.set('favorites', settingsStore.get('favorites').filter(stillExists))
  settingsStore.set('recentNotes', settingsStore.get('recentNotes').filter(stillExists))
}

export function registerFsIpc(): void {
  ipcMain.handle('fs:listTree', async () => {
    return vaultManager.listTree(requireVaultRoot())
  })

  ipcMain.handle('fs:createFile', async (_e, parentRelPath: string, baseName?: string) => {
    return baseName
      ? vaultManager.createFile(requireVaultRoot(), parentRelPath, baseName)
      : vaultManager.createFile(requireVaultRoot(), parentRelPath)
  })

  ipcMain.handle('fs:createFolder', async (_e, parentRelPath: string) => {
    return vaultManager.createFolder(requireVaultRoot(), parentRelPath)
  })

  ipcMain.handle('fs:rename', async (_e, oldRelPath: string, newRelPath: string) => {
    const root = requireVaultRoot()
    await vaultManager.renamePath(root, oldRelPath, newRelPath)
    syncSettingsOnRename(oldRelPath, newRelPath)
    await iconAssignments.syncIconsOnRename(root, oldRelPath, newRelPath)
  })

  ipcMain.handle('fs:delete', async (_e, relPath: string) => {
    const root = requireVaultRoot()
    const abs = vaultManager.resolveSafe(root, relPath)
    await shell.trashItem(abs)
    syncSettingsOnRemove(relPath)
    await iconAssignments.syncIconsOnRemove(root, relPath)
  })

  ipcMain.handle('fs:reveal', async (_e, relPath: string) => {
    const root = requireVaultRoot()
    const abs = vaultManager.resolveSafe(root, relPath)
    shell.showItemInFolder(abs)
  })

  ipcMain.handle('fs:readFile', async (_e, relPath: string) => {
    return vaultManager.readFile(requireVaultRoot(), relPath)
  })

  ipcMain.handle('fs:writeFile', async (_e, relPath: string, content: string) => {
    await vaultManager.writeFile(requireVaultRoot(), relPath, content)
  })

  ipcMain.handle('fs:saveAttachment', async (_e, data: Uint8Array, suggestedName: string) => {
    return vaultManager.saveAttachment(requireVaultRoot(), data, suggestedName)
  })
}
