export interface FontOption {
  id: string
  label: string
  family: string
  monospace: boolean
}

export const FONT_OPTIONS: FontOption[] = [
  {
    id: 'jetbrains-mono',
    label: 'JetBrains Mono',
    family: "'JetBrains Mono', ui-monospace, Consolas, monospace",
    monospace: true
  },
  {
    id: 'fira-code',
    label: 'Fira Code',
    family: "'Fira Code', ui-monospace, Consolas, monospace",
    monospace: true
  },
  {
    id: 'system-mono',
    label: 'Monoespaçada do sistema',
    family: "ui-monospace, 'Cascadia Code', 'SFMono-Regular', Consolas, monospace",
    monospace: true
  },
  {
    id: 'inter',
    label: 'Inter',
    family: "'Inter', ui-sans-serif, system-ui, sans-serif",
    monospace: false
  },
  {
    id: 'georgia',
    label: 'Georgia',
    family: "Georgia, 'Times New Roman', serif",
    monospace: false
  }
]

const DEFAULT_FONT = FONT_OPTIONS[0]

export function getFontOption(id: string): FontOption {
  return FONT_OPTIONS.find((f) => f.id === id) ?? DEFAULT_FONT
}
