import { syntaxTree } from '@codemirror/language'
import type { Extension, Range } from '@codemirror/state'
import { Decoration, EditorView, ViewPlugin, type DecorationSet, type ViewUpdate, WidgetType } from '@codemirror/view'
import { icon } from '@fortawesome/fontawesome-svg-core'
import { lineTouchedBySelection } from './selectionUtils'
import { getFaIcon } from '../icons/faCatalog'

const ICON_RE = /:([a-z][a-z0-9-]*):/g
const CODE_NODE_NAMES = new Set(['InlineCode', 'FencedCode', 'CodeBlock', 'CodeText'])

function isInsideCode(view: EditorView, pos: number): boolean {
  let node = syntaxTree(view.state).resolveInner(pos, 1)
  for (;;) {
    if (CODE_NODE_NAMES.has(node.type.name)) return true
    if (!node.parent) return false
    node = node.parent
  }
}

class FaIconWidget extends WidgetType {
  constructor(private readonly name: string) {
    super()
  }

  eq(other: FaIconWidget): boolean {
    return other.name === this.name
  }

  toDOM(): HTMLElement {
    const span = document.createElement('span')
    span.className = 'cm-inline-icon'
    const definition = getFaIcon(this.name)
    if (definition) {
      const rendered = icon(definition)
      if (rendered) span.innerHTML = rendered.html.join('')
    }
    return span
  }

  ignoreEvent(): boolean {
    return false
  }
}

function buildIconDecorations(view: EditorView): DecorationSet {
  const { state } = view
  const decos: Range<Decoration>[] = []

  for (const { from, to } of view.visibleRanges) {
    const text = state.doc.sliceString(from, to)
    ICON_RE.lastIndex = 0
    let m: RegExpExecArray | null
    while ((m = ICON_RE.exec(text))) {
      const name = m[1]
      if (!getFaIcon(name)) continue
      const start = from + m.index
      const end = start + m[0].length
      if (isInsideCode(view, start)) continue
      if (lineTouchedBySelection(state, start, end)) continue
      decos.push(Decoration.replace({ widget: new FaIconWidget(name) }).range(start, end))
    }
  }

  return Decoration.set(decos, true)
}

class IconPluginValue {
  decorations: DecorationSet

  constructor(view: EditorView) {
    this.decorations = buildIconDecorations(view)
  }

  update(update: ViewUpdate): void {
    if (update.docChanged || update.selectionSet || update.viewportChanged) {
      this.decorations = buildIconDecorations(update.view)
    }
  }
}

const iconViewPlugin = ViewPlugin.fromClass(IconPluginValue, { decorations: (v) => v.decorations })

const iconTheme = EditorView.baseTheme({
  '.cm-inline-icon': {
    display: 'inline-flex',
    verticalAlign: 'middle',
    color: 'var(--color-accent)'
  },
  '.cm-inline-icon svg': {
    height: '1em',
    width: '1em'
  }
})

export function inlineIcons(): Extension {
  return [iconViewPlugin, iconTheme]
}
