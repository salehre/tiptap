<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  initialUrl?: string
  initialOpenInNewTab?: boolean
  hasExistingLink?: boolean
}>()

const emit = defineEmits<{
  close: []
  apply: [url: string, openInNewTab: boolean]
  remove: []
}>()

const url = ref(props.initialUrl ?? '')
const openInNewTab = ref(props.initialOpenInNewTab ?? true)

function submit() {
  if (!url.value.trim()) return
  emit('apply', url.value.trim(), openInNewTab.value)
}
</script>

<template>
  <v-dialog :model-value="true" max-width="420" @update:model-value="emit('close')">
    <v-card title="افزودن لینک">
      <v-card-text class="d-flex flex-column ga-3">
        <v-text-field
          v-model="url"
          label="آدرس (URL)"
          placeholder="https://example.com"
          variant="outlined"
          density="comfortable"
          dir="ltr"
          autofocus
          hide-details
          @keydown.enter="submit"
        />
        <v-checkbox v-model="openInNewTab" label="باز شدن در تب جدید" density="compact" hide-details />
      </v-card-text>
      <v-card-actions>
        <v-btn v-if="props.hasExistingLink" color="error" variant="text" @click="emit('remove')">حذف لینک</v-btn>
        <v-spacer />
        <v-btn variant="text" @click="emit('close')">انصراف</v-btn>
        <v-btn color="primary" variant="flat" @click="submit">اعمال</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
