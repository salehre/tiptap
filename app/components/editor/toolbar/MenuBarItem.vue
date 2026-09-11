<script setup lang="ts">
defineProps<{ label: string; modelValue: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [boolean]; hover: [] }>()
</script>

<template>
  <v-menu
    :model-value="modelValue"
    location="bottom start"
    @update:model-value="(v) => emit('update:modelValue', v)"
  >
    <template #activator="{ props: menuProps }">
      <button
        type="button"
        class="menu-trigger"
        :class="{ 'is-active': modelValue }"
        v-bind="menuProps"
        @mouseenter="emit('hover')"
      >
        {{ label }}
      </button>
    </template>

    <v-list density="compact" min-width="220">
      <slot :close="() => emit('update:modelValue', false)" />
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
.menu-trigger:hover,
.menu-trigger.is-active {
  background: rgba(0, 0, 0, 0.06);
}
</style>