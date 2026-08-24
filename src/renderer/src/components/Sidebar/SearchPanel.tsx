import { useEffect, useRef, useState } from 'react'
import { useTabsStore } from '../../state/tabsStore'
import type { SearchResult } from '../../../../shared/types'

export function SearchPanel(): React.JSX.Element {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const openTab = useTabsStore((s) => s.openTab)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    let cancelled = false
    const timer = setTimeout(() => {
      if (!query.trim()) {
        setResults([])
        return
      }
      void window.cortex.search.query(query).then((r) => {
        if (!cancelled) setResults(r)
      })
    }, 150)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [query])

  return (
    <div className="panel">
      <input
        ref={inputRef}
        className="panel-search-input"
        placeholder="Buscar notas…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {query.trim() && results.length === 0 && <div className="tree-empty">Nenhum resultado.</div>}
      <div className="panel-list">
        {results.map((r) => (
          <div key={r.path} className="panel-list-item" title={r.path} onClick={() => openTab(r.path)}>
            <div className="panel-list-title">{r.title}</div>
            {r.snippet && <div className="panel-list-snippet">{r.snippet}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}
