<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Editor } from '@tiptap/vue-3'
import { ALargeSmall } from '@lucide/vue'
import ToolbarIconBtn from './ToolbarIconBtn.vue'

const props = defineProps<{ editor: Editor }>()
const menu = ref(false)

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
  { value: '', title: 'پیش‌فرض' },
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
  { value: '', title: 'پیش‌فرض' },
  { value: '1', title: '1' },
  { value: '1.15', title: '1.15' },
  { value: '1.5', title: '1.5' },
  { value: '2', title: '2' },
  { value: '2.5', title: '2.5' }
]
</script>

<template>
  <v-menu v-model="menu" :close-on-content-click="false" location="bottom">
    <template #activator="{ props: menuProps }">
      <span v-bind="menuProps">
        <ToolbarIconBtn title="فونت، اندازه و ارتفاع خط">
          <ALargeSmall :size="18" />
        </ToolbarIconBtn>
      </span>
    </template>

    <v-card class="pa-3 d-flex flex-column ga-3" width="220">
      <v-select
        v-model="fontFamily"
        :items="fontOptions"
        item-title="title"
        item-value="value"
        label="فونت"
        density="compact"
        variant="outlined"
        hide-details
      />
      <v-select
        v-model="fontSize"
        :items="fontSizeOptions"
        item-title="title"
        item-value="value"
        label="اندازه"
        density="compact"
        variant="outlined"
        hide-details
      />
      <v-select
        v-model="lineHeight"
        :items="lineHeightOptions"
        item-title="title"
        item-value="value"
        label="ارتفاع خط"
        density="compact"
        variant="outlined"
        hide-details
      />
    </v-card>
  </v-menu>
</template>