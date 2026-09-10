import { Node, mergeAttributes } from '@tiptap/core'

export interface IframeEmbedOptions {
  HTMLAttributes: Record<string, unknown>
}

/**
 * A generic responsive iframe embed (Vimeo, Aparat, or any embeddable URL).
 * YouTube links are handled by the dedicated @tiptap/extension-youtube
 * instead, which offers richer options; this is the fallback for everything else.
 */
export const IframeEmbed = Node.create<IframeEmbedOptions>({
  name: 'iframeEmbed',
  group: 'block',
  atom: true,
  draggable: true,

  addOptions() {
    return { HTMLAttributes: {} }
  },

  addAttributes() {
    return {
      src: { default: null }
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-iframe-embed] iframe' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      { class: 'rte-embed', 'data-iframe-embed': '' },
      [
        'iframe',
        mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
          frameborder: '0',
          allowfullscreen: 'true'
        })
      ]
    ]
  },

  addCommands() {
    return {
      setIframeEmbed:
        (src: string) =>
        ({ chain }) =>
          chain().insertContent({ type: this.name, attrs: { src } }).run()
    } as Partial<import('@tiptap/core').RawCommands>
  }
})
