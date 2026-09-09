import { Table } from '@tiptap/extension-table'

/**
 * Adds table-level "properties": overall alignment on the page and a
 * custom border color — TinyMCE exposes both in its table properties dialog.
 */
export const TableWithProperties = Table.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      align: {
        default: 'center', // 'left' | 'center' | 'right'
        parseHTML: (element) => element.getAttribute('data-align') || 'center',
        renderHTML: (attributes) => ({ 'data-align': attributes.align || 'center' })
      },
      borderColor: {
        default: null,
        parseHTML: (element) => element.style.getPropertyValue('--rte-table-border') || null,
        renderHTML: (attributes) => {
          if (!attributes.borderColor) return {}
          return { style: `--rte-table-border: ${attributes.borderColor}` }
        }
      }
    }
  }
})