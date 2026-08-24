import { useTabsStore } from '../state/tabsStore'
import { useVaultStore } from '../state/vaultStore'
import { useStatsStore } from '../state/statsStore'

function vaultDisplayName(vaultPath: string): string {
  return vaultPath.split(/[\\/]/).pop() ?? vaultPath
}

export function StatusBar(): React.JSX.Element {
  const currentVaultPath = useVaultStore((s) => s.currentVaultPath)
  const activePath = useTabsStore((s) => s.activePath)
  const dirty = useTabsStore((s) => s.dirty)
  const wordCount = useStatsStore((s) => s.wordCount)
  const charCount = useStatsStore((s) => s.charCount)
  const lineCount = useStatsStore((s) => s.lineCount)

  const isDirty = activePath ? !!dirty[activePath] : false

  return (
    <div className="status-bar">
      <span className="status-bar-vault" title={currentVaultPath ?? ''}>
        {currentVaultPath ? vaultDisplayName(currentVaultPath) : 'Nenhum vault'}
      </span>
      <div className="status-bar-right">
        {activePath && (
          <>
            <span>{lineCount} linhas</span>
            <span>{wordCount} palavras</span>
            <span>{charCount} caracteres</span>
            <span className={isDirty ? 'status-dirty' : 'status-saved'}>
              {isDirty ? 'Editando…' : 'Salvo'}
            </span>
          </>
        )}
      </div>
    </div>
  )
}
