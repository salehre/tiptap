import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'

/**
 * The stock table cell/header nodes have no color attribute, so a table's
 * "advanced" formatting (per-cell shading) needs this extended version.
 */
function withBackgroundColor<T extends typeof TableCell | typeof TableHeader>(base: T) {
  return base.extend({
    addAttributes() {
      return {
        ...this.parent?.(),
        backgroundColor: {
          default: null,
          parseHTML: (element) => element.style.backgroundColor || null,
          renderHTML: (attributes) => {
            if (!attributes.backgroundColor) return {}
            return { style: `background-color: ${attributes.backgroundColor}` }
          }
        }
      }
    }
  })
}

export const TableCellWithBackground = withBackgroundColor(TableCell)
export const TableHeaderWithBackground = withBackgroundColor(TableHeader)