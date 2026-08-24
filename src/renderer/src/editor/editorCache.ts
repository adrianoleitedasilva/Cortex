import type { EditorState } from '@codemirror/state'

const cache = new Map<string, EditorState>()

export function getCachedState(path: string): EditorState | undefined {
  return cache.get(path)
}

export function setCachedState(path: string, state: EditorState): void {
  cache.set(path, state)
}

export function renameCachedState(oldPath: string, newPath: string): void {
  const state = cache.get(oldPath)
  if (state) {
    cache.delete(oldPath)
    cache.set(newPath, state)
  }
}

export function deleteCachedState(path: string): void {
  cache.delete(path)
}

/** Drops every cached editor state — used when switching to a different vault, since none
 * of the currently cached document states belong to it. */
export function clearAllCachedStates(): void {
  cache.clear()
}
