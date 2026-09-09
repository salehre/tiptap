import { Extension } from '@tiptap/core'

export interface TextDirectionOptions {
  types: string[]
}

/**
 * Adds a `dir` attribute to block nodes so a single paragraph/heading can be
 * flipped to the opposite writing direction from the rest of the document —
 * useful when mixing Persian and English content in the same page.
 */
export const TextDirection = Extension.create<TextDirectionOptions>({
  name: 'textDirection',

  addOptions() {
    return { types: ['paragraph', 'heading', 'blockquote'] }
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          dir: {
            default: null,
            parseHTML: (element) => element.getAttribute('dir'),
            renderHTML: (attributes) => (attributes.dir ? { dir: attributes.dir } : {})
          }
        }
      }
    ]
  },

  addCommands() {
    return {
      setTextDirection:
        (direction: 'ltr' | 'rtl') =>
        ({ tr, state, dispatch }) => {
          const { selection } = state
          let changed = false
          state.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
            if (!this.options.types.includes(node.type.name)) return
            if (dispatch) tr.setNodeAttribute(pos, 'dir', direction)
            changed = true
          })
          if (changed && dispatch) dispatch(tr)
          return changed
        },
      unsetTextDirection:
        () =>
        ({ tr, state, dispatch }) => {
          const { selection } = state
          let changed = false
          state.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
            if (!this.options.types.includes(node.type.name)) return
            if (dispatch) tr.setNodeAttribute(pos, 'dir', null)
            changed = true
          })
          if (changed && dispatch) dispatch(tr)
          return changed
        }
    } as Partial<import('@tiptap/core').RawCommands>
  }
})