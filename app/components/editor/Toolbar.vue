<script setup lang="ts">
import { computed } from 'vue'
import type { Editor } from '@tiptap/vue-3'
import {
  Undo2,
  Redo2,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  CodeXml,
  Quote,
  List,
  ListOrdered,
  ListTodo,
  Link2,
  Image as ImageIcon,
  Minus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Palette,
  Highlighter,
  Subscript,
  Superscript,
  Search,
  Maximize2,
  Minimize2,
  Eraser,
  TableIcon,
  IndentIncrease,
  IndentDecrease,
  Languages,
  Anchor as AnchorIcon,
  MonitorPlay,
  Eye,
  Printer,
  SquareDashedMousePointer,
  Pilcrow,
  SeparatorHorizontal,
  Calculator
} from '@lucide/vue'
import ToolbarIconBtn from './toolbar/ToolbarIconBtn.vue'
import ColorPickerMenu from './toolbar/ColorPickerMenu.vue'
import TableGridPicker from './toolbar/TableGridPicker.vue'
import EmojiMenu from './toolbar/EmojiMenu.vue'
import SpecialCharMenu from './toolbar/SpecialCharMenu.vue'
import InsertMenu from './toolbar/InsertMenu.vue'
import LayoutMenu from './toolbar/LayoutMenu.vue'

const props = defineProps<{
  editor: Editor
  fullscreen: boolean
  findOpen: boolean
  showVisualBlocks: boolean
  showVisualChars: boolean
}>()

const emit = defineEmits<{
  'open-link': []
  'open-image': []
  'open-source': []
  'open-anchor': []
  'open-embed': []
  'open-preview': []
  'open-word-count': []
  'insert-page-break': []
  print: []
  'toggle-visual-blocks': []
  'toggle-visual-chars': []
  'toggle-fullscreen': []
  'toggle-find': []
}>()

const TEXT_COLORS = [
  '#201f1c', '#a3402e', '#c76b3f', '#b8874b',
  '#3d6b4a', '#2f4b7c', '#5a4a8c', '#7a776f'
]
const HIGHLIGHT_COLORS = [
  '#fbe89e', '#f9c9c0', '#f6d9b0', '#cfe3c8',
  '#c6d8ec', '#ded0ea', '#f0ede4', '#e4e1d8'
]

const blockType = computed({
  get() {
    if (props.editor.isActive('heading', { level: 1 })) return 'h1'
    if (props.editor.isActive('heading', { level: 2 })) return 'h2'
    if (props.editor.isActive('heading', { level: 3 })) return 'h3'
    if (props.editor.isActive('heading', { level: 4 })) return 'h4'
    if (props.editor.isActive('codeBlock')) return 'code'
    return 'p'
  },
  set(value: string) {
    const chain = props.editor.chain().focus()
    if (value === 'p') chain.setParagraph().run()
    else if (value === 'code') chain.toggleCodeBlock().run()
    else chain.toggleHeading({ level: Number(value.slice(1)) as 1 | 2 | 3 | 4 }).run()
  }
})

const blockOptions = [
  { value: 'p', title: 'پاراگراف' },
  { value: 'h1', title: 'عنوان ۱' },
  { value: 'h2', title: 'عنوان ۲' },
  { value: 'h3', title: 'عنوان ۳' },
  { value: 'h4', title: 'عنوان ۴' },
  { value: 'code', title: 'بلوک کد' }
]

const fontFamily = computed({
  get() {
    return props.editor.getAttributes('textStyle').fontFamily ?? ''
  },
  set(value: string) {
    if (!value) props.editor.chain().focus().unsetFontFamily().run()
    else props.editor.chain().focus().setFontFamily(value).run()
  }
})

const fontOptions = [
  { value: '', title: 'فونت پیش‌فرض' },
  { value: 'Vazirmatn Variable, sans-serif', title: 'وزیرمتن' },
  { value: 'JetBrains Mono, monospace', title: 'مونو' },
  { value: 'Georgia, serif', title: 'سریف' }
]

