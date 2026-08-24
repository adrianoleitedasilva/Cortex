import { promises as fs } from 'fs'
import path from 'path'
import MiniSearch from 'minisearch'
import type { SearchResult } from '../../shared/types'

export interface NoteMeta {
  path: string
  title: string
  tags: string[]
  links: string[]
  content: string
}

interface SearchDoc {
  id: string
  title: string
  content: string
  tags: string
}

const WIKILINK_RE = /\[\[([^\]|]+)(\|[^\]]+)?\]\]/g
const TAG_RE = /(^|\s)#([a-zA-Z0-9_/-]+)/g

function parseNote(content: string): { tags: string[]; links: string[] } {
  const tags = new Set<string>()
  const links = new Set<string>()

  WIKILINK_RE.lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = WIKILINK_RE.exec(content))) {
    const target = m[1].trim()
    if (target) links.add(target)
  }

  TAG_RE.lastIndex = 0
  while ((m = TAG_RE.exec(content))) {
    tags.add(m[2])
  }

  return { tags: [...tags], links: [...links] }
}

function basenameKey(relPath: string): string {
  const base = relPath.includes('/') ? relPath.slice(relPath.lastIndexOf('/') + 1) : relPath
  return base.replace(/\.md$/i, '').toLowerCase()
}

function buildSnippet(content: string, query: string): string {
  const firstTerm = query.trim().split(/\s+/)[0]?.toLowerCase() ?? ''
  const idx = firstTerm ? content.toLowerCase().indexOf(firstTerm) : -1
  if (idx === -1) return content.slice(0, 100).trim()
  const start = Math.max(0, idx - 40)
  const end = Math.min(content.length, idx + 60)
  return `${start > 0 ? '…' : ''}${content.slice(start, end).trim()}${end < content.length ? '…' : ''}`
}

export class VaultIndex {
  private notes = new Map<string, NoteMeta>()
  private byBasename = new Map<string, string[]>()
  private miniSearch = new MiniSearch<SearchDoc>({
    idField: 'id',
    fields: ['title', 'content', 'tags'],
    storeFields: ['title']
  })
  private indexedIds = new Set<string>()

  private addToBasenameIndex(relPath: string): void {
    const key = basenameKey(relPath)
    const list = this.byBasename.get(key) ?? []
    if (!list.includes(relPath)) list.push(relPath)
    this.byBasename.set(key, list)
  }

  private removeFromBasenameIndex(relPath: string): void {
    const key = basenameKey(relPath)
    const list = this.byBasename.get(key)
    if (!list) return
    const next = list.filter((p) => p !== relPath)
    if (next.length > 0) this.byBasename.set(key, next)
    else this.byBasename.delete(key)
  }

  async setFile(vaultRoot: string, relPath: string): Promise<void> {
    if (!relPath.toLowerCase().endsWith('.md')) return
    try {
      const content = await fs.readFile(path.join(vaultRoot, relPath), 'utf-8')
      const { tags, links } = parseNote(content)
      if (this.notes.has(relPath)) this.removeFromBasenameIndex(relPath)
      const title = path.basename(relPath, '.md')
      this.notes.set(relPath, { path: relPath, title, tags, links, content })
      this.addToBasenameIndex(relPath)

      if (this.indexedIds.has(relPath)) this.miniSearch.discard(relPath)
      this.miniSearch.add({ id: relPath, title, content, tags: tags.join(' ') })
      this.indexedIds.add(relPath)
    } catch {
      // File may already have been removed between the watcher event and this read — ignore.
    }
  }

  removeFile(relPath: string): void {
    if (this.notes.delete(relPath)) {
      this.removeFromBasenameIndex(relPath)
    }
    if (this.indexedIds.has(relPath)) {
      this.miniSearch.discard(relPath)
      this.indexedIds.delete(relPath)
    }
  }

  clear(): void {
    this.notes.clear()
    this.byBasename.clear()
    this.miniSearch.removeAll()
    this.indexedIds.clear()
  }

  resolveWikilink(target: string): string | null {
    const key = basenameKey(target.replace(/\.md$/i, ''))
    const matches = this.byBasename.get(key)
    if (!matches || matches.length === 0) return null
    return [...matches].sort()[0]
  }

  getAllTags(): string[] {
    const set = new Set<string>()
    for (const note of this.notes.values()) {
      for (const tag of note.tags) set.add(tag)
    }
    return [...set].sort((a, b) => a.localeCompare(b))
  }

  getNotesByTag(tag: string): string[] {
    const paths: string[] = []
    for (const note of this.notes.values()) {
      if (note.tags.includes(tag)) paths.push(note.path)
    }
    return paths.sort((a, b) => a.localeCompare(b))
  }

  /** Notes that contain a wikilink resolving to `targetPath`. */
  getBacklinks(targetPath: string): string[] {
    const sources: string[] = []
    for (const note of this.notes.values()) {
      if (note.path === targetPath) continue
      for (const link of note.links) {
        if (this.resolveWikilink(link) === targetPath) {
          sources.push(note.path)
          break
        }
      }
    }
    return sources.sort((a, b) => a.localeCompare(b))
  }

  /** Raw wikilink targets in `notePath` that don't resolve to any file in the vault. */
  getBrokenLinks(notePath: string): string[] {
    const note = this.notes.get(notePath)
    if (!note) return []
    return note.links.filter((link) => this.resolveWikilink(link) === null)
  }

  search(query: string, limit = 20): SearchResult[] {
    const trimmed = query.trim()
    if (!trimmed) return []
    const results = this.miniSearch.search(trimmed, {
      prefix: true,
      fuzzy: 0.2,
      boost: { title: 2 }
    })
    return results.slice(0, limit).map((r) => {
      const note = this.notes.get(String(r.id))
      return {
        path: String(r.id),
        title: note?.title ?? String(r.id),
        snippet: buildSnippet(note?.content ?? '', trimmed)
      }
    })
  }
}

export const vaultIndex = new VaultIndex()
