import type { RenderCtx } from './exportTypes'

const VOID_TAGS = new Set(['img', 'br', 'hr', 'input'])

export type AttrValue = string | number | boolean | Record<string, string> | undefined | null

function escapeText(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function escapeAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
}

function styleObjectToString(style: Record<string, string>, syntax: RenderCtx['syntax']): string {
  if (syntax === 'react') {
    const body = Object.entries(style)
      .map(([k, v]) => `${camelCase(k)}: '${v}'`)
      .join(', ')
    return `{{ ${body} }}`
  }
  const body = Object.entries(style)
    .map(([k, v]) => `${kebabCase(k)}: ${v}`)
    .join('; ')
  return `"${body}"`
}

function camelCase(prop: string): string {
  return prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
}
function kebabCase(prop: string): string {
  return prop.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)
}

/** Renders a single HTML element with syntax-aware attribute names. */
export function el(
  tag: string,
  attrs: Record<string, AttrValue>,
  children: string[],
  ctx: RenderCtx
): string {
  const parts: string[] = []
  for (const [rawKey, value] of Object.entries(attrs)) {
    if (value === undefined || value === null || value === false || value === '') continue
    let key = rawKey
    if (key === 'class') key = ctx.syntax === 'react' ? 'className' : 'class'

    if (key === 'style' && typeof value === 'object') {
      parts.push(`style=${styleObjectToString(value, ctx.syntax)}`)
    } else if (value === true) {
      parts.push(key)
    } else {
      parts.push(`${key}="${escapeAttr(String(value))}"`)
    }
  }
  const attrStr = parts.length ? ' ' + parts.join(' ') : ''

  if (VOID_TAGS.has(tag)) {
    return `<${tag}${attrStr} />`
  }
  const inner = children.join('')
  if (!inner) return `<${tag}${attrStr}></${tag}>`
  return `<${tag}${attrStr}>${inner}</${tag}>`
}

export function text(value: string): string {
  return escapeText(value)
}

export function comment(value: string, ctx: RenderCtx): string {
  return ctx.syntax === 'react' ? `{/* ${value} */}` : `<!-- ${value} -->`
}

/** Simple line-based indenting for the final assembled document (not the
 * whole tree - node renderers return single-line-ish strings that we
 * re-indent when we join top-level blocks together). */
export function indentBlock(code: string, spaces: number): string {
  const pad = ' '.repeat(spaces)
  return code
    .split('\n')
    .map((line) => (line.length ? pad + line : line))
    .join('\n')
}