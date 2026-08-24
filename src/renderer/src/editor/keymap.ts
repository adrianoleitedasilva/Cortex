import { EditorSelection, type ChangeSpec } from '@codemirror/state'
import { EditorView, type KeyBinding } from '@codemirror/view'

function wrapSelection(view: EditorView, before: string, after: string = before): boolean {
  const { state } = view
  const changes = state.changeByRange((range) => {
    const changeSpec: ChangeSpec[] = [
      { from: range.from, insert: before },
      { from: range.to, insert: after }
    ]
    return {
      changes: changeSpec,
      range: EditorSelection.range(range.from + before.length, range.to + before.length)
    }
  })
  view.dispatch(state.update(changes, { scrollIntoView: true, userEvent: 'input' }))
  return true
}

export const markdownEditorKeymap: KeyBinding[] = [
  { key: 'Mod-b', run: (view) => wrapSelection(view, '**') },
  { key: 'Mod-i', run: (view) => wrapSelection(view, '*') },
  { key: 'Mod-k', run: (view) => wrapSelection(view, '[', '](url)') }
]
