<script setup lang="ts">
import { computed } from 'vue'
import type { Editor } from '@tiptap/vue-3'
import {
  Undo2,
  Redo2,
  Bold,
  Italic,
  Underline,
  Link2,
  Image as ImageIcon,
  Palette,
  Highlighter,
  Search,
  Maximize2,
  Minimize2,
  TableIcon
} from '@lucide/vue'
import ToolbarIconBtn from './toolbar/ToolbarIconBtn.vue'
import ColorPickerMenu from './toolbar/ColorPickerMenu.vue'
import TableGridPicker from './toolbar/TableGridPicker.vue'
import EmojiMenu from './toolbar/EmojiMenu.vue'
import SpecialCharMenu from './toolbar/SpecialCharMenu.vue'
import InsertMenu from './toolbar/InsertMenu.vue'
import LayoutMenu from './toolbar/LayoutMenu.vue'
import FontSettingsMenu from './toolbar/FontSettingsMenu.vue'
import FormatMoreMenu from './toolbar/FormatMoreMenu.vue'
import AlignMenu from './toolbar/AlignMenu.vue'
import ListMenu from './toolbar/ListMenu.vue'
import InsertMoreMenu from './toolbar/InsertMoreMenu.vue'
import PageToolsMenu from './toolbar/PageToolsMenu.vue'
import ExportMenu from './toolbar/ExportMenu.vue'
import type { ExportCss, ExportSyntax } from '~/utils/exportTypes'

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
  export: [syntax: ExportSyntax, css: ExportCss]
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
    <FontSettingsMenu :editor="editor" />

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
    <FormatMoreMenu :editor="editor" />

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

    <v-divider vertical class="mx-1 my-2" />

    <AlignMenu :editor="editor" />
    <ListMenu :editor="editor" />

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
    <LayoutMenu :editor="editor" />
    <InsertMoreMenu @open-anchor="emit('open-anchor')" @open-embed="emit('open-embed')" />
    <EmojiMenu :editor="editor" />
    <SpecialCharMenu :editor="editor" />
    <InsertMenu :editor="editor" />

    <v-divider vertical class="mx-1 my-2" />

    <ToolbarIconBtn title="جستجو و جایگزینی" :active="findOpen" @click="emit('toggle-find')">
      <Search :size="18" />
    </ToolbarIconBtn>
    <PageToolsMenu
      :show-visual-blocks="showVisualBlocks"
      :show-visual-chars="showVisualChars"
      @open-source="emit('open-source')"
      @open-preview="emit('open-preview')"
      @print="emit('print')"
      @toggle-visual-blocks="emit('toggle-visual-blocks')"
      @toggle-visual-chars="emit('toggle-visual-chars')"
      @insert-page-break="emit('insert-page-break')"
      @open-word-count="emit('open-word-count')"
    />
    <ExportMenu @export="(syntax, css) => emit('export', syntax, css)" />

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
