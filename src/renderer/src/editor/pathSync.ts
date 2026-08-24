import { useTabsStore } from '../state/tabsStore'
import * as editorCache from './editorCache'
import * as autosave from './autosave'

function remap(path: string, oldPrefix: string, newPrefix: string): string | null {
  if (path === oldPrefix) return newPrefix
  if (path.startsWith(`${oldPrefix}/`)) return newPrefix + path.slice(oldPrefix.length)
  return null
}

/** Keeps open tabs, cached editor states and pending autosaves in sync when a file
 * or folder is renamed/moved elsewhere in the vault. */
export function syncOpenPathsOnRename(oldPrefix: string, newPrefix: string): void {
  const { openPaths } = useTabsStore.getState()
  for (const path of openPaths) {
    const mapped = remap(path, oldPrefix, newPrefix)
    if (mapped) {
      useTabsStore.getState().renameTab(path, mapped)
      editorCache.renameCachedState(path, mapped)
      autosave.renamePending(path, mapped)
    }
  }
}

/** Closes any open tabs for a file/folder (and its contents) that was deleted. */
export function syncOpenPathsOnRemove(removedPrefix: string): void {
  const { openPaths } = useTabsStore.getState()
  for (const path of openPaths) {
    if (path === removedPrefix || path.startsWith(`${removedPrefix}/`)) {
      useTabsStore.getState().closeTab(path)
      editorCache.deleteCachedState(path)
      autosave.cancelPending(path)
    }
  }
}
