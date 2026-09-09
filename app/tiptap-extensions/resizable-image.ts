import { Node, mergeAttributes } from '@tiptap/core'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import ResizableImageView from '../components/editor/ResizableImageView.vue'

export interface ResizableImageOptions {
  HTMLAttributes: Record<string, unknown>
}

/**
 * Replaces @tiptap/extension-image with a version that supports
 * drag-to-resize, left/center/right alignment and an editable caption —
 * none of which the stock Image node offers.
 */
export const ResizableImage = Node.create<ResizableImageOptions>({
  name: 'image',
  group: 'block',
  atom: true,
  draggable: true,
  isolating: true,

  addOptions() {
    return { HTMLAttributes: {} }
  },

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: null },
      title: { default: null },
      width: { default: null },
      align: { default: 'center' }, // 'left' | 'center' | 'right'
      caption: { default: null }
    }
  },

  parseHTML() {
    return [
      {
        tag: 'figure.rte-figure',
        getAttrs: (el) => {
          const img = (el as HTMLElement).querySelector('img')
          const caption = (el as HTMLElement).querySelector('figcaption')
          if (!img) return false
          return {
            src: img.getAttribute('src'),
            alt: img.getAttribute('alt'),
            title: img.getAttribute('title'),
            width: img.getAttribute('width'),
            align: (el as HTMLElement).getAttribute('data-align') || 'center',
            caption: caption?.textContent || null
          }
        }
      },
      { tag: 'img[src]' }
    ]
  },

  renderHTML({ HTMLAttributes }) {
    const { src, alt, title, width, align, caption } = HTMLAttributes as Record<string, string | null>
    const img = [
      'img',
      mergeAttributes(this.options.HTMLAttributes, {
        src,
        alt,
        title,
        width: width || undefined
      })
    ]
    const children: unknown[] = [img]
    if (caption) children.push(['figcaption', {}, caption])
    return ['figure', { class: 'rte-figure', 'data-align': align || 'center' }, ...children]
  },

  addNodeView() {
    return VueNodeViewRenderer(ResizableImageView)
  },

  addCommands() {
    return {
      setImage:
        (attrs: { src: string; alt?: string; title?: string }) =>
        ({ chain }) =>
          chain().insertContent({ type: this.name, attrs }).run(),
      setImageAlign:
        (align: 'left' | 'center' | 'right') =>
        ({ chain }) =>
          chain().updateAttributes(this.name, { align }).run(),
      setImageCaption:
        (caption: string | null) =>
        ({ chain }) =>
          chain().updateAttributes(this.name, { caption }).run()
    } as Partial<import('@tiptap/core').RawCommands>
  }
})