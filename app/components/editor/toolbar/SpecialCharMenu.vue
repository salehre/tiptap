<script setup lang="ts">
import { ref } from 'vue'
import type { Editor } from '@tiptap/vue-3'
import { Omega } from '@lucide/vue'
import ToolbarIconBtn from './ToolbarIconBtn.vue'

const props = defineProps<{ editor: Editor }>()

const menu = ref(false)

const CHARS = [
  '©', '®', '™', '°', '±', '×', '÷', '≈',
  '≠', '≤', '≥', '∞', '√', 'π', 'Ω', 'µ',
  '§', '¶', '†', '‡', '•', '…', '‰', '¤',
  '←', '→', '↑', '↓', '↔', '½', '¼', '¾'
]

function insert(char: string) {
  props.editor.chain().focus().insertContent(char).run()
  menu.value = false
}
</script>

<template>
  <v-menu v-model="menu" :close-on-content-click="false" location="bottom">
    <template #activator="{ props: menuProps }">
      <span v-bind="menuProps">
        <ToolbarIconBtn title="نویسه‌های خاص">
          <Omega :size="17" />
        </ToolbarIconBtn>
      </span>
    </template>

    <v-card class="pa-2" width="216">
      <div class="char-grid">
        <button v-for="c in CHARS" :key="c" type="button" class="char-cell" @click="insert(c)">
          {{ c }}
        </button>
      </div>
    </v-card>
  </v-menu>
</template>

<style scoped>
.char-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 2px;
}
.char-cell {
  width: 24px;
  height: 24px;
  border: none;
  background: none;
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
  border-radius: 4px;
  color: rgb(var(--v-theme-on-surface));
}
.char-cell:hover {
  background: rgba(0, 0, 0, 0.06);
}
</style>