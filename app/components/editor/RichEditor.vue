<script setup lang="ts">
import { ref, shallowRef, watch, onMounted, onBeforeUnmount } from 'vue'
import { EditorContent, type Editor } from '@tiptap/vue-3'
import { useRichEditor } from '../../composables/useRichEditor'
import Toolbar from './Toolbar.vue'
import MenuBar from './MenuBar.vue'
import StatusBar from './StatusBar.vue'
import SelectionBubbleMenu from './SelectionBubbleMenu.vue'
import TableBubbleMenu from './TableBubbleMenu.vue'
import ImageBubbleMenu from './ImageBubbleMenu.vue'
import LayoutBubbleMenu from './LayoutBubbleMenu.vue'
import FindReplacePanel from './FindReplacePanel.vue'
import LinkDialog from './dialogs/LinkDialog.vue'
import ImageDialog from './dialogs/ImageDialog.vue'
import SourceCodeDialog from './dialogs/SourceCodeDialog.vue'
import AnchorDialog from './dialogs/AnchorDialog.vue'
import EmbedDialog from './dialogs/EmbedDialog.vue'
import PreviewDialog from './dialogs/PreviewDialog.vue'
import WordCountDialog from './dialogs/WordCountDialog.vue'
import TablePropertiesDialog from './dialogs/TablePropertiesDialog.vue'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    placeholder?: string
    editable?: boolean
    charLimit?: number | null
    minHeight?: string
  }>(),
  {
    modelValue: '',
    placeholder: 'شروع به نوشتن کنید…',
    editable: true,
    charLimit: null,
    minHeight: '420px'
  }
)

const emit = defineEmits<{ 'update:modelValue': [html: string] }>()

// Tiptap parses HTML content via the DOM, so the editor instance
// can only be created on the client - never during SSR.
const editor = shallowRef<Editor | null>(null)

onMounted(() => {
  editor.value = useRichEditor({
    content: props.modelValue,
    placeholder: props.placeholder,
    editable: props.editable,
    charLimit: props.charLimit,
    onUpdateHtml: (html) => emit('update:modelValue', html)
  })
})

onBeforeUnmount(() => editor.value?.destroy())

watch(
  () => props.modelValue,
  (value) => {
    if (editor.value && value !== editor.value.getHTML()) {
      editor.value.commands.setContent(value, { emitUpdate: false })
    }
  }
)

watch(
  () => props.editable,
  (value) => editor.value?.setEditable(value)
)

const fullscreen = ref(false)
const findOpen = ref(false)
const linkDialogOpen = ref(false)
const imageDialogOpen = ref(false)
const sourceDialogOpen = ref(false)
const anchorDialogOpen = ref(false)
const embedDialogOpen = ref(false)
const previewDialogOpen = ref(false)
const wordCountDialogOpen = ref(false)
const tablePropertiesOpen = ref(false)
const showVisualBlocks = ref(false)
const showVisualChars = ref(false)

function toggleFullscreen() {
  fullscreen.value = !fullscreen.value
}

function toggleFind() {
  findOpen.value = !findOpen.value
  if (!findOpen.value) editor.value?.commands.setSearchTerm('')
}

function closeFind() {
  findOpen.value = false
  editor.value?.commands.setSearchTerm('')
}

// --- Link dialog ---
function openLinkDialog() {
  linkDialogOpen.value = true
}
function applyLink(url: string, openInNewTab: boolean) {
  editor.value
    ?.chain()
    .focus()
    .extendMarkRange('link')
    .setLink({ href: url, target: openInNewTab ? '_blank' : null })
    .run()
  linkDialogOpen.value = false
}
function removeLink() {
  editor.value?.chain().focus().extendMarkRange('link').unsetLink().run()
  linkDialogOpen.value = false
}

// --- Image dialog ---
function insertImage(src: string, alt: string) {
  editor.value?.chain().focus().setImage({ src, alt }).run()
  imageDialogOpen.value = false
}

// --- Source dialog ---
function applySource(html: string) {
  editor.value?.commands.setContent(html)
  sourceDialogOpen.value = false
}

// --- Anchor dialog ---
function insertAnchor(name: string) {
  editor.value?.commands.setAnchor(name)
  anchorDialogOpen.value = false
}

// --- Embed dialog ---
function insertYoutube(url: string) {
  editor.value?.commands.setYoutubeVideo({ src: url })
  embedDialogOpen.value = false
}
function insertGenericEmbed(url: string) {
  editor.value?.commands.setIframeEmbed(url)
  embedDialogOpen.value = false
}

// --- Table properties dialog ---
function applyTableProperties(align: string, borderColor: string | null) {
  editor.value?.chain().focus().updateAttributes('table', { align, borderColor }).run()
  tablePropertiesOpen.value = false
}

// --- Page-level tools ---
function insertPageBreak() {
  editor.value?.commands.setPageBreak()
}

