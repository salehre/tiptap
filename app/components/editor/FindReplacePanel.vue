<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { Editor } from '@tiptap/vue-3'
import { X, ChevronUp, ChevronDown } from '@lucide/vue'

const props = defineProps<{ editor: Editor }>()
const emit = defineEmits<{ close: [] }>()

const term = ref('')
const replacement = ref('')

const matchCount = computed(() => props.editor.storage.searchAndReplace.results.length as number)
const activeIndex = computed(() => props.editor.storage.searchAndReplace.activeIndex as number)

watch(term, (value) => {
  props.editor.commands.setSearchTerm(value)
})

function next() {
  props.editor.commands.nextMatch()
}
function prev() {
  props.editor.commands.previousMatch()
}
function replaceOne() {
  props.editor.commands.replaceActive(replacement.value)
}
function replaceAll() {
  props.editor.commands.replaceAll(replacement.value)
}
function close() {
  props.editor.commands.setSearchTerm('')
  emit('close')
}
</script>

<template>
  <v-card class="fr-panel pa-3" elevation="8" rounded="lg">
    <div class="d-flex align-center ga-2 mb-2">
      <v-text-field
        v-model="term"
        density="compact"
        variant="outlined"
        hide-details
        placeholder="جستجو در متن…"
        autofocus
        @keydown.enter.prevent="next"
      />
      <span class="text-caption text-medium-emphasis" style="white-space: nowrap; min-width: 70px; text-align: center">
        {{ matchCount ? `${activeIndex + 1} / ${matchCount}` : 'موردی یافت نشد' }}
      </span>
      <v-btn icon size="small" variant="text" :disabled="!matchCount" @click="prev">
        <ChevronUp :size="16" />
      </v-btn>
      <v-btn icon size="small" variant="text" :disabled="!matchCount" @click="next">
        <ChevronDown :size="16" />
      </v-btn>
      <v-btn icon size="small" variant="text" @click="close">
        <X :size="16" />
      </v-btn>
    </div>

    <div class="d-flex align-center ga-2">
      <v-text-field
        v-model="replacement"
        density="compact"
        variant="outlined"
        hide-details
        placeholder="جایگزینی با…"
        @keydown.enter.prevent="replaceOne"
      />
      <v-btn size="small" variant="tonal" :disabled="!matchCount" @click="replaceOne">جایگزینی</v-btn>
      <v-btn size="small" variant="tonal" :disabled="!matchCount" @click="replaceAll">جایگزینی همه</v-btn>
    </div>
  </v-card>
</template>

<style scoped>
.fr-panel {
  position: absolute;
  inset-inline-end: 16px;
  top: 12px;
  z-index: 20;
  width: min(360px, 90vw);
}
</style>
