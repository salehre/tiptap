<script setup lang="ts">
import { BubbleMenu } from '@tiptap/vue-3/menus'
import type { Editor } from '@tiptap/vue-3'
import { Rows3 as AddRowIcon, MinusSquare, Trash2 } from '@lucide/vue'

const props = defineProps<{ editor: Editor }>()
</script>

<template>
  <BubbleMenu
    :editor="props.editor"
    :should-show="({ editor }) => editor.isActive('columnLayout')"
    :options="{ placement: 'top' }"
    class="layout-menu"
  >
    <v-card elevation="8" rounded="lg" class="d-flex align-center pa-1 ga-1">
      <v-btn icon size="small" density="comfortable" variant="text" title="افزودن ردیف جدید" @click="editor.chain().focus().addColumnRow().run()">
        <AddRowIcon :size="16" />
      </v-btn>
      <v-btn icon size="small" density="comfortable" variant="text" title="حذف آخرین ردیف" @click="editor.chain().focus().removeColumnRow().run()">
        <MinusSquare :size="16" />
      </v-btn>
      <v-divider vertical class="mx-1" />
      <v-btn icon size="small" density="comfortable" variant="text" color="error" title="حذف چیدمان" @click="editor.chain().focus().deleteColumnLayout().run()">
        <Trash2 :size="16" />
      </v-btn>
    </v-card>
  </BubbleMenu>
</template>