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
 * inside recognised child tags (p, h3, ...) survives.
 *
 * This node captures the *outer* <div> (style or class present) verbatim as
 * an opaque, non-text-editable block. Companion <style> tags and <svg>
 * sprites are stored INSIDE that div's markup (see normalizePastedHtml), so
 * the block carries its own CSS.
 *
 * In the editor the block is rendered inside a Shadow DOM so that
 *  - the block's CSS (class selectors, `:root`/`body` rules, `*` resets...)
 *    cannot leak into the editor UI, and
 *  - the editor/Vuetify CSS cannot leak into the block.
 * `getHTML()` still returns plain light-DOM markup (style tag included).
 */

/** Inside a shadow tree `:root` / `html` / `body` never match - map them to the host. */
function scopeCssToHost(css: string): string {
    return css.replace(/(^|[,{}\s])(:root|html|body)(?=[\s,{.:#\[>+~]|$)/g, '$1:host')
}

function renderIntoShadow(host: HTMLElement, html: string) {
    const root = host.shadowRoot ?? host.attachShadow({ mode: 'open' })
    const tpl = document.createElement('template')
    tpl.innerHTML = html
    tpl.content.querySelectorAll('script').forEach((s) => s.remove())
    tpl.content.querySelectorAll('style').forEach((s) => {
        s.textContent = scopeCssToHost(s.textContent || '')
    })
    const base = document.createElement('style')
    base.textContent = ':host { display: block; }'
    root.replaceChildren(base, tpl.content)
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

    renderHTML({ node, HTMLAttributes }) {
        // getHTML()/serialization uses this method, NOT addNodeView.
        // Returning a real DOM Element is allowed by ProseMirror's DOMOutputSpec.
        if (typeof document === 'undefined') {
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
            // Original (un-scoped) markup, read by the framework export.
            ;(dom as any).__rteHtml = node.attrs.html
            renderIntoShadow(dom, node.attrs.html || '')

            return {
                dom,
                update: (updated) => {
                    if (updated.type.name !== 'htmlBlock') return false
                        ;(dom as any).__rteHtml = updated.attrs.html
                    renderIntoShadow(dom, updated.attrs.html || '')
                    return true
                },
                ignoreMutation: () => true
            }
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