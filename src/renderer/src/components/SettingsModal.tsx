import { useState } from 'react'
import { useSettingsStore } from '../state/settingsStore'
import { useVaultStore } from '../state/vaultStore'
import { FONT_OPTIONS } from '../editor/fonts'

type SettingsSection = 'appearance' | 'privacy' | 'vault' | 'shortcuts'

const SECTIONS: { key: SettingsSection; label: string }[] = [
  { key: 'appearance', label: 'Aparência' },
  { key: 'privacy', label: 'Privacidade' },
  { key: 'vault', label: 'Vault' },
  { key: 'shortcuts', label: 'Atalhos' }
]

const SHORTCUTS: { keys: string; description: string }[] = [
  { keys: 'Ctrl+N', description: 'Nova nota (na pasta selecionada, ou na raiz)' },
  { keys: 'Ctrl+Shift+N', description: 'Nova pasta (na pasta selecionada, ou na raiz)' },
  { keys: 'Ctrl+Alt+N', description: 'Nota rápida (sempre na raiz do vault)' },
  { keys: 'Ctrl+O', description: 'Abrir o Quick Switcher (ir para uma nota)' },
  { keys: 'Ctrl+W', description: 'Fechar a aba ativa' },
  { keys: 'Ctrl+S', description: 'Forçar salvar a nota ativa' },
  { keys: 'Ctrl+\\', description: 'Alternar barra lateral' },
  { keys: 'Ctrl+B', description: 'Negrito' },
  { keys: 'Ctrl+I', description: 'Itálico' },
  { keys: 'Ctrl+K', description: 'Inserir link' },
  { keys: 'Ctrl+Z / Ctrl+Y', description: 'Desfazer / refazer' }
]

interface Props {
  onClose: () => void
}

export function SettingsModal({ onClose }: Props): React.JSX.Element {
  const [section, setSection] = useState<SettingsSection>('appearance')
  const theme = useSettingsStore((s) => s.theme)
  const fontFamilyId = useSettingsStore((s) => s.fontFamilyId)
  const fontSize = useSettingsStore((s) => s.fontSize)
  const allowRemoteImages = useSettingsStore((s) => s.allowRemoteImages)
  const setTheme = useSettingsStore((s) => s.setTheme)
  const setFontFamilyId = useSettingsStore((s) => s.setFontFamilyId)
  const setFontSize = useSettingsStore((s) => s.setFontSize)
  const setAllowRemoteImages = useSettingsStore((s) => s.setAllowRemoteImages)

  const currentVaultPath = useVaultStore((s) => s.currentVaultPath)
  const selectFolder = useVaultStore((s) => s.selectFolder)

  return (
    <div className="settings-overlay" onMouseDown={onClose}>
      <div className="settings-modal" onMouseDown={(e) => e.stopPropagation()}>
        <nav className="settings-nav">
          {SECTIONS.map((s) => (
            <button
              key={s.key}
              className={`settings-nav-item${section === s.key ? ' active' : ''}`}
              onClick={() => setSection(s.key)}
            >
              {s.label}
            </button>
          ))}
        </nav>
        <div className="settings-content">
          {section === 'appearance' && (
            <div>
              <h2>Aparência</h2>
              <div className="settings-row">
                <div>
                  <div className="settings-row-label">Tema</div>
                </div>
                <div className="settings-theme-options">
                  <button
                    className={`settings-theme-option${theme === 'light' ? ' active' : ''}`}
                    onClick={() => void setTheme('light')}
                  >
                    Light
                  </button>
                  <button
                    className={`settings-theme-option${theme === 'dark' ? ' active' : ''}`}
                    onClick={() => void setTheme('dark')}
                  >
                    Dark
                  </button>
                </div>
              </div>
              <div className="settings-row">
                <div className="settings-row-label">Fonte</div>
                <select value={fontFamilyId} onChange={(e) => void setFontFamilyId(e.target.value)}>
                  {FONT_OPTIONS.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.label} {f.monospace ? '' : '(prosa)'}
                    </option>
                  ))}
                </select>
              </div>
              <div className="settings-row">
                <div className="settings-row-label">Tamanho da fonte</div>
                <input
                  type="number"
                  min={11}
                  max={24}
                  value={fontSize}
                  onChange={(e) => {
                    const value = Number(e.target.value)
                    if (!Number.isNaN(value)) void setFontSize(value)
                  }}
                />
              </div>
            </div>
          )}

          {section === 'privacy' && (
            <div>
              <h2>Privacidade</h2>
              <div className="settings-row">
                <div>
                  <div className="settings-row-label">Carregar imagens remotas</div>
                  <div className="settings-row-description">
                    Permite exibir imagens de URLs http/https em notas. Desligado por padrão —
                    URLs remotas podem ser usadas para rastreamento. Alterar isso recarrega o
                    app.
                  </div>
                </div>
                <input
                  type="checkbox"
                  className="settings-toggle"
                  checked={allowRemoteImages}
                  onChange={(e) => void setAllowRemoteImages(e.target.checked)}
                />
              </div>
            </div>
          )}

          {section === 'vault' && (
            <div>
              <h2>Vault</h2>
              <div className="settings-vault-current">Atual: {currentVaultPath ?? 'nenhum'}</div>
              <button onClick={() => void selectFolder()}>Selecionar ou criar outra pasta…</button>
            </div>
          )}

          {section === 'shortcuts' && (
            <div>
              <h2>Atalhos de teclado</h2>
              <table className="settings-shortcuts-table">
                <tbody>
                  {SHORTCUTS.map((s) => (
                    <tr key={s.keys}>
                      <td>
                        <kbd>{s.keys}</kbd>
                      </td>
                      <td>{s.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="settings-row-description" style={{ marginTop: 10 }}>
                Personalização de atalhos está no roadmap para uma fase futura.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
