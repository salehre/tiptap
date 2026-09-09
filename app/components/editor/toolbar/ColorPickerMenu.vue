<script setup lang="ts">
import { ref } from 'vue'
import ToolbarIconBtn from './ToolbarIconBtn.vue'

const props = defineProps<{
  title: string
  presets: string[]
  active?: boolean
}>()

const emit = defineEmits<{ pick: [color: string]; clear: [] }>()

const menu = ref(false)
const customColor = ref('#3f63a0')

function pick(color: string) {
  emit('pick', color)
  menu.value = false
}
</script>

<template>
  <v-menu v-model="menu" :close-on-content-click="false" location="bottom">
    <template #activator="{ props: menuProps }">
      <span v-bind="menuProps">
        <ToolbarIconBtn :title="props.title" :active="props.active">
          <slot />
        </ToolbarIconBtn>
      </span>
    </template>

    <v-card width="216" class="pa-3">
      <div class="swatch-grid mb-3">
        <button
          v-for="c in props.presets"
          :key="c"
          type="button"
          class="swatch"
          :style="{ background: c }"
          :title="c"
          @click="pick(c)"
        />
      </div>
      <v-color-picker v-model="customColor" hide-inputs mode="hex" class="mb-2" />
      <div class="d-flex ga-2">
        <v-btn size="small" color="primary" variant="flat" block @click="pick(customColor)">اعمال</v-btn>
        <v-btn size="small" variant="tonal" block @click="emit('clear'); menu = false">حذف رنگ</v-btn>
      </div>
    </v-card>
  </v-menu>
</template>

<style scoped>
.swatch-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 6px;
}
.swatch {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  cursor: pointer;
  padding: 0;
}
.swatch:hover {
  outline: 2px solid rgb(var(--v-theme-primary));
  outline-offset: 1px;
}
</style>
