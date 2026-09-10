<script setup lang="ts">
import type { Editor } from '@tiptap/vue-3'
import { Strikethrough, Code, Subscript, Superscript, Eraser, MoreHorizontal } from '@lucide/vue'
import DropdownMenuButton from './DropdownMenuButton.vue'

const props = defineProps<{ editor: Editor }>()
</script>

<template>
  <DropdownMenuButton title="قالب‌بندی بیشتر" min-width="180px">
    <template #icon>
      <MoreHorizontal :size="18" />
    </template>
    <template #default="{ close }">
      <v-list-item
        :active="editor.isActive('strike')"
        @click="editor.chain().focus().toggleStrike().run(); close()"
      >
        <template #prepend><Strikethrough :size="16" class="me-2" /></template>
        <v-list-item-title>خط‌خورده</v-list-item-title>
      </v-list-item>
      <v-list-item
        :active="editor.isActive('code')"
        @click="editor.chain().focus().toggleCode().run(); close()"
      >
        <template #prepend><Code :size="16" class="me-2" /></template>
        <v-list-item-title>کد درون‌خطی</v-list-item-title>
      </v-list-item>
      <v-list-item
        :active="editor.isActive('subscript')"
        @click="editor.chain().focus().toggleSubscript().run(); close()"
      >
        <template #prepend><Subscript :size="16" class="me-2" /></template>
        <v-list-item-title>زیرنویس</v-list-item-title>
      </v-list-item>
      <v-list-item
        :active="editor.isActive('superscript')"
        @click="editor.chain().focus().toggleSuperscript().run(); close()"
      >
        <template #prepend><Superscript :size="16" class="me-2" /></template>
        <v-list-item-title>بالانویس</v-list-item-title>
      </v-list-item>
      <v-divider class="my-1" />
      <v-list-item @click="editor.chain().focus().unsetAllMarks().clearNodes().run(); close()">
        <template #prepend><Eraser :size="16" class="me-2" /></template>
        <v-list-item-title>حذف قالب‌بندی</v-list-item-title>
      </v-list-item>
    </template>
  </DropdownMenuButton>
</template>