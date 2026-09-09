import { Extension } from '@tiptap/core'

export interface IndentOptions {
  types: string[]
  minLevel: number
  maxLevel: number
  step: number
}

/**
 * Adds an `indent` attribute (rendered as inline margin) to block nodes,
 * plus `indent` / `outdent` commands. Tiptap has no built-in equivalent
 * of TinyMCE's indent/outdent buttons.
 */
export const Indent = Extension.create<IndentOptions>({
  name: 'indent',

  addOptions() {
    return {
      types: ['paragraph', 'heading'],
      minLevel: 0,
      maxLevel: 8,
      step: 24
    }
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          indent: {
            default: 0,
            parseHTML: (element) => Number(element.style.marginInlineStart?.replace('px', '')) / this.options.step || 0,
            renderHTML: (attributes) => {
              if (!attributes.indent) return {}
              return {
                style: `margin-inline-start: ${attributes.indent * this.options.step}px`
              }
            }
          }
        }
      }
    ]
  },

  addCommands() {
    return {
      indent:
        () =>
        ({ tr, state, dispatch }) => {
          const { selection } = state
          let changed = false
          state.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
            if (!this.options.types.includes(node.type.name)) return
            const level = Math.min(this.options.maxLevel, (node.attrs.indent ?? 0) + 1)
            if (dispatch) tr.setNodeAttribute(pos, 'indent', level)
            changed = true
          })
          if (changed && dispatch) dispatch(tr)
          return changed
        },
      outdent:
        () =>
        ({ tr, state, dispatch }) => {
          const { selection } = state
          let changed = false
          state.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
            if (!this.options.types.includes(node.type.name)) return
            const level = Math.max(this.options.minLevel, (node.attrs.indent ?? 0) - 1)
            if (dispatch) tr.setNodeAttribute(pos, 'indent', level)
            changed = true
          })
          if (changed && dispatch) dispatch(tr)
          return changed
        }
    } as Partial<import('@tiptap/core').RawCommands>
  },

  addKeyboardShortcuts() {
    return {
      Tab: () => {
        if (this.editor.isActive('listItem') || this.editor.isActive('taskItem')) return false
        return this.editor.commands.indent()
      },
      'Shift-Tab': () => {
        if (this.editor.isActive('listItem') || this.editor.isActive('taskItem')) return false
        return this.editor.commands.outdent()
      }
    }
  }
})