import { useTabsStore } from '../../state/tabsStore'
import { useIconAssignmentsStore } from '../../state/iconAssignmentsStore'
import { FaIcon } from '../../icons/FaIcon'
import { FileOutline } from '../icons'

function basename(p: string): string {
  const idx = p.lastIndexOf('/')
  return idx === -1 ? p : p.slice(idx + 1)
}

function titleOf(p: string): string {
  const name = basename(p)
  return name.endsWith('.md') ? name.slice(0, -3) : name
}

export function EditorTabs(): React.JSX.Element | null {
  const openPaths = useTabsStore((s) => s.openPaths)
  const activePath = useTabsStore((s) => s.activePath)
  const dirty = useTabsStore((s) => s.dirty)
  const setActive = useTabsStore((s) => s.setActive)
  const closeTab = useTabsStore((s) => s.closeTab)
  const icons = useIconAssignmentsStore((s) => s.icons)

  if (openPaths.length === 0) return null

  return (
    <div className="editor-tabs">
      {openPaths.map((p) => (
        <div
          key={p}
          className={`editor-tab${p === activePath ? ' active' : ''}`}
          onClick={() => setActive(p)}
          title={p}
        >
          <span className="tab-icon">{icons[p] ? <FaIcon name={icons[p]} /> : <FileOutline />}</span>
          <span className="tab-title">{titleOf(p)}</span>
          {dirty[p] && <span className="tab-dirty">●</span>}
          <button
            className="tab-close"
            onClick={(e) => {
              e.stopPropagation()
              closeTab(p)
            }}
            title="Fechar"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
