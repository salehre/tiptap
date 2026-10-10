<script setup lang="ts">
import { ref, computed } from 'vue'
import { PREVIEW_VIEWPORTS, type PreviewViewport } from '../../../composables/usePreviewViewports'
import tokensCss from '../../../assets/css/tokens.css?raw'
import editorContentCss from '../../../assets/css/editor-content.css?raw'

const props = defineProps<{ html: string }>()
const emit = defineEmits<{ close: [] }>()

const viewport = ref<PreviewViewport>('full')

const FRAME_HEIGHTS: Partial<Record<PreviewViewport, string>> = {
  sm: '640px',
  md: '820px'
}

const currentWidth = computed(
    () => PREVIEW_VIEWPORTS.find((v) => v.value === viewport.value)?.width ?? '100%'
)
const currentHeight = computed(() => FRAME_HEIGHTS[viewport.value] ?? '70vh')

/** The app's @font-face rules (Vazirmatn, ...) so the isolated frame uses the same fonts. */
function collectFontFaces(): string {
  const rules: string[] = []
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      for (const rule of Array.from(sheet.cssRules)) {
        if (rule instanceof CSSFontFaceRule) rules.push(rule.cssText)
      }
    } catch {
      // cross-origin stylesheet - skip
    }
  }
  return rules.join('\n')
}

// The document is rendered inside an iframe so that:
//  - CSS shipped with the content (e.g. an HTML block's <style>) cannot leak into the app,
//  - app/Vuetify CSS cannot leak into the content,
//  - @media queries react to the simulated device width, like a real page.
// `sandbox` (without allow-scripts) keeps any pasted <script> from running.
const srcdoc = computed(
    () => `<!DOCTYPE html>
<html dir="rtl" lang="fa">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<base href="${location.origin}/">
<style>${collectFontFaces()}</style>
<style>${tokensCss}</style>
<style>
*, *::before, *::after { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body { font-family: var(--font-ui); font-size: 15px; line-height: 1.6; background: #fff; }
</style>
<style>${editorContentCss}</style>
</head>
<body>
<div class="rte-content"><div class="ProseMirror">${props.html}</div></div>
</body>
</html>`
)
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
          <iframe
              class="device-screen"
              title="پیش‌نمایش"
              sandbox="allow-same-origin"
              :srcdoc="srcdoc"
              :style="{ height: currentHeight }"
          />
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
  overflow-y: visible !important;
  flex: 0 0 auto;
}
.preview-body {
  background: rgb(var(--v-theme-background));
  padding: 24px !important;
  display: flex;
  justify-content: center;
  align-items: flex-start;
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
  display: block;
  width: 100%;
  border: 0;
  background: #fff;
  border-radius: 8px;
}
.vp-sm .device-screen,
.vp-md .device-screen {
  border-radius: 0;
}
</style>