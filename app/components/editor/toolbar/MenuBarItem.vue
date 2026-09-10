<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ label: string }>()
const menu = ref(false)
</script>

<template>
  <v-menu v-model="menu" location="bottom start">
    <template #activator="{ props: menuProps }">
      <button type="button" class="menu-trigger" v-bind="menuProps">
        {{ label }}
      </button>
    </template>

    <v-list density="compact" min-width="220">
      <slot :close="() => (menu = false)" />
    </v-list>
  </v-menu>
</template>

<style scoped>
.menu-trigger {
  border: none;
  background: none;
  font-family: inherit;
  font-size: 13px;
  color: var(--ink-700, rgba(0, 0, 0, 0.75));
  padding: 4px 10px;
  border-radius: 4px;
  cursor: pointer;
}
.menu-trigger:hover {
  background: rgba(0, 0, 0, 0.06);
}
</style>