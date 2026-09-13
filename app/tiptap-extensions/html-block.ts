import { Node, mergeAttributes } from '@tiptap/core'

export interface HtmlBlockOptions {
    HTMLAttributes: Record<string, unknown>
}

/**
 * Preserves arbitrary <div>-based markup (styled cards, timelines, custom
 * grids built with inline CSS such as background, border-radius, box-shadow,
 * position: absolute, gradients, flex layouts, etc.) that has no equivalent
 * node in the StarterKit schema.
 *
 * Without this, TipTap silently "unwraps" any <div> it doesn't recognise:
 * the wrapper and its style/class attributes are dropped and only the text
 * inside recognised child tags (p, h3, ...) survives. That's why pasted or
 * source-code HTML built from decorative <div>s loses its colors, boxes and
 * layout even though the plain-text formatting (bold, heading color, etc.)
 * keeps working.
 *
 * This node captures the *outer* <div> (style or class present) verbatim as
 * an opaque, non-text-editable block, rendered via innerHTML so it looks
 * exactly like the original markup. Trade-off: text inside such a block can
 * no longer be edited inline through the rich-text tools — it can only be
 * selected, moved or deleted as a whole. Nested <div>s inside it are not
 * parsed separately; they're part of the captured HTML string.
 */
export const HtmlBlock = Node.create<HtmlBlockOptions>({
    name: 'htmlBlock',
    group: 'block',
    atom: true,
    selectable: true,
    draggable: true,

    addOptions() {
        return { HTMLAttributes: {} }
    },

    addAttributes() {
        return {
            html: {
                default: '',
                parseHTML: (element) => element.outerHTML,
                renderHTML: () => ({})
            }
        }
    },

    parseHTML() {
        return [
            {
                tag: 'div',
                // Only capture divs that actually carry styling/layout. Plain
                // wrapper divs with no style/class fall through to the default
                // "unwrap children" behaviour so ordinary pasted content still
                // becomes normal editable paragraphs/headings as before.
                getAttrs: (element) => {
                    if (!(element instanceof HTMLElement)) return false
                    if (element.hasAttribute('data-html-block')) return false
                    const hasStyle = element.hasAttribute('style')
                    const hasClass = element.hasAttribute('class')
                    if (!hasStyle && !hasClass) return false
                    return { html: element.outerHTML }
                }
            }
        ]
    },

    renderHTML({ node, HTMLAttributes }) {
        // IMPORTANT: getHTML()/serialization uses this method, NOT addNodeView
        // (that's only for the live editable view). Returning a plain array
        // spec here has no way to inject an arbitrary raw HTML subtree, so we
        // return a real DOM Element instead — ProseMirror's DOMOutputSpec
        // explicitly allows an Element, and the serializer uses it as-is.
        if (typeof document === 'undefined') {
            // SSR fallback: no DOM available to build a real element from.
            return ['div', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { 'data-html-block': 'true' })]
        }
        const dom = document.createElement('div')
        Object.entries(mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { 'data-html-block': 'true' })).forEach(
            ([key, value]) => dom.setAttribute(key, String(value))
        )
        dom.innerHTML = node.attrs.html || ''
        return dom
    },

    addNodeView() {
        return ({ node }) => {
            const dom = document.createElement('div')
            dom.setAttribute('data-html-block', 'true')
            dom.contentEditable = 'false'
            dom.innerHTML = node.attrs.html
            return { dom }
        }
    },

    addCommands() {
        return {
            setHtmlBlock:
                (html: string) =>
                    ({ chain }: { chain: any }) =>
                        chain().insertContent({ type: this.name, attrs: { html } }).run()
        } as Partial<import('@tiptap/core').RawCommands>
    }
})