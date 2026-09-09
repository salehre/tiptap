<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  close: []
  'insert-youtube': [url: string]
  'insert-generic': [url: string]
}>()

const url = ref('')

function isYoutube(value: string) {
  return /youtu\.?be/i.test(value)
}

function submit() {
  const value = url.value.trim()
  if (!value) return
  if (isYoutube(value)) emit('insert-youtube', value)
  else emit('insert-generic', value)
}
</script>

<template>
  <v-dialog :model-value="true" max-width="440" @update:model-value="emit('close')">
    <v-card title="جاسازی ویدیو / رسانه">
      <v-card-text class="d-flex flex-column ga-2">
        <v-text-field
          v-model="url"
          label="آدرس ویدیو"
          placeholder="https://www.youtube.com/watch?v=..."
          variant="outlined"
          density="comfortable"
          dir="ltr"
          autofocus
          hide-details
          @keydown.enter="submit"
        />
        <p class="text-caption text-medium-emphasis">
          لینک یوتیوب به‌صورت خودکار embed می‌شود. برای Vimeo، آپارات یا سرویس‌های دیگر، مستقیماً آدرس صفحه‌ی embed را وارد کنید.
        </p>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="emit('close')">انصراف</v-btn>
        <v-btn color="primary" variant="flat" @click="submit">جاسازی</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>