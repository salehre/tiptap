<script setup lang="ts">
import { ref, computed } from 'vue'
import { PREVIEW_VIEWPORTS, type PreviewViewport } from '../../../composables/usePreviewViewports'

defineProps<{ html: string }>()
const emit = defineEmits<{ close: [] }>()

const viewport = ref<PreviewViewport>('full')

const FRAME_HEIGHTS: Partial<Record<PreviewViewport, string>> = {
  sm: '640px',
  md: '820px'
}

const currentWidth = computed(
  () => PREVIEW_VIEWPORTS.find((v) => v.value === viewport.value)?.width ?? '100%'
)
const currentHeight = computed(() => FRAME_HEIGHTS[viewport.value] ?? null)
</script>

<template>
  <v-dialog :model-value="true" max-width="1100" scrollable @update:model-value="emit('close')">
    <v-card title="پیش‌نمایش سند">
      <v-card-text class="viewport-bar pb-0">
        <v-btn
          v-for="v in PREVIEW_VIEWPORTS"
          :key="v.value"
          :variant="viewport === v.value ? 'flat' : 'tonal'"
          :color="viewport === v.value ? 'primary' : undefined"
          size="small"
          class="me-2"
          @click="viewport = v.value"
        >
          <component :is="v.icon" :size="16" class="me-1" />
          {{ v.title }}
        </v-btn>
      </v-card-text>

      <v-card-text class="preview-body">
        <div class="preview-frame" :class="`vp-${viewport}`" :style="{ width: currentWidth }">
          <div
            class="device-screen"
            :style="currentHeight ? { height: currentHeight, overflowY: 'auto' } : undefined"
          >
            <div class="rte-content">
              <div class="ProseMirror" v-html="html" />
            </div>
          </div>
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
.viewport-bar {
  display: flex;
  justify-content: center;
}
.preview-body {
  background: rgb(var(--v-theme-background));
  padding: 24px !important;
  display: flex;
  justify-content: center;
}
.preview-frame {
  max-width: 100%;
  transition: width 0.2s ease;
}
.preview-frame.vp-sm,
.preview-frame.vp-md {
  border: 8px solid rgba(var(--v-theme-on-surface), 0.85);
  border-radius: 20px;
  overflow: hidden;
}
.device-screen {
  /* isolates its own scroll so mobile/tablet frames behave like a real
     device viewport instead of growing with the page */
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}
.rte-content {
  background: rgb(var(--v-theme-surface));
  border-radius: 8px;
}
.vp-sm .rte-content,
.vp-md .rte-content {
  border-radius: 0;
}
.vp-full .rte-content {
  max-width: 760px;
  margin-inline: auto;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06), 0 8px 24px -12px rgba(0, 0, 0, 0.16);
}
</style>