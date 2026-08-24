import { HighlightStyle } from '@codemirror/language'
import { tags as t } from '@lezer/highlight'

export const cortexHighlightStyle = HighlightStyle.define([
  // Font size/weight for headings is applied at the line level by the live-preview
  // plugin (cm-heading-N) — only color lives here, to avoid double-scaling the two together.
  { tag: [t.heading1, t.heading2, t.heading3, t.heading4, t.heading5, t.heading6], color: 'var(--syntax-heading)' },
  { tag: t.strong, fontWeight: '700', color: 'var(--syntax-strong)' },
  { tag: t.emphasis, fontStyle: 'italic', color: 'var(--syntax-emphasis)' },
  { tag: t.strikethrough, textDecoration: 'line-through', color: 'var(--syntax-strikethrough)' },
  { tag: t.link, color: 'var(--syntax-link)', textDecoration: 'underline' },
  { tag: t.url, color: 'var(--syntax-link)' },
  { tag: t.monospace, color: 'var(--syntax-code)' },
  { tag: t.quote, color: 'var(--syntax-quote)', fontStyle: 'italic' },
  { tag: t.list, color: 'var(--syntax-heading)' },
  { tag: t.meta, color: 'var(--syntax-meta)' },
  { tag: t.processingInstruction, color: 'var(--syntax-meta)' },
  { tag: t.contentSeparator, color: 'var(--syntax-meta)' },
  { tag: t.keyword, color: 'var(--syntax-code)' },
  { tag: t.string, color: 'var(--syntax-code)' },
  { tag: t.comment, color: 'var(--syntax-meta)', fontStyle: 'italic' }
])
