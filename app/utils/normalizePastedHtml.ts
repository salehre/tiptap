const TEXT_STYLE_PROPS = ['color', 'backgroundColor', 'fontFamily', 'fontSize', 'lineHeight'] as const
type TextStyleProp = (typeof TEXT_STYLE_PROPS)[number]

const CSS_NAME: Record<TextStyleProp, string> = {
    color: 'color',
    backgroundColor: 'background-color',
    fontFamily: 'font-family',
    fontSize: 'font-size',
    lineHeight: 'line-height'
}

const VOID_TAGS = new Set(['IMG', 'BR', 'HR', 'INPUT', 'AREA', 'BASE', 'COL', 'EMBED', 'LINK', 'META', 'SOURCE', 'TRACK', 'WBR'])

function parseStyleAttr(style: string | null): Record<string, string> {
    const map: Record<string, string> = {}
    if (!style) return map
    for (const decl of style.split(';')) {
        const idx = decl.indexOf(':')
        if (idx === -1) continue
        const key = decl.slice(0, idx).trim()
        const value = decl.slice(idx + 1).trim()
        if (key && value) map[key] = value
    }
    return map
}

function resolveComputedStylesToInline(html: string): string {
    if (typeof document === 'undefined') return html

    const iframe = document.createElement('iframe')
    iframe.setAttribute('aria-hidden', 'true')
    iframe.style.cssText = 'position:fixed; inset:auto -9999px -9999px auto; width:0; height:0; border:0;'
    document.body.appendChild(iframe)

    try {
        const idoc = iframe.contentDocument
        const iwin = iframe.contentWindow
        if (!idoc || !iwin) return html

        idoc.open()
        idoc.write(/<html[\s>]/i.test(html) ? html : `<!DOCTYPE html><html><body>${html}</body></html>`)
        idoc.close()

        const walk = (el: Element, parentComputed: CSSStyleDeclaration) => {
            const computed = iwin.getComputedStyle(el)
            const existingStyle = parseStyleAttr(el.getAttribute('style'))
            for (const prop of TEXT_STYLE_PROPS) {
                const value = computed[prop as any]
                const inherited = parentComputed[prop as any]
                if (value && value !== inherited) {
                    existingStyle[CSS_NAME[prop]] = value
                }
            }
            const merged = Object.entries(existingStyle)
                .map(([k, v]) => `${k}: ${v}`)
                .join('; ')
            if (merged) el.setAttribute('style', merged)
            Array.from(el.children).forEach((child) => walk(child, computed))
        }

        const bodyComputed = iwin.getComputedStyle(idoc.body)
        Array.from(idoc.body.children).forEach((child) => walk(child, bodyComputed))

        return idoc.body.innerHTML
    } catch {
        return html
    } finally {
        document.body.removeChild(iframe)
    }
}

function wrapInlineStylesInSpans(el: Element): void {
    Array.from(el.children).forEach((child) => wrapInlineStylesInSpans(child))

    const tag = el.tagName

    if (tag === 'FONT' && el.hasAttribute('color') && !(el as HTMLElement).style.color) {
        ;(el as HTMLElement).style.color = el.getAttribute('color') || ''
    }

    if (tag === 'SPAN' || tag === 'DIV' || VOID_TAGS.has(tag) || !el.childNodes.length) return

    const style = (el as HTMLElement).style
    const found: Partial<Record<TextStyleProp, string>> = {}
    for (const prop of TEXT_STYLE_PROPS) {
        const value = style[prop as any]
        if (value) found[prop] = value
    }
    if (!Object.keys(found).length) return

    for (const prop of TEXT_STYLE_PROPS) {
        if (found[prop]) style[prop as any] = ''
    }

    const wrapper = el.ownerDocument.createElement('span')
    wrapper.setAttribute(
        'style',
        Object.entries(found)
            .map(([k, v]) => `${CSS_NAME[k as TextStyleProp]}: ${v}`)
            .join('; ')
    )
    while (el.firstChild) wrapper.appendChild(el.firstChild)
    el.appendChild(wrapper)
}

/* ---------------------------------------------------------------------------
 * HTML blocks (styled <div> pages / cards) must reach the editor EXACTLY as
 * written. The normalisation above inlines computed text styles and wraps
 * element contents in <span>s, which breaks such markup (spans around block
 * elements, <use> pulled out of <svg>, ...). So these blocks are swapped for
 * placeholders before normalising and restored afterwards. Their companion
 * <style> tags and top-level <svg> sprites (which ProseMirror would otherwise
 * silently drop) are moved INSIDE the first block so the CSS survives.
 * ------------------------------------------------------------------------- */

const KEEP_ATTR = 'data-rte-keep'
const NOT_HTML_BLOCK_ATTRS = ['data-youtube-video', 'data-iframe-embed', 'data-page-break']

function isHtmlBlockRoot(el: Element): boolean {
    if (el.tagName !== 'DIV') return false
    if (el.hasAttribute('data-html-block')) return true
    if (NOT_HTML_BLOCK_ATTRS.some((a) => el.hasAttribute(a))) return false
    if (Array.from(el.classList).some((c) => c.startsWith('rte-'))) return false
    return el.hasAttribute('style') || el.hasAttribute('class')
}

function findHtmlBlockRoots(parent: Element, out: Element[]) {
    for (const child of Array.from(parent.children)) {
        if (isHtmlBlockRoot(child)) out.push(child)
        else if (child.tagName === 'DIV') findHtmlBlockRoots(child, out)
    }
}

function extractHtmlBlocks(html: string): { shell: string; kept: string[] } | null {
    const doc = new DOMParser().parseFromString(html, 'text/html')
    const roots: Element[] = []
    findHtmlBlockRoots(doc.body, roots)
    if (!roots.length) return null

    const inside = (el: Element) => roots.some((r) => r !== el && r.contains(el))

    // Companion CSS / SVG sprites living outside the blocks (head or body level).
    const companions: Element[] = [
        ...Array.from(doc.querySelectorAll('style')).filter((s) => !inside(s)),
        ...Array.from(doc.body.children).filter((c) => c.tagName.toLowerCase() === 'svg')
    ].filter((el) => !roots.includes(el))
    const companionHtml = companions.map((c) => c.outerHTML).join('\n')
    companions.forEach((c) => c.remove())

    if (companionHtml) roots[0].insertAdjacentHTML('afterbegin', companionHtml)

    const kept: string[] = []
    roots.forEach((root, i) => {
        kept.push(root.outerHTML)
        const placeholder = doc.createElement('div')
        placeholder.setAttribute(KEEP_ATTR, String(i))
        root.replaceWith(placeholder)
    })
    return { shell: doc.body.innerHTML, kept }
}

function restoreHtmlBlocks(html: string, kept: string[]): string {
    return html.replace(
        new RegExp(`<div ${KEEP_ATTR}="(\\d+)"[^>]*></div>`, 'g'),
        (_, i) => kept[Number(i)] ?? ''
    )
}

function normalizeCore(html: string): string {
    const withInlineStyles = resolveComputedStylesToInline(html)
    const doc = new DOMParser().parseFromString(withInlineStyles, 'text/html')
    Array.from(doc.body.children).forEach((child) => wrapInlineStylesInSpans(child))
    return doc.body.innerHTML
}

export function normalizePastedHtml(html: string): string {
    if (typeof window === 'undefined' || typeof DOMParser === 'undefined') return html
    try {
        const extracted = extractHtmlBlocks(html)
        if (!extracted) return normalizeCore(html)
        return restoreHtmlBlocks(normalizeCore(extracted.shell), extracted.kept)
    } catch {
        return html
    }
}