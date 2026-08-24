import chokidar, { type FSWatcher } from 'chokidar'
import { BrowserWindow } from 'electron'
import path from 'path'
import { vaultIndex } from './vaultIndex'

let watcher: FSWatcher | null = null
let currentRoot: string | null = null
let notifyTimer: ReturnType<typeof setTimeout> | null = null

function notifyRenderer(): void {
  if (notifyTimer) clearTimeout(notifyTimer)
  notifyTimer = setTimeout(() => {
    notifyTimer = null
    for (const win of BrowserWindow.getAllWindows()) {
      win.webContents.send('vault:changed-externally')
    }
  }, 300)
}

function toRel(root: string, absPath: string): string {
  return path.relative(root, absPath).split(path.sep).join('/')
}

export async function startWatching(vaultRoot: string): Promise<void> {
  await stopWatching()
  currentRoot = vaultRoot
  vaultIndex.clear()

  const w = chokidar.watch(vaultRoot, {
    ignoreInitial: false,
    ignored: (p: string) => path.basename(p).startsWith('.'),
    depth: 40
  })
  watcher = w

  w.on('add', (absPath: string) => {
    if (!currentRoot) return
    void vaultIndex.setFile(currentRoot, toRel(currentRoot, absPath)).then(notifyRenderer)
  })
  w.on('change', (absPath: string) => {
    if (!currentRoot) return
    void vaultIndex.setFile(currentRoot, toRel(currentRoot, absPath)).then(notifyRenderer)
  })
  w.on('unlink', (absPath: string) => {
    if (!currentRoot) return
    vaultIndex.removeFile(toRel(currentRoot, absPath))
    notifyRenderer()
  })

  await new Promise<void>((resolve) => w.once('ready', () => resolve()))
}

export async function stopWatching(): Promise<void> {
  if (watcher) {
    await watcher.close()
    watcher = null
  }
  currentRoot = null
}
