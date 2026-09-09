<script setup lang="ts">
import { BubbleMenu } from '@tiptap/vue-3/menus'
import type { Editor } from '@tiptap/vue-3'
import {
  ArrowUpToLine,
  ArrowDownToLine,
  ArrowLeftToLine,
  ArrowRightToLine,
  Trash2,
  Combine,
  SquareSplitHorizontal
} from '@lucide/vue'

const props = defineProps<{ editor: Editor }>()
</script>

<template>
  <BubbleMenu
    :editor="props.editor"
    :should-show="({ editor }) => editor.isActive('table')"
    :options="{ placement: 'top' }"
    class="tbl-menu"
  >
    <v-card elevation="8" rounded="lg" class="d-flex align-center pa-1 ga-1">
      <v-btn icon size="small" density="comfortable" variant="text" title="افزودن سطر بالا" @click="editor.chain().focus().addRowBefore().run()">
        <ArrowUpToLine :size="16" />
      </v-btn>
      <v-btn icon size="small" density="comfortable" variant="text" title="افزودن سطر پایین" @click="editor.chain().focus().addRowAfter().run()">
        <ArrowDownToLine :size="16" />
      </v-btn>
      <v-btn icon size="small" density="comfortable" variant="text" title="افزودن ستون قبل" @click="editor.chain().focus().addColumnBefore().run()">
        <ArrowRightToLine :size="16" />
      </v-btn>
      <v-btn icon size="small" density="comfortable" variant="text" title="افزودن ستون بعد" @click="editor.chain().focus().addColumnAfter().run()">
        <ArrowLeftToLine :size="16" />
      </v-btn>
      <v-btn icon size="small" density="comfortable" variant="text" title="ادغام سلول‌ها" @click="editor.chain().focus().mergeCells().run()">
        <Combine :size="16" />
      </v-btn>
      <v-btn icon size="small" density="comfortable" variant="text" title="تفکیک سلول" @click="editor.chain().focus().splitCell().run()">
        <SquareSplitHorizontal :size="16" />
      </v-btn>
      <v-btn icon size="small" density="comfortable" variant="text" title="حذف سطر" @click="editor.chain().focus().deleteRow().run()">
        <Trash2 :size="16" />
      </v-btn>
      <v-btn icon size="small" density="comfortable" variant="text" color="error" title="حذف جدول" @click="editor.chain().focus().deleteTable().run()">
        <Trash2 :size="16" />
      </v-btn>
    </v-card>
  </BubbleMenu>
</template>
