const TEXT_STYLE_PROPS = ['color', 'backgroundColor', 'fontFamily', 'fontSize', 'lineHeight'] as const
const VOID_TAGS = new Set(['IMG', 'BR', 'HR', 'INPUT', 'AREA', 'BASE', 'COL', 'EMBED', 'LINK', 'META', 'SOURCE', 'TRACK', 'WBR'])

function styleToCss(props: Partial<Record<(typeof TEXT_STYLE_PROPS)[number], string>>): string {
    const cssName: Record<string, string> = {
        color: 'color',
        backgroundColor: 'background-color',
        fontFamily: 'font-family',
        fontSize: 'font-size',
        lineHeight: 'line-height'
    }
    return Object.entries(props)
        .map(([k, v]) => `${cssName[k]}: ${v}`)
        .join('; ')
}

function processElement(el: Element): void {
    // Process children first so nested elements are normalized bottom-up.
    Array.from(el.children).forEach((child) => processElement(child))

    const tag = el.tagName

    // Legacy <font color="..."> - convert to the same style-based approach.
    if (tag === 'FONT' && el.hasAttribute('color') && !(el as HTMLElement).style.color) {
        ;(el as HTMLElement).style.color = el.getAttribute('color') || ''
    }

    if (tag === 'SPAN' || VOID_TAGS.has(tag) || !el.childNodes.length) return

    const style = (el as HTMLElement).style
    const found: Partial<Record<(typeof TEXT_STYLE_PROPS)[number], string>> = {}
    for (const prop of TEXT_STYLE_PROPS) {
        const value = style[prop as any]
        if (value) found[prop] = value
    }
    if (!Object.keys(found).length) return

    // Remove the extracted properties from the original element...
    for (const prop of TEXT_STYLE_PROPS) {
        if (found[prop]) style[prop as any] = ''
    }

    // ...and move them onto a new inner <span> wrapping the element's children.
    const wrapper = el.ownerDocument.createElement('span')
    wrapper.setAttribute('style', styleToCss(found))
    while (el.firstChild) wrapper.appendChild(el.firstChild)
    el.appendChild(wrapper)
}

export function normalizePastedHtml(html: string): string {
    if (typeof window === 'undefined' || typeof DOMParser === 'undefined') return html
    try {
        const doc = new DOMParser().parseFromString(html, 'text/html')
        Array.from(doc.body.children).forEach((child) => processElement(child))
        return doc.body.innerHTML
    } catch {
        return html
    }
}