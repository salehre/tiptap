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

function vueScaffold(inner: string): { code: string; notes: string[] } {
  const body = `  <div style="${CONTAINER_STYLE}">\n${indentBlock(inner, 4)}\n  </div>`
  const code = `<template>\n${body}\n</template>\n\n<script setup>\n// این کامپوننت به‌صورت خودکار از محتوای ادیتور تولید شده است.\n</script>\n`
  return { code, notes: [] }
}

function reactScaffold(inner: string): { code: string; notes: string[] } {
  const body = `    <div style={{ maxWidth: '768px', margin: '0 auto', padding: '24px' }}>\n${indentBlock(inner, 6)}\n    </div>`
  const code = `export default function GeneratedContent() {\n  return (\n${body}\n  );\n}\n`
  return { code, notes: [] }
}

export function exportEditorContent(json: PMNode, syntax: ExportSyntax, css: ExportCss): ExportResult {
  const inner = renderNode(json, { syntax, css })

  if (syntax === 'vue') {
    const { code, notes } = vueScaffold(inner)
    return { code, filename: 'GeneratedContent.vue', language: 'vue', notes }
  }

  const { code, notes } = reactScaffold(inner)
  return { code, filename: 'GeneratedContent.jsx', language: 'jsx', notes }
}