const fontSize = computed({
  get() {
    return props.editor.getAttributes('textStyle').fontSize ?? ''
  },
  set(value: string) {
    if (!value) props.editor.chain().focus().unsetFontSize().run()
    else props.editor.chain().focus().setFontSize(value).run()
  }
})

const fontSizeOptions = [
  { value: '', title: 'اندازه' },
  { value: '12px', title: '12' },
  { value: '14px', title: '14' },
  { value: '16px', title: '16' },
  { value: '18px', title: '18' },
  { value: '20px', title: '20' },
  { value: '24px', title: '24' },
  { value: '28px', title: '28' },
  { value: '32px', title: '32' }
]

const lineHeight = computed({
  get() {
    return props.editor.getAttributes('textStyle').lineHeight ?? ''
  },
  set(value: string) {
    if (!value) props.editor.chain().focus().unsetLineHeight().run()
    else props.editor.chain().focus().setLineHeight(value).run()
  }
})

const lineHeightOptions = [
  { value: '', title: 'ارتفاع خط' },
  { value: '1', title: '1' },
  { value: '1.15', title: '1.15' },
  { value: '1.5', title: '1.5' },
  { value: '2', title: '2' },
  { value: '2.5', title: '2.5' }
]

function toggleDirection() {
  const current = props.editor.getAttributes('paragraph').dir || props.editor.getAttributes('heading').dir
  if (current === 'ltr') props.editor.chain().focus().setTextDirection('rtl').run()
  else props.editor.chain().focus().setTextDirection('ltr').run()
}

function setLink() {
  emit('open-link')
}
</script>

