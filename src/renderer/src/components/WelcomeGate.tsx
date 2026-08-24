import { useVaultStore } from '../state/vaultStore'

export function WelcomeGate(): React.JSX.Element {
  const selectFolder = useVaultStore((s) => s.selectFolder)

  return (
    <div className="welcome-gate">
      <div className="welcome-gate-card">
        <div className="welcome-gate-title">Cortex</div>
        <p className="welcome-gate-description">
          Selecione uma pasta para ser seu vault — é ali que suas notas em Markdown vão viver.
        </p>
        <button className="welcome-gate-button" onClick={() => void selectFolder()}>
          Selecionar ou criar vault
        </button>
      </div>
    </div>
  )
}
