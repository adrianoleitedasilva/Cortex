import { useEffect } from 'react'
import { useListsStore } from '../../state/listsStore'
import { PathListPanel } from './PathListPanel'
import { StarSolid } from '../icons'

export function FavoritesPanel(): React.JSX.Element {
  const favorites = useListsStore((s) => s.favorites)
  const loadLists = useListsStore((s) => s.loadLists)

  useEffect(() => {
    loadLists()
  }, [loadLists])

  return (
    <PathListPanel
      paths={favorites}
      icon={<StarSolid />}
      emptyMessage="Nenhum favorito ainda. Clique com o botão direito numa nota para favoritar."
    />
  )
}
