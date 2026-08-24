import { syntaxTree } from '@codemirror/language'
import type { Extension, Range } from '@codemirror/state'
import { Decoration, EditorView, ViewPlugin, type DecorationSet, type ViewUpdate, WidgetType } from '@codemirror/view'
import { lineTouchedBySelection } from './selectionUtils'

const IMAGE_MARKDOWN_RE = /^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)$/

function toAttachmentUrl(relPath: string): string {
  if (/^([a-z][a-z0-9+.-]*:)?\/\//i.test(relPath) || relPath.startsWith('data:')) return relPath
  const encoded = relPath
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/')
  return `cortex-attachment://vault/${encoded}`
}

class ImageWidget extends WidgetType {
  constructor(
    private readonly src: string,
    private readonly alt: string
  ) {
    super()
  }

  eq(other: ImageWidget): boolean {
    return other.src === this.src && other.alt === this.alt
  }

  toDOM(): HTMLElement {
    const wrapper = document.createElement('span')
    wrapper.className = 'cm-image-widget'
    const img = document.createElement('img')
    img.src = toAttachmentUrl(this.src)
    img.alt = this.alt
    img.loading = 'lazy'
    wrapper.appendChild(img)
    return wrapper
  }

  ignoreEvent(): boolean {
    return false
  }
}

function buildImageDecorations(view: EditorView): DecorationSet {
  const { state } = view
  const decos: Range<Decoration>[] = []

  for (const { from, to } of view.visibleRanges) {
    syntaxTree(state).iterate({
      from,
      to,
      enter: (node) => {
        if (node.type.name !== 'Image') return
        if (lineTouchedBySelection(state, node.from, node.to)) return

        const text = state.doc.sliceString(node.from, node.to)
        const match = IMAGE_MARKDOWN_RE.exec(text)
        if (!match) return
        const [, alt, url] = match
        decos.push(
          Decoration.replace({ widget: new ImageWidget(url, alt) }).range(node.from, node.to)
        )
      }
    })
  }

  return Decoration.set(decos, true)
}

class ImagePluginValue {
  decorations: DecorationSet

  constructor(view: EditorView) {
    this.decorations = buildImageDecorations(view)
  }

  update(update: ViewUpdate): void {
    if (update.docChanged || update.selectionSet || update.viewportChanged) {
      this.decorations = buildImageDecorations(update.view)
    }
  }
}

const imageViewPlugin = ViewPlugin.fromClass(ImagePluginValue, { decorations: (v) => v.decorations })

const imageTheme = EditorView.baseTheme({
  '.cm-image-widget': {
    display: 'inline-block'
  },
  '.cm-image-widget img': {
    display: 'block',
    maxWidth: '100%',
    maxHeight: '400px',
    borderRadius: '6px',
    margin: '4px 0'
  }
})

export function images(): Extension {
  return [imageViewPlugin, imageTheme]
}
