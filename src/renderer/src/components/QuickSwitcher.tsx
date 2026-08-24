import { useEffect, useRef, useState } from 'react'
import fuzzysort from 'fuzzysort'
import { useTabsStore } from '../state/tabsStore'
import { getAllNotePaths } from '../editor/noteResolver'

interface Props {
  onClose: () => void
}

export function QuickSwitcher({ onClose }: Props): React.JSX.Element {
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const openTab = useTabsStore((s) => s.openTab)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const allPaths = getAllNotePaths()
  const results = query.trim()
    ? fuzzysort.go(query, allPaths, { limit: 30 }).map((r) => r.target)
    : allPaths.slice(0, 30)

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  const openAt = (index: number): void => {
    const path = results[index]
    if (path) {
      openTab(path)
      onClose()
    }
  }

  return (
    <div className="quick-switcher-overlay" onMouseDown={onClose}>
      <div className="quick-switcher" onMouseDown={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          className="quick-switcher-input"
          placeholder="Ir para uma nota…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.preventDefault()
              onClose()
            } else if (e.key === 'ArrowDown') {
              e.preventDefault()
              setSelectedIndex((i) => Math.min(i + 1, results.length - 1))
            } else if (e.key === 'ArrowUp') {
              e.preventDefault()
              setSelectedIndex((i) => Math.max(i - 1, 0))
            } else if (e.key === 'Enter') {
              e.preventDefault()
              openAt(selectedIndex)
            }
          }}
        />
        <div className="quick-switcher-list">
          {results.length === 0 && <div className="tree-empty">Nenhuma nota encontrada.</div>}
          {results.map((path, i) => (
            <div
              key={path}
              className={`quick-switcher-item${i === selectedIndex ? ' active' : ''}`}
              onMouseEnter={() => setSelectedIndex(i)}
              onClick={() => openAt(i)}
            >
              {path}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
