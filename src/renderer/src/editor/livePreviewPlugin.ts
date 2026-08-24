import { syntaxTree } from '@codemirror/language'
import type { Extension, Range } from '@codemirror/state'
import { Decoration, EditorView, ViewPlugin, type DecorationSet, type ViewUpdate, WidgetType } from '@codemirror/view'
import type { SyntaxNodeRef } from '@lezer/common'
import { lineTouchedBySelection } from './selectionUtils'

const HEADING_LEVELS: Record<string, number> = {
  ATXHeading1: 1,
  ATXHeading2: 2,
  ATXHeading3: 3,
  ATXHeading4: 4,
  ATXHeading5: 5,
  ATXHeading6: 6
}

class CheckboxWidget extends WidgetType {
  constructor(
    private readonly checked: boolean,
    private readonly from: number,
    private readonly to: number
  ) {
    super()
  }

  eq(other: CheckboxWidget): boolean {
    return other.checked === this.checked && other.from === this.from && other.to === this.to
  }

  toDOM(view: EditorView): HTMLElement {
    const box = document.createElement('input')
    box.type = 'checkbox'
    box.className = 'cm-task-checkbox'
    box.checked = this.checked
    box.addEventListener('mousedown', (e) => {
      e.preventDefault()
      const replacement = this.checked ? '[ ]' : '[x]'
      view.dispatch({ changes: { from: this.from, to: this.to, insert: replacement } })
    })
    return box
  }

  ignoreEvent(): boolean {
    return false
  }
}

function buildDecorations(view: EditorView): { decorations: DecorationSet; atomic: DecorationSet } {
  const { state } = view
  const marks: Range<Decoration>[] = []
  const atomic: Range<Decoration>[] = []

  const hideRange = (from: number, to: number): void => {
    const dec = Decoration.replace({})
    marks.push(dec.range(from, to))
    atomic.push(dec.range(from, to))
  }

  const hideRangeWithTrailingSpace = (from: number, to: number): void => {
    let end = to
    if (state.doc.sliceString(end, end + 1) === ' ') end += 1
    hideRange(from, end)
  }

  for (const { from, to } of view.visibleRanges) {
    syntaxTree(state).iterate({
      from,
      to,
      enter: (node: SyntaxNodeRef) => {
        const name = node.type.name

        if (name in HEADING_LEVELS) {
          const line = state.doc.lineAt(node.from)
          marks.push(Decoration.line({ class: `cm-heading cm-heading-${HEADING_LEVELS[name]}` }).range(line.from))
          return
        }

        if (name === 'HeaderMark') {
          if (!lineTouchedBySelection(state, node.from, node.to)) {
            hideRangeWithTrailingSpace(node.from, node.to)
          }
          return
        }

        if (name === 'QuoteMark') {
          const line = state.doc.lineAt(node.from)
          marks.push(Decoration.line({ class: 'cm-quote-line' }).range(line.from))
          if (!lineTouchedBySelection(state, node.from, node.to)) {
            hideRangeWithTrailingSpace(node.from, node.to)
          }
          return
        }

        if (name === 'EmphasisMark') {
          const parent = node.node.parent
          if (parent && !lineTouchedBySelection(state, parent.from, parent.to)) {
            hideRange(node.from, node.to)
          }
          return
        }

        if (name === 'CodeMark') {
          const parent = node.node.parent
          if (
            parent &&
            parent.type.name === 'InlineCode' &&
            !lineTouchedBySelection(state, parent.from, parent.to)
          ) {
            hideRange(node.from, node.to)
          }
          return
        }

        if (name === 'FencedCode') {
          const startLine = state.doc.lineAt(node.from).number
          const endLine = state.doc.lineAt(node.to).number
          for (let ln = startLine; ln <= endLine; ln++) {
            marks.push(Decoration.line({ class: 'cm-code-block-line' }).range(state.doc.line(ln).from))
          }
          return
        }

        if (name === 'TaskMarker') {
          const text = state.doc.sliceString(node.from, node.to)
          const checked = /x/i.test(text)
          const dec = Decoration.replace({ widget: new CheckboxWidget(checked, node.from, node.to) })
          marks.push(dec.range(node.from, node.to))
          atomic.push(dec.range(node.from, node.to))
        }
      }
    })
  }

  return { decorations: Decoration.set(marks, true), atomic: Decoration.set(atomic, true) }
}

class LivePreviewPluginValue {
  decorations: DecorationSet
  atomic: DecorationSet

  constructor(view: EditorView) {
    const built = buildDecorations(view)
    this.decorations = built.decorations
    this.atomic = built.atomic
  }

  update(update: ViewUpdate): void {
    if (update.docChanged || update.selectionSet || update.viewportChanged) {
      const built = buildDecorations(update.view)
      this.decorations = built.decorations
      this.atomic = built.atomic
    }
  }
}

const livePreviewViewPlugin = ViewPlugin.fromClass(LivePreviewPluginValue, {
  decorations: (v) => v.decorations
})

const livePreviewTheme = EditorView.baseTheme({
  '.cm-heading': {
    fontWeight: '700'
  },
  '.cm-heading-1': { fontSize: '1.6em' },
  '.cm-heading-2': { fontSize: '1.4em' },
  '.cm-heading-3': { fontSize: '1.2em' },
  '.cm-heading-4, .cm-heading-5, .cm-heading-6': { fontSize: '1.05em' },
  '.cm-quote-line': {
    borderLeft: '3px solid var(--color-border)',
    paddingLeft: '10px'
  },
  '.cm-code-block-line': {
    backgroundColor: 'var(--color-bg-elevated)'
  },
  '.cm-task-checkbox': {
    marginRight: '6px',
    verticalAlign: 'middle',
    cursor: 'pointer'
  }
})

export function livePreview(): Extension {
  return [
    livePreviewViewPlugin,
    EditorView.atomicRanges.of((view) => view.plugin(livePreviewViewPlugin)?.atomic ?? Decoration.none),
    livePreviewTheme
  ]
}
