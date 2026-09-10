<script setup lang="ts">
import { Anchor as AnchorIcon, MonitorPlay, Plus } from '@lucide/vue'
import DropdownMenuButton from './DropdownMenuButton.vue'

const emit = defineEmits<{ 'open-anchor': []; 'open-embed': [] }>()
</script>

<template>
  <DropdownMenuButton title="درج بیشتر" min-width="180px">
    <template #icon>
      <Plus :size="18" />
    </template>
    <template #default="{ close }">
      <v-list-item @click="emit('open-anchor'); close()">
        <template #prepend><AnchorIcon :size="16" class="me-2" /></template>
        <v-list-item-title>لنگر (Anchor)</v-list-item-title>
      </v-list-item>
      <v-list-item @click="emit('open-embed'); close()">
        <template #prepend><MonitorPlay :size="16" class="me-2" /></template>
        <v-list-item-title>جاسازی ویدیو</v-list-item-title>
      </v-list-item>
    </template>
  </DropdownMenuButton>
</template>