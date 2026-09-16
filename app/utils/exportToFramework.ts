import type { ExportCss, ExportSyntax, PMNode } from './exportTypes'
import { renderNode } from './exportRenderer'
import { indentBlock } from './exportDom'

export interface ExportResult {
  code: string
  filename: string
  language: 'vue' | 'jsx'
  notes: string[]
}

const CONTAINER_STYLE = 'max-width: 768px; margin: 0 auto; padding: 24px;'

const ORDER_CLASS = 'rte-order-root'
const ORDER_STYLE = `.${ORDER_CLASS} { display: flex; flex-direction: column; container-type: inline-size; }
.${ORDER_CLASS} > * { order: var(--order-lg, 0); }
@container (max-width: 767.98px) {
  .${ORDER_CLASS} > * { order: var(--order-sm, var(--order-lg, 0)); }
}
@container (min-width: 768px) and (max-width: 1023.98px) {
  .${ORDER_CLASS} > * { order: var(--order-md, var(--order-lg, 0)); }
}`

function vueScaffold(inner: string, orderUsed: boolean): { code: string; notes: string[] } {
  const cls = orderUsed ? ` class="${ORDER_CLASS}"` : ''
  const body = `  <div${cls} style="${CONTAINER_STYLE}">\n${indentBlock(inner, 4)}\n  </div>`
  const styleBlock = orderUsed ? `\n\n<style>\n${ORDER_STYLE}\n</style>\n` : ''
  const code = `<template>\n${body}\n</template>\n\n<script setup>\n// این کامپوننت به‌صورت خودکار از محتوای ادیتور تولید شده است.\n</script>${styleBlock}`
  return { code, notes: [] }
}

function reactScaffold(inner: string, orderUsed: boolean): { code: string; notes: string[] } {
  const cls = orderUsed ? ` className="${ORDER_CLASS}"` : ''
  const styleTag = orderUsed ? `      <style>{\`${ORDER_STYLE}\`}</style>\n` : ''
  const body = `    <div${cls} style={{ maxWidth: '768px', margin: '0 auto', padding: '24px' }}>\n${styleTag}${indentBlock(inner, 6)}\n    </div>`
  const code = `export default function GeneratedContent() {\n  return (\n${body}\n  );\n}\n`
  return { code, notes: [] }
}

export function exportEditorContent(json: PMNode, syntax: ExportSyntax, css: ExportCss): ExportResult {
  const orderUsed = { value: false }
  const inner = renderNode(json, { syntax, css, orderUsed })

  if (syntax === 'vue') {
    const { code, notes } = vueScaffold(inner, orderUsed.value)
    return { code, filename: 'GeneratedContent.vue', language: 'vue', notes }
  }

  const { code, notes } = reactScaffold(inner, orderUsed.value)
  return { code, filename: 'GeneratedContent.jsx', language: 'jsx', notes }
}