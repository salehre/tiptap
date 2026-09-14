import type { PMNode, RenderCtx } from './exportTypes'
import { el, text, comment } from './exportDom'

// ---------------------------------------------------------------------------
// All styling below is written as inline `style` objects (never CSS classes,
// never framework components like <v-img>/<v-row>/<v-checkbox>/...). The
// output is intentionally identical no matter which css framework option the
// user picked - it doesn't depend on Tailwind/Bootstrap/Vuetify being
// installed at all, just plain HTML(-ish) tags with inline styles.
// ---------------------------------------------------------------------------

const CODE_INLINE_STYLE = {
  backgroundColor: '#f3f4f6',
  borderRadius: '4px',
  padding: '2px 4px',
  fontFamily: 'monospace',
  fontSize: '0.875em'
}
const LINK_STYLE = { color: '#2563eb', textDecoration: 'underline' }

// ---------------------------------------------------------------------------
// Marks (bold, italic, links, colors, ...)
// ---------------------------------------------------------------------------

function renderMarks(inner: string, marks: PMNode['marks'], ctx: RenderCtx): string {
  if (!marks || !marks.length) return inner
  return marks.reduce((acc, mark) => {
    switch (mark.type) {
      case 'bold':
        return el('strong', {}, [acc], ctx)
      case 'italic':
        return el('em', {}, [acc], ctx)
      case 'underline':
        return el('u', {}, [acc], ctx)
      case 'strike':
        return el('s', {}, [acc], ctx)
      case 'subscript':
        return el('sub', {}, [acc], ctx)
      case 'superscript':
        return el('sup', {}, [acc], ctx)
      case 'code':
        return el('code', { style: CODE_INLINE_STYLE }, [acc], ctx)
      case 'link':
        return el(
            'a',
            {
              href: mark.attrs?.href,
              target: mark.attrs?.target || undefined,
              style: LINK_STYLE
            },
            [acc],
            ctx
        )
      case 'textStyle': {
        const style: Record<string, string> = {}
        if (mark.attrs?.color) style.color = mark.attrs.color
        if (mark.attrs?.fontSize) style.fontSize = mark.attrs.fontSize
        if (mark.attrs?.fontFamily) style.fontFamily = mark.attrs.fontFamily
        if (mark.attrs?.lineHeight) style.lineHeight = mark.attrs.lineHeight
        if (!Object.keys(style).length) return acc
        return el('span', { style }, [acc], ctx)
      }
      case 'highlight': {
        const style: Record<string, string> = {}
        if (mark.attrs?.color) style.backgroundColor = mark.attrs.color
        return el('mark', Object.keys(style).length ? { style } : {}, [acc], ctx)
      }
      default:
        return acc
    }
  }, inner)
}

// ---------------------------------------------------------------------------
// Inline-style tables for block-level nodes
// ---------------------------------------------------------------------------

const STYLES = {
  paragraph: { marginBottom: '16px', lineHeight: '1.75' },
  ul: { listStyleType: 'disc', paddingInlineStart: '24px', marginBottom: '16px' },
  ol: { listStyleType: 'decimal', paddingInlineStart: '24px', marginBottom: '16px' },
  li: { marginBottom: '4px' },
  hr: { margin: '24px 0', borderColor: '#d1d5db' },
  figcaption: { fontSize: '14px', color: '#6b7280', marginTop: '4px' },
  img: { maxWidth: '100%', height: 'auto', borderRadius: '8px' },
  th: {
    border: '1px solid #d1d5db',
    padding: '8px 12px',
    backgroundColor: '#f3f4f6',
    fontWeight: '600',
    textAlign: 'start'
  },
  td: { border: '1px solid #d1d5db', padding: '8px 12px' },
  table: { width: '100%', borderCollapse: 'collapse', marginBottom: '16px' }
} as const

function sty(node: keyof typeof STYLES): Record<string, string> {
  return { ...STYLES[node] }
}

function headingStyle(level: number): Record<string, string> {
  const sizes: Record<number, { fontSize: string; fontWeight: string; marginBottom: string }> = {
    1: { fontSize: '36px', fontWeight: '700', marginBottom: '16px' },
    2: { fontSize: '30px', fontWeight: '700', marginBottom: '12px' },
    3: { fontSize: '24px', fontWeight: '600', marginBottom: '12px' },
    4: { fontSize: '20px', fontWeight: '600', marginBottom: '8px' }
  }
  return sizes[level] ?? { fontSize: '18px', fontWeight: '600', marginBottom: '8px' }
}

function alignItems(align: string | undefined): string {
  const a = align || 'center'
  return { left: 'flex-start', center: 'center', right: 'flex-end' }[a] ?? 'center'
}

// ---------------------------------------------------------------------------
// Node renderers
// ---------------------------------------------------------------------------

function renderChildren(node: PMNode, ctx: RenderCtx): string[] {
  return (node.content ?? []).map((child) => renderNode(child, ctx)).filter(Boolean)
}

function renderResponsiveEmbed(src: string, ctx: RenderCtx): string {
  return el(
      'div',
      { style: { position: 'relative', width: '100%', marginBottom: '16px', aspectRatio: '16/9' } },
      [
        el(
            'iframe',
            {
              src,
              style: { position: 'absolute', inset: '0', width: '100%', height: '100%', border: '0', borderRadius: '8px' },
              allowfullscreen: true
            },
            [],
            ctx
        )
      ],
      ctx
  )
}

