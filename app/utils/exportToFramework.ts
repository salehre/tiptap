import type { ExportCss, ExportSyntax } from './exportTypes'
import tokensCss from '../assets/css/tokens.css?raw'
import editorContentCss from '../assets/css/editor-content.css?raw'

export interface ExportResult {
  code: string
  filename: string
  language: 'vue' | 'jsx'
  notes: string[]
}

/* -------------------------------------------------------------------------
 * The export is produced from the REAL rendered DOM of the editor
 * (`editor.view.dom`, i.e. what DevTools > Elements shows), not from a
 * re-implementation of each node. The only things removed are editor-only
 * artifacts (contenteditable, placeholders, selection/focus classes, resize
 * handles, search highlights, ProseMirror helper nodes, scoped-style hashes).
 * ----------------------------------------------------------------------- */

const VOID_TAGS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr'
])

// Tags whose children may be placed on separate indented lines without
// changing how the browser lays them out.
const BLOCK_TAGS = new Set([
  'address', 'article', 'aside', 'blockquote', 'colgroup', 'col', 'dd', 'div', 'dl', 'dt', 'figcaption',
  'figure', 'footer', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'hr', 'li', 'ol', 'p', 'pre', 'section',
  'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr', 'ul', 'label'
])

// Attributes that only exist because the node is being edited.
const EDITOR_ATTRS = new Set([
  'contenteditable', 'tabindex', 'translate', 'role', 'draggable', 'spellcheck', 'autocorrect',
  'autocapitalize', 'autocomplete', 'data-placeholder', 'data-drag-handle', 'data-node-view-content',
  'data-node-view-content-inner', 'data-selected', 'data-active'
])

// Editor-state classes that never belong in the exported markup.
const EDITOR_CLASS_RE =
    /^(ProseMirror-.+|search-match.*|has-focus|is-selected|is-resizing|is-editor-empty|is-empty|is-node-empty|is-active|selectednode)$/

const TRAILING_BREAK_CLASS = 'ProseMirror-trailingBreak'

function isEditorOnlyElement(el: Element): boolean {
  const cls = el.classList
  if (cls.contains('resize-handle')) return true
  if (cls.contains('column-resize-handle')) return true
  if (cls.contains('ProseMirror-gapcursor')) return true
  if (cls.contains('ProseMirror-separator')) return true
  if (cls.contains('ProseMirror-widget')) return true
  if (cls.contains('ProseMirror-dropcursor')) return true
  return false
}

function cleanClasses(el: Element) {
  const keep = Array.from(el.classList).filter((c) => !EDITOR_CLASS_RE.test(c))
  if (keep.length) el.setAttribute('class', keep.join(' '))
  else el.removeAttribute('class')
}

function cleanAttributes(el: Element) {
  for (const attr of Array.from(el.attributes)) {
    const name = attr.name
    if (
        EDITOR_ATTRS.has(name) ||
        name.startsWith('data-v-') || // Vue scoped-style hashes
        name.startsWith('aria-')
    ) {
      el.removeAttribute(name)
    }
  }
  cleanClasses(el)
}

function unwrap(el: Element) {
  const parent = el.parentNode
  if (!parent) return
  while (el.firstChild) parent.insertBefore(el.firstChild, el)
  parent.removeChild(el)
}

function cleanTree(root: Element) {
  // 1) comments (Vue's <!--v-if--> placeholders etc.)
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_COMMENT)
  const comments: Node[] = []
  while (walker.nextNode()) comments.push(walker.currentNode)
  comments.forEach((c) => c.parentNode?.removeChild(c))

  // 2) editor-only elements
  Array.from(root.querySelectorAll('*'))
      .filter(isEditorOnlyElement)
      .forEach((el) => el.remove())

  // 3) trailing <br> ProseMirror adds so an empty block keeps its height:
  //    keep a plain <br> when it is the block's only content, drop otherwise.
  root.querySelectorAll(`br.${TRAILING_BREAK_CLASS}`).forEach((br) => {
    const parent = br.parentElement
    const onlyChild = parent && parent.childNodes.length === 1
    if (onlyChild) br.removeAttribute('class')
    else br.remove()
  })

  // 4) empty, editor-only <figcaption> (shown while an image is selected)
  root.querySelectorAll('figcaption').forEach((fc) => {
    if (!fc.textContent?.trim() && fc.hasAttribute('contenteditable')) fc.remove()
  })

  // 5) search highlight spans -> unwrap
  root.querySelectorAll('span').forEach((span) => {
    const tokens = Array.from(span.classList)
    if (tokens.length && tokens.every((c) => c.startsWith('search-match')) && span.attributes.length === 1) {
      unwrap(span)
    }
  })

  // 6) attributes / classes on everything that is left
  root.querySelectorAll('*').forEach(cleanAttributes)
}

