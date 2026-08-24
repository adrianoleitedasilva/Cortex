import { useEffect, useRef } from 'react'
import { EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { buildExtensions } from './extensions'
import * as editorCache from './editorCache'
import * as autosave from './autosave'
import { useTabsStore } from '../state/tabsStore'
import { useStatsStore } from '../state/statsStore'

interface Props {
  path: string
}

export function CodeMirrorEditor({ path }: Props): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const currentPathRef = useRef<string | null>(null)

  useEffect(() => {
    const view = new EditorView({
      parent: containerRef.current as HTMLDivElement,
      state: EditorState.create({ doc: '' })
    })
    viewRef.current = view
    return () => {
      const outgoing = currentPathRef.current
      if (outgoing) {
        editorCache.setCachedState(outgoing, view.state)
      }
      view.destroy()
      viewRef.current = null
      useStatsStore.getState().clear()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadDoc(): Promise<void> {
      const view = viewRef.current
      if (!view) return

      const outgoing = currentPathRef.current
      if (outgoing && outgoing !== path) {
        autosave.flushPending(outgoing)
        editorCache.setCachedState(outgoing, view.state)
      }

      let state = editorCache.getCachedState(path)
      if (!state) {
        const content = await window.cortex.fs.readFile(path)
        if (cancelled) return
        state = EditorState.create({
          doc: content,
          extensions: buildExtensions('Comece a escrever…', (docContent) => {
            useTabsStore.getState().setDirty(path, true)
            autosave.scheduleSave(path, docContent)
          })
        })
        editorCache.setCachedState(path, state)
      }
      if (cancelled) return
      view.setState(state)
      currentPathRef.current = path
      view.focus()
    }

    void loadDoc()
    return () => {
      cancelled = true
    }
  }, [path])

  return <div className="cm-container" ref={containerRef} />
}
