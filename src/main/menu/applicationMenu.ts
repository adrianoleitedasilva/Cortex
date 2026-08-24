import { app, BrowserWindow, Menu, type MenuItemConstructorOptions } from 'electron'

function sendMenuAction(action: string): void {
  const win = BrowserWindow.getFocusedWindow() ?? BrowserWindow.getAllWindows()[0]
  win?.webContents.send('menu:action', action)
}

export function registerApplicationMenu(): void {
  const template: MenuItemConstructorOptions[] = [
    {
      label: 'Arquivo',
      submenu: [
        { label: 'Nova nota', accelerator: 'CmdOrCtrl+N', click: () => sendMenuAction('new-note') },
        {
          label: 'Nova pasta',
          accelerator: 'CmdOrCtrl+Shift+N',
          click: () => sendMenuAction('new-folder')
        },
        {
          label: 'Nota rápida (na raiz do vault)',
          accelerator: 'CmdOrCtrl+Alt+N',
          click: () => sendMenuAction('quick-note')
        },
        { type: 'separator' },
        { label: 'Salvar', accelerator: 'CmdOrCtrl+S', click: () => sendMenuAction('save') },
        { type: 'separator' },
        { label: 'Selecionar vault…', click: () => sendMenuAction('select-vault') },
        { type: 'separator' },
        { label: 'Fechar aba', accelerator: 'CmdOrCtrl+W', click: () => sendMenuAction('close-tab') },
        { type: 'separator' },
        { role: 'quit', label: 'Sair' }
      ]
    },
    {
      label: 'Editar',
      submenu: [
        { role: 'undo', label: 'Desfazer' },
        { role: 'redo', label: 'Refazer' },
        { type: 'separator' },
        { role: 'cut', label: 'Recortar' },
        { role: 'copy', label: 'Copiar' },
        { role: 'paste', label: 'Colar' },
        { role: 'selectAll', label: 'Selecionar tudo' }
      ]
    },
    {
      label: 'Visualizar',
      submenu: [
        {
          label: 'Alternar barra lateral',
          accelerator: 'CmdOrCtrl+\\',
          click: () => sendMenuAction('toggle-sidebar')
        },
        { label: 'Alternar backlinks', click: () => sendMenuAction('toggle-backlinks') },
        { label: 'Ir para nota…', accelerator: 'CmdOrCtrl+O', click: () => sendMenuAction('quick-switcher') },
        { type: 'separator' },
        { label: 'Alternar tema', click: () => sendMenuAction('toggle-theme') },
        { type: 'separator' },
        { role: 'resetZoom', label: 'Zoom padrão' },
        { role: 'zoomIn', label: 'Aumentar zoom' },
        { role: 'zoomOut', label: 'Diminuir zoom' },
        ...(!app.isPackaged
          ? ([
              { type: 'separator' },
              { role: 'reload', label: 'Recarregar' },
              { role: 'toggleDevTools', label: 'DevTools' }
            ] as MenuItemConstructorOptions[])
          : [])
      ]
    },
    {
      label: 'Configurações',
      click: () => sendMenuAction('open-settings')
    },
    {
      label: 'Sobre',
      click: () => sendMenuAction('open-about')
    }
  ]

  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}
