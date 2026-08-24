import { useEffect, useState } from 'react'
import { useTabsStore } from '../../state/tabsStore'

function titleOf(p: string): string {
  const name = p.includes('/') ? p.slice(p.lastIndexOf('/') + 1) : p
  return name.toLowerCase().endsWith('.md') ? name.slice(0, -3) : name
}

export function TagsPanel(): React.JSX.Element {
  const [tagList, setTagList] = useState<string[]>([])
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [notes, setNotes] = useState<string[]>([])
  const openTab = useTabsStore((s) => s.openTab)

  useEffect(() => {
    void window.cortex.index.getTags().then(setTagList)
  }, [])

  useEffect(() => {
    if (!activeTag) {
      setNotes([])
      return
    }
    void window.cortex.index.getNotesByTag(activeTag).then(setNotes)
  }, [activeTag])

  if (activeTag) {
    return (
      <div className="panel">
        <button className="panel-back" onClick={() => setActiveTag(null)}>
          ← tags
        </button>
        <div className="panel-section-title">#{activeTag}</div>
        <div className="panel-list">
          {notes.length === 0 && <div className="tree-empty">Nenhuma nota com essa tag.</div>}
          {notes.map((p) => (
            <div key={p} className="panel-list-item" title={p} onClick={() => openTab(p)}>
              {titleOf(p)}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="panel">
      {tagList.length === 0 && <div className="tree-empty">Nenhuma tag no vault ainda.</div>}
      <div className="tag-cloud">
        {tagList.map((t) => (
          <button key={t} className="tag-chip" onClick={() => setActiveTag(t)}>
            #{t}
          </button>
        ))}
      </div>
    </div>
  )
}
