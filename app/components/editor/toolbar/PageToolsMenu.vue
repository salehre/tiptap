<script setup lang="ts">
import {
  CodeXml,
  Eye,
  Printer,
  SquareDashedMousePointer,
  Pilcrow,
  SeparatorHorizontal,
  Calculator,
  LayoutPanelTop
} from '@lucide/vue'
import DropdownMenuButton from './DropdownMenuButton.vue'

defineProps<{ showVisualBlocks: boolean; showVisualChars: boolean }>()

const emit = defineEmits<{
  'open-source': []
  'open-preview': []
  print: []
  'toggle-visual-blocks': []
  'toggle-visual-chars': []
  'insert-page-break': []
  'open-word-count': []
}>()
</script>

<template>
  <DropdownMenuButton title="ابزارهای صفحه" min-width="220px">
    <template #icon>
      <LayoutPanelTop :size="18" />
    </template>
    <template #default="{ close }">
      <v-list-item @click="emit('open-source'); close()">
        <template #prepend><CodeXml :size="16" class="me-2" /></template>
        <v-list-item-title>کد HTML</v-list-item-title>
      </v-list-item>
      <v-list-item @click="emit('open-preview'); close()">
        <template #prepend><Eye :size="16" class="me-2" /></template>
        <v-list-item-title>پیش‌نمایش</v-list-item-title>
      </v-list-item>
      <v-list-item @click="emit('print'); close()">
        <template #prepend><Printer :size="16" class="me-2" /></template>
        <v-list-item-title>چاپ</v-list-item-title>
      </v-list-item>

      <v-divider class="my-1" />

      <v-list-item :active="showVisualBlocks" @click="emit('toggle-visual-blocks'); close()">
        <template #prepend><SquareDashedMousePointer :size="16" class="me-2" /></template>
        <v-list-item-title>نمایش کادر بلوک‌ها</v-list-item-title>
      </v-list-item>
      <v-list-item :active="showVisualChars" @click="emit('toggle-visual-chars'); close()">
        <template #prepend><Pilcrow :size="16" class="me-2" /></template>
        <v-list-item-title>نمایش نشانه‌ی پاراگراف</v-list-item-title>
      </v-list-item>
      <v-list-item @click="emit('insert-page-break'); close()">
        <template #prepend><SeparatorHorizontal :size="16" class="me-2" /></template>
        <v-list-item-title>درج پایان صفحه</v-list-item-title>
      </v-list-item>

      <v-divider class="my-1" />

      <v-list-item @click="emit('open-word-count'); close()">
        <template #prepend><Calculator :size="16" class="me-2" /></template>
        <v-list-item-title>آمار سند</v-list-item-title>
      </v-list-item>
    </template>
  </DropdownMenuButton>
</template>