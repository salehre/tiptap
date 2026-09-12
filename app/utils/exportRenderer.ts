import type { PMNode, RenderCtx } from './exportTypes'
import { el, text, comment } from './exportDom'

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
        return el('code', { class: codeInlineClass(ctx) }, [acc], ctx)
      case 'link':
        return el(
          'a',
          {
            href: mark.attrs?.href,
            target: mark.attrs?.target || undefined,
            class: linkClass(ctx)
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

function codeInlineClass(ctx: RenderCtx): string {
  if (ctx.css === 'tailwind') return 'bg-gray-100 rounded px-1 py-0.5 font-mono text-sm'
  if (ctx.css === 'vuetify') return 'font-mono'
  return '' // bootstrap styles <code> by default
}
function linkClass(ctx: RenderCtx): string {
  if (ctx.css === 'tailwind') return 'text-blue-600 underline hover:text-blue-800'
  if (ctx.css === 'vuetify') return 'text-primary'
  return '' // bootstrap styles <a> by default
}

// ---------------------------------------------------------------------------
// Per-css-framework class tables for block-level nodes
// ---------------------------------------------------------------------------

const CLASSES = {
  paragraph: { tailwind: 'mb-4 leading-relaxed', bootstrap: 'mb-3', vuetify: 'text-body-1 mb-4' },
  ul: { tailwind: 'list-disc ps-6 mb-4', bootstrap: 'mb-3', vuetify: 'ps-6 mb-4' },
  ol: { tailwind: 'list-decimal ps-6 mb-4', bootstrap: 'mb-3', vuetify: 'ps-6 mb-4' },
  li: { tailwind: 'mb-1', bootstrap: '', vuetify: 'mb-1' },
  hr: { tailwind: 'my-6 border-gray-300', bootstrap: 'my-4', vuetify: '' },
  figcaption: { tailwind: 'text-sm text-gray-500 mt-1', bootstrap: 'figure-caption', vuetify: 'text-caption mt-1' },
  img: { tailwind: 'max-w-full h-auto rounded-lg', bootstrap: 'img-fluid rounded', vuetify: 'rounded-lg' },
  th: {
    tailwind: 'border border-gray-300 px-3 py-2 bg-gray-100 font-semibold text-start',
    bootstrap: '',
    vuetify: ''
  },
  td: { tailwind: 'border border-gray-300 px-3 py-2', bootstrap: '', vuetify: '' },
  table: { tailwind: 'w-full border-collapse mb-4', bootstrap: 'table table-bordered mb-3', vuetify: 'mb-4' }
} as const

function cls(node: keyof typeof CLASSES, ctx: RenderCtx): string {
  return CLASSES[node][ctx.css]
}

function headingClass(level: number, ctx: RenderCtx): string {
  if (ctx.css === 'tailwind') {
    const sizes: Record<number, string> = {
      1: 'text-4xl font-bold mb-4',
      2: 'text-3xl font-bold mb-3',
      3: 'text-2xl font-semibold mb-3',
      4: 'text-xl font-semibold mb-2'
    }
    return sizes[level] ?? 'text-lg font-semibold mb-2'
  }
  if (ctx.css === 'vuetify') return `text-h${Math.min(level, 6)} mb-4`
  return 'mb-3' // bootstrap's reboot already styles h1-h6
}

function alignClass(align: string | undefined, ctx: RenderCtx): string {
  const a = align || 'center'
  if (ctx.css === 'bootstrap') {
    return { left: 'text-start', center: 'text-center', right: 'text-end' }[a] ?? 'text-center'
  }
  // tailwind + vuetify: flex alignment on the figure wrapper
  return { left: 'items-start', center: 'items-center', right: 'items-end' }[a] ?? 'items-center'
}

// ---------------------------------------------------------------------------
// Node renderers
// ---------------------------------------------------------------------------

function renderChildren(node: PMNode, ctx: RenderCtx): string[] {
  return (node.content ?? []).map((child) => renderNode(child, ctx)).filter(Boolean)
}

function renderResponsiveEmbed(src: string, ctx: RenderCtx): string {
  if (ctx.css === 'bootstrap') {
    return el('div', { class: 'ratio ratio-16x9 mb-3' }, [
      el('iframe', { src, allowfullscreen: true }, [], ctx)
    ], ctx)
  }
  if (ctx.css === 'vuetify' && ctx.syntax === 'vue') {
    return el(
      'v-responsive',
      { 'aspect-ratio': '16/9', class: 'mb-4' } as any,
      [el('iframe', { src, style: { width: '100%', height: '100%', border: '0' }, allowfullscreen: true }, [], ctx)],
      ctx
    )
  }
  return el(
    'div',
    { class: 'relative w-full mb-4', style: { aspectRatio: '16/9' } },
    [el('iframe', { src, class: 'absolute inset-0 w-full h-full rounded-lg', allowfullscreen: true }, [], ctx)],
    ctx
  )
}

export function renderNode(node: PMNode, ctx: RenderCtx): string {
  switch (node.type) {
    case 'doc':
      return renderChildren(node, ctx).join('\n')

    case 'paragraph':
      return el('p', { class: cls('paragraph', ctx) }, renderChildren(node, ctx), ctx)

    case 'heading': {
      const level = node.attrs?.level ?? 1
      const dir = node.attrs?.dir || undefined
      return el(`h${level}`, { class: headingClass(level, ctx), dir }, renderChildren(node, ctx), ctx)
    }

    case 'text':
      return renderMarks(text(node.text ?? ''), node.marks, ctx)

    case 'bulletList':
      return el('ul', { class: cls('ul', ctx) }, renderChildren(node, ctx), ctx)
    case 'orderedList':
      return el('ol', { class: cls('ol', ctx) }, renderChildren(node, ctx), ctx)
    case 'listItem':
      return el('li', { class: cls('li', ctx) }, renderChildren(node, ctx), ctx)

    case 'taskList':
      if (ctx.css === 'vuetify' && ctx.syntax === 'vue') {
        return el('div', { class: 'mb-4' }, renderChildren(node, ctx), ctx)
      }
      return el('ul', { class: 'list-none ps-0 mb-4' }, renderChildren(node, ctx), ctx)

    case 'taskItem': {
      const checked = !!node.attrs?.checked
      const labelText = extractText(node)
      if (ctx.css === 'vuetify' && ctx.syntax === 'vue') {
        return el(
          'v-checkbox',
          {
            'model-value': checked ? 'true' : 'false',
            label: labelText,
            disabled: true,
            density: 'compact',
            'hide-details': true
          } as any,
          [],
          ctx
        )
      }
      if (ctx.css === 'bootstrap') {
        return el('li', { class: 'form-check mb-1' }, [
          el('input', { class: 'form-check-input', type: 'checkbox', checked, disabled: true }, [], ctx),
          el('label', { class: 'form-check-label' }, renderChildren(node, ctx), ctx)
        ], ctx)
      }
      return el('li', { class: 'flex items-center gap-2 mb-1' }, [
        el('input', { type: 'checkbox', checked, disabled: true, class: 'rounded' }, [], ctx),
        el('span', {}, renderChildren(node, ctx), ctx)
      ], ctx)
    }

    case 'blockquote': {
      const children = renderChildren(node, ctx)
      if (ctx.css === 'bootstrap') {
        return el('blockquote', { class: 'blockquote border-start ps-3 my-3' }, children, ctx)
      }
      if (ctx.css === 'vuetify' && ctx.syntax === 'vue') {
        return el(
          'v-sheet',
          { class: 'pa-4 my-4', color: 'grey-lighten-4', rounded: true } as any,
          children,
          ctx
        )
      }
      return el('blockquote', { class: 'border-s-4 border-gray-300 ps-4 italic text-gray-600 my-4' }, children, ctx)
    }

    case 'codeBlock': {
      const code = extractText(node)
      const codeEl = el('code', {}, [text(code)], ctx)
      if (ctx.css === 'bootstrap') {
        return el('pre', { class: 'bg-dark text-light rounded p-3 mb-3' }, [codeEl], ctx)
      }
      if (ctx.css === 'vuetify' && ctx.syntax === 'vue') {
        return el(
          'v-sheet',
          { class: 'pa-4 mb-4', color: 'grey-darken-4', rounded: true } as any,
          [el('pre', { class: 'text-white mb-0', style: { margin: '0' } }, [codeEl], ctx)],
          ctx
        )
      }
      return el('pre', { class: 'bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto mb-4' }, [codeEl], ctx)
    }

    case 'horizontalRule':
      if (ctx.css === 'vuetify' && ctx.syntax === 'vue') return el('v-divider', { class: 'my-6' } as any, [], ctx)
      return el('hr', { class: cls('hr', ctx) }, [], ctx)

    case 'hardBreak':
      return el('br', {}, [], ctx)

    case 'image': {
      const { src, alt, title, width, align, caption } = node.attrs ?? {}
      const imgAttrs: Record<string, any> = { alt, title }
      if (ctx.css === 'vuetify' && ctx.syntax === 'vue') {
        return el(
          'div',
          { class: `d-flex flex-column mb-4 ${alignClass(align, ctx)}` },
          [
            el('v-img', { src, alt, width: width || undefined, class: 'rounded-lg' } as any, [], ctx),
            caption ? el('p', { class: cls('figcaption', ctx) }, [text(caption)], ctx) : ''
          ].filter(Boolean),
          ctx
        )
      }
      if (width) imgAttrs.width = width
      imgAttrs.src = src
      imgAttrs.class = cls('img', ctx)
      const figureClass =
        ctx.css === 'bootstrap' ? `figure ${alignClass(align, ctx)} mb-3` : `flex flex-col ${alignClass(align, ctx)} mb-4`
      return el(
        'figure',
        { class: figureClass },
        [
          el('img', imgAttrs, [], ctx),
          caption ? el('figcaption', { class: cls('figcaption', ctx) }, [text(caption)], ctx) : ''
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
      if (ctx.css === 'vuetify' && ctx.syntax === 'vue') {
        return el('v-table', { class: cls('table', ctx) } as any, inner, ctx)
      }
      return el('table', { class: cls('table', ctx) }, inner, ctx)
    }
    case 'tableRow':
      return el('tr', {}, renderChildren(node, ctx), ctx)
    case 'tableHeader':
      return el('th', { class: cls('th', ctx) }, renderChildren(node, ctx), ctx)
    case 'tableCell': {
      const bg = node.attrs?.backgroundColor
      return el('td', { class: cls('td', ctx), style: bg ? { backgroundColor: bg } : undefined }, renderChildren(node, ctx), ctx)
    }

    case 'pageBreak':
      return comment('page break', ctx)

    case 'anchor':
      return el('span', { id: node.attrs?.name }, [], ctx)

    case 'columnLayout': {
      const columns = node.attrs?.columns ?? 2
      const colHtml = renderChildren(node, ctx)
      if (ctx.css === 'bootstrap') {
        return el('div', { class: 'row g-3 mb-4' }, colHtml.map((c) => el('div', { class: 'col' }, [c], ctx)), ctx)
      }
      if (ctx.css === 'vuetify' && ctx.syntax === 'vue') {
        return el('v-row', { class: 'mb-4' } as any, colHtml.map((c) => el('v-col', {} as any, [c], ctx)), ctx)
      }
      return el(
        'div',
        { class: 'grid gap-4 mb-4', style: { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` } },
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