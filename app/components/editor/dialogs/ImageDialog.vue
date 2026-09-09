<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  close: []
  insert: [src: string, alt: string]
}>()

const url = ref('')
const alt = ref('')
const preview = ref<string | null>(null)

function onFile(files: File[] | File | null) {
  const file = Array.isArray(files) ? files[0] : files
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    preview.value = String(reader.result)
  }
  reader.readAsDataURL(file)
}

function submit() {
  const src = preview.value ?? url.value.trim()
  if (!src) return
  emit('insert', src, alt.value.trim())
}
</script>

<template>
  <v-dialog :model-value="true" max-width="420" @update:model-value="emit('close')">
    <v-card title="افزودن تصویر">
      <v-card-text class="d-flex flex-column ga-3">
        <v-file-input
          label="آپلود از سیستم"
          accept="image/*"
          variant="outlined"
          density="comfortable"
          prepend-icon=""
          prepend-inner-icon="mdi-image-plus"
          hide-details
          @update:model-value="onFile"
        />

        <v-img v-if="preview" :src="preview" max-height="160" class="rounded-lg border" />

        <v-text-field
          v-model="url"
          label="یا آدرس تصویر (URL)"
          placeholder="https://example.com/photo.jpg"
          variant="outlined"
          density="comfortable"
          dir="ltr"
          :disabled="!!preview"
          hide-details
        />

        <v-text-field
          v-model="alt"
          label="متن جایگزین (alt)"
          placeholder="توضیح کوتاه تصویر"
          variant="outlined"
          density="comfortable"
          hide-details
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="emit('close')">انصراف</v-btn>
        <v-btn color="primary" variant="flat" @click="submit">درج تصویر</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
