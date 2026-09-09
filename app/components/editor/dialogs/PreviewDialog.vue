<script setup lang="ts">
defineProps<{ html: string }>()
const emit = defineEmits<{ close: [] }>()
</script>

<template>
  <v-dialog :model-value="true" max-width="900" scrollable @update:model-value="emit('close')">
    <v-card title="پیش‌نمایش سند">
      <v-card-text class="preview-body">
        <div class="rte-content">
          <div class="ProseMirror" v-html="html" />
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="emit('close')">بستن</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.preview-body {
  background: rgb(var(--v-theme-background));
  padding: 24px !important;
}
.rte-content {
  background: rgb(var(--v-theme-surface));
  border-radius: 8px;
  max-width: 760px;
  margin-inline: auto;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06), 0 8px 24px -12px rgba(0, 0, 0, 0.16);
}
</style>