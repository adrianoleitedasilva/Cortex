import { useEffect, useRef, useState } from 'react'
import { useVaultStore } from '../../state/vaultStore'
import { useTabsStore } from '../../state/tabsStore'
import { useListsStore } from '../../state/listsStore'
import { useUiStore } from '../../state/uiStore'
import { useIconAssignmentsStore } from '../../state/iconAssignmentsStore'
import { FolderOutline, FolderSolid, FileOutline } from '../icons'
import { FaIcon } from '../../icons/FaIcon'
import type { TreeNode } from '../../../../shared/types'

function baseNameWithoutExt(name: string, isFile: boolean): string {
  if (!isFile) return name
  const idx = name.lastIndexOf('.')
  return idx > 0 ? name.slice(0, idx) : name
}

function parentOf(relPath: string): string {
  const idx = relPath.lastIndexOf('/')
  return idx === -1 ? '' : relPath.slice(0, idx)
}

interface RowProps {
  node: TreeNode
  depth: number
}

function TreeRow({ node, depth }: RowProps): React.JSX.Element {
  const expanded = useVaultStore((s) => s.expanded)
  const selectedPath = useVaultStore((s) => s.selectedPath)
  const editingPath = useVaultStore((s) => s.editingPath)
  const toggleExpanded = useVaultStore((s) => s.toggleExpanded)
  const setSelected = useVaultStore((s) => s.setSelected)
  const beginRename = useVaultStore((s) => s.beginRename)
  const cancelRename = useVaultStore((s) => s.cancelRename)
  const commitRename = useVaultStore((s) => s.commitRename)
  const createNoteAt = useVaultStore((s) => s.createNoteAt)
  const createFolderAt = useVaultStore((s) => s.createFolderAt)
  const remove = useVaultStore((s) => s.remove)
  const reveal = useVaultStore((s) => s.reveal)
  const moveItem = useVaultStore((s) => s.moveItem)
  const openTab = useTabsStore((s) => s.openTab)
  const favorites = useListsStore((s) => s.favorites)
  const toggleFavorite = useListsStore((s) => s.toggleFavorite)
  const openIconPicker = useUiStore((s) => s.openIconPicker)
  const customIcon = useIconAssignmentsStore((s) => s.icons[node.path])
  const removeIcon = useIconAssignmentsStore((s) => s.removeIcon)

  const isFolder = node.type === 'folder'
  const isOpen = !!expanded[node.path]
  const isEditing = editingPath === node.path
  const [draft, setDraft] = useState(baseNameWithoutExt(node.name, !isFolder))
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing) {
      setDraft(baseNameWithoutExt(node.name, !isFolder))
      requestAnimationFrame(() => {
        inputRef.current?.focus()
        inputRef.current?.select()
      })
    }
  }, [isEditing])

  const handleContextMenu = async (e: React.MouseEvent): Promise<void> => {
    e.preventDefault()
    e.stopPropagation()
    const action = await window.cortex.contextMenu.showFileTreeContext({
      type: node.type,
      path: node.path,
      isFavorite: favorites.includes(node.path),
      hasIcon: !!customIcon
    })
    if (action === 'new-note') await createNoteAt(isFolder ? node.path : parentOf(node.path))
    else if (action === 'new-folder') await createFolderAt(isFolder ? node.path : parentOf(node.path))
    else if (action === 'rename') beginRename(node.path)
    else if (action === 'delete') await remove(node.path)
    else if (action === 'reveal') reveal(node.path)
    else if (action === 'toggle-favorite') await toggleFavorite(node.path)
    else if (action === 'choose-icon') openIconPicker(node.path)
    else if (action === 'remove-icon') await removeIcon(node.path)
  }

  const handleClick = (): void => {
    if (isFolder) {
      toggleExpanded(node.path)
    } else {
      openTab(node.path)
    }
    setSelected(node.path)
  }

  const submitRename = (): void => {
    const trimmed = draft.trim()
    if (!trimmed) {
      cancelRename()
      return
    }
    const ext = isFolder ? '' : '.md'
    const newName = `${trimmed}${ext}`
    if (newName === node.name) {
      cancelRename()
      return
    }
    const parent = parentOf(node.path)
    const newPath = parent ? `${parent}/${newName}` : newName
    commitRename(node.path, newPath)
  }

  return (
    <div>
      <div
        className={`tree-row${selectedPath === node.path ? ' selected' : ''}${dragOver ? ' drag-over' : ''}`}
        style={{ paddingLeft: 8 + depth * 14 }}
        draggable={!isEditing}
        onDragStart={(e) => e.dataTransfer.setData('text/cortex-path', node.path)}
        onDragOver={(e) => {
          if (isFolder) {
            e.preventDefault()
            setDragOver(true)
          }
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          if (!isFolder) return
          e.preventDefault()
          e.stopPropagation()
          setDragOver(false)
          const draggedPath = e.dataTransfer.getData('text/cortex-path')
          if (draggedPath) moveItem(draggedPath, node.path)
        }}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
      >
        <span className="tree-icon">
          {customIcon ? (
            <FaIcon name={customIcon} />
          ) : isFolder ? (
            isOpen ? (
              <FolderSolid />
            ) : (
              <FolderOutline />
            )
          ) : (
            <FileOutline />
          )}
        </span>
        {isEditing ? (
          <input
            ref={inputRef}
            className="tree-rename-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submitRename()
              else if (e.key === 'Escape') cancelRename()
            }}
            onBlur={submitRename}
          />
        ) : (
          <span className="tree-label">{node.name}</span>
        )}
      </div>
      {isFolder && isOpen && node.children && (
        <div>
          {node.children.map((child) => (
            <TreeRow key={child.path} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

export function FileTree(): React.JSX.Element {
  const tree = useVaultStore((s) => s.tree)
  const createNoteAt = useVaultStore((s) => s.createNoteAt)
  const createFolderAt = useVaultStore((s) => s.createFolderAt)
  const moveItem = useVaultStore((s) => s.moveItem)
  const [dragOver, setDragOver] = useState(false)

  const handleRootContextMenu = async (e: React.MouseEvent): Promise<void> => {
    e.preventDefault()
    const action = await window.cortex.contextMenu.showFileTreeContext({ type: 'root', path: '' })
    if (action === 'new-note') await createNoteAt('')
    else if (action === 'new-folder') await createFolderAt('')
  }

  const handleRootDrop = (e: React.DragEvent): void => {
    e.preventDefault()
    setDragOver(false)
    const draggedPath = e.dataTransfer.getData('text/cortex-path')
    if (draggedPath) moveItem(draggedPath, '')
  }

  return (
    <div
      className={`file-tree${dragOver ? ' drag-over' : ''}`}
      onContextMenu={handleRootContextMenu}
      onDragOver={(e) => {
        e.preventDefault()
        setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleRootDrop}
    >
      {tree.length === 0 && (
        <div className="tree-empty">Vault vazio — clique com o botão direito para criar uma nota.</div>
      )}
      {tree.map((node) => (
        <TreeRow key={node.path} node={node} depth={0} />
      ))}
    </div>
  )
}
