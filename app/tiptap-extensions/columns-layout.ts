import { Node, mergeAttributes } from '@tiptap/core'

export interface ColumnsLayoutOptions {
  HTMLAttributes: Record<string, unknown>
}

/**
 * A CSS-grid container for arranging block content (typically images)
 * side by side — e.g. 2 items in a row, or 4 items as a 2x2 grid.
 * TinyMCE has no direct equivalent; this covers the same need via a
 * lightweight grid block instead of a full table.
 */
export const ColumnLayout = Node.create<ColumnsLayoutOptions>({
  name: 'columnLayout',
  group: 'block',
  content: 'column+',
  isolating: true,

  addOptions() {
    return { HTMLAttributes: {} }
  },

  addAttributes() {
    return {
      columns: {
        default: 2,
        parseHTML: (element) => Number(element.getAttribute('data-columns')) || 2,
        renderHTML: (attributes) => ({
          'data-columns': attributes.columns,
          style: `--rte-columns: ${attributes.columns}`
        })
      }
    }
  },

  parseHTML() {
    return [{ tag: 'div.rte-columns' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { class: 'rte-columns' }), 0]
  },

  addCommands() {
    return {
      setColumnLayout:
        (columns: number) =>
        ({ chain }) =>
          chain()
            .insertContent({
              type: this.name,
              attrs: { columns },
              content: Array.from({ length: columns }, () => ({
                type: 'column',
                content: [{ type: 'paragraph' }]
              }))
            })
            .run(),
      addColumnRow:
        () =>
        ({ tr, state, dispatch }) => {
          const { selection } = state
          let done = false
          state.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
            if (done || node.type.name !== this.name) return
            const columns = node.attrs.columns ?? 2
            const insertPos = pos + node.nodeSize - 1
            const row = Array.from({ length: columns }, () =>
              state.schema.nodes.column.createAndFill()
            )
            if (dispatch) {
              row.forEach((colNode, i) => {
                if (colNode) tr.insert(insertPos + i, colNode)
              })
            }
            done = true
          })
          if (done && dispatch) dispatch(tr)
          return done
        },
      removeColumnRow:
        () =>
        ({ tr, state, dispatch }) => {
          const { selection } = state
          let done = false
          state.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
            if (done || node.type.name !== this.name) return
            const columns = node.attrs.columns ?? 2
            if (node.childCount <= columns) return // keep at least one row
            const lastRowStart = node.childCount - columns
            let from = pos + 1
            for (let i = 0; i < lastRowStart; i += 1) from += node.child(i).nodeSize
            let to = from
            for (let i = lastRowStart; i < node.childCount; i += 1) to += node.child(i).nodeSize
            if (dispatch) tr.delete(from, to)
            done = true
          })
          if (done && dispatch) dispatch(tr)
          return done
        },
      deleteColumnLayout:
        () =>
        ({ tr, state, dispatch }) => {
          const { selection } = state
          let done = false
          state.doc.nodesBetween(selection.from, selection.to, (node, pos) => {
            if (done || node.type.name !== this.name) return
            if (dispatch) tr.delete(pos, pos + node.nodeSize)
            done = true
          })
          if (done && dispatch) dispatch(tr)
          return done
        }
    } as Partial<import('@tiptap/core').RawCommands>
  }
})

export const Column = Node.create({
  name: 'column',
  content: 'block+',
  isolating: true,

  parseHTML() {
    return [{ tag: 'div.rte-column' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { class: 'rte-column' }), 0]
  }
})