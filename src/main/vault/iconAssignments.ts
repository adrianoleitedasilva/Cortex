import { promises as fs } from 'fs'
import path from 'path'
import { resolveSafe } from './vaultManager'

const ICONS_FILE = '.cortex/icons.json'

async function readIcons(vaultRoot: string): Promise<Record<string, string>> {
  try {
    const raw = await fs.readFile(path.join(vaultRoot, ICONS_FILE), 'utf-8')
    return JSON.parse(raw) as Record<string, string>
  } catch {
    return {}
  }
}

async function writeIcons(vaultRoot: string, icons: Record<string, string>): Promise<void> {
  const abs = resolveSafe(vaultRoot, ICONS_FILE)
  await fs.mkdir(path.dirname(abs), { recursive: true })
  await fs.writeFile(abs, JSON.stringify(icons, null, 2), 'utf-8')
}

export async function getIcons(vaultRoot: string): Promise<Record<string, string>> {
  return readIcons(vaultRoot)
}

export async function setIcon(vaultRoot: string, relPath: string, iconName: string): Promise<Record<string, string>> {
  const icons = await readIcons(vaultRoot)
  icons[relPath] = iconName
  await writeIcons(vaultRoot, icons)
  return icons
}

export async function removeIcon(vaultRoot: string, relPath: string): Promise<Record<string, string>> {
  const icons = await readIcons(vaultRoot)
  delete icons[relPath]
  await writeIcons(vaultRoot, icons)
  return icons
}

function remapPath(storedPath: string, oldPrefix: string, newPrefix: string): string {
  if (storedPath === oldPrefix) return newPrefix
  if (storedPath.startsWith(`${oldPrefix}/`)) return newPrefix + storedPath.slice(oldPrefix.length)
  return storedPath
}

export async function syncIconsOnRename(vaultRoot: string, oldPath: string, newPath: string): Promise<void> {
  const icons = await readIcons(vaultRoot)
  const next: Record<string, string> = {}
  let changed = false
  for (const [key, value] of Object.entries(icons)) {
    const mapped = remapPath(key, oldPath, newPath)
    if (mapped !== key) changed = true
    next[mapped] = value
  }
  if (changed) await writeIcons(vaultRoot, next)
}

export async function syncIconsOnRemove(vaultRoot: string, removedPath: string): Promise<void> {
  const icons = await readIcons(vaultRoot)
  const stillExists = (p: string): boolean => p !== removedPath && !p.startsWith(`${removedPath}/`)
  const next: Record<string, string> = {}
  let changed = false
  for (const [key, value] of Object.entries(icons)) {
    if (stillExists(key)) next[key] = value
    else changed = true
  }
  if (changed) await writeIcons(vaultRoot, next)
}
