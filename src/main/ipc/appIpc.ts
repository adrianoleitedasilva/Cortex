import { app, ipcMain, shell } from 'electron'

export function registerAppIpc(): void {
  ipcMain.handle('app:getInfo', () => ({
    name: app.getName(),
    version: app.getVersion()
  }))

  ipcMain.handle('shell:openExternal', async (_e, url: string) => {
    if (!/^https?:\/\//i.test(url)) return
    await shell.openExternal(url)
  })
}
