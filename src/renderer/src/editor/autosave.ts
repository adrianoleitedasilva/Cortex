import { useTabsStore } from '../state/tabsStore'

interface Pending {
  timer: ReturnType<typeof setTimeout>
  content: string
}

const pending = new Map<string, Pending>()
const SAVE_DELAY_MS = 600

async function writeNow(path: string, content: string): Promise<void> {
  try {
    await window.cortex.fs.writeFile(path, content)
  } catch (err) {
    console.error('Autosave falhou para', path, err)
    return
  }
  useTabsStore.getState().setDirty(path, false)
}

export function scheduleSave(path: string, content: string): void {
  const existing = pending.get(path)
  if (existing) clearTimeout(existing.timer)
  const timer = setTimeout(() => {
    pending.delete(path)
    void writeNow(path, content)
  }, SAVE_DELAY_MS)
  pending.set(path, { timer, content })
}

export function flushPending(path: string): Promise<void> {
  const existing = pending.get(path)
  if (!existing) return Promise.resolve()
  clearTimeout(existing.timer)
  pending.delete(path)
  return writeNow(path, existing.content)
}

export function cancelPending(path: string): void {
  const existing = pending.get(path)
  if (existing) {
    clearTimeout(existing.timer)
    pending.delete(path)
  }
}

export function renamePending(oldPath: string, newPath: string): void {
  const existing = pending.get(oldPath)
  if (existing) {
    pending.delete(oldPath)
    pending.set(newPath, existing)
  }
}

/** Flushes every pending autosave to disk — used before switching vaults, so unsaved edits
 * in the outgoing vault aren't silently lost. */
export async function flushAllPending(): Promise<void> {
  const paths = [...pending.keys()]
  await Promise.all(paths.map((path) => flushPending(path)))
}
