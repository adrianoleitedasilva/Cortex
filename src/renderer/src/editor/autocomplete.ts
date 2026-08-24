import type { Extension } from '@codemirror/state'
import { autocompletion, type CompletionContext, type CompletionResult } from '@codemirror/autocomplete'
import { getAllNotePaths } from './noteResolver'
import { searchFaIcons } from '../icons/faCatalog'

function wikilinkCompletions(context: CompletionContext): CompletionResult | null {
  const match = context.matchBefore(/\[\[[^\]]*/)
  if (!match) return null

  const query = match.text.slice(2).toLowerCase()
  const options = getAllNotePaths()
    .filter((p) => p.toLowerCase().includes(query))
    .slice(0, 50)
    .map((p) => {
      const title = p.toLowerCase().endsWith('.md') ? p.slice(0, -3) : p
      return { label: title, apply: `${title}]]`, type: 'text' }
    })

  return { from: match.from + 2, options, filter: false }
}

async function tagCompletions(context: CompletionContext): Promise<CompletionResult | null> {
  const match = context.matchBefore(/#[a-zA-Z0-9_/-]*/)
  if (!match) return null
  if (match.from === match.to && !context.explicit) return null

  const query = match.text.slice(1).toLowerCase()
  const allTags = await window.cortex.index.getTags()
  const options = allTags
    .filter((t) => t.toLowerCase().includes(query))
    .map((t) => ({ label: `#${t}`, apply: `#${t}`, type: 'text' }))

  return { from: match.from, options, filter: false }
}

function iconCompletions(context: CompletionContext): CompletionResult | null {
  // Requires at least one char after ":" (no "+" -> "*") so a bare colon in prose/URLs/times
  // never pops up the full icon list.
  const match = context.matchBefore(/:[a-z0-9-]+/)
  if (!match) return null

  const query = match.text.slice(1).toLowerCase()
  const results = searchFaIcons(query, 50)
  if (results.length === 0) return null

  const options = results.map((entry) => ({ label: `:${entry.name}:`, apply: `:${entry.name}:`, type: 'text' }))
  return { from: match.from, options, filter: false }
}

export function noteAutocomplete(): Extension {
  return autocompletion({ override: [wikilinkCompletions, tagCompletions, iconCompletions] })
}
