import { Node, mergeAttributes } from '@tiptap/core'

export interface HtmlBlockOptions {
    HTMLAttributes: Record<string, unknown>
}

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

    renderHTML({ HTMLAttributes }) {
        return ['div', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { 'data-html-block': 'true' })]
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