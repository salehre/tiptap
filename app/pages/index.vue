<script setup lang="ts">
import { ref } from 'vue'
import RichEditor from '../components/editor/RichEditor.vue'

const content = ref(`
  <h1>به دوات خوش آمدید</h1>
  <p>دوات یک ادیتور متن غنی است که با <strong>Nuxt</strong>، <strong>Tiptap</strong> و <strong>Vuetify</strong> ساخته شده — همهٔ قابلیت‌های TinyMCE را دارد، به‌علاوهٔ چند قابلیت اضافه.</p>
  <p>می‌توانید بین راست‌به‌چپ و چپ‌به‌راست جابه‌جا شوید: <em>This paragraph is in English and flows left-to-right,</em> درست در کنار متن فارسی.</p>
  <blockquote>یک نقل‌قول نمونه برای نمایش استایل بلاک‌کوت.</blockquote>
  <ul data-type="taskList">
    <li data-checked="true"><label><input type="checkbox" checked disabled></label><div>نصب و راه‌اندازی پروژه</div></li>
    <li data-checked="false"><label><input type="checkbox" disabled></label><div>افزودن قابلیت‌های اختصاصی بعدی</div></li>
  </ul>
  <pre><code class="language-javascript">const editor = useRichEditor({ placeholder: 'بنویس...' })</code></pre>
`)
</script>

<template>
  <v-main>
    <v-container class="py-8" style="max-width: 980px">
      <div class="text-center mb-8">
        <p class="text-caption text-medium-emphasis mb-2" dir="ltr" style="font-family: var(--font-mono)">
          Nuxt + Tiptap + Vuetify
        </p>
        <h1 class="text-h3 font-weight-bold mb-3">دوات</h1>
        <p class="text-body-1 text-medium-emphasis mx-auto" style="max-width: 52ch; line-height: 1.8">
          ادیتور متن غنی، قابل استفاده هم به‌عنوان یک کامپوننت مستقل در پروژه‌های دیگر و هم به‌صورت یک برنامهٔ نوشتاری کامل.
        </p>
      </div>

      <RichEditor v-model="content" min-height="480px" />
    </v-container>
  </v-main>
</template>
