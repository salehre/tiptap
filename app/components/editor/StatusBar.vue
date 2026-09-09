<script setup lang="ts">
import type { Editor } from '@tiptap/vue-3'

defineProps<{ editor: Editor; charLimit?: number | null }>()
</script>

<template>
  <v-sheet color="background" class="status-bar d-flex align-center ga-2 px-4 py-1 text-caption text-medium-emphasis">
    <span>{{ editor.storage.characterCount.words() }} کلمه</span>
    <span class="status-dot" />
    <span>
      {{ editor.storage.characterCount.characters() }}
      <template v-if="charLimit"> / {{ charLimit }}</template>
      کاراکتر
    </span>
  </v-sheet>
</template>

<style scoped>
.status-bar {
  border-block-start: 1px solid rgb(var(--v-border-color));
}
.status-dot {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.5;
}
</style>
