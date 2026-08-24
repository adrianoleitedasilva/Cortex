import { syntaxTree } from '@codemirror/language'
import type { Extension, Range } from '@codemirror/state'
import { Decoration, EditorView, ViewPlugin, type DecorationSet, type ViewUpdate } from '@codemirror/view'
import { lineTouchedBySelection } from './selectionUtils'
import { resolveWikilink } from './noteResolver'
import { useVaultStore } from '../state/vaultStore'
import { useTabsStore } from '../state/tabsStore'

const WIKILINK_RE = /\[\[([^\]|]+)(\|([^\]]+))?\]\]/g
const CODE_NODE_NAMES = new Set(['InlineCode', 'FencedCode', 'CodeBlock', 'CodeText'])

function isInsideCode(view: EditorView, pos: number): boolean {
  let node = syntaxTree(view.state).resolveInner(pos, 1)
  for (;;) {
    if (CODE_NODE_NAMES.has(node.type.name)) return true
    if (!node.parent) return false
    node = node.parent
  }
}

function buildWikilinkDecorations(view: EditorView): DecorationSet {
  const { state } = view
  const decos: Range<Decoration>[] = []

  for (const { from, to } of view.visibleRanges) {
    const text = state.doc.sliceString(from, to)
    WIKILINK_RE.lastIndex = 0
    let m: RegExpExecArray | null
    while ((m = WIKILINK_RE.exec(text))) {
      const start = from + m.index
      const end = start + m[0].length
      if (isInsideCode(view, start)) continue

      const target = m[1].trim()
      const aliasRaw = m[3]
      const targetStart = start + 2
      const targetEnd = targetStart + m[1].length
      let labelStart = targetStart
      let labelEnd = targetEnd
      let closeStart = targetEnd

      if (aliasRaw !== undefined) {
        const aliasStart = targetEnd + 1
        labelStart = aliasStart
        labelEnd = aliasStart + aliasRaw.length
        closeStart = labelEnd
      }

      const touched = lineTouchedBySelection(state, start, end)
      const resolved = resolveWikilink(target)
      const cls = resolved ? 'cm-wikilink' : 'cm-wikilink cm-wikilink-broken'

      if (!touched) {
        decos.push(Decoration.replace({}).range(start, targetStart))
        if (labelStart > targetStart) {
          decos.push(Decoration.replace({}).range(targetStart, labelStart))
        }
        decos.push(
          Decoration.mark({ class: cls, attributes: { 'data-wikilink-target': target } }).range(
            labelStart,
            labelEnd
          )
        )
        decos.push(Decoration.replace({}).range(closeStart, end))
      } else {
        decos.push(Decoration.mark({ class: 'cm-wikilink-mark' }).range(start, targetStart))
        if (labelStart > targetStart) {
          decos.push(Decoration.mark({ class: 'cm-wikilink-mark' }).range(targetStart, labelStart))
        }
        decos.push(Decoration.mark({ class: cls }).range(labelStart, labelEnd))
        decos.push(Decoration.mark({ class: 'cm-wikilink-mark' }).range(closeStart, end))
      }
    }
  }

  return Decoration.set(decos, true)
}

class WikilinkPluginValue {
  decorations: DecorationSet

  constructor(view: EditorView) {
    this.decorations = buildWikilinkDecorations(view)
  }

  update(update: ViewUpdate): void {
    if (update.docChanged || update.selectionSet || update.viewportChanged) {
      this.decorations = buildWikilinkDecorations(update.view)
    }
  }
}

const wikilinkViewPlugin = ViewPlugin.fromClass(WikilinkPluginValue, {
  decorations: (v) => v.decorations
})

export async function navigateToWikilink(rawTarget: string): Promise<void> {
  const resolved = resolveWikilink(rawTarget)
  if (resolved) {
    useTabsStore.getState().openTab(resolved)
    return
  }
  const newPath = await window.cortex.fs.createFile('', rawTarget)
  await useVaultStore.getState().refreshTree()
  useTabsStore.getState().openTab(newPath)
}

const wikilinkClickHandler = EditorView.domEventHandlers({
  mousedown(event) {
    const el = (event.target as HTMLElement).closest('.cm-wikilink')
    if (!el) return false
    const target = el.getAttribute('data-wikilink-target')
    if (!target) return false
    event.preventDefault()
    void navigateToWikilink(target)
    return true
  }
})

const wikilinkTheme = EditorView.baseTheme({
  '.cm-wikilink': {
    color: 'var(--color-accent)',
    cursor: 'pointer',
    borderBottom: '1px solid color-mix(in srgb, var(--color-accent) 45%, transparent)'
  },
  '.cm-wikilink-broken': {
    color: 'var(--color-text-muted)',
    borderBottomStyle: 'dashed',
    borderBottomColor: '#e06c75'
  },
  '.cm-wikilink-mark': {
    color: 'var(--color-text-muted)'
  }
})

export function wikilinks(): Extension {
  return [wikilinkViewPlugin, wikilinkClickHandler, wikilinkTheme]
}
