import type { Extension } from '@codemirror/state'
import { EditorView } from '@codemirror/view'

const IMAGE_EXT_RE = /\.(png|jpe?g|gif|webp|svg|bmp)$/i

function isImageFile(file: File): boolean {
  return file.type.startsWith('image/') || IMAGE_EXT_RE.test(file.name)
}

async function insertFiles(view: EditorView, files: File[], startPos: number): Promise<void> {
  let insertPos = startPos
  for (const file of files) {
    const buffer = new Uint8Array(await file.arrayBuffer())
    const relPath = await window.cortex.fs.saveAttachment(buffer, file.name || 'anexo')
    const markdown = isImageFile(file) ? `![](${relPath})\n` : `[${file.name || relPath}](${relPath})\n`
    view.dispatch({
      changes: { from: insertPos, insert: markdown },
      selection: { anchor: insertPos + markdown.length }
    })
    insertPos += markdown.length
  }
}

export function attachmentHandling(): Extension {
  return EditorView.domEventHandlers({
    paste(event, view) {
      const files = event.clipboardData?.files
      if (!files || files.length === 0) return false
      event.preventDefault()
      void insertFiles(view, Array.from(files), view.state.selection.main.from)
      return true
    },
    drop(event, view) {
      const files = event.dataTransfer?.files
      if (!files || files.length === 0) return false
      event.preventDefault()
      const pos = view.posAtCoords({ x: event.clientX, y: event.clientY }) ?? view.state.selection.main.from
      void insertFiles(view, Array.from(files), pos)
      return true
    }
  })
}