<template>
  <v-toolbar
    density="comfortable"
    color="surface"
    role="toolbar"
    aria-label="ابزار قالب‌بندی"
    class="rte-toolbar flex-wrap py-1"
    :height="undefined"
  >
    <ToolbarIconBtn title="واگرد" :disabled="!editor.can().undo()" @click="editor.chain().focus().undo().run()">
      <Undo2 :size="18" />
    </ToolbarIconBtn>
    <ToolbarIconBtn title="ازنو" :disabled="!editor.can().redo()" @click="editor.chain().focus().redo().run()">
      <Redo2 :size="18" />
    </ToolbarIconBtn>

    <v-divider vertical class="mx-1 my-2" />

    <v-select
      v-model="blockType"
      :items="blockOptions"
      item-title="title"
      item-value="value"
      density="compact"
      variant="plain"
      hide-details
      class="block-select"
      style="width: 108px"
    />
    <v-select
      v-model="fontFamily"
      :items="fontOptions"
      item-title="title"
      item-value="value"
      density="compact"
      variant="plain"
      hide-details
      class="block-select"
      style="width: 120px"
    />
    <v-select
      v-model="fontSize"
      :items="fontSizeOptions"
      item-title="title"
      item-value="value"
      density="compact"
      variant="plain"
      hide-details
      class="block-select"
      style="width: 84px"
    />
    <v-select
      v-model="lineHeight"
      :items="lineHeightOptions"
      item-title="title"
      item-value="value"
      density="compact"
      variant="plain"
      hide-details
      class="block-select"
      style="width: 96px"
    />

    <v-divider vertical class="mx-1 my-2" />

    <ToolbarIconBtn title="ضخیم" :active="editor.isActive('bold')" @click="editor.chain().focus().toggleBold().run()">
      <Bold :size="18" />
    </ToolbarIconBtn>
    <ToolbarIconBtn title="مورب" :active="editor.isActive('italic')" @click="editor.chain().focus().toggleItalic().run()">
      <Italic :size="18" />
    </ToolbarIconBtn>
    <ToolbarIconBtn title="زیرخط‌دار" :active="editor.isActive('underline')" @click="editor.chain().focus().toggleUnderline().run()">
      <Underline :size="18" />
    </ToolbarIconBtn>
    <ToolbarIconBtn title="خط‌خورده" :active="editor.isActive('strike')" @click="editor.chain().focus().toggleStrike().run()">
      <Strikethrough :size="18" />
    </ToolbarIconBtn>
    <ToolbarIconBtn title="کد درون‌خطی" :active="editor.isActive('code')" @click="editor.chain().focus().toggleCode().run()">
      <Code :size="18" />
    </ToolbarIconBtn>
    <ToolbarIconBtn title="زیرنویس" :active="editor.isActive('subscript')" @click="editor.chain().focus().toggleSubscript().run()">
      <Subscript :size="18" />
    </ToolbarIconBtn>
    <ToolbarIconBtn title="بالانویس" :active="editor.isActive('superscript')" @click="editor.chain().focus().toggleSuperscript().run()">
      <Superscript :size="18" />
    </ToolbarIconBtn>

    <ColorPickerMenu
      title="رنگ متن"
      :presets="TEXT_COLORS"
      :active="!!editor.getAttributes('textStyle').color"
      @pick="(c) => editor.chain().focus().setColor(c).run()"
      @clear="editor.chain().focus().unsetColor().run()"
    >
      <Palette :size="18" />
    </ColorPickerMenu>
    <ColorPickerMenu
      title="هایلایت"
      :presets="HIGHLIGHT_COLORS"
      :active="editor.isActive('highlight')"
      @pick="(c) => editor.chain().focus().toggleHighlight({ color: c }).run()"
      @clear="editor.chain().focus().unsetHighlight().run()"
    >
      <Highlighter :size="18" />
    </ColorPickerMenu>

    <ToolbarIconBtn title="حذف قالب‌بندی" @click="editor.chain().focus().unsetAllMarks().clearNodes().run()">
      <Eraser :size="18" />
    </ToolbarIconBtn>

    <v-divider vertical class="mx-1 my-2" />

    <ToolbarIconBtn title="راست‌چین" :active="editor.isActive({ textAlign: 'right' })" @click="editor.chain().focus().setTextAlign('right').run()">
      <AlignRight :size="18" />
    </ToolbarIconBtn>
    <ToolbarIconBtn title="وسط‌چین" :active="editor.isActive({ textAlign: 'center' })" @click="editor.chain().focus().setTextAlign('center').run()">
      <AlignCenter :size="18" />
    </ToolbarIconBtn>
    <ToolbarIconBtn title="چپ‌چین" :active="editor.isActive({ textAlign: 'left' })" @click="editor.chain().focus().setTextAlign('left').run()">
      <AlignLeft :size="18" />
    </ToolbarIconBtn>
    <ToolbarIconBtn title="تراز از دو طرف" :active="editor.isActive({ textAlign: 'justify' })" @click="editor.chain().focus().setTextAlign('justify').run()">
      <AlignJustify :size="18" />
    </ToolbarIconBtn>
    <ToolbarIconBtn title="افزایش تورفتگی" @click="editor.chain().focus().indent().run()">
      <IndentIncrease :size="18" />
    </ToolbarIconBtn>
    <ToolbarIconBtn title="کاهش تورفتگی" @click="editor.chain().focus().outdent().run()">
      <IndentDecrease :size="18" />
    </ToolbarIconBtn>
    <ToolbarIconBtn title="تغییر جهت متن (راست‌به‌چپ / چپ‌به‌راست)" @click="toggleDirection">
      <Languages :size="18" />
    </ToolbarIconBtn>

    <v-divider vertical class="mx-1 my-2" />

    <ToolbarIconBtn title="لیست نقطه‌ای" :active="editor.isActive('bulletList')" @click="editor.chain().focus().toggleBulletList().run()">
      <List :size="18" />
    </ToolbarIconBtn>
    <ToolbarIconBtn title="لیست شماره‌دار" :active="editor.isActive('orderedList')" @click="editor.chain().focus().toggleOrderedList().run()">
      <ListOrdered :size="18" />
    </ToolbarIconBtn>
    <ToolbarIconBtn title="چک‌لیست" :active="editor.isActive('taskList')" @click="editor.chain().focus().toggleTaskList().run()">
      <ListTodo :size="18" />
    </ToolbarIconBtn>
    <ToolbarIconBtn title="نقل قول" :active="editor.isActive('blockquote')" @click="editor.chain().focus().toggleBlockquote().run()">
      <Quote :size="18" />
    </ToolbarIconBtn>
    <ToolbarIconBtn title="خط افقی" @click="editor.chain().focus().setHorizontalRule().run()">
      <Minus :size="18" />
    </ToolbarIconBtn>

    <v-divider vertical class="mx-1 my-2" />

    <ToolbarIconBtn title="لینک" :active="editor.isActive('link')" @click="setLink">
      <Link2 :size="18" />
    </ToolbarIconBtn>
    <ToolbarIconBtn title="تصویر" @click="emit('open-image')">
      <ImageIcon :size="18" />
    </ToolbarIconBtn>
    <TableGridPicker @pick="(r, c) => editor.chain().focus().insertTable({ rows: r, cols: c, withHeaderRow: true }).run()">
      <TableIcon :size="18" />
    </TableGridPicker>
    <ToolbarIconBtn title="لنگر (Anchor)" @click="emit('open-anchor')">
      <AnchorIcon :size="18" />
    </ToolbarIconBtn>
    <ToolbarIconBtn title="جاسازی ویدیو" @click="emit('open-embed')">
      <MonitorPlay :size="18" />
    </ToolbarIconBtn>
    <LayoutMenu :editor="editor" />
    <EmojiMenu :editor="editor" />
    <SpecialCharMenu :editor="editor" />
    <InsertMenu :editor="editor" />

    <v-divider vertical class="mx-1 my-2" />

    <ToolbarIconBtn title="جستجو و جایگزینی" :active="findOpen" @click="emit('toggle-find')">
      <Search :size="18" />
    </ToolbarIconBtn>
    <ToolbarIconBtn title="کد HTML" @click="emit('open-source')">
      <CodeXml :size="18" />
    </ToolbarIconBtn>

    <v-divider vertical class="mx-1 my-2" />

    <ToolbarIconBtn title="پیش‌نمایش" @click="emit('open-preview')">
      <Eye :size="18" />
    </ToolbarIconBtn>
    <ToolbarIconBtn title="چاپ" @click="emit('print')">
      <Printer :size="18" />
    </ToolbarIconBtn>
    <ToolbarIconBtn title="نمایش کادر بلوک‌ها" :active="showVisualBlocks" @click="emit('toggle-visual-blocks')">
      <SquareDashedMousePointer :size="18" />
    </ToolbarIconBtn>
    <ToolbarIconBtn title="نمایش نشانه‌ی پایان پاراگراف" :active="showVisualChars" @click="emit('toggle-visual-chars')">
      <Pilcrow :size="18" />
    </ToolbarIconBtn>
    <ToolbarIconBtn title="درج پایان صفحه" @click="emit('insert-page-break')">
      <SeparatorHorizontal :size="18" />
    </ToolbarIconBtn>
    <ToolbarIconBtn title="آمار سند" @click="emit('open-word-count')">
      <Calculator :size="18" />
    </ToolbarIconBtn>

    <v-divider vertical class="mx-1 my-2" />

    <ToolbarIconBtn :title="fullscreen ? 'خروج از تمام‌صفحه' : 'تمام‌صفحه'" :active="fullscreen" @click="emit('toggle-fullscreen')">
      <component :is="fullscreen ? Minimize2 : Maximize2" :size="18" />
    </ToolbarIconBtn>
  </v-toolbar>
</template>

<style scoped>
.rte-toolbar :deep(.v-toolbar__content) {
  flex-wrap: wrap;
  height: auto !important;
  gap: 2px;
  padding-block: 6px;
}
.block-select :deep(.v-field__input) {
  font-size: 13px;
  padding-inline-start: 8px;
}
</style>
