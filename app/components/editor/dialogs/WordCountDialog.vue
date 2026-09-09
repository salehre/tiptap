<script setup lang="ts">
import { computed } from 'vue'
import type { Editor } from '@tiptap/vue-3'

const props = defineProps<{ editor: Editor }>()
const emit = defineEmits<{ close: [] }>()

const text = computed(() => props.editor.getText())
const words = computed(() => props.editor.storage.characterCount.words())
const chars = computed(() => props.editor.storage.characterCount.characters())
const charsNoSpaces = computed(() => text.value.replace(/\s/g, '').length)
const paragraphs = computed(() => Math.max(1, props.editor.state.doc.childCount))
const readingMinutes = computed(() => Math.max(1, Math.round(words.value / 200)))

const rows = computed(() => [
  { label: 'کلمات', value: words.value },
  { label: 'نویسه‌ها (با فاصله)', value: chars.value },
  { label: 'نویسه‌ها (بدون فاصله)', value: charsNoSpaces.value },
  { label: 'پاراگراف‌ها', value: paragraphs.value },
  { label: 'زمان تقریبی مطالعه', value: `${readingMinutes.value} دقیقه` }
])
</script>

<template>
  <v-dialog :model-value="true" max-width="360" @update:model-value="emit('close')">
    <v-card title="آمار سند">
      <v-list density="compact">
        <v-list-item v-for="row in rows" :key="row.label">
          <div class="d-flex justify-space-between w-100">
            <span class="text-medium-emphasis">{{ row.label }}</span>
            <span class="font-weight-medium">{{ row.value }}</span>
          </div>
        </v-list-item>
      </v-list>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="emit('close')">بستن</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>