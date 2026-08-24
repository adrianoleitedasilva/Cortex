import { promises as fs, existsSync } from 'fs'
import path from 'path'
import type { TreeNode } from '../../shared/types'

const INVALID_NAME_CHARS = /[<>:"/\\|?*\x00-\x1f]/

export class VaultPathError extends Error {}

function toPosix(p: string): string {
  return p.split(path.sep).join('/')
}

export function resolveSafe(vaultRoot: string, relativePath: string): string {
  const normalized = relativePath.replace(/^[/\\]+/, '')
  const resolved = path.resolve(vaultRoot, normalized)
  const rel = path.relative(vaultRoot, resolved)
  if (rel.startsWith('..') || path.isAbsolute(rel)) {
    throw new VaultPathError(`Caminho fora do vault: ${relativePath}`)
  }
  return resolved
}

export function validateName(name: string): void {
  if (!name || !name.trim()) throw new VaultPathError('Nome não pode ser vazio')
  if (INVALID_NAME_CHARS.test(name)) throw new VaultPathError('Nome contém caracteres inválidos')
}

export function sanitizeFileBaseName(name: string): string {
  const cleaned = name.replace(INVALID_NAME_CHARS, '-').trim()
  return cleaned || 'anexo'
}

async function walk(dir: string, vaultRoot: string): Promise<TreeNode[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const nodes: TreeNode[] = []
  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue
    const abs = path.join(dir, entry.name)
    const rel = toPosix(path.relative(vaultRoot, abs))
    if (entry.isDirectory()) {
      nodes.push({ name: entry.name, path: rel, type: 'folder', children: await walk(abs, vaultRoot) })
    } else if (entry.isFile()) {
      nodes.push({ name: entry.name, path: rel, type: 'file' })
    }
  }
  nodes.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'folder' ? -1 : 1
    return a.name.localeCompare(b.name, 'pt-BR', { sensitivity: 'base' })
  })
  return nodes
}

export async function listTree(vaultRoot: string): Promise<TreeNode[]> {
  return walk(vaultRoot, vaultRoot)
}

export async function ensureUniqueName(
  vaultRoot: string,
  parentRelPath: string,
  baseName: string,
  ext: string
): Promise<string> {
  const parentAbs = resolveSafe(vaultRoot, parentRelPath)
  let candidate = `${baseName}${ext}`
  let i = 1
  while (existsSync(path.join(parentAbs, candidate))) {
    candidate = `${baseName} ${i}${ext}`
    i++
  }
  return candidate
}

export async function createFile(
  vaultRoot: string,
  parentRelPath: string,
  baseName = 'Sem título'
): Promise<string> {
  const parentAbs = resolveSafe(vaultRoot, parentRelPath)
  await fs.mkdir(parentAbs, { recursive: true })
  const fileName = await ensureUniqueName(vaultRoot, parentRelPath, baseName, '.md')
  const abs = path.join(parentAbs, fileName)
  await fs.writeFile(abs, '', 'utf-8')
  return toPosix(path.relative(vaultRoot, abs))
}

export async function createFolder(
  vaultRoot: string,
  parentRelPath: string,
  baseName = 'Nova pasta'
): Promise<string> {
  const parentAbs = resolveSafe(vaultRoot, parentRelPath)
  await fs.mkdir(parentAbs, { recursive: true })
  const folderName = await ensureUniqueName(vaultRoot, parentRelPath, baseName, '')
  const abs = path.join(parentAbs, folderName)
  await fs.mkdir(abs)
  return toPosix(path.relative(vaultRoot, abs))
}

export async function renamePath(vaultRoot: string, oldRelPath: string, newRelPath: string): Promise<void> {
  const oldAbs = resolveSafe(vaultRoot, oldRelPath)
  const newAbs = resolveSafe(vaultRoot, newRelPath)
  if (oldAbs === newAbs) return
  if (existsSync(newAbs)) {
    throw new VaultPathError('Já existe um item com esse nome')
  }
  await fs.mkdir(path.dirname(newAbs), { recursive: true })
  await fs.rename(oldAbs, newAbs)
}

export async function readFile(vaultRoot: string, relPath: string): Promise<string> {
  return fs.readFile(resolveSafe(vaultRoot, relPath), 'utf-8')
}

export async function writeFile(vaultRoot: string, relPath: string, content: string): Promise<void> {
  const abs = resolveSafe(vaultRoot, relPath)
  await fs.mkdir(path.dirname(abs), { recursive: true })
  await fs.writeFile(abs, content, 'utf-8')
}

const ATTACHMENTS_DIR = 'attachments'

export async function saveAttachment(
  vaultRoot: string,
  data: Uint8Array,
  suggestedName: string
): Promise<string> {
  const dirAbs = resolveSafe(vaultRoot, ATTACHMENTS_DIR)
  await fs.mkdir(dirAbs, { recursive: true })

  const ext = path.extname(suggestedName)
  const baseName = sanitizeFileBaseName(path.basename(suggestedName, ext) || 'anexo')
  const fileName = await ensureUniqueName(vaultRoot, ATTACHMENTS_DIR, baseName, ext)
  const abs = path.join(dirAbs, fileName)
  await fs.writeFile(abs, data)
  return toPosix(path.relative(vaultRoot, abs))
}
