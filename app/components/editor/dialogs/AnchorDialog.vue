<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{ close: []; insert: [name: string] }>()

const name = ref('')

function submit() {
  const cleaned = name.value.trim().replace(/\s+/g, '-')
  if (!cleaned) return
  emit('insert', cleaned)
}
</script>

<template>
  <v-dialog :model-value="true" max-width="380" @update:model-value="emit('close')">
    <v-card title="افزودن لنگر (Anchor)">
      <v-card-text>
        <v-text-field
          v-model="name"
          label="نام لنگر"
          placeholder="مثلاً: بخش-دوم"
          variant="outlined"
          density="comfortable"
          dir="ltr"
          autofocus
          hide-details
          @keydown.enter="submit"
        />
        <p class="text-caption text-medium-emphasis mt-2">
          بعداً می‌توانید با لینک دادن به «#{{ name.trim().replace(/\s+/g, '-') || 'نام-لنگر' }}» به این نقطه از سند بپرید.
        </p>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="emit('close')">انصراف</v-btn>
        <v-btn color="primary" variant="flat" @click="submit">درج لنگر</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>