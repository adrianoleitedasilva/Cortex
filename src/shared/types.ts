export interface TreeNode {
  name: string
  path: string
  type: 'file' | 'folder'
  children?: TreeNode[]
}

export interface VaultState {
  currentVaultPath: string | null
}

export type FileTreeContextType = 'file' | 'folder' | 'root'

export type FileTreeAction =
  | 'new-note'
  | 'new-folder'
  | 'rename'
  | 'delete'
  | 'reveal'
  | 'toggle-favorite'
  | 'choose-icon'
  | 'remove-icon'
  | null

export interface FileTreeContextPayload {
  type: FileTreeContextType
  path: string
  isFavorite?: boolean
  hasIcon?: boolean
}

export interface SearchResult {
  path: string
  title: string
  snippet: string
}

export interface AppearanceSettings {
  theme: 'light' | 'dark'
  fontFamily: string
  fontSize: number
  allowRemoteImages: boolean
}

export interface AppInfo {
  name: string
  version: string
}
