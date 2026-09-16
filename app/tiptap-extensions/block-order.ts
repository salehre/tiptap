import { Extension } from '@tiptap/core'

/**
 * Lets any top-level block (paragraph, heading, image, table, ...) carry a
 * different visual position per breakpoint - e.g. image #4 shown right
 * after image #1 on mobile, but last on desktop - WITHOUT physically moving
 * it in the document. The document/edit order (and therefore the underlying
 * HTML/JSON content) never changes; only the CSS `order` used to visually
 * place it changes per breakpoint, via inline `--order-sm/--order-md/--order-lg`
 * custom properties consumed by editor-content.css (and by the equivalent
 * rules embedded into exported code).
 *
 * Stored as inline style so it round-trips through plain HTML (getHTML() /
 * setContent()) with no extra data-* attributes needed. Tiptap's
 * mergeAttributes() concatenates `style` contributions from multiple
 * attribute sources (unlike most attributes, which simply overwrite), so
 * this composes safely with any other extension that also sets `style`
 * (e.g. text-align) without clobbering it.
 */

export interface BlockOrderValue {
  sm: number | null
  md: number | null
  lg: number | null
}

// Every node type that can appear as a direct child of the document. Order
// only has a visual effect on direct doc children (see editor-content.css'
// `.ProseMirror > *` rule) - listing a few extra/nested-only types here
// would simply leave the attribute unused for them, no harm either way.
export const ORDERABLE_BLOCK_TYPES = [
  'paragraph',
  'heading',
  'blockquote',
  'bulletList',
  'orderedList',
  'codeBlock',
  'horizontalRule',
  'image',
  'table',
  'taskList',
  'youtube',
  'iframeEmbed',
  'columnLayout',
  'htmlBlock'
]

function parseOrderStyle(style: string | null): BlockOrderValue | null {
  if (!style) return null
  const read = (name: string): number | null => {
    const match = style.match(new RegExp(`--order-${name}\\s*:\\s*(-?\\d+)`))
    return match ? Number(match[1]) : null
  }
  const sm = read('sm')
  const md = read('md')
  const lg = read('lg')
  if (sm === null && md === null && lg === null) return null
  return { sm, md, lg }
}

function orderToStyle(order: BlockOrderValue | null | undefined): string | null {
  if (!order) return null
  const parts: string[] = []
  if (order.sm !== null && order.sm !== undefined) parts.push(`--order-sm: ${order.sm}`)
  if (order.md !== null && order.md !== undefined) parts.push(`--order-md: ${order.md}`)
  if (order.lg !== null && order.lg !== undefined) parts.push(`--order-lg: ${order.lg}`)
  if (!parts.length) return null
  return parts.join('; ') + ';'
}

export const BlockOrder = Extension.create({
  name: 'blockOrder',

  addGlobalAttributes() {
    return [
      {
        types: ORDERABLE_BLOCK_TYPES,
        attributes: {
          order: {
            default: null,
            parseHTML: (element) => parseOrderStyle(element.getAttribute('style')),
            renderHTML: (attrs) => {
              const style = orderToStyle(attrs.order as BlockOrderValue | null)
              return style ? { style } : {}
            }
          }
        }
      }
    ]
  }
})