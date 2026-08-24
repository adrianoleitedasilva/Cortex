import type { EditorState } from '@codemirror/state'

/** Whether any selection range overlaps the lines spanned by [from, to). Used to decide
 * whether to reveal raw markdown syntax (cursor nearby) or hide it (prettified). */
export function lineTouchedBySelection(state: EditorState, from: number, to: number): boolean {
  const startLine = state.doc.lineAt(from).number
  const endLine = state.doc.lineAt(Math.max(from, to - 1)).number
  for (const range of state.selection.ranges) {
    const rangeFromLine = state.doc.lineAt(range.from).number
    const rangeToLine = state.doc.lineAt(range.to).number
    if (rangeToLine >= startLine && rangeFromLine <= endLine) return true
  }
  return false
}
