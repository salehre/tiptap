<script setup lang="ts">
import { ref } from 'vue'
import ToolbarIconBtn from './ToolbarIconBtn.vue'

const MAX = 8
const emit = defineEmits<{ pick: [rows: number, cols: number] }>()

const menu = ref(false)
const hoverRow = ref(0)
const hoverCol = ref(0)

function choose(r: number, c: number) {
  emit('pick', r, c)
  menu.value = false
}
</script>

<template>
  <v-menu v-model="menu" :close-on-content-click="false" location="bottom">
    <template #activator="{ props: menuProps }">
      <span v-bind="menuProps">
        <ToolbarIconBtn title="درج جدول">
          <slot />
        </ToolbarIconBtn>
      </span>
    </template>

    <v-card class="pa-3">
      <p class="text-caption text-medium-emphasis text-center mb-2">
        {{ hoverRow || 1 }} × {{ hoverCol || 1 }}
      </p>
      <div class="grid" @mouseleave="hoverRow = 0; hoverCol = 0">
        <template v-for="r in MAX" :key="r">
          <button
            v-for="c in MAX"
            :key="c"
            type="button"
            class="cell"
            :class="{ 'is-hover': r <= hoverRow && c <= hoverCol }"
            @mouseenter="hoverRow = r; hoverCol = c"
            @click="choose(r, c)"
          />
        </template>
      </div>
    </v-card>
  </v-menu>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(8, 16px);
  grid-template-rows: repeat(8, 16px);
  gap: 3px;
}
.cell {
  width: 16px;
  height: 16px;
  border-radius: 3px;
  border: 1px solid rgba(0, 0, 0, 0.18);
  background: rgb(var(--v-theme-background));
  padding: 0;
  cursor: pointer;
}
.cell.is-hover {
  background: rgb(var(--v-theme-primary));
  border-color: rgb(var(--v-theme-primary));
}
</style>
