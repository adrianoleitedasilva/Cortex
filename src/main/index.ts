import { app, shell, BrowserWindow } from 'electron'
import { join } from 'path'
import { registerVaultIpc } from './ipc/vaultIpc'
import { registerFsIpc } from './ipc/fsIpc'
import { registerMenuIpc } from './ipc/menuIpc'
import { registerIndexIpc } from './ipc/indexIpc'
import { registerSearchIpc } from './ipc/searchIpc'
import { registerSettingsIpc } from './ipc/settingsIpc'
import { registerAppIpc } from './ipc/appIpc'
import { registerIconIpc } from './ipc/iconIpc'
import { startWatching } from './index/vaultWatcher'
import { settingsStore } from './settings/store'
import {
  registerAttachmentSchemePrivileges,
  registerAttachmentProtocolHandler
} from './protocols/attachmentProtocol'
import { registerCsp } from './security/csp'
import { registerApplicationMenu } from './menu/applicationMenu'

registerAttachmentSchemePrivileges()

const isDev = !app.isPackaged

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 720,
    minHeight: 480,
    show: false,
    // build/icon.ico is also electron-builder's default Windows icon source (buildResources).
    // Only resolves correctly unpackaged for now — revisit when packaging is set up.
    icon: join(__dirname, '../../build/icon.ico'),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    if (details.url.startsWith('http:') || details.url.startsWith('https:')) {
      shell.openExternal(details.url)
    }
    return { action: 'deny' }
  })

  if (isDev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  registerVaultIpc()
  registerFsIpc()
  registerMenuIpc()
  registerIndexIpc()
  registerSearchIpc()
  registerSettingsIpc()
  registerAppIpc()
  registerIconIpc()
  registerAttachmentProtocolHandler()
  registerCsp()
  registerApplicationMenu()
  createWindow()

  const existingVault = settingsStore.get('currentVaultPath')
  if (existingVault) {
    void startWatching(existingVault)
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
