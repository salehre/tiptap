<script setup lang="ts">
import { ref, computed } from 'vue'
import { NodeViewWrapper, nodeViewProps } from '@tiptap/vue-3'

const props = defineProps(nodeViewProps)

const resizing = ref(false)
let startX = 0
let startWidth = 0

const wrapperEl = ref<{ $el: HTMLElement } | null>(null)

const align = computed(() => props.node.attrs.align || 'center')
const width = computed(() => props.node.attrs.width)
const caption = computed(() => props.node.attrs.caption)

function startResize(e: MouseEvent) {
  e.preventDefault()
  resizing.value = true
  startX = e.clientX
  const rootEl = wrapperEl.value?.$el
  const imgEl = rootEl?.querySelector('img')
  startWidth = imgEl?.getBoundingClientRect().width ?? 300

  const onMove = (moveEvent: MouseEvent) => {
    const delta = moveEvent.clientX - startX
    // In RTL the drag handle sits on the visual left, so dragging left grows the image
    const dir = rootEl?.closest('[dir]')?.getAttribute('dir')
    const sign = dir === 'rtl' ? -1 : 1
    const newWidth = Math.max(80, Math.round(startWidth + delta * sign))
    props.updateAttributes({ width: newWidth })
  }
  const onUp = () => {
    resizing.value = false
    window.removeEventListener('mousemove', onMove)
    window.removeEventListener('mouseup', onUp)
  }
  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseup', onUp)
}

function onCaptionInput(e: Event) {
  const text = (e.target as HTMLElement).innerText.trim()
  props.updateAttributes({ caption: text || null })
}
</script>

<template>
  <NodeViewWrapper
    ref="wrapperEl"
    class="rte-figure-view"
    :class="[`align-${align}`, { 'is-selected': selected, 'is-resizing': resizing }]"
    as="figure"
  >
    <div class="img-frame" :style="width ? { width: `${width}px` } : undefined">
      <img :src="node.attrs.src" :alt="node.attrs.alt" :title="node.attrs.title">
      <span v-if="selected" class="resize-handle" @mousedown="startResize" />
    </div>
    <figcaption
      v-if="caption !== null || selected"
      class="img-caption"
      contenteditable
      :data-placeholder="'توضیح تصویر (اختیاری)'"
      @blur="onCaptionInput"
    >{{ caption }}</figcaption>
  </NodeViewWrapper>
</template>

<style scoped>
.rte-figure-view {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.rte-figure-view.align-left { align-items: flex-start; }
.rte-figure-view.align-center { align-items: center; }
.rte-figure-view.align-right { align-items: flex-end; }

.img-frame {
  position: relative;
  max-width: 100%;
  line-height: 0;
}
.img-frame img {
  display: block;
  max-width: 100%;
  height: auto;
  border-radius: var(--radius-sm, 5px);
}

.rte-figure-view.is-selected .img-frame img {
  outline: 2px solid rgb(var(--v-theme-primary));
  outline-offset: 2px;
}

.resize-handle {
  position: absolute;
  inset-inline-start: -6px;
  bottom: -6px;
  width: 14px;
  height: 14px;
  border-radius: 4px;
  background: rgb(var(--v-theme-primary));
  border: 2px solid #fff;
  cursor: nwse-resize;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.img-caption {
  font-size: 0.85em;
  color: rgba(var(--v-theme-on-surface), 0.6);
  text-align: center;
  outline: none;
  min-width: 60px;
  max-width: 100%;
}
.img-caption:empty::before {
  content: attr(data-placeholder);
  opacity: 0.5;
}
</style>