import { useTabsStore } from '../../state/tabsStore'
import { EditorTabs } from './EditorTabs'
import { CodeMirrorEditor } from '../../editor/CodeMirrorEditor'

export function EditorArea(): React.JSX.Element {
  const activePath = useTabsStore((s) => s.activePath)

  return (
    <div className="editor-area">
      <EditorTabs />
      <div className="editor-content">
        {activePath ? (
          <CodeMirrorEditor path={activePath} />
        ) : (
          <div className="note-placeholder muted">Selecione ou crie uma nota na barra lateral.</div>
        )}
      </div>
    </div>
  )
}