/* -------------------------------------------------------------------------
 * Serialisation to Vue template / JSX
 * ----------------------------------------------------------------------- */

const REACT_ATTR_MAP: Record<string, string> = {
  class: 'className',
  for: 'htmlFor',
  colspan: 'colSpan',
  rowspan: 'rowSpan',
  frameborder: 'frameBorder',
  allowfullscreen: 'allowFullScreen',
  tabindex: 'tabIndex',
  srcset: 'srcSet',
  crossorigin: 'crossOrigin',
  datetime: 'dateTime',
  maxlength: 'maxLength',
  readonly: 'readOnly',
  autoplay: 'autoPlay',
  playsinline: 'playsInline',
  referrerpolicy: 'referrerPolicy',
  cellpadding: 'cellPadding',
  cellspacing: 'cellSpacing',
  contenteditable: 'contentEditable',
  checked: 'defaultChecked'
}

const BOOLEAN_ATTRS = new Set([
  'checked', 'disabled', 'readonly', 'required', 'selected', 'multiple', 'controls', 'loop', 'muted',
  'autoplay', 'hidden', 'open'
])

function escapeText(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function escapeAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
}

/** Split a CSS declaration list on `;` while ignoring `;` inside url()/quotes/parens. */
function parseStyle(style: string): [string, string][] {
  const decls: string[] = []
  let current = ''
  let depth = 0
  let quote: string | null = null
  for (const ch of style) {
    if (quote) {
      current += ch
      if (ch === quote) quote = null
      continue
    }
    if (ch === '"' || ch === "'") {
      quote = ch
      current += ch
    } else if (ch === '(') {
      depth++
      current += ch
    } else if (ch === ')') {
      depth = Math.max(0, depth - 1)
      current += ch
    } else if (ch === ';' && depth === 0) {
      decls.push(current)
      current = ''
    } else {
      current += ch
    }
  }
  if (current.trim()) decls.push(current)

  const out: [string, string][] = []
  for (const d of decls) {
    const idx = d.indexOf(':')
    if (idx === -1) continue
    const prop = d.slice(0, idx).trim()
    const value = d.slice(idx + 1).trim()
    if (prop && value) out.push([prop, value])
  }
  return out
}

function camel(prop: string): string {
  return prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
}

function reactStyleKey(prop: string): string {
  if (prop.startsWith('--')) return JSON.stringify(prop)
  if (prop.startsWith('-ms-')) return 'ms' + camel(prop.slice(4)).replace(/^./, (c) => c.toUpperCase())
  if (prop.startsWith('-')) return camel(prop.slice(1)).replace(/^./, (c) => c.toUpperCase())
  return camel(prop)
}

function reactStyle(style: string): string {
  const body = parseStyle(style)
      .map(([k, v]) => `${reactStyleKey(k)}: ${JSON.stringify(v)}`)
      .join(', ')
  return `{{ ${body} }}`
}

function serializeAttrs(el: Element, syntax: ExportSyntax): string {
  const parts: string[] = []
  for (const attr of Array.from(el.attributes)) {
    const name = attr.name
    const value = attr.value

    if (syntax === 'react') {
      if (name === 'style') {
        parts.push(`style=${reactStyle(value)}`)
        continue
      }
      const lower = name.toLowerCase()
      const jsxName = REACT_ATTR_MAP[lower] ?? name
      if (BOOLEAN_ATTRS.has(lower) && (value === '' || value === lower)) {
        parts.push(jsxName)
      } else {
        parts.push(`${jsxName}="${escapeAttr(value)}"`)
      }
    } else {
      if (BOOLEAN_ATTRS.has(name) && (value === '' || value === name)) {
        parts.push(name)
      } else {
        parts.push(`${name}="${escapeAttr(value)}"`)
      }
    }
  }
  return parts.length ? ' ' + parts.join(' ') : ''
}

