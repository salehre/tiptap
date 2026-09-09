<script setup lang="ts">
import { BubbleMenu } from '@tiptap/vue-3/menus'
import type { Editor } from '@tiptap/vue-3'
import { Bold, Italic, Underline, Strikethrough, Code, Link2, Highlighter } from '@lucide/vue'

const props = defineProps<{ editor: Editor }>()
const emit = defineEmits<{ 'open-link': [] }>()
</script>

<template>
  <BubbleMenu
    :editor="props.editor"
    :should-show="({ state }) => !state.selection.empty"
    class="sel-menu"
  >
    <v-card color="#201f1c" elevation="8" rounded="lg" class="d-flex align-center pa-1 ga-1">
      <v-btn icon size="small" density="comfortable" variant="text" :color="editor.isActive('bold') ? 'primary' : 'white'" @click="editor.chain().focus().toggleBold().run()">
        <Bold :size="16" />
      </v-btn>
      <v-btn icon size="small" density="comfortable" variant="text" :color="editor.isActive('italic') ? 'primary' : 'white'" @click="editor.chain().focus().toggleItalic().run()">
        <Italic :size="16" />
      </v-btn>
      <v-btn icon size="small" density="comfortable" variant="text" :color="editor.isActive('underline') ? 'primary' : 'white'" @click="editor.chain().focus().toggleUnderline().run()">
        <Underline :size="16" />
      </v-btn>
      <v-btn icon size="small" density="comfortable" variant="text" :color="editor.isActive('strike') ? 'primary' : 'white'" @click="editor.chain().focus().toggleStrike().run()">
        <Strikethrough :size="16" />
      </v-btn>
      <v-btn icon size="small" density="comfortable" variant="text" :color="editor.isActive('code') ? 'primary' : 'white'" @click="editor.chain().focus().toggleCode().run()">
        <Code :size="16" />
      </v-btn>
      <v-btn icon size="small" density="comfortable" variant="text" :color="editor.isActive('highlight') ? 'primary' : 'white'" @click="editor.chain().focus().toggleHighlight().run()">
        <Highlighter :size="16" />
      </v-btn>
      <v-btn icon size="small" density="comfortable" variant="text" :color="editor.isActive('link') ? 'primary' : 'white'" @click="emit('open-link')">
        <Link2 :size="16" />
      </v-btn>
    </v-card>
  </BubbleMenu>
</template>

<style scoped>
.sel-menu :deep(.v-btn--variant-text .v-btn__overlay) {
  background: currentColor;
}
</style>
