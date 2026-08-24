import { useVaultStore } from '../state/vaultStore'
import type { TreeNode } from '../../../shared/types'

function flattenNotePaths(nodes: TreeNode[], out: string[] = []): string[] {
  for (const node of nodes) {
    if (node.type === 'file' && node.name.toLowerCase().endsWith('.md')) {
      out.push(node.path)
    } else if (node.type === 'folder' && node.children) {
      flattenNotePaths(node.children, out)
    }
  }
  return out
}

function basenameKey(relPath: string): string {
  const base = relPath.includes('/') ? relPath.slice(relPath.lastIndexOf('/') + 1) : relPath
  return base.replace(/\.md$/i, '').toLowerCase()
}

/** All note paths currently known in the open vault, derived from the (already-reactive) file
 * tree — no separate index needed for this, since the renderer's tree is the source of truth. */
export function getAllNotePaths(): string[] {
  return flattenNotePaths(useVaultStore.getState().tree)
}

/** Resolves a `[[Target]]` wikilink to a vault-relative note path by basename match
 * (case-insensitive, extension optional), Obsidian-style. Returns null if unresolved. */
export function resolveWikilink(target: string): string | null {
  const key = basenameKey(target.replace(/\.md$/i, ''))
  const matches = getAllNotePaths().filter((p) => basenameKey(p) === key)
  if (matches.length === 0) return null
  return matches.sort()[0]
}
