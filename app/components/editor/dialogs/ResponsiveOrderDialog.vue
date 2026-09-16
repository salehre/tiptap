<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Editor } from '@tiptap/vue-3'
import { ArrowUp, ArrowDown, RotateCcw, Smartphone, Tablet, Laptop } from '@lucide/vue'

const props = defineProps<{ editor: Editor }>()
const emit = defineEmits<{ close: [] }>()

type Breakpoint = 'sm' | 'md' | 'lg'

interface OrderValue {
  sm: number | null
  md: number | null
  lg: number | null
}

interface BlockItem {
  pos: number
  type: string
  label: string
  order: OrderValue
}

const BP_TABS: { value: Breakpoint; title: string; icon: unknown }[] = [
  { value: 'sm', title: 'موبایل', icon: Smartphone },
  { value: 'md', title: 'تبلت', icon: Tablet },
  { value: 'lg', title: 'دسکتاپ', icon: Laptop }
]

const TYPE_LABELS: Record<string, string> = {
  paragraph: 'پاراگراف',
  heading: 'عنوان',
  image: 'تصویر',
  table: 'جدول',
  bulletList: 'لیست نقطه‌ای',
  orderedList: 'لیست شماره‌دار',
  blockquote: 'نقل‌قول',
  codeBlock: 'بلوک کد',
  horizontalRule: 'خط جداکننده',
  taskList: 'چک‌لیست',
  youtube: 'ویدیوی یوتیوب',
  iframeEmbed: 'امبد',
  columnLayout: 'گرید ستونی',
  htmlBlock: 'بلوک HTML',
  pageBreak: 'شکست صفحه'
}

function labelFor(node: any): string {
  const base = TYPE_LABELS[node.type.name] ?? node.type.name
  const text: string = (node.textContent ?? '').trim().slice(0, 30)
  return text ? `${base}: «${text}»` : base
}

function loadItems(): BlockItem[] {
  const list: BlockItem[] = []
  props.editor.state.doc.forEach((node: any, offset: number) => {
    const order = node.attrs?.order as OrderValue | null
    list.push({
      pos: offset,
      type: node.type.name,
      label: labelFor(node),
      order: order ? { ...order } : { sm: null, md: null, lg: null }
    })
  })
  return list
}

const items = ref<BlockItem[]>(loadItems())
const activeTab = ref<Breakpoint>('lg')

// Items ordered the way they'd visually appear at the active breakpoint:
// sorted by their order[bp] value, with unset (null) ones kept in their
// original relative order at the end.
const sortedForTab = computed(() => {
  const bp = activeTab.value
  return items.value
    .map((item, idx) => ({ item, idx }))
    .sort((a, b) => {
      const av = a.item.order[bp]
      const bv = b.item.order[bp]
      if (av === null && bv === null) return a.idx - b.idx
      if (av === null) return 1
      if (bv === null) return -1
      return av - bv
    })
    .map((x) => x.item)
})

const hasCustomOrder = (item: BlockItem, bp: Breakpoint) => item.order[bp] !== null

function move(item: BlockItem, dir: -1 | 1) {
  const bp = activeTab.value
  const list = sortedForTab.value
  const i = list.indexOf(item)
  const j = i + dir
  if (i === -1 || j < 0 || j >= list.length) return
  const reordered = [...list]
  const a = reordered[i]
  const b = reordered[j]
  if (!a || !b) return
  reordered[i] = b
  reordered[j] = a
  reordered.forEach((it, idx) => {
    it.order[bp] = idx
  })
}

function resetTab() {
  items.value.forEach((it) => {
    it.order[activeTab.value] = null
  })
}

function apply() {
  const { state, view } = props.editor
  let tr = state.tr
  items.value.forEach((it) => {
    const node = tr.doc.nodeAt(it.pos)
    if (!node) return
    const hasAny = it.order.sm !== null || it.order.md !== null || it.order.lg !== null
    tr = tr.setNodeMarkup(it.pos, null, { ...node.attrs, order: hasAny ? it.order : null })
  })
  view.dispatch(tr)
  emit('close')
}
</script>

<template>
  <v-dialog :model-value="true" max-width="520" scrollable @update:model-value="emit('close')">
    <v-card title="ترتیب واکنش‌گرا">
      <v-card-text class="pb-0">
        <p class="text-caption text-medium-emphasis mb-3">
          برای هر اندازه‌ی صفحه، ترتیب نمایش بخش‌ها را جدا تعیین کنید. محتوای سند جابه‌جا
          نمی‌شود؛ فقط نمایش آن در هر اندازه فرق می‌کند.
        </p>
        <v-btn-toggle v-model="activeTab" mandatory density="comfortable" variant="outlined" divided class="mb-3">
          <v-btn v-for="tab in BP_TABS" :key="tab.value" :value="tab.value" size="small">
            <component :is="tab.icon" :size="16" class="me-1" />
            {{ tab.title }}
          </v-btn>
        </v-btn-toggle>

        <v-list class="order-list" density="compact" border rounded>
          <v-list-item v-for="item in sortedForTab" :key="item.pos" class="order-item">
            <template #prepend>
              <div class="order-buttons">
                <v-btn icon size="x-small" variant="text" @click="move(item, -1)">
                  <ArrowUp :size="14" />
                </v-btn>
                <v-btn icon size="x-small" variant="text" @click="move(item, 1)">
                  <ArrowDown :size="14" />
                </v-btn>
              </div>
            </template>
            <v-list-item-title class="text-body-2">{{ item.label }}</v-list-item-title>
            <template #append>
              <v-chip v-if="hasCustomOrder(item, activeTab)" size="x-small" color="primary" variant="tonal">
                سفارشی
              </v-chip>
            </template>
          </v-list-item>
        </v-list>

        <v-btn variant="text" size="small" class="mt-2" @click="resetTab">
          <RotateCcw :size="14" class="me-1" />
          بازنشانی ترتیب {{ BP_TABS.find((t) => t.value === activeTab)?.title }}
        </v-btn>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="emit('close')">انصراف</v-btn>
        <v-btn color="primary" variant="flat" @click="apply">اعمال</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.order-list {
  max-height: 320px;
  overflow-y: auto;
}
.order-item + .order-item {
  border-block-start: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}
.order-buttons {
  display: flex;
  flex-direction: column;
  margin-inline-end: 8px;
}
</style>