<script setup lang="ts">
import { ref } from 'vue'
import { FileCode2, ChevronLeft } from '@lucide/vue'
import ToolbarIconBtn from './ToolbarIconBtn.vue'
import { EXPORT_OPTIONS, type ExportCss, type ExportSyntax } from '../../../utils/exportTypes'

const menu = ref(false)
const emit = defineEmits<{ export: [syntax: ExportSyntax, css: ExportCss] }>()

function choose(syntax: ExportSyntax, css: ExportCss) {
  emit('export', syntax, css)
  menu.value = false
}
</script>

<template>
  <v-menu v-model="menu" location="bottom">
    <template #activator="{ props: menuProps }">
      <span v-bind="menuProps">
        <ToolbarIconBtn title="خروجی به Vue / React">
          <FileCode2 :size="18" />
        </ToolbarIconBtn>
      </span>
    </template>

    <v-list density="compact" min-width="180">
      <v-menu
        v-for="group in EXPORT_OPTIONS"
        :key="group.syntax"
        submenu
        open-on-hover
        :close-on-content-click="false"
      >
        <template #activator="{ props: subProps }">
          <v-list-item v-bind="subProps" :title="group.label">
            <template #append>
              <ChevronLeft :size="14" />
            </template>
          </v-list-item>
        </template>

        <v-list density="compact" min-width="200">
          <v-list-item
            v-for="opt in group.options"
            :key="opt.css"
            :title="opt.label"
            @click="choose(opt.syntax, opt.css)"
          />
        </v-list>
      </v-menu>
    </v-list>
  </v-menu>
</template>