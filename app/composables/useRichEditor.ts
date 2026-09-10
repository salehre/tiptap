import { Editor, type Content } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { TextStyle, FontSize, LineHeight } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { FontFamily } from '@tiptap/extension-font-family'
import { Highlight } from '@tiptap/extension-highlight'
import { TextAlign } from '@tiptap/extension-text-align'
import { TableRow } from '@tiptap/extension-table-row'
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight'
import { CharacterCount } from '@tiptap/extension-character-count'
import { Placeholder } from '@tiptap/extension-placeholder'
import { TaskList } from '@tiptap/extension-task-list'
import { TaskItem } from '@tiptap/extension-task-item'
import { Subscript } from '@tiptap/extension-subscript'
import { Superscript } from '@tiptap/extension-superscript'
import { Typography } from '@tiptap/extension-typography'
import { Focus } from '@tiptap/extension-focus'
import { Youtube } from '@tiptap/extension-youtube'
import { createLowlight, common } from 'lowlight'
import { SearchAndReplace } from '../tiptap-extensions/search-and-replace'
import { Indent } from '../tiptap-extensions/indent'
import { TextDirection } from '../tiptap-extensions/text-direction'
import { Anchor } from '../tiptap-extensions/anchor'
import { IframeEmbed } from '../tiptap-extensions/iframe-embed'
import { ResizableImage } from '../tiptap-extensions/resizable-image'
import { TableCellWithBackground, TableHeaderWithBackground } from '../tiptap-extensions/table-cell-background'
import { TableWithProperties } from '../tiptap-extensions/table-properties'
import { PageBreak } from '../tiptap-extensions/page-break'
import { ColumnLayout, Column } from '../tiptap-extensions/columns-layout'

export interface UseRichEditorOptions {
  content?: Content
  placeholder?: string
  editable?: boolean
  charLimit?: number | null
  onUpdateHtml?: (html: string) => void
}

/**
 * Builds a fully-featured Tiptap editor instance.
 * Kept separate from the UI so `RichEditor.vue` can be reused
 * anywhere and the extension set can be tuned in one place.
 */
export function useRichEditor(options: UseRichEditorOptions = {}) {
  const lowlight = createLowlight(common)

  const editor = new Editor({
    editable: options.editable ?? true,
    content: options.content ?? '',
    extensions: [
      StarterKit.configure({
        codeBlock: false, // replaced by CodeBlockLowlight for syntax highlighting
        link: {
          openOnClick: false,
          autolink: true,
          HTMLAttributes: { rel: 'noopener noreferrer nofollow' }
        },
        underline: {}
      }),
      TextStyle,
      FontSize,
      LineHeight,
      Color,
      FontFamily,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      ResizableImage,
      TableWithProperties.configure({ resizable: true }),
      TableRow,
      TableHeaderWithBackground,
      TableCellWithBackground,
      CodeBlockLowlight.configure({ lowlight }),
      CharacterCount.configure({ limit: options.charLimit ?? null }),
      Placeholder.configure({
        placeholder: options.placeholder ?? 'شروع به نوشتن کنید…'
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Subscript,
      Superscript,
      Typography,
      Focus.configure({ className: 'has-focus', mode: 'shallowest' }),
      Youtube.configure({ nocookie: true, HTMLAttributes: { class: 'rte-embed-frame' } }),
      SearchAndReplace,
      Indent,
      TextDirection,
      Anchor,
      IframeEmbed,
      PageBreak,
      ColumnLayout,
      Column
    ],
    onUpdate: ({ editor }) => {
      options.onUpdateHtml?.(editor.getHTML())
    }
  })

  return editor
}
