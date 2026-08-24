import { ipcMain } from 'electron'
import { settingsStore } from '../settings/store'
import * as iconAssignments from '../vault/iconAssignments'

function requireVaultRoot(): string {
  const root = settingsStore.get('currentVaultPath')
  if (!root) throw new Error('Nenhum vault selecionado')
  return root
}

export function registerIconIpc(): void {
  ipcMain.handle('icons:get', () => iconAssignments.getIcons(requireVaultRoot()))

  ipcMain.handle('icons:set', (_e, relPath: string, iconName: string) =>
    iconAssignments.setIcon(requireVaultRoot(), relPath, iconName)
  )

  ipcMain.handle('icons:remove', (_e, relPath: string) =>
    iconAssignments.removeIcon(requireVaultRoot(), relPath)
  )
}
