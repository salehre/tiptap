<script setup lang="ts">
import { ref } from 'vue'
import { BubbleMenu } from '@tiptap/vue-3/menus'
import type { Editor } from '@tiptap/vue-3'
import {
  ArrowUpToLine,
  ArrowDownToLine,
  ArrowLeftToLine,
  ArrowRightToLine,
  Trash2,
  Combine,
  SquareSplitHorizontal,
  PaintBucket,
  Rows3,
  Columns3,
  Settings2
} from '@lucide/vue'

const props = defineProps<{ editor: Editor }>()
const emit = defineEmits<{ 'open-properties': [] }>()

const bgMenu = ref(false)
const cellColor = ref('#e7edf6')

function applyCellColor(color: string) {
  props.editor.chain().focus().setCellAttribute('backgroundColor', color).run()
  bgMenu.value = false
}
function clearCellColor() {
  props.editor.chain().focus().setCellAttribute('backgroundColor', null).run()
  bgMenu.value = false
}
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

      <v-divider vertical class="mx-1" />

      <v-btn icon size="small" density="comfortable" variant="text" title="ادغام سلول‌ها" @click="editor.chain().focus().mergeCells().run()">
        <Combine :size="16" />
      </v-btn>
      <v-btn icon size="small" density="comfortable" variant="text" title="تفکیک سلول" @click="editor.chain().focus().splitCell().run()">
        <SquareSplitHorizontal :size="16" />
      </v-btn>

      <v-divider vertical class="mx-1" />

      <v-btn icon size="small" density="comfortable" variant="text" title="سطر عنوان" @click="editor.chain().focus().toggleHeaderRow().run()">
        <Rows3 :size="16" />
      </v-btn>
      <v-btn icon size="small" density="comfortable" variant="text" title="ستون عنوان" @click="editor.chain().focus().toggleHeaderColumn().run()">
        <Columns3 :size="16" />
      </v-btn>

      <v-menu v-model="bgMenu" :close-on-content-click="false" location="top">
        <template #activator="{ props: menuProps }">
          <v-btn v-bind="menuProps" icon size="small" density="comfortable" variant="text" title="رنگ پس‌زمینه‌ی سلول">
            <PaintBucket :size="16" />
          </v-btn>
        </template>
        <v-card class="pa-3" width="200">
          <v-color-picker v-model="cellColor" hide-inputs mode="hex" class="mb-2" />
          <div class="d-flex ga-2">
            <v-btn size="small" color="primary" variant="flat" block @click="applyCellColor(cellColor)">اعمال</v-btn>
            <v-btn size="small" variant="tonal" block @click="clearCellColor">حذف</v-btn>
          </div>
        </v-card>
      </v-menu>

      <v-btn icon size="small" density="comfortable" variant="text" title="ویژگی‌های جدول" @click="emit('open-properties')">
        <Settings2 :size="16" />
      </v-btn>

      <v-divider vertical class="mx-1" />

      <v-btn icon size="small" density="comfortable" variant="text" title="حذف سطر" @click="editor.chain().focus().deleteRow().run()">
        <Trash2 :size="16" />
      </v-btn>
      <v-btn icon size="small" density="comfortable" variant="text" color="error" title="حذف جدول" @click="editor.chain().focus().deleteTable().run()">
        <Trash2 :size="16" />
      </v-btn>
    </v-card>
  </BubbleMenu>
</template>
