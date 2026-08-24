import { useEffect, useState, type CSSProperties } from 'react'
import { Sidebar } from './components/Sidebar/Sidebar'
import { EditorArea } from './components/Editor/EditorArea'
import { QuickSwitcher } from './components/QuickSwitcher'
import { BacklinksPanel } from './components/BacklinksPanel'
import { ToolRail } from './components/ToolRail'
import { SettingsModal } from './components/SettingsModal'
import { AboutModal } from './components/AboutModal'
import { IconPicker } from './components/IconPicker'
import { WelcomeGate } from './components/WelcomeGate'
import { StatusBar } from './components/StatusBar'
import { useTabsStore } from './state/tabsStore'
import { useVaultStore } from './state/vaultStore'
import { useUiStore } from './state/uiStore'
import { useSettingsStore } from './state/settingsStore'
import { getFontOption } from './editor/fonts'
import * as autosave from './editor/autosave'

function App(): React.JSX.Element {
  const [quickSwitcherOpen, setQuickSwitcherOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [aboutOpen, setAboutOpen] = useState(false)
  const rightPanelOpen = useUiStore((s) => s.rightPanelOpen)
  const toggleRightPanel = useUiStore((s) => s.toggleRightPanel)
  const sidebarVisible = useUiStore((s) => s.sidebarVisible)
  const toggleSidebarVisible = useUiStore((s) => s.toggleSidebarVisible)

  const theme = useSettingsStore((s) => s.theme)
  const fontFamilyId = useSettingsStore((s) => s.fontFamilyId)
  const fontSize = useSettingsStore((s) => s.fontSize)
  const loadSettings = useSettingsStore((s) => s.load)

  const currentVaultPath = useVaultStore((s) => s.currentVaultPath)
  const vaultLoading = useVaultStore((s) => s.loading)
  const initVault = useVaultStore((s) => s.init)

  useEffect(() => {
    void loadSettings()
  }, [loadSettings])

  useEffect(() => {
    void initVault()
  }, [initVault])

  useEffect(() => {
    return window.cortex.events.onVaultChangedExternally(() => {
      void useVaultStore.getState().refreshTree()
    })
  }, [])

  useEffect(() => {
    return window.cortex.events.onMenuAction((action) => {
      switch (action) {
        case 'new-note':
          void useVaultStore.getState().createNoteInContext()
          break
        case 'new-folder':
          void useVaultStore.getState().createFolderInContext()
          break
        case 'quick-note':
          void useVaultStore.getState().createNoteAt('')
          break
        case 'save': {
          const { activePath } = useTabsStore.getState()
          if (activePath) void autosave.flushPending(activePath)
          break
        }
        case 'select-vault':
          void useVaultStore.getState().selectFolder()
          break
        case 'close-tab': {
          const { activePath, closeTab } = useTabsStore.getState()
          if (activePath) closeTab(activePath)
          break
        }
        case 'toggle-sidebar':
          toggleSidebarVisible()
          break
        case 'toggle-backlinks':
          toggleRightPanel()
          break
        case 'quick-switcher':
          setQuickSwitcherOpen((v) => !v)
          break
        case 'toggle-theme': {
          const { theme: current, setTheme } = useSettingsStore.getState()
          void setTheme(current === 'dark' ? 'light' : 'dark')
          break
        }
        case 'open-settings':
          setSettingsOpen(true)
          break
        case 'open-about':
          setAboutOpen(true)
          break
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fontOption = getFontOption(fontFamilyId)
  const fontVars = {
    '--app-font-family': fontOption.family,
    '--editor-font-family': fontOption.family,
    '--editor-font-size': `${fontSize}px`
  } as CSSProperties

  return (
    <div className="app" data-theme={theme} style={fontVars}>
      {vaultLoading ? null : !currentVaultPath ? (
        <WelcomeGate />
      ) : (
        <>
          <div className="app-body">
            {sidebarVisible && <Sidebar />}
            <main className="app-main">
              <EditorArea />
            </main>
            {rightPanelOpen && <BacklinksPanel />}
            <ToolRail />
          </div>
          <StatusBar />
        </>
      )}
      {quickSwitcherOpen && <QuickSwitcher onClose={() => setQuickSwitcherOpen(false)} />}
      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}
      {aboutOpen && <AboutModal onClose={() => setAboutOpen(false)} />}
      <IconPicker />
    </div>
  )
}

export default App
