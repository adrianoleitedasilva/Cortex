import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron'
import type {
  TreeNode,
  VaultState,
  FileTreeContextPayload,
  FileTreeAction,
  SearchResult,
  AppearanceSettings,
  AppInfo
} from '../shared/types'

const api = {
  ping: (): string => 'pong',
  app: {
    getInfo: (): Promise<AppInfo> => ipcRenderer.invoke('app:getInfo')
  },
  shell: {
    openExternal: (url: string): Promise<void> => ipcRenderer.invoke('shell:openExternal', url)
  },
  vault: {
    getState: (): Promise<VaultState> => ipcRenderer.invoke('vault:getState'),
    selectFolder: (): Promise<VaultState> => ipcRenderer.invoke('vault:selectFolder'),
    setCurrent: (vaultPath: string): Promise<VaultState> => ipcRenderer.invoke('vault:setCurrent', vaultPath)
  },
  fs: {
    listTree: (): Promise<TreeNode[]> => ipcRenderer.invoke('fs:listTree'),
    createFile: (parentRelPath: string, baseName?: string): Promise<string> =>
      ipcRenderer.invoke('fs:createFile', parentRelPath, baseName),
    createFolder: (parentRelPath: string): Promise<string> =>
      ipcRenderer.invoke('fs:createFolder', parentRelPath),
    rename: (oldRelPath: string, newRelPath: string): Promise<void> =>
      ipcRenderer.invoke('fs:rename', oldRelPath, newRelPath),
    remove: (relPath: string): Promise<void> => ipcRenderer.invoke('fs:delete', relPath),
    reveal: (relPath: string): Promise<void> => ipcRenderer.invoke('fs:reveal', relPath),
    readFile: (relPath: string): Promise<string> => ipcRenderer.invoke('fs:readFile', relPath),
    writeFile: (relPath: string, content: string): Promise<void> =>
      ipcRenderer.invoke('fs:writeFile', relPath, content),
    saveAttachment: (data: Uint8Array, suggestedName: string): Promise<string> =>
      ipcRenderer.invoke('fs:saveAttachment', data, suggestedName)
  },
  contextMenu: {
    showFileTreeContext: (ctx: FileTreeContextPayload): Promise<FileTreeAction> =>
      ipcRenderer.invoke('menu:showFileTreeContext', ctx)
  },
  index: {
    getTags: (): Promise<string[]> => ipcRenderer.invoke('index:getTags'),
    getNotesByTag: (tag: string): Promise<string[]> => ipcRenderer.invoke('index:getNotesByTag', tag),
    getBacklinks: (notePath: string): Promise<string[]> => ipcRenderer.invoke('index:getBacklinks', notePath),
    getBrokenLinks: (notePath: string): Promise<string[]> =>
      ipcRenderer.invoke('index:getBrokenLinks', notePath)
  },
  search: {
    query: (text: string): Promise<SearchResult[]> => ipcRenderer.invoke('search:query', text)
  },
  icons: {
    get: (): Promise<Record<string, string>> => ipcRenderer.invoke('icons:get'),
    set: (relPath: string, iconName: string): Promise<Record<string, string>> =>
      ipcRenderer.invoke('icons:set', relPath, iconName),
    remove: (relPath: string): Promise<Record<string, string>> => ipcRenderer.invoke('icons:remove', relPath)
  },
  settings: {
    getFavorites: (): Promise<string[]> => ipcRenderer.invoke('settings:getFavorites'),
    toggleFavorite: (notePath: string): Promise<string[]> =>
      ipcRenderer.invoke('settings:toggleFavorite', notePath),
    getRecentNotes: (): Promise<string[]> => ipcRenderer.invoke('settings:getRecentNotes'),
    pushRecentNote: (notePath: string): Promise<string[]> =>
      ipcRenderer.invoke('settings:pushRecentNote', notePath),
    getAppearance: (): Promise<AppearanceSettings> => ipcRenderer.invoke('settings:getAppearance'),
    setTheme: (theme: 'light' | 'dark'): Promise<'light' | 'dark'> =>
      ipcRenderer.invoke('settings:setTheme', theme),
    setFontFamily: (fontFamilyId: string): Promise<string> =>
      ipcRenderer.invoke('settings:setFontFamily', fontFamilyId),
    setFontSize: (size: number): Promise<number> => ipcRenderer.invoke('settings:setFontSize', size),
    setAllowRemoteImages: (value: boolean): Promise<boolean> =>
      ipcRenderer.invoke('settings:setAllowRemoteImages', value)
  },
  events: {
    onVaultChangedExternally: (callback: () => void): (() => void) => {
      const listener = (): void => callback()
      ipcRenderer.on('vault:changed-externally', listener)
      return () => ipcRenderer.removeListener('vault:changed-externally', listener)
    },
    onMenuAction: (callback: (action: string) => void): (() => void) => {
      const listener = (_e: IpcRendererEvent, action: string): void => callback(action)
      ipcRenderer.on('menu:action', listener)
      return () => ipcRenderer.removeListener('menu:action', listener)
    }
  }
}

export type CortexApi = typeof api

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('cortex', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // contextIsolation desabilitado (não deveria acontecer em produção)
  ;(globalThis as unknown as { cortex: CortexApi }).cortex = api
}
