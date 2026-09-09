import { Editor, type Content } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { FontFamily } from '@tiptap/extension-font-family'
import { Highlight } from '@tiptap/extension-highlight'
import { TextAlign } from '@tiptap/extension-text-align'
import { Image } from '@tiptap/extension-image'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableHeader } from '@tiptap/extension-table-header'
import { TableCell } from '@tiptap/extension-table-cell'
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight'
import { CharacterCount } from '@tiptap/extension-character-count'
import { Placeholder } from '@tiptap/extension-placeholder'
import { TaskList } from '@tiptap/extension-task-list'
import { TaskItem } from '@tiptap/extension-task-item'
import { Subscript } from '@tiptap/extension-subscript'
import { Superscript } from '@tiptap/extension-superscript'
import { Typography } from '@tiptap/extension-typography'
import { Focus } from '@tiptap/extension-focus'
import { createLowlight, common } from 'lowlight'
import { SearchAndReplace } from '../tiptap-extensions/search-and-replace'

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
      Color,
      FontFamily,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Image.configure({ inline: false, allowBase64: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
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
      SearchAndReplace
    ],
    onUpdate: ({ editor }) => {
      options.onUpdateHtml?.(editor.getHTML())
    }
  })

  return editor
}
