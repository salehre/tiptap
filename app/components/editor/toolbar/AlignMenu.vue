<script setup lang="ts">
import { computed } from 'vue'
import type { Editor } from '@tiptap/vue-3'
import { AlignRight, AlignCenter, AlignLeft, AlignJustify } from '@lucide/vue'
import DropdownMenuButton from './DropdownMenuButton.vue'

const props = defineProps<{ editor: Editor }>()

const currentIcon = computed(() => {
  if (props.editor.isActive({ textAlign: 'center' })) return AlignCenter
  if (props.editor.isActive({ textAlign: 'left' })) return AlignLeft
  if (props.editor.isActive({ textAlign: 'justify' })) return AlignJustify
  return AlignRight
})
</script>

<template>
  <DropdownMenuButton title="تراز متن" min-width="160px">
    <template #icon>
      <component :is="currentIcon" :size="18" />
    </template>
    <template #default="{ close }">
      <v-list-item
        :active="editor.isActive({ textAlign: 'right' })"
        @click="editor.chain().focus().setTextAlign('right').run(); close()"
      >
        <template #prepend><AlignRight :size="16" class="me-2" /></template>
        <v-list-item-title>راست‌چین</v-list-item-title>
      </v-list-item>
      <v-list-item
        :active="editor.isActive({ textAlign: 'center' })"
        @click="editor.chain().focus().setTextAlign('center').run(); close()"
      >
        <template #prepend><AlignCenter :size="16" class="me-2" /></template>
        <v-list-item-title>وسط‌چین</v-list-item-title>
      </v-list-item>
      <v-list-item
        :active="editor.isActive({ textAlign: 'left' })"
        @click="editor.chain().focus().setTextAlign('left').run(); close()"
      >
        <template #prepend><AlignLeft :size="16" class="me-2" /></template>
        <v-list-item-title>چپ‌چین</v-list-item-title>
      </v-list-item>
      <v-list-item
        :active="editor.isActive({ textAlign: 'justify' })"
        @click="editor.chain().focus().setTextAlign('justify').run(); close()"
      >
        <template #prepend><AlignJustify :size="16" class="me-2" /></template>
        <v-list-item-title>تراز از دو طرف</v-list-item-title>
      </v-list-item>
    </template>
  </DropdownMenuButton>
</template>