<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{ html: string }>()
const emit = defineEmits<{ close: []; apply: [html: string] }>()

const draft = ref(props.html)
</script>

<template>
  <v-dialog :model-value="true" max-width="640" @update:model-value="emit('close')">
    <v-card title="مشاهده و ویرایش کد HTML">
      <v-card-text>
        <v-textarea
          v-model="draft"
          variant="outlined"
          density="comfortable"
          rows="12"
          dir="ltr"
          spellcheck="false"
          hide-details
          class="src-textarea"
        />
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="emit('close')">انصراف</v-btn>
        <v-btn color="primary" variant="flat" @click="emit('apply', draft)">اعمال تغییرات</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.src-textarea :deep(textarea) {
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 1.6;
}
</style>
