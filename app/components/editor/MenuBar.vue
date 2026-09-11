<script setup lang="ts">
import { ref } from 'vue'
import type { Editor } from '@tiptap/vue-3'
import MenuBarItem from './toolbar/MenuBarItem.vue'

const props = defineProps<{ editor: Editor }>()

const emit = defineEmits<{ 'open-table-properties': [] }>()

// Once one menu is opened by a click, hovering over a sibling trigger
// switches the open menu too - matches classic desktop menu-bar behavior.
const activeLabel = ref<string | null>(null)

function isOpen(label: string) {
  return activeLabel.value === label
}
function setOpen(label: string, open: boolean) {
  if (open) activeLabel.value = label
  else if (activeLabel.value === label) activeLabel.value = null
}
function onHover(label: string) {
  if (activeLabel.value !== null && activeLabel.value !== label) {
    activeLabel.value = label
  }
}

function newDocument() {
  if (props.editor.isEmpty || window.confirm('محتوای فعلی پاک شود و یک سند جدید شروع شود؟')) {
    props.editor.chain().focus().clearContent(true).run()
  }
}
</script>

<template>
  <div class="rte-menubar">
    <MenuBarItem
      label="فایل"
      :model-value="isOpen('فایل')"
      @update:model-value="(v) => setOpen('فایل', v)"
      @hover="onHover('فایل')"
    >
      <template #default="{ close }">
        <v-list-item @click="newDocument(); close()">
          <v-list-item-title>سند جدید</v-list-item-title>
        </v-list-item>
      </template>
    </MenuBarItem>

    <MenuBarItem
      label="ویرایش"
      :model-value="isOpen('ویرایش')"
      @update:model-value="(v) => setOpen('ویرایش', v)"
      @hover="onHover('ویرایش')"
    >
      <template #default="{ close }">
        <v-list-item @click="editor.chain().focus().selectAll().run(); close()">
          <v-list-item-title>انتخاب همه</v-list-item-title>
        </v-list-item>
      </template>
    </MenuBarItem>

    <MenuBarItem
      label="جدول"
      :model-value="isOpen('جدول')"
      @update:model-value="(v) => setOpen('جدول', v)"
      @hover="onHover('جدول')"
    >
      <template #default="{ close }">
        <v-list-item @click="editor.chain().focus().addRowBefore().run(); close()">
          <v-list-item-title>افزودن سطر بالا</v-list-item-title>
        </v-list-item>
        <v-list-item @click="editor.chain().focus().addRowAfter().run(); close()">
          <v-list-item-title>افزودن سطر پایین</v-list-item-title>
        </v-list-item>
        <v-list-item @click="editor.chain().focus().addColumnBefore().run(); close()">
          <v-list-item-title>افزودن ستون قبل</v-list-item-title>
        </v-list-item>
        <v-list-item @click="editor.chain().focus().addColumnAfter().run(); close()">
          <v-list-item-title>افزودن ستون بعد</v-list-item-title>
        </v-list-item>
        <v-divider class="my-1" />
        <v-list-item @click="editor.chain().focus().deleteRow().run(); close()">
          <v-list-item-title>حذف سطر</v-list-item-title>
        </v-list-item>
        <v-list-item @click="editor.chain().focus().deleteColumn().run(); close()">
          <v-list-item-title>حذف ستون</v-list-item-title>
        </v-list-item>
        <v-list-item @click="editor.chain().focus().deleteTable().run(); close()">
          <v-list-item-title>حذف جدول</v-list-item-title>
        </v-list-item>
        <v-divider class="my-1" />
        <v-list-item @click="editor.chain().focus().mergeCells().run(); close()">
          <v-list-item-title>ادغام سلول‌ها</v-list-item-title>
        </v-list-item>
        <v-list-item @click="editor.chain().focus().splitCell().run(); close()">
          <v-list-item-title>تفکیک سلول</v-list-item-title>
        </v-list-item>
        <v-divider class="my-1" />
        <v-list-item @click="editor.chain().focus().toggleHeaderRow().run(); close()">
          <v-list-item-title>سطر عنوان</v-list-item-title>
        </v-list-item>
        <v-list-item @click="editor.chain().focus().toggleHeaderColumn().run(); close()">
          <v-list-item-title>ستون عنوان</v-list-item-title>
        </v-list-item>
        <v-divider class="my-1" />
        <v-list-item @click="emit('open-table-properties'); close()">
          <v-list-item-title>ویژگی‌های جدول</v-list-item-title>
        </v-list-item>
      </template>
    </MenuBarItem>
  </div>
</template>

<style scoped>
.rte-menubar {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 6px 10px;
  border-block-end: 1px solid rgba(0, 0, 0, 0.08);
}
</style>