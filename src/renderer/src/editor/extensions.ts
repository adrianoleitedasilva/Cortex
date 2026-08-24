import type { Extension } from '@codemirror/state'
import { EditorView, keymap, placeholder } from '@codemirror/view'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { syntaxHighlighting } from '@codemirror/language'
import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { languages } from '@codemirror/language-data'
import { GFM } from '@lezer/markdown'
import { cortexHighlightStyle } from './highlightStyle'
import { markdownEditorKeymap } from './keymap'
import { livePreview } from './livePreviewPlugin'
import { wikilinks } from './wikilinkPlugin'
import { tags } from './tagPlugin'
import { noteAutocomplete } from './autocomplete'
import { images } from './imagePlugin'
import { attachmentHandling } from './attachmentHandler'
import { stats } from './statsPlugin'
import { inlineIcons } from './iconInlinePlugin'

const baseTheme = EditorView.theme({
  '&': {
    height: '100%',
    fontSize: 'var(--editor-font-size, 14px)',
    fontFamily: 'var(--editor-font-family, inherit)',
    backgroundColor: 'transparent',
    color: 'var(--color-text)'
  },
  '.cm-content': {
    fontFamily: 'inherit',
    padding: '16px 0',
    caretColor: 'var(--color-accent)',
    lineHeight: '1.6'
  },
  '.cm-scroller': {
    overflow: 'auto',
    fontFamily: 'inherit'
  },
  '&.cm-focused': {
    outline: 'none'
  },
  '.cm-cursor, .cm-dropCursor': {
    borderLeftColor: 'var(--color-accent)'
  },
  '.cm-selectionBackground, &.cm-focused .cm-selectionBackground, ::selection': {
    backgroundColor: 'var(--color-bg-elevated) !important'
  },
  '.cm-activeLine': {
    backgroundColor: 'transparent'
  },
  '.cm-gutters': {
    display: 'none'
  },
  '.cm-placeholder': {
    color: 'var(--color-text-muted)'
  }
})

export function buildExtensions(placeholderText: string, onChange: (content: string) => void): Extension[] {
  return [
    history(),
    keymap.of([...markdownEditorKeymap, ...defaultKeymap, ...historyKeymap]),
    markdown({ base: markdownLanguage, codeLanguages: languages, extensions: [GFM] }),
    syntaxHighlighting(cortexHighlightStyle),
    livePreview(),
    wikilinks(),
    tags(),
    images(),
    inlineIcons(),
    attachmentHandling(),
    noteAutocomplete(),
    stats(),
    EditorView.lineWrapping,
    placeholder(placeholderText),
    baseTheme,
    EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        onChange(update.state.doc.toString())
      }
    })
  ]
}
