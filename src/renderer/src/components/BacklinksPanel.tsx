import { useEffect, useState } from 'react'
import { useTabsStore } from '../state/tabsStore'
import { navigateToWikilink } from '../editor/wikilinkPlugin'

function titleOf(p: string): string {
  const name = p.includes('/') ? p.slice(p.lastIndexOf('/') + 1) : p
  return name.toLowerCase().endsWith('.md') ? name.slice(0, -3) : name
}

export function BacklinksPanel(): React.JSX.Element {
  const activePath = useTabsStore((s) => s.activePath)
  const openTab = useTabsStore((s) => s.openTab)
  const [backlinks, setBacklinks] = useState<string[]>([])
  const [broken, setBroken] = useState<string[]>([])
  const [refreshTick, setRefreshTick] = useState(0)

  useEffect(() => {
    return window.cortex.events.onVaultChangedExternally(() => {
      setRefreshTick((t) => t + 1)
    })
  }, [])

  useEffect(() => {
    if (!activePath) {
      setBacklinks([])
      setBroken([])
      return
    }
    let cancelled = false
    Promise.all([
      window.cortex.index.getBacklinks(activePath),
      window.cortex.index.getBrokenLinks(activePath)
    ]).then(([bl, brk]) => {
      if (!cancelled) {
        setBacklinks(bl)
        setBroken(brk)
      }
    })
    return () => {
      cancelled = true
    }
  }, [activePath, refreshTick])

  if (!activePath) {
    return (
      <aside className="right-panel">
        <div className="tree-empty">Abra uma nota para ver backlinks.</div>
      </aside>
    )
  }

  return (
    <aside className="right-panel">
      <div className="backlinks-section">
        <div className="backlinks-section-title">Backlinks ({backlinks.length})</div>
        {backlinks.length === 0 && <div className="tree-empty">Nenhuma nota linka para esta.</div>}
        <div className="panel-list">
          {backlinks.map((p) => (
            <div key={p} className="panel-list-item" title={p} onClick={() => openTab(p)}>
              {titleOf(p)}
            </div>
          ))}
        </div>
      </div>
      <div className="backlinks-section">
        <div className="backlinks-section-title">Links quebrados ({broken.length})</div>
        {broken.length === 0 && <div className="tree-empty">Nenhum link quebrado nesta nota.</div>}
        <div className="panel-list">
          {broken.map((target) => (
            <div
              key={target}
              className="panel-list-item broken"
              title="Clique para criar esta nota"
              onClick={() => void navigateToWikilink(target)}
            >
              {target}
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}
