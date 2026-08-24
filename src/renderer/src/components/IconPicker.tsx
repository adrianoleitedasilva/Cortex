import { useEffect, useRef, useState } from 'react'
import { useUiStore } from '../state/uiStore'
import { useIconAssignmentsStore } from '../state/iconAssignmentsStore'
import { searchFaIcons } from '../icons/faCatalog'
import { FaIcon } from '../icons/FaIcon'

export function IconPicker(): React.JSX.Element | null {
  const target = useUiStore((s) => s.iconPickerTarget)
  const close = useUiStore((s) => s.closeIconPicker)
  const setIcon = useIconAssignmentsStore((s) => s.setIcon)
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (target) {
      setQuery('')
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [target])

  if (!target) return null

  const results = searchFaIcons(query)

  const pick = (name: string): void => {
    void setIcon(target, name)
    close()
  }

  return (
    <div className="settings-overlay" onMouseDown={close}>
      <div className="icon-picker" onMouseDown={(e) => e.stopPropagation()}>
        <input
          ref={inputRef}
          className="icon-picker-input"
          placeholder="Buscar ícone (Font Awesome)…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') close()
            else if (e.key === 'Enter' && results[0]) pick(results[0].name)
          }}
        />
        <div className="icon-picker-grid">
          {results.length === 0 && <div className="tree-empty">Nenhum ícone encontrado.</div>}
          {results.map((entry) => (
            <button
              key={entry.name}
              className="icon-picker-cell"
              title={entry.name}
              onClick={() => pick(entry.name)}
            >
              <FaIcon name={entry.name} />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