export function renderNode(node: PMNode, ctx: RenderCtx): string {
  switch (node.type) {
    case 'doc':
      return renderChildren(node, ctx).join('\n')

    case 'paragraph':
      return el('p', { style: sty('paragraph') }, renderChildren(node, ctx), ctx)

    case 'heading': {
      const level = node.attrs?.level ?? 1
      const dir = node.attrs?.dir || undefined
      return el(`h${level}`, { style: headingStyle(level), dir }, renderChildren(node, ctx), ctx)
    }

    case 'text':
      return renderMarks(text(node.text ?? ''), node.marks, ctx)

    case 'bulletList':
      return el('ul', { style: sty('ul') }, renderChildren(node, ctx), ctx)
    case 'orderedList':
      return el('ol', { style: sty('ol') }, renderChildren(node, ctx), ctx)
    case 'listItem':
      return el('li', { style: sty('li') }, renderChildren(node, ctx), ctx)

    case 'taskList':
      return el(
          'ul',
          { style: { listStyleType: 'none', paddingInlineStart: '0', marginBottom: '16px' } },
          renderChildren(node, ctx),
          ctx
      )

    case 'taskItem': {
      const checked = !!node.attrs?.checked
      return el('li', { style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' } }, [
        el('input', { type: 'checkbox', checked, disabled: true }, [], ctx),
        el('span', {}, renderChildren(node, ctx), ctx)
      ], ctx)
    }

    case 'blockquote': {
      const children = renderChildren(node, ctx)
      return el(
          'blockquote',
          {
            style: {
              borderInlineStart: '4px solid #d1d5db',
              paddingInlineStart: '16px',
              fontStyle: 'italic',
              color: '#4b5563',
              margin: '16px 0'
            }
          },
          children,
          ctx
      )
    }

    case 'codeBlock': {
      const code = extractText(node)
      const codeEl = el('code', {}, [text(code)], ctx)
      return el(
          'pre',
          {
            style: {
              backgroundColor: '#111827',
              color: '#f3f4f6',
              borderRadius: '8px',
              padding: '16px',
              overflowX: 'auto',
              marginBottom: '16px'
            }
          },
          [codeEl],
          ctx
      )
    }

    case 'horizontalRule':
      return el('hr', { style: sty('hr') }, [], ctx)

    case 'hardBreak':
      return el('br', {}, [], ctx)

    case 'image': {
      const { src, alt, title, width, align, caption } = node.attrs ?? {}
      const imgAttrs: Record<string, any> = { alt, title, src, style: sty('img') }
      if (width) imgAttrs.width = width
      return el(
          'figure',
          { style: { display: 'flex', flexDirection: 'column', alignItems: alignItems(align), marginBottom: '16px' } },
          [
            el('img', imgAttrs, [], ctx),
            caption ? el('figcaption', { style: sty('figcaption') }, [text(caption)], ctx) : ''
          ].filter(Boolean),
          ctx
      )
    }

    case 'table': {
      const rows = node.content ?? []
      const headerRows = rows.filter((r) => (r.content ?? []).every((c) => c.type === 'tableHeader'))
      const bodyRows = rows.filter((r) => !(r.content ?? []).every((c) => c.type === 'tableHeader'))
      const theadHtml = headerRows.length
          ? el('thead', {}, headerRows.map((r) => renderNode(r, ctx)), ctx)
          : ''
      const tbodyHtml = bodyRows.length ? el('tbody', {}, bodyRows.map((r) => renderNode(r, ctx)), ctx) : ''
      const inner = [theadHtml, tbodyHtml].filter(Boolean)
      return el('table', { style: sty('table') }, inner, ctx)
    }
    case 'tableRow':
      return el('tr', {}, renderChildren(node, ctx), ctx)
    case 'tableHeader':
      return el('th', { style: sty('th') }, renderChildren(node, ctx), ctx)
    case 'tableCell': {
      const bg = node.attrs?.backgroundColor
      const style = sty('td')
      if (bg) style.backgroundColor = bg
      return el('td', { style }, renderChildren(node, ctx), ctx)
    }

    case 'pageBreak':
      return comment('page break', ctx)

    case 'anchor':
      return el('span', { id: node.attrs?.name }, [], ctx)

    case 'columnLayout': {
      const columns = node.attrs?.columns ?? 2
      const colHtml = renderChildren(node, ctx)
      return el(
          'div',
          {
            style: {
              display: 'grid',
              gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
              gap: '16px',
              marginBottom: '16px'
            }
          },
          colHtml,
          ctx
      )
    }
    case 'column':
      return el('div', {}, renderChildren(node, ctx), ctx)

    case 'youtube': {
      const src = node.attrs?.src
      return src ? renderResponsiveEmbed(src, ctx) : ''
    }
    case 'iframeEmbed': {
      const src = node.attrs?.src
      return src ? renderResponsiveEmbed(src, ctx) : ''
    }

    default:
      // Unknown node types are skipped rather than breaking the export.
      return renderChildren(node, ctx).join('\n')
  }
}

function extractText(node: PMNode): string {
  if (node.type === 'text') return node.text ?? ''
  return (node.content ?? []).map(extractText).join('')
}