import type { Extension } from '@codemirror/state'
import { EditorView, ViewPlugin, type ViewUpdate } from '@codemirror/view'
import { useStatsStore } from '../state/statsStore'

function computeStats(view: EditorView): void {
  const doc = view.state.doc
  useStatsStore.getState().setStats(doc.toString(), doc.lines)
}

/** Keeps statsStore (word/char/line counts) in sync with the active note's document —
 * recomputed on construction (covers initial load and switching to a cached note's state)
 * and on every doc change. */
class StatsPluginValue {
  constructor(view: EditorView) {
    computeStats(view)
  }

  update(update: ViewUpdate): void {
    if (update.docChanged) {
      computeStats(update.view)
    }
  }
}

export function stats(): Extension {
  return ViewPlugin.fromClass(StatsPluginValue)
}
