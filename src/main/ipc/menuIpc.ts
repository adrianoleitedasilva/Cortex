import { BrowserWindow, Menu, ipcMain, type MenuItemConstructorOptions } from 'electron'
import type { FileTreeAction, FileTreeContextPayload } from '../../shared/types'

export function registerMenuIpc(): void {
  ipcMain.handle('menu:showFileTreeContext', async (event, ctx: FileTreeContextPayload) => {
    return new Promise<FileTreeAction>((resolve) => {
      let resolved = false
      const done = (action: FileTreeAction): void => {
        if (resolved) return
        resolved = true
        resolve(action)
      }

      const template: MenuItemConstructorOptions[] = []
      if (ctx.type !== 'file') {
        template.push({ label: 'Nova nota', click: () => done('new-note') })
        template.push({ label: 'Nova pasta', click: () => done('new-folder') })
      }
      if (ctx.type !== 'root') {
        if (template.length > 0) template.push({ type: 'separator' })
        template.push({ label: 'Renomear', click: () => done('rename') })
        template.push({ label: 'Excluir', click: () => done('delete') })
        if (ctx.type === 'file') {
          template.push({
            label: ctx.isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos',
            click: () => done('toggle-favorite')
          })
        }
        template.push({ label: 'Escolher ícone…', click: () => done('choose-icon') })
        if (ctx.hasIcon) {
          template.push({ label: 'Remover ícone', click: () => done('remove-icon') })
        }
        template.push({ type: 'separator' })
        template.push({ label: 'Revelar no Explorer', click: () => done('reveal') })
      }

      const menu = Menu.buildFromTemplate(template)
      const win = BrowserWindow.fromWebContents(event.sender) ?? undefined
      menu.popup({ window: win })
      menu.once('menu-will-close', () => {
        setTimeout(() => done(null), 30)
      })
    })
  })
}
