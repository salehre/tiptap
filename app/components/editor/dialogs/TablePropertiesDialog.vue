<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  initialAlign?: string
  initialBorderColor?: string | null
}>()

const emit = defineEmits<{
  close: []
  apply: [align: string, borderColor: string | null]
}>()

const align = ref(props.initialAlign ?? 'center')
const borderColor = ref(props.initialBorderColor ?? '#c7c3b6')

const ALIGN_OPTIONS = [
  { value: 'left', title: 'چپ' },
  { value: 'center', title: 'وسط' },
  { value: 'right', title: 'راست' }
]
</script>

<template>
  <v-dialog :model-value="true" max-width="360" @update:model-value="emit('close')">
    <v-card title="ویژگی‌های جدول">
      <v-card-text class="d-flex flex-column ga-4">
        <v-btn-toggle v-model="align" mandatory density="comfortable" variant="outlined" divided>
          <v-btn v-for="opt in ALIGN_OPTIONS" :key="opt.value" :value="opt.value" size="small">
            {{ opt.title }}
          </v-btn>
        </v-btn-toggle>

        <div>
          <p class="text-caption text-medium-emphasis mb-1">رنگ حاشیه</p>
          <v-color-picker v-model="borderColor" hide-inputs mode="hex" />
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="emit('close')">انصراف</v-btn>
        <v-btn color="primary" variant="flat" @click="emit('apply', align, borderColor)">اعمال</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>