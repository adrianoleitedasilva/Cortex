import { syntaxTree } from '@codemirror/language'
import type { Extension, Range } from '@codemirror/state'
import { Decoration, EditorView, ViewPlugin, type DecorationSet, type ViewUpdate } from '@codemirror/view'

const TAG_RE = /(^|\s)(#[a-zA-Z0-9_/-]+)/g
const CODE_NODE_NAMES = new Set(['InlineCode', 'FencedCode', 'CodeBlock', 'CodeText'])

function isInsideCode(view: EditorView, pos: number): boolean {
  let node = syntaxTree(view.state).resolveInner(pos, 1)
  for (;;) {
    if (CODE_NODE_NAMES.has(node.type.name)) return true
    if (!node.parent) return false
    node = node.parent
  }
}

function buildTagDecorations(view: EditorView): DecorationSet {
  const { state } = view
  const decos: Range<Decoration>[] = []

  for (const { from, to } of view.visibleRanges) {
    const text = state.doc.sliceString(from, to)
    TAG_RE.lastIndex = 0
    let m: RegExpExecArray | null
    while ((m = TAG_RE.exec(text))) {
      const start = from + m.index + m[1].length
      const end = start + m[2].length
      if (isInsideCode(view, start)) continue
      decos.push(Decoration.mark({ class: 'cm-tag' }).range(start, end))
    }
  }

  return Decoration.set(decos, true)
}

class TagPluginValue {
  decorations: DecorationSet

  constructor(view: EditorView) {
    this.decorations = buildTagDecorations(view)
  }

  update(update: ViewUpdate): void {
    if (update.docChanged || update.selectionSet || update.viewportChanged) {
      this.decorations = buildTagDecorations(update.view)
    }
  }
}

const tagViewPlugin = ViewPlugin.fromClass(TagPluginValue, { decorations: (v) => v.decorations })

const tagTheme = EditorView.baseTheme({
  '.cm-tag': {
    color: 'var(--color-accent)',
    backgroundColor: 'color-mix(in srgb, var(--color-accent) 14%, transparent)',
    borderRadius: '4px',
    padding: '0 2px'
  }
})

export function tags(): Extension {
  return [tagViewPlugin, tagTheme]
}
