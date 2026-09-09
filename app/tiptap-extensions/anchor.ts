import { Node, mergeAttributes } from '@tiptap/core'

export interface AnchorOptions {
  HTMLAttributes: Record<string, unknown>
}

/**
 * An invisible inline bookmark, like TinyMCE's "anchor" plugin.
 * Renders as an empty <span id="..."> that a link's href can target
 * with "#name" to jump to that point in the document.
 */
export const Anchor = Node.create<AnchorOptions>({
  name: 'anchor',
  group: 'inline',
  inline: true,
  atom: true,

  addOptions() {
    return { HTMLAttributes: {} }
  },

  addAttributes() {
    return {
      name: {
        default: null,
        parseHTML: (element) => element.getAttribute('id'),
        renderHTML: (attributes) => (attributes.name ? { id: attributes.name } : {})
      }
    }
  },

  parseHTML() {
    return [{ tag: 'span.rte-anchor[id]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { class: 'rte-anchor' })]
  },

  addCommands() {
    return {
      setAnchor:
        (name: string) =>
        ({ chain }) =>
          chain().insertContent({ type: this.name, attrs: { name } }).run()
    } as Partial<import('@tiptap/core').RawCommands>
  }
})