function printDocument() {
  if (!editor.value) return
  const html = editor.value.getHTML()
  const iframe = document.createElement('iframe')
  iframe.style.position = 'fixed'
  iframe.style.inset = '0'
  iframe.style.width = '0'
  iframe.style.height = '0'
  iframe.style.border = '0'
  document.body.appendChild(iframe)
  const doc = iframe.contentWindow?.document
  if (doc) {
    doc.open()
    doc.write(`<!DOCTYPE html><html dir="rtl" lang="fa"><head><meta charset="utf-8">
      <style>
        body { font-family: sans-serif; line-height: 1.8; padding: 24px; }
        .rte-page-break { border: none; page-break-after: always; }
        img { max-width: 100%; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ccc; padding: 6px 10px; }
      </style>
    </head><body>${html}</body></html>`)
    doc.close()
    iframe.contentWindow?.focus()
    iframe.contentWindow?.print()
  }
  setTimeout(() => document.body.removeChild(iframe), 1000)
}
</script>

<template>
  <v-card v-if="editor" class="rte" :class="{ 'rte-fullscreen': fullscreen }" rounded="lg" border>
    <MenuBar
      :editor="editor"
      :fullscreen="fullscreen"
      :find-open="findOpen"
      :show-visual-blocks="showVisualBlocks"
      :show-visual-chars="showVisualChars"
      @open-link="openLinkDialog"
      @open-image="imageDialogOpen = true"
      @open-source="sourceDialogOpen = true"
      @open-anchor="anchorDialogOpen = true"
      @open-embed="embedDialogOpen = true"
      @open-preview="previewDialogOpen = true"
      @open-word-count="wordCountDialogOpen = true"
      @open-table-properties="tablePropertiesOpen = true"
      @insert-page-break="insertPageBreak"
      @print="printDocument"
      @toggle-visual-blocks="showVisualBlocks = !showVisualBlocks"
      @toggle-visual-chars="showVisualChars = !showVisualChars"
      @toggle-fullscreen="toggleFullscreen"
      @toggle-find="toggleFind"
    />
    <Toolbar
      :editor="editor"
      :fullscreen="fullscreen"
      :find-open="findOpen"
      :show-visual-blocks="showVisualBlocks"
      :show-visual-chars="showVisualChars"
      @open-link="openLinkDialog"
      @open-image="imageDialogOpen = true"
      @open-source="sourceDialogOpen = true"
      @open-anchor="anchorDialogOpen = true"
      @open-embed="embedDialogOpen = true"
      @open-preview="previewDialogOpen = true"
      @open-word-count="wordCountDialogOpen = true"
      @insert-page-break="insertPageBreak"
      @print="printDocument"
      @toggle-visual-blocks="showVisualBlocks = !showVisualBlocks"
      @toggle-visual-chars="showVisualChars = !showVisualChars"
      @toggle-fullscreen="toggleFullscreen"
      @toggle-find="toggleFind"
    />

    <FindReplacePanel v-if="findOpen" :editor="editor" @close="closeFind" />

    <div class="rte-canvas">
      <v-sheet class="rte-page" elevation="2" rounded="lg" :style="{ minHeight }">
        <SelectionBubbleMenu :editor="editor" @open-link="openLinkDialog" />
        <TableBubbleMenu :editor="editor" @open-properties="tablePropertiesOpen = true" />
        <ImageBubbleMenu :editor="editor" />
        <LayoutBubbleMenu :editor="editor" />
        <EditorContent
          class="rte-content"
          :class="{ 'show-visual-blocks': showVisualBlocks, 'show-visual-chars': showVisualChars }"
          :editor="editor"
        />
      </v-sheet>
    </div>

    <StatusBar :editor="editor" :char-limit="charLimit" />

    <LinkDialog
      v-if="linkDialogOpen"
      :initial-url="editor.getAttributes('link').href"
      :has-existing-link="editor.isActive('link')"
      @close="linkDialogOpen = false"
      @apply="applyLink"
      @remove="removeLink"
    />
    <ImageDialog v-if="imageDialogOpen" @close="imageDialogOpen = false" @insert="insertImage" />
    <SourceCodeDialog
      v-if="sourceDialogOpen"
      :html="editor.getHTML()"
      @close="sourceDialogOpen = false"
      @apply="applySource"
    />
    <AnchorDialog v-if="anchorDialogOpen" @close="anchorDialogOpen = false" @insert="insertAnchor" />
    <EmbedDialog
      v-if="embedDialogOpen"
      @close="embedDialogOpen = false"
      @insert-youtube="insertYoutube"
      @insert-generic="insertGenericEmbed"
    />
    <PreviewDialog v-if="previewDialogOpen" :html="editor.getHTML()" @close="previewDialogOpen = false" />
    <WordCountDialog v-if="wordCountDialogOpen" :editor="editor" @close="wordCountDialogOpen = false" />
    <TablePropertiesDialog
      v-if="tablePropertiesOpen"
      :initial-align="editor.getAttributes('table').align"
      :initial-border-color="editor.getAttributes('table').borderColor"
      @close="tablePropertiesOpen = false"
      @apply="applyTableProperties"
    />
  </v-card>
  <v-sheet v-else class="rte-loading" border rounded="lg" :style="{ minHeight }">
    در حال بارگذاری ادیتور…
  </v-sheet>
</template>

<style scoped>
.rte {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.rte-fullscreen {
  position: fixed;
  inset: 0;
  z-index: 100;
  border-radius: 0 !important;
}

.rte-canvas {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  justify-content: center;
  background: rgb(var(--v-theme-background));
}

.rte-page {
  width: 100%;
  max-width: 820px;
  position: relative;
}

.rte-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(var(--v-theme-on-surface), 0.6);
  font-size: 13px;
}
</style>