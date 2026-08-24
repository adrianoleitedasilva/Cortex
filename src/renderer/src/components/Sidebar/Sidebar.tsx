import { useEffect } from 'react'
import { useVaultStore } from '../../state/vaultStore'
import { useUiStore, type SidebarPanel } from '../../state/uiStore'
import { useListsStore } from '../../state/listsStore'
import { useIconAssignmentsStore } from '../../state/iconAssignmentsStore'
import { FileTree } from './FileTree'
import { SearchPanel } from './SearchPanel'
import { TagsPanel } from './TagsPanel'
import { FavoritesPanel } from './FavoritesPanel'
import { RecentPanel } from './RecentPanel'
import { IconSwap } from '../IconSwap'
import {
  FolderOutline,
  FolderSolid,
  SearchOutline,
  SearchSolid,
  TagOutline,
  TagSolid,
  StarOutline,
  StarSolid,
  ClockOutline,
  ClockSolid
} from '../icons'

const PANELS: { key: SidebarPanel; label: string; outline: React.ReactNode; solid: React.ReactNode }[] = [
  { key: 'files', label: 'Arquivos', outline: <FolderOutline />, solid: <FolderSolid /> },
  { key: 'search', label: 'Busca', outline: <SearchOutline />, solid: <SearchSolid /> },
  { key: 'tags', label: 'Tags', outline: <TagOutline />, solid: <TagSolid /> },
  { key: 'favorites', label: 'Favoritos', outline: <StarOutline />, solid: <StarSolid /> },
  { key: 'recent', label: 'Recentes', outline: <ClockOutline />, solid: <ClockSolid /> }
]

function vaultDisplayName(vaultPath: string): string {
  return vaultPath.split(/[\\/]/).pop() ?? vaultPath
}

// Only ever mounted once App.tsx confirms a vault is selected (see WelcomeGate) — no
// "no vault" state to handle here.
export function Sidebar(): React.JSX.Element {
  const currentVaultPath = useVaultStore((s) => s.currentVaultPath)
  const error = useVaultStore((s) => s.error)
  const selectFolder = useVaultStore((s) => s.selectFolder)
  const panel = useUiStore((s) => s.sidebarPanel)
  const setPanel = useUiStore((s) => s.setSidebarPanel)
  const loadLists = useListsStore((s) => s.loadLists)
  const loadIcons = useIconAssignmentsStore((s) => s.load)

  useEffect(() => {
    void loadLists()
    void loadIcons()
  }, [loadLists, loadIcons])

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span className="vault-name" title={currentVaultPath ?? ''}>
          {currentVaultPath ? vaultDisplayName(currentVaultPath) : 'Nenhum vault'}
        </span>
        <button className="icon-button" title="Trocar vault" onClick={() => selectFolder()}>
          ⋯
        </button>
      </div>
      <div className="sidebar-tabs">
        {PANELS.map((p) => (
          <button
            key={p.key}
            className={`sidebar-tab${panel === p.key ? ' active' : ''}`}
            title={p.label}
            onClick={() => setPanel(p.key)}
          >
            <IconSwap outline={p.outline} solid={p.solid} />
          </button>
        ))}
      </div>
      {error && <div className="sidebar-error">{error}</div>}
      <div className="sidebar-body">
        {panel === 'files' ? (
          <FileTree />
        ) : panel === 'search' ? (
          <SearchPanel />
        ) : panel === 'tags' ? (
          <TagsPanel />
        ) : panel === 'favorites' ? (
          <FavoritesPanel />
        ) : (
          <RecentPanel />
        )}
      </div>
    </aside>
  )
}
