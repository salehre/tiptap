<script setup lang="ts">
import { ref } from 'vue'
import type { Editor } from '@tiptap/vue-3'
import { CalendarClock, MoveHorizontal } from '@lucide/vue'
import ToolbarIconBtn from './ToolbarIconBtn.vue'

const props = defineProps<{ editor: Editor }>()

const menu = ref(false)

function insertDate() {
  const text = new Date().toLocaleDateString('fa-IR')
  props.editor.chain().focus().insertContent(text).run()
  menu.value = false
}

function insertDateTime() {
  const text = new Date().toLocaleString('fa-IR')
  props.editor.chain().focus().insertContent(text).run()
  menu.value = false
}

function insertNbsp() {
  props.editor.chain().focus().insertContent('\u00A0').run()
  menu.value = false
}
</script>

<template>
  <v-menu v-model="menu" location="bottom">
    <template #activator="{ props: menuProps }">
      <span v-bind="menuProps">
        <ToolbarIconBtn title="درج تاریخ / فاصله">
          <CalendarClock :size="18" />
        </ToolbarIconBtn>
      </span>
    </template>

    <v-list density="compact">
      <v-list-item title="درج تاریخ امروز" @click="insertDate" />
      <v-list-item title="درج تاریخ و ساعت" @click="insertDateTime" />
      <v-list-item @click="insertNbsp">
        <template #prepend>
          <MoveHorizontal :size="16" class="me-2" />
        </template>
        <v-list-item-title>فاصله‌ی نیم‌فاصله (non-breaking space)</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>