function serializeText(value: string, syntax: ExportSyntax): string {
  if (syntax === 'react') {
    // Anything JSX would reinterpret or whitespace-collapse is emitted as a JS string.
    if (/[{}\n\r\t]|^\s|\s$|\s{2,}/.test(value)) return `{${JSON.stringify(value)}}`
    return escapeText(value)
  }
  // Vue: protect mustache interpolation
  return escapeText(value).replace(/\{\{/g, "{{ '{{' }}")
}

const INDENT = '  '

function serializeNode(node: Node, syntax: ExportSyntax, depth: number, preserve: boolean): string {
  if (node.nodeType === Node.TEXT_NODE) return serializeText(node.textContent ?? '', syntax)
  if (node.nodeType !== Node.ELEMENT_NODE) return ''

  const el = node as Element
  const tag = el.tagName.toLowerCase()
  const attrs = serializeAttrs(el, syntax)

  if (VOID_TAGS.has(tag)) return `<${tag}${attrs} />`

  const childNodes = Array.from(el.childNodes)
  if (!childNodes.length) return `<${tag}${attrs}></${tag}>`

  const keepWhitespace = preserve || tag === 'pre' || tag === 'textarea'

  const meaningful = childNodes.filter(
      (c) => !(c.nodeType === Node.TEXT_NODE && !(c.textContent ?? '').trim())
  )
  const canPretty =
      !keepWhitespace &&
      meaningful.length > 0 &&
      meaningful.every(
          (c) => c.nodeType === Node.ELEMENT_NODE && BLOCK_TAGS.has((c as Element).tagName.toLowerCase())
      )

  if (canPretty) {
    const pad = INDENT.repeat(depth + 1)
    const inner = meaningful
        .map((c) => pad + serializeNode(c, syntax, depth + 1, false))
        .join('\n')
    return `<${tag}${attrs}>\n${inner}\n${INDENT.repeat(depth)}</${tag}>`
  }

  const inner = childNodes.map((c) => serializeNode(c, syntax, depth + 1, keepWhitespace)).join('')
  return `<${tag}${attrs}>${inner}</${tag}>`
}

/* -------------------------------------------------------------------------
 * CSS shipped with the export so it renders like the editor
 * ----------------------------------------------------------------------- */

// The image node-view styles live in a scoped <style> inside
// ResizableImageView.vue, so they cannot be imported as a plain stylesheet.
const IMAGE_FIGURE_CSS = `
.rte-content .rte-figure-view {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.rte-content .rte-figure-view.align-left { align-items: flex-start; }
.rte-content .rte-figure-view.align-center { align-items: center; }
.rte-content .rte-figure-view.align-right { align-items: flex-end; }
.rte-content .img-frame {
  position: relative;
  line-height: 0;
  max-width: 100%;
}
.rte-content .img-frame img {
  display: block;
  width: 100%;
  height: auto;
  border-radius: var(--radius-sm, 5px);
}
.rte-content .img-caption {
  font-size: 0.85em;
  color: rgba(32, 31, 28, 0.6);
  text-align: center;
  max-width: 100%;
}`

function buildCss(): string {
  return [tokensCss, editorContentCss, IMAGE_FIGURE_CSS]
      .map((c) => c.replace(/\/\*[\s\S]*?\*\//g, '').trim())
      .filter(Boolean)
      .join('\n\n')
}

function escapeForTemplateLiteral(css: string): string {
  return css.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${')
}

/* -------------------------------------------------------------------------
 * Public API
 * ----------------------------------------------------------------------- */

function buildExportRoot(editorDom: HTMLElement): HTMLElement {
  const clone = editorDom.cloneNode(true) as HTMLElement
  cleanTree(clone)

  // The root keeps only what DevTools shows without the editing state.
  for (const attr of Array.from(clone.attributes)) {
    if (attr.name !== 'class' && attr.name !== 'style') clone.removeAttribute(attr.name)
  }
  const rootClasses = Array.from(clone.classList).filter((c) => c === 'tiptap' || c === 'ProseMirror')
  clone.setAttribute('class', rootClasses.join(' ') || 'ProseMirror')
  return clone
}

export function exportEditorContent(
    editorDom: HTMLElement,
    syntax: ExportSyntax,
    _css: ExportCss
): ExportResult {
  const root = buildExportRoot(editorDom)
  const css = buildCss()

  const notes = [
    'کد دقیقاً از DOM زندهٔ ادیتور (همان چیزی که در Elements مرورگر دیده می‌شود) ساخته شده؛ فقط ویژگی‌های مخصوص ویرایش (contenteditable، placeholder، کلاس‌های انتخاب/فوکوس، دستگیره‌های تغییر اندازه) حذف شده‌اند.',
    'استایل‌های لازم برای نمایش مشابه ادیتور همراه خروجی در بلوک style آمده است.'
  ]

  if (syntax === 'vue') {
    const body = serializeNode(root, 'vue', 2, false)
    const code =
        `<template>\n` +
        `  <div class="rte-content">\n` +
        `    ${body}\n` +
        `  </div>\n` +
        `</template>\n\n` +
        `<style>\n${css}\n</style>\n`
    return { code, filename: 'GeneratedContent.vue', language: 'vue', notes }
  }

  const body = serializeNode(root, 'react', 4, false)
  const code =
      `export default function GeneratedContent() {\n` +
      `  return (\n` +
      `    <>\n` +
      `      <style>{\`\n${escapeForTemplateLiteral(css)}\n\`}</style>\n` +
      `      <div className="rte-content">\n` +
      `        ${body}\n` +
      `      </div>\n` +
      `    </>\n` +
      `  );\n` +
      `}\n`
  return { code, filename: 'GeneratedContent.jsx', language: 'jsx', notes }
}