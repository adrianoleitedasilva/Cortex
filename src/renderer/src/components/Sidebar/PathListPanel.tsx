import { useTabsStore } from '../../state/tabsStore'

function titleOf(p: string): string {
  const name = p.includes('/') ? p.slice(p.lastIndexOf('/') + 1) : p
  return name.toLowerCase().endsWith('.md') ? name.slice(0, -3) : name
}

interface Props {
  paths: string[]
  emptyMessage: string
  icon?: React.ReactNode
}

export function PathListPanel({ paths, emptyMessage, icon }: Props): React.JSX.Element {
  const openTab = useTabsStore((s) => s.openTab)

  return (
    <div className="panel">
      {paths.length === 0 && <div className="tree-empty">{emptyMessage}</div>}
      <div className="panel-list">
        {paths.map((p) => (
          <div key={p} className="panel-list-item" title={p} onClick={() => openTab(p)}>
            {icon && <span className="panel-list-icon">{icon}</span>}
            {titleOf(p)}
          </div>
        ))}
      </div>
    </div>
  )
}
