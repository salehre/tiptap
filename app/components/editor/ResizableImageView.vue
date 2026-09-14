<script setup lang="ts">
import { ref, computed } from 'vue'
import { NodeViewWrapper, nodeViewProps } from '@tiptap/vue-3'

const props = defineProps(nodeViewProps)

const resizing = ref(false)
const resizeAlign = ref<string | null>(null)
let startX = 0
let startWidth = 0
const resizeFrameStyle = ref<Record<string, string> | null>(null)

const wrapperEl = ref<{ $el: HTMLElement } | null>(null)
const frameEl = ref<HTMLElement | null>(null)

const align = computed(() => props.node.attrs.align || 'center')
const width = computed(() => props.node.attrs.width)
const caption = computed(() => props.node.attrs.caption)

function startResize(side: 'left' | 'right', e: MouseEvent) {
  e.preventDefault()
  resizing.value = true
  startX = e.clientX
  const rootEl = wrapperEl.value?.$el
  const frame = frameEl.value
  const imgEl = rootEl?.querySelector('img')
  startWidth = imgEl?.getBoundingClientRect().width ?? 300

  // Pin the edge opposite the dragged handle so the handle tracks the
  // cursor 1:1. A centered (or oppositely aligned) image otherwise grows
  // from both sides at once, making the drag feel inverted or "laggy".
  // We freeze the frame's *current* on-screen offset as an explicit pixel
  // margin (rather than just flipping align-items) so switching anchor
  // doesn't visually snap the image to a new spot the instant you grab
  // the handle — the anchor edge simply stays exactly where it already is.
  if (rootEl && frame) {
    const rootRect = rootEl.getBoundingClientRect()
    const frameRect = frame.getBoundingClientRect()
    if (side === 'right') {
      resizeAlign.value = 'flex-start'
      resizeFrameStyle.value = { marginInlineStart: `${frameRect.left - rootRect.left}px` }
    } else {
      resizeAlign.value = 'flex-end'
      resizeFrameStyle.value = { marginInlineEnd: `${rootRect.right - frameRect.right}px` }
    }
  }

  const onMove = (moveEvent: MouseEvent) => {
    const delta = moveEvent.clientX - startX
    // Left handle: dragging further left (negative delta) grows the image.
    // Right handle: dragging further right (positive delta) grows the image.
    // Each handle only cares about its own side, regardless of text direction.
    const signedDelta = side === 'left' ? -delta : delta
    const newWidth = Math.max(80, Math.round(startWidth + signedDelta))
    props.updateAttributes({ width: newWidth })
  }
  const onUp = () => {
    resizing.value = false
    resizeAlign.value = null
    resizeFrameStyle.value = null
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
      :style="resizeAlign ? { alignItems: resizeAlign } : undefined"
      as="figure"
  >
    <div class="img-frame" ref="frameEl" :style="[width ? { width: `${width}px` } : {}, resizeFrameStyle || {}]">
      <img :src="node.attrs.src" :alt="node.attrs.alt" :title="node.attrs.title">
      <template v-if="selected">
        <span class="resize-handle resize-handle-tl" @mousedown="startResize('left', $event)" />
        <span class="resize-handle resize-handle-tr" @mousedown="startResize('right', $event)" />
        <span class="resize-handle resize-handle-bl" @mousedown="startResize('left', $event)" />
        <span class="resize-handle resize-handle-br" @mousedown="startResize('right', $event)" />
      </template>
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
  line-height: 0;
}
.img-frame img {
  display: block;
  width: 100%;
  height: auto;
  border-radius: var(--radius-sm, 5px);
}

.rte-figure-view.is-selected .img-frame img {
  outline: 2px solid rgb(var(--v-theme-primary));
  outline-offset: 2px;
}

.resize-handle {
  position: absolute;
  width: 14px;
  height: 14px;
  border-radius: 4px;
  background: rgb(var(--v-theme-primary));
  border: 2px solid #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}
.resize-handle-tl { left: -6px; top: -6px; cursor: nwse-resize; }
.resize-handle-tr { right: -6px; top: -6px; cursor: nesw-resize; }
.resize-handle-bl { left: -6px; bottom: -6px; cursor: nesw-resize; }
.resize-handle-br { right: -6px; bottom: -6px; cursor: nwse-resize; }

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