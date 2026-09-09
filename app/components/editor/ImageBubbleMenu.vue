<script setup lang="ts">
import { computed } from 'vue'
import { BubbleMenu } from '@tiptap/vue-3/menus'
import type { Editor } from '@tiptap/vue-3'
import { AlignLeft, AlignCenter, AlignRight, Captions, RotateCcw, Trash2 } from '@lucide/vue'

const props = defineProps<{ editor: Editor }>()

const hasCaption = computed(() => props.editor.getAttributes('image').caption != null)

function toggleCaption() {
  if (hasCaption.value) props.editor.commands.setImageCaption(null)
  else props.editor.commands.setImageCaption('')
}
</script>

<template>
  <BubbleMenu
    :editor="props.editor"
    :should-show="({ editor }) => editor.isActive('image')"
    :options="{ placement: 'top' }"
    class="img-menu"
  >
    <v-card elevation="8" rounded="lg" class="d-flex align-center pa-1 ga-1">
      <v-btn
        icon size="small" density="comfortable" variant="text"
        :color="editor.getAttributes('image').align === 'left' ? 'primary' : undefined"
        title="چپ‌چین"
        @click="editor.commands.setImageAlign('left')"
      >
        <AlignLeft :size="16" />
      </v-btn>
      <v-btn
        icon size="small" density="comfortable" variant="text"
        :color="editor.getAttributes('image').align === 'center' ? 'primary' : undefined"
        title="وسط‌چین"
        @click="editor.commands.setImageAlign('center')"
      >
        <AlignCenter :size="16" />
      </v-btn>
      <v-btn
        icon size="small" density="comfortable" variant="text"
        :color="editor.getAttributes('image').align === 'right' ? 'primary' : undefined"
        title="راست‌چین"
        @click="editor.commands.setImageAlign('right')"
      >
        <AlignRight :size="16" />
      </v-btn>
      <v-divider vertical class="mx-1" />
      <v-btn
        icon size="small" density="comfortable" variant="text"
        :color="hasCaption ? 'primary' : undefined"
        title="زیرنویس تصویر"
        @click="toggleCaption"
      >
        <Captions :size="16" />
      </v-btn>
      <v-btn
        icon size="small" density="comfortable" variant="text"
        title="بازگشت به اندازه‌ی اصلی"
        @click="editor.chain().focus().updateAttributes('image', { width: null }).run()"
      >
        <RotateCcw :size="16" />
      </v-btn>
      <v-btn
        icon size="small" density="comfortable" variant="text" color="error"
        title="حذف تصویر"
        @click="editor.chain().focus().deleteSelection().run()"
      >
        <Trash2 :size="16" />
      </v-btn>
    </v-card>
  </BubbleMenu>
</template>