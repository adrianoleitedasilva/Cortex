import { useUiStore } from '../state/uiStore'
import { IconSwap } from './IconSwap'
import { LinkOutline, LinkSolid } from './icons'

interface ToolItem {
  key: string
  outline: React.ReactNode
  solid: React.ReactNode
  label: string
  active: boolean
  onClick: () => void
}

/** Narrow icon rail docked to the right edge of the window, top-aligned. Each icon toggles
 * a tool panel (Backlinks today) — add more tools here as they're built. */
export function ToolRail(): React.JSX.Element {
  const rightPanelOpen = useUiStore((s) => s.rightPanelOpen)
  const toggleRightPanel = useUiStore((s) => s.toggleRightPanel)

  const tools: ToolItem[] = [
    {
      key: 'backlinks',
      outline: <LinkOutline />,
      solid: <LinkSolid />,
      label: 'Backlinks',
      active: rightPanelOpen,
      onClick: toggleRightPanel
    }
  ]

  return (
    <div className="tool-rail">
      {tools.map((tool) => (
        <button
          key={tool.key}
          className={`tool-rail-item${tool.active ? ' active' : ''}`}
          title={tool.label}
          onClick={tool.onClick}
        >
          <IconSwap outline={tool.outline} solid={tool.solid} />
        </button>
      ))}
    </div>
  )
}
