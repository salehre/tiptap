import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

export interface SearchStorage {
  term: string
  results: { from: number; to: number }[]
  activeIndex: number
}

function buildResults(doc: import('@tiptap/pm/model').Node, term: string) {
  const results: { from: number; to: number }[] = []
  if (!term) return results
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const re = new RegExp(escaped, 'gi')

  doc.descendants((node, pos) => {
    if (!node.isText || !node.text) return
    let match: RegExpExecArray | null
    re.lastIndex = 0
    // eslint-disable-next-line no-cond-assign
    while ((match = re.exec(node.text))) {
      results.push({ from: pos + match.index, to: pos + match.index + match[0].length })
    }
  })
  return results
}

export const SearchAndReplace = Extension.create<
  Record<string, never>,
  SearchStorage
>({
  name: 'searchAndReplace',

  addStorage() {
    return { term: '', results: [], activeIndex: -1 }
  },

  addCommands() {
    return {
      setSearchTerm:
        (term: string) =>
        ({ state, dispatch, tr }) => {
          this.storage.term = term
          this.storage.results = buildResults(state.doc, term)
          this.storage.activeIndex = this.storage.results.length ? 0 : -1
          if (dispatch) dispatch(tr)
          return true
        },
      nextMatch:
        () =>
        ({ state, dispatch, tr, editor }) => {
          const { results } = this.storage
          if (!results.length) return false
          this.storage.activeIndex = (this.storage.activeIndex + 1) % results.length
          const r = results[this.storage.activeIndex]
          editor.commands.setTextSelection(r)
          editor.commands.scrollIntoView()
          if (dispatch) dispatch(tr)
          return true
        },
      previousMatch:
        () =>
        ({ dispatch, tr, editor }) => {
          const { results } = this.storage
          if (!results.length) return false
          this.storage.activeIndex =
            (this.storage.activeIndex - 1 + results.length) % results.length
          const r = results[this.storage.activeIndex]
          editor.commands.setTextSelection(r)
          editor.commands.scrollIntoView()
          if (dispatch) dispatch(tr)
          return true
        },
      replaceActive:
        (replacement: string) =>
        ({ state, dispatch }) => {
          const { results, activeIndex } = this.storage
          if (activeIndex < 0 || !results[activeIndex]) return false
          const r = results[activeIndex]
          if (dispatch) {
            const tr = state.tr.insertText(replacement, r.from, r.to)
            dispatch(tr)
          }
          this.storage.results = buildResults(state.doc, this.storage.term)
          return true
        },
      replaceAll:
        (replacement: string) =>
        ({ state, dispatch }) => {
          const { results } = this.storage
          if (!results.length) return false
          if (dispatch) {
            let tr = state.tr
            // replace from the end so earlier positions stay valid
            ;[...results].reverse().forEach((r) => {
              tr = tr.insertText(replacement, r.from, r.to)
            })
            dispatch(tr)
          }
          this.storage.results = []
          this.storage.activeIndex = -1
          return true
        }
    } as Partial<import('@tiptap/core').RawCommands>
  },

  addProseMirrorPlugins() {
    const extensionThis = this
    return [
      new Plugin({
        key: new PluginKey('searchAndReplace'),
        props: {
          decorations: (state) => {
            const { results, activeIndex } = extensionThis.storage
            if (!results.length) return DecorationSet.empty
            const decos = results.map((r, i) =>
              Decoration.inline(r.from, r.to, {
                class: i === activeIndex ? 'search-match search-match-active' : 'search-match'
              })
            )
            return DecorationSet.create(state.doc, decos)
          }
        }
      })
    ]
  }
})
