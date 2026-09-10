<script setup lang="ts">
import { ref } from 'vue'
import ToolbarIconBtn from './ToolbarIconBtn.vue'

withDefaults(defineProps<{ title: string; active?: boolean; minWidth?: string }>(), {
  active: false,
  minWidth: '200px'
})

const menu = ref(false)
defineExpose({ close: () => (menu.value = false) })
</script>

<template>
  <v-menu v-model="menu" location="bottom">
    <template #activator="{ props: menuProps }">
      <span v-bind="menuProps">
        <ToolbarIconBtn :title="title" :active="active">
          <slot name="icon" />
        </ToolbarIconBtn>
      </span>
    </template>

    <v-list density="compact" :min-width="minWidth">
      <slot :close="() => (menu = false)" />
    </v-list>
  </v-menu>
</template>