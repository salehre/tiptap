<script setup lang="ts">
import type { Editor } from '@tiptap/vue-3'
import {
  List,
  ListOrdered,
  ListTodo,
  Quote,
  Minus,
  IndentIncrease,
  IndentDecrease,
  Languages
} from '@lucide/vue'
import DropdownMenuButton from './DropdownMenuButton.vue'

const props = defineProps<{ editor: Editor }>()

function toggleDirection() {
  const current = props.editor.getAttributes('paragraph').dir || props.editor.getAttributes('heading').dir
  if (current === 'ltr') props.editor.chain().focus().setTextDirection('rtl').run()
  else props.editor.chain().focus().setTextDirection('ltr').run()
}
</script>

<template>
  <DropdownMenuButton title="لیست و پاراگراف" :active="editor.isActive('bulletList') || editor.isActive('orderedList') || editor.isActive('taskList') || editor.isActive('blockquote')" min-width="200px">
    <template #icon>
      <List :size="18" />
    </template>
    <template #default="{ close }">
      <v-list-item
        :active="editor.isActive('bulletList')"
        @click="editor.chain().focus().toggleBulletList().run(); close()"
      >
        <template #prepend><List :size="16" class="me-2" /></template>
        <v-list-item-title>لیست نقطه‌ای</v-list-item-title>
      </v-list-item>
      <v-list-item
        :active="editor.isActive('orderedList')"
        @click="editor.chain().focus().toggleOrderedList().run(); close()"
      >
        <template #prepend><ListOrdered :size="16" class="me-2" /></template>
        <v-list-item-title>لیست شماره‌دار</v-list-item-title>
      </v-list-item>
      <v-list-item
        :active="editor.isActive('taskList')"
        @click="editor.chain().focus().toggleTaskList().run(); close()"
      >
        <template #prepend><ListTodo :size="16" class="me-2" /></template>
        <v-list-item-title>چک‌لیست</v-list-item-title>
      </v-list-item>
      <v-list-item
        :active="editor.isActive('blockquote')"
        @click="editor.chain().focus().toggleBlockquote().run(); close()"
      >
        <template #prepend><Quote :size="16" class="me-2" /></template>
        <v-list-item-title>نقل قول</v-list-item-title>
      </v-list-item>
      <v-list-item @click="editor.chain().focus().setHorizontalRule().run(); close()">
        <template #prepend><Minus :size="16" class="me-2" /></template>
        <v-list-item-title>خط افقی</v-list-item-title>
      </v-list-item>

      <v-divider class="my-1" />

      <v-list-item @click="editor.chain().focus().indent().run(); close()">
        <template #prepend><IndentIncrease :size="16" class="me-2" /></template>
        <v-list-item-title>افزایش تورفتگی</v-list-item-title>
      </v-list-item>
      <v-list-item @click="editor.chain().focus().outdent().run(); close()">
        <template #prepend><IndentDecrease :size="16" class="me-2" /></template>
        <v-list-item-title>کاهش تورفتگی</v-list-item-title>
      </v-list-item>
      <v-list-item @click="toggleDirection(); close()">
        <template #prepend><Languages :size="16" class="me-2" /></template>
        <v-list-item-title>تغییر جهت متن</v-list-item-title>
      </v-list-item>
    </template>
  </DropdownMenuButton>
</template>