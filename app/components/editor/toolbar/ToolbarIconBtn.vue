<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    active?: boolean
    disabled?: boolean
  }>(),
  { active: false, disabled: false }
)

defineEmits<{ click: [] }>()
</script>

<template>
  <v-tooltip :text="title" location="bottom">
    <template #activator="{ props: tip }">
      <v-btn
        v-bind="tip"
        :icon="true"
        size="small"
        variant="text"
        :color="active ? 'primary' : undefined"
        :disabled="disabled"
        :aria-label="title"
        :aria-pressed="active"
        density="comfortable"
        @click="$emit('click')"
      >
        <slot />
      </v-btn>
    </template>
  </v-tooltip>
</template>
