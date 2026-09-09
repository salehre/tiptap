<script setup lang="ts">
import { ref, shallowRef, watch, onMounted, onBeforeUnmount } from 'vue'
import { EditorContent, type Editor } from '@tiptap/vue-3'
import { useRichEditor } from '../../composables/useRichEditor'
import Toolbar from './Toolbar.vue'
import StatusBar from './StatusBar.vue'
import SelectionBubbleMenu from './SelectionBubbleMenu.vue'
import TableBubbleMenu from './TableBubbleMenu.vue'
import FindReplacePanel from './FindReplacePanel.vue'
import LinkDialog from './dialogs/LinkDialog.vue'
import ImageDialog from './dialogs/ImageDialog.vue'
import SourceCodeDialog from './dialogs/SourceCodeDialog.vue'

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
</script>

<template>
  <v-card v-if="editor" class="rte" :class="{ 'rte-fullscreen': fullscreen }" rounded="lg" border>
    <Toolbar
      :editor="editor"
      :fullscreen="fullscreen"
      :find-open="findOpen"
      @open-link="openLinkDialog"
      @open-image="imageDialogOpen = true"
      @open-source="sourceDialogOpen = true"
      @toggle-fullscreen="toggleFullscreen"
      @toggle-find="toggleFind"
    />

    <FindReplacePanel v-if="findOpen" :editor="editor" @close="closeFind" />

    <div class="rte-canvas">
      <v-sheet class="rte-page" elevation="2" rounded="lg" :style="{ minHeight }">
        <SelectionBubbleMenu :editor="editor" @open-link="openLinkDialog" />
        <TableBubbleMenu :editor="editor" />
        <EditorContent class="rte-content" :editor="editor" />
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
  z-index: 2400;
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
