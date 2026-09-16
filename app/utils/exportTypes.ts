export type ExportSyntax = 'vue' | 'react'
export type ExportCss = 'tailwind' | 'vuetify' | 'bootstrap'

export interface ExportOption {
  syntax: ExportSyntax
  css: ExportCss
  label: string
}

export const EXPORT_OPTIONS: { syntax: ExportSyntax; label: string; options: ExportOption[] }[] = [
  {
    syntax: 'vue',
    label: 'Vue',
    options: [
      { syntax: 'vue', css: 'tailwind', label: 'Vue + Tailwind' },
      { syntax: 'vue', css: 'vuetify', label: 'Vue + Vuetify' },
      { syntax: 'vue', css: 'bootstrap', label: 'Vue + Bootstrap' }
    ]
  },
  {
    syntax: 'react',
    label: 'React',
    options: [
      { syntax: 'react', css: 'tailwind', label: 'React + Tailwind' },
      { syntax: 'react', css: 'bootstrap', label: 'React + Bootstrap' }
    ]
  }
]

export interface PMNode {
  type: string
  attrs?: Record<string, any>
  content?: PMNode[]
  text?: string
  marks?: { type: string; attrs?: Record<string, any> }[]
}

export interface RenderCtx {
  syntax: ExportSyntax
  css: ExportCss
  orderUsed: { value: boolean }
}