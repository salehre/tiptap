<script setup lang="ts">
import { ref } from 'vue'
import type { Editor } from '@tiptap/vue-3'
import MenuBarItem from './toolbar/MenuBarItem.vue'

const props = defineProps<{
  editor: Editor
  fullscreen: boolean
  findOpen: boolean
  showVisualBlocks: boolean
  showVisualChars: boolean
}>()

const emit = defineEmits<{
  'open-link': []
  'open-image': []
  'open-source': []
  'open-anchor': []
  'open-embed': []
  'open-preview': []
  'open-word-count': []
  'open-table-properties': []
  'insert-page-break': []
  print: []
  'toggle-visual-blocks': []
  'toggle-visual-chars': []
  'toggle-fullscreen': []
  'toggle-find': []
}>()

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

function insertDate() {
  props.editor.chain().focus().insertContent(new Date().toLocaleDateString('fa-IR')).run()
}
function insertNbsp() {
  props.editor.chain().focus().insertContent('\u00A0').run()
}

function toggleDirection() {
  const current = props.editor.getAttributes('paragraph').dir || props.editor.getAttributes('heading').dir
  if (current === 'ltr') props.editor.chain().focus().setTextDirection('rtl').run()
  else props.editor.chain().focus().setTextDirection('ltr').run()
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
        <v-list-item @click="emit('open-preview'); close()">
          <v-list-item-title>پیش‌نمایش</v-list-item-title>
        </v-list-item>
        <v-list-item @click="emit('print'); close()">
          <v-list-item-title>چاپ</v-list-item-title>
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
        <v-list-item :disabled="!editor.can().undo()" @click="editor.chain().focus().undo().run(); close()">
          <v-list-item-title>واگرد</v-list-item-title>
        </v-list-item>
        <v-list-item :disabled="!editor.can().redo()" @click="editor.chain().focus().redo().run(); close()">
          <v-list-item-title>ازنو</v-list-item-title>
        </v-list-item>
        <v-divider class="my-1" />
        <v-list-item @click="editor.chain().focus().selectAll().run(); close()">
          <v-list-item-title>انتخاب همه</v-list-item-title>
        </v-list-item>
        <v-list-item @click="editor.chain().focus().unsetAllMarks().clearNodes().run(); close()">
          <v-list-item-title>حذف قالب‌بندی</v-list-item-title>
        </v-list-item>
        <v-divider class="my-1" />
        <v-list-item :active="findOpen" @click="emit('toggle-find'); close()">
          <v-list-item-title>جستجو و جایگزینی</v-list-item-title>
        </v-list-item>
      </template>
    </MenuBarItem>

    <MenuBarItem
      label="نما"
      :model-value="isOpen('نما')"
      @update:model-value="(v) => setOpen('نما', v)"
      @hover="onHover('نما')"
    >
      <template #default="{ close }">
        <v-list-item :active="showVisualBlocks" @click="emit('toggle-visual-blocks'); close()">
          <v-list-item-title>نمایش کادر بلوک‌ها</v-list-item-title>
        </v-list-item>
        <v-list-item :active="showVisualChars" @click="emit('toggle-visual-chars'); close()">
          <v-list-item-title>نمایش نشانه‌ی پاراگراف</v-list-item-title>
        </v-list-item>
        <v-divider class="my-1" />
        <v-list-item :active="fullscreen" @click="emit('toggle-fullscreen'); close()">
          <v-list-item-title>تمام‌صفحه</v-list-item-title>
        </v-list-item>
        <v-list-item @click="emit('open-word-count'); close()">
          <v-list-item-title>آمار سند</v-list-item-title>
        </v-list-item>
        <v-divider class="my-1" />
        <v-list-item @click="emit('open-source'); close()">
          <v-list-item-title>کد HTML</v-list-item-title>
        </v-list-item>
      </template>
    </MenuBarItem>

    <MenuBarItem
      label="درج"
      :model-value="isOpen('درج')"
      @update:model-value="(v) => setOpen('درج', v)"
      @hover="onHover('درج')"
    >
      <template #default="{ close }">
        <v-list-item @click="emit('open-link'); close()">
          <v-list-item-title>لینک</v-list-item-title>
        </v-list-item>
        <v-list-item @click="emit('open-image'); close()">
          <v-list-item-title>تصویر</v-list-item-title>
        </v-list-item>
        <v-list-item @click="editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(); close()">
          <v-list-item-title>جدول</v-list-item-title>
        </v-list-item>
        <v-list-item @click="emit('open-anchor'); close()">
          <v-list-item-title>لنگر (Anchor)</v-list-item-title>
        </v-list-item>
        <v-list-item @click="emit('open-embed'); close()">
          <v-list-item-title>جاسازی ویدیو</v-list-item-title>
        </v-list-item>
        <v-divider class="my-1" />
        <v-list-item @click="editor.chain().focus().setColumnLayout(2).run(); close()">
          <v-list-item-title>چیدمان دو ستونی</v-list-item-title>
        </v-list-item>
        <v-list-item @click="editor.chain().focus().setColumnLayout(3).run(); close()">
          <v-list-item-title>چیدمان سه ستونی</v-list-item-title>
        </v-list-item>
        <v-list-item @click="editor.chain().focus().setColumnLayout(4).run(); close()">
          <v-list-item-title>چیدمان چهار ستونی</v-list-item-title>
        </v-list-item>
        <v-divider class="my-1" />
        <v-list-item @click="editor.chain().focus().setHorizontalRule().run(); close()">
          <v-list-item-title>خط افقی</v-list-item-title>
        </v-list-item>
        <v-list-item @click="emit('insert-page-break'); close()">
          <v-list-item-title>پایان صفحه</v-list-item-title>
        </v-list-item>
        <v-list-item @click="insertDate(); close()">
          <v-list-item-title>تاریخ امروز</v-list-item-title>
        </v-list-item>
        <v-list-item @click="insertNbsp(); close()">
          <v-list-item-title>فاصله‌ی نیم‌فاصله</v-list-item-title>
        </v-list-item>
      </template>
    </MenuBarItem>

    <MenuBarItem
      label="قالب‌بندی"
      :model-value="isOpen('قالب‌بندی')"
      @update:model-value="(v) => setOpen('قالب‌بندی', v)"
      @hover="onHover('قالب‌بندی')"
    >
      <template #default="{ close }">
        <v-list-item :active="editor.isActive('bold')" @click="editor.chain().focus().toggleBold().run(); close()">
          <v-list-item-title>ضخیم</v-list-item-title>
        </v-list-item>
        <v-list-item :active="editor.isActive('italic')" @click="editor.chain().focus().toggleItalic().run(); close()">
          <v-list-item-title>مورب</v-list-item-title>
        </v-list-item>
        <v-list-item :active="editor.isActive('underline')" @click="editor.chain().focus().toggleUnderline().run(); close()">
          <v-list-item-title>زیرخط‌دار</v-list-item-title>
        </v-list-item>
        <v-list-item :active="editor.isActive('strike')" @click="editor.chain().focus().toggleStrike().run(); close()">
          <v-list-item-title>خط‌خورده</v-list-item-title>
        </v-list-item>
        <v-list-item :active="editor.isActive('code')" @click="editor.chain().focus().toggleCode().run(); close()">
          <v-list-item-title>کد درون‌خطی</v-list-item-title>
        </v-list-item>
        <v-list-item :active="editor.isActive('subscript')" @click="editor.chain().focus().toggleSubscript().run(); close()">
          <v-list-item-title>زیرنویس</v-list-item-title>
        </v-list-item>
        <v-list-item :active="editor.isActive('superscript')" @click="editor.chain().focus().toggleSuperscript().run(); close()">
          <v-list-item-title>بالانویس</v-list-item-title>
        </v-list-item>
        <v-divider class="my-1" />
        <v-list-item :active="editor.isActive({ textAlign: 'right' })" @click="editor.chain().focus().setTextAlign('right').run(); close()">
          <v-list-item-title>راست‌چین</v-list-item-title>
        </v-list-item>
        <v-list-item :active="editor.isActive({ textAlign: 'center' })" @click="editor.chain().focus().setTextAlign('center').run(); close()">
          <v-list-item-title>وسط‌چین</v-list-item-title>
        </v-list-item>
        <v-list-item :active="editor.isActive({ textAlign: 'left' })" @click="editor.chain().focus().setTextAlign('left').run(); close()">
          <v-list-item-title>چپ‌چین</v-list-item-title>
        </v-list-item>
        <v-list-item :active="editor.isActive({ textAlign: 'justify' })" @click="editor.chain().focus().setTextAlign('justify').run(); close()">
          <v-list-item-title>تراز از دو طرف</v-list-item-title>
        </v-list-item>
        <v-divider class="my-1" />
        <v-list-item @click="editor.chain().focus().indent().run(); close()">
          <v-list-item-title>افزایش تورفتگی</v-list-item-title>
        </v-list-item>
        <v-list-item @click="editor.chain().focus().outdent().run(); close()">
          <v-list-item-title>کاهش تورفتگی</v-list-item-title>
        </v-list-item>
        <v-list-item @click="toggleDirection(); close()">
          <v-list-item-title>تغییر جهت متن</v-list-item-title>
        </v-list-item>
        <v-divider class="my-1" />
        <v-list-item @click="editor.chain().focus().unsetAllMarks().clearNodes().run(); close()">
          <v-list-item-title>حذف قالب‌بندی</v-list-item-title>
        </v-list-item>
      </template>
    </MenuBarItem>

    <MenuBarItem
      label="ابزارها"
      :model-value="isOpen('ابزارها')"
      @update:model-value="(v) => setOpen('ابزارها', v)"
      @hover="onHover('ابزارها')"
    >
      <template #default="{ close }">
        <v-list-item :active="findOpen" @click="emit('toggle-find'); close()">
          <v-list-item-title>جستجو و جایگزینی</v-list-item-title>
        </v-list-item>
        <v-list-item @click="emit('open-word-count'); close()">
          <v-list-item-title>آمار سند</v-list-item-title>
        </v-list-item>
        <v-list-item @click="emit('open-source'); close()">
          <v-list-item-title>کد HTML</v-list-item-title>
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
        <v-list-item @click="editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(); close()">
          <v-list-item-title>درج جدول</v-list-item-title>
        </v-list-item>
        <v-divider class="my-1" />
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