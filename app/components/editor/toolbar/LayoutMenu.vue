<script setup lang="ts">
import { ref } from 'vue'
import type { Editor } from '@tiptap/vue-3'
import { Columns3 as LayoutIcon } from '@lucide/vue'
import ToolbarIconBtn from './ToolbarIconBtn.vue'

const props = defineProps<{ editor: Editor }>()

const menu = ref(false)

const OPTIONS = [
  { columns: 2, label: 'دو ستون', hint: 'مثلاً ۲ عکس کنار هم' },
  { columns: 3, label: 'سه ستون', hint: '۳ آیتم کنار هم' },
  { columns: 4, label: 'چهار ستون', hint: 'مثلاً ۴ عکس، دوتا-دوتا' }
]

function choose(columns: number) {
  props.editor.chain().focus().setColumnLayout(columns).run()
  menu.value = false
}
</script>

<template>
  <v-menu v-model="menu" location="bottom">
    <template #activator="{ props: menuProps }">
      <span v-bind="menuProps">
        <ToolbarIconBtn title="چیدمان ستونی (کنار هم چیدن تصاویر)">
          <LayoutIcon :size="18" />
        </ToolbarIconBtn>
      </span>
    </template>

    <v-list density="compact">
      <v-list-item
        v-for="opt in OPTIONS"
        :key="opt.columns"
        :title="opt.label"
        :subtitle="opt.hint"
        @click="choose(opt.columns)"
      />
    </v-list>
  </v-menu>
</template>