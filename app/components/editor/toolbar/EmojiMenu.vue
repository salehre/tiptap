<script setup lang="ts">
import { ref } from 'vue'
import type { Editor } from '@tiptap/vue-3'
import { SmilePlus } from '@lucide/vue'
import ToolbarIconBtn from './ToolbarIconBtn.vue'

const props = defineProps<{ editor: Editor }>()

const menu = ref(false)

const EMOJIS = [
  '😀', '😂', '😊', '😍', '🤔', '😎', '😢', '😡',
  '👍', '👎', '👏', '🙏', '💪', '🎉', '✅', '❌',
  '❤️', '🔥', '⭐', '💡', '📌', '📎', '⏰', '🚀'
]

function insert(emoji: string) {
  props.editor.chain().focus().insertContent(emoji).run()
  menu.value = false
}
</script>

<template>
  <v-menu v-model="menu" :close-on-content-click="false" location="bottom">
    <template #activator="{ props: menuProps }">
      <span v-bind="menuProps">
        <ToolbarIconBtn title="ایموجی">
          <SmilePlus :size="18" />
        </ToolbarIconBtn>
      </span>
    </template>

    <v-card class="pa-2" width="216">
      <div class="emoji-grid">
        <button v-for="e in EMOJIS" :key="e" type="button" class="emoji-cell" @click="insert(e)">
          {{ e }}
        </button>
      </div>
    </v-card>
  </v-menu>
</template>

<style scoped>
.emoji-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 2px;
}
.emoji-cell {
  width: 24px;
  height: 24px;
  border: none;
  background: none;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  border-radius: 4px;
}
.emoji-cell:hover {
  background: rgba(0, 0, 0, 0.06);
}
</style>