import { useEffect, useState } from 'react'
import type { AppInfo } from '../../../shared/types'

const GITHUB_URL: string | null = 'https://github.com/adrianoleitedasilva/Cortex'
const RELEASE_DATE = '08/2026'

interface Props {
  onClose: () => void
}

export function AboutModal({ onClose }: Props): React.JSX.Element {
  const [info, setInfo] = useState<AppInfo | null>(null)

  useEffect(() => {
    void window.cortex.app.getInfo().then(setInfo)
  }, [])

  return (
    <div className="settings-overlay" onMouseDown={onClose}>
      <div className="about-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="about-title">Cortex</div>
        <div className="about-version">{info ? `Versão ${info.version}` : ' '}</div>
        <div className="about-version">Lançamento: {RELEASE_DATE}</div>
        <p className="about-description">
          Um app de notas local-first em Markdown, com links internos, tags e Live Preview —
          inspirado em Obsidian e Notion.
        </p>
        {GITHUB_URL && (
          <button className="about-link" onClick={() => window.cortex.shell.openExternal(GITHUB_URL)}>
            Repositório no GitHub
          </button>
        )}
        <div className="about-credits">
          Ícones por{' '}
          <button
            className="about-credits-link"
            onClick={() => window.cortex.shell.openExternal('https://fontawesome.com')}
          >
            Font Awesome Free
          </button>{' '}
          (CC BY 4.0)
        </div>
        <button className="about-close" onClick={onClose}>
          Fechar
        </button>
      </div>
    </div>
  )
}
