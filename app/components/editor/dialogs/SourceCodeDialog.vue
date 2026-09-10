<script setup lang="ts">
import { ref, computed } from 'vue'
import { PREVIEW_VIEWPORTS, type PreviewViewport } from '~/composables/usePreviewViewports.ts'

const props = defineProps<{ html: string }>()
const emit = defineEmits<{ close: []; apply: [html: string] }>()

const draft = ref(props.html)
const viewport = ref<PreviewViewport>('full')

const currentWidth = computed(
    () => PREVIEW_VIEWPORTS.find((v) => v.value === viewport.value)?.width ?? '100%'
)
</script>

<template>
  <v-dialog :model-value="true" max-width="1040" scrollable @update:model-value="emit('close')">
    <v-card title="کد HTML">
      <v-card-text class="src-body">
        <div class="src-pane">
          <p class="pane-label">کد</p>
          <v-textarea
              v-model="draft"
              variant="outlined"
              density="comfortable"
              rows="16"
              dir="ltr"
              spellcheck="false"
              hide-details
              class="src-textarea"
          />
        </div>
        <div class="src-pane">
          <div class="d-flex align-center justify-space-between mb-1">
            <p class="pane-label mb-0">پیش‌نمایش زنده</p>
            <div class="viewport-buttons">
              <v-btn
                  v-for="v in PREVIEW_VIEWPORTS"
                  :key="v.value"
                  :variant="viewport === v.value ? 'flat' : 'text'"
                  :color="viewport === v.value ? 'primary' : undefined"
                  icon
                  size="x-small"
                  :title="v.title"
                  @click="viewport = v.value"
              >
                <component :is="v.icon" :size="14" />
              </v-btn>
            </div>
          </div>
          <div class="live-preview-wrap">
            <div class="live-preview rte-content" :style="{ width: currentWidth }">
              <div class="ProseMirror" v-html="draft" />
            </div>
          </div>
        </div>
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
.src-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
@media (max-width: 720px) {
  .src-body {
    grid-template-columns: 1fr;
  }
}
.src-pane {
  min-width: 0;
}
.pane-label {
  font-size: 12px;
  color: rgba(var(--v-theme-on-surface), 0.6);
}
.src-textarea :deep(textarea) {
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 1.6;
}
.viewport-buttons {
  display: flex;
  gap: 2px;
}
.live-preview-wrap {
  display: flex;
  justify-content: center;
  background: rgb(var(--v-theme-background));
  border-radius: 4px;
  padding: 8px;
  min-height: 316px;
  max-height: 436px;
  overflow-y: auto;
}
.live-preview {
  max-width: 100%;
  transition: width 0.2s ease;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 4px;
  background: rgb(var(--v-theme-surface));
}
.live-preview .ProseMirror {
  padding: var(--space-4);
}
</style>