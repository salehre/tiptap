import type { ExportCss, ExportSyntax, PMNode } from './exportTypes'
import { renderNode } from './exportRenderer'
import { indentBlock } from './exportDom'

export interface ExportResult {
  code: string
  filename: string
  language: 'vue' | 'jsx'
  notes: string[]
}

const CONTAINER_CLASS: Record<ExportCss, string> = {
  tailwind: 'max-w-3xl mx-auto p-6',
  bootstrap: 'container py-4',
  vuetify: '' // wrapped in v-container instead, see below
}

function vueScaffold(inner: string, css: ExportCss): { code: string; notes: string[] } {
  const notes: string[] = []
  let body: string

  if (css === 'vuetify') {
    notes.push('این پروژه باید Vuetify نصب و پیکربندی‌شده داشته باشد (v-app در ریشه‌ی اپ).')
    body = `  <v-container>\n${indentBlock(inner, 4)}\n  </v-container>`
  } else {
    if (css === 'tailwind') notes.push('Tailwind CSS باید در پروژه‌ی مقصد پیکربندی شده باشد.')
    if (css === 'bootstrap') notes.push('فایل CSS بوت‌استرپ باید در پروژه ایمپورت شده باشد.')
    body = `  <div class="${CONTAINER_CLASS[css]}">\n${indentBlock(inner, 4)}\n  </div>`
  }

  const code = `<template>\n${body}\n</template>\n\n<script setup>\n// این کامپوننت به‌صورت خودکار از محتوای ادیتور تولید شده است.\n</script>\n`
  return { code, notes }
}

function reactScaffold(inner: string, css: ExportCss): { code: string; notes: string[] } {
  const notes: string[] = []
  if (css === 'tailwind') notes.push('Tailwind CSS باید در پروژه‌ی مقصد پیکربندی شده باشد.')
  if (css === 'bootstrap') notes.push("فایل 'bootstrap/dist/css/bootstrap.min.css' باید ایمپورت شده باشد.")

  const body = `    <div className="${CONTAINER_CLASS[css]}">\n${indentBlock(inner, 6)}\n    </div>`
  const code = `export default function GeneratedContent() {\n  return (\n${body}\n  );\n}\n`
  return { code, notes }
}

export function exportEditorContent(json: PMNode, syntax: ExportSyntax, css: ExportCss): ExportResult {
  const inner = renderNode(json, { syntax, css })

  if (syntax === 'vue') {
    const { code, notes } = vueScaffold(inner, css)
    return { code, filename: 'GeneratedContent.vue', language: 'vue', notes }
  }

  const { code, notes } = reactScaffold(inner, css)
  return { code, filename: 'GeneratedContent.jsx', language: 'jsx', notes }
}