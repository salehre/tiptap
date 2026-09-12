<script setup lang="ts">
import { ref } from 'vue'
import { Copy, Check, Download } from '@lucide/vue'
import type { ExportResult } from '../../../utils/exportToFramework'

const props = defineProps<{ result: ExportResult; title: string }>()
const emit = defineEmits<{ close: [] }>()

const copied = ref(false)

async function copyCode() {
  try {
    await navigator.clipboard.writeText(props.result.code)
    copied.value = true
    setTimeout(() => (copied.value = false), 1500)
  } catch {
    // clipboard API unavailable - user can still select the text manually
  }
}

function downloadCode() {
  const blob = new Blob([props.result.code], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = props.result.filename
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <v-dialog :model-value="true" max-width="720" scrollable @update:model-value="emit('close')">
    <v-card :title="title">
      <v-card-text>
        <v-alert
          v-if="result.notes.length"
          type="info"
          variant="tonal"
          density="compact"
          class="mb-3 text-caption"
        >
          <div v-for="(note, i) in result.notes" :key="i">{{ note }}</div>
        </v-alert>

        <pre class="code-block"><code>{{ result.code }}</code></pre>
      </v-card-text>
      <v-card-actions>
        <span class="text-caption text-medium-emphasis ms-2">{{ result.filename }}</span>
        <v-spacer />
        <v-btn variant="text" prepend-icon="" @click="downloadCode">
          <Download :size="16" class="me-1" />
          دانلود
        </v-btn>
        <v-btn variant="text" @click="copyCode">
          <component :is="copied ? Check : Copy" :size="16" class="me-1" />
          {{ copied ? 'کپی شد' : 'کپی کد' }}
        </v-btn>
        <v-btn variant="flat" color="primary" @click="emit('close')">بستن</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.code-block {
  background: rgb(var(--v-theme-background));
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 6px;
  padding: 16px;
  max-height: 420px;
  overflow: auto;
  direction: ltr;
  text-align: left;
  font-family: var(--font-mono);
  font-size: 12.5px;
  line-height: 1.6;
  white-space: pre;
}
</style>