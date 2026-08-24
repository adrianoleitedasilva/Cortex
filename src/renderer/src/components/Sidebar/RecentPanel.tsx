import { useEffect } from 'react'
import { useListsStore } from '../../state/listsStore'
import { PathListPanel } from './PathListPanel'

export function RecentPanel(): React.JSX.Element {
  const recentNotes = useListsStore((s) => s.recentNotes)
  const loadLists = useListsStore((s) => s.loadLists)

  useEffect(() => {
    loadLists()
  }, [loadLists])

  return <PathListPanel paths={recentNotes} emptyMessage="Nenhuma nota recente ainda." />
}
