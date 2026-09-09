import { Node } from '@tiptap/core'

/**
 * An explicit page-break marker, like TinyMCE's "pagebreak" plugin.
 * Renders as a thin dashed rule in the editor and forces an actual
 * page break when printing or exporting.
 */
export const PageBreak = Node.create({
  name: 'pageBreak',
  group: 'block',
  atom: true,

  parseHTML() {
    return [{ tag: 'div[data-page-break]' }]
  },

  renderHTML() {
    return ['div', { 'data-page-break': '', class: 'rte-page-break' }]
  },

  addCommands() {
    return {
      setPageBreak:
        () =>
        ({ chain }) =>
          chain().insertContent({ type: this.name }).run()
    } as Partial<import('@tiptap/core').RawCommands>
  }
})