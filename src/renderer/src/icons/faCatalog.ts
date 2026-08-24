import { fas } from '@fortawesome/free-solid-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'

export interface FaCatalogEntry {
  name: string
  definition: IconDefinition
}

const CATALOG: FaCatalogEntry[] = Object.values(fas)
  .filter((def): def is IconDefinition => typeof def === 'object' && 'iconName' in def)
  .map((def) => ({ name: def.iconName, definition: def }))
  .sort((a, b) => a.name.localeCompare(b.name))

const BY_NAME = new Map(CATALOG.map((entry) => [entry.name, entry.definition]))

export function getFaIcon(name: string): IconDefinition | undefined {
  return BY_NAME.get(name)
}

export function searchFaIcons(query: string, limit = 120): FaCatalogEntry[] {
  const trimmed = query.trim().toLowerCase()
  if (!trimmed) return CATALOG.slice(0, limit)
  const results = CATALOG.filter((entry) => entry.name.includes(trimmed))
  return results.slice(0, limit)
}

export function allFaIconNames(): string[] {
  return CATALOG.map((entry) => entry.name)
}
