// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@vueuse/nuxt', 'vuetify-nuxt-module'],
  css: [
    '@fontsource-variable/vazirmatn',
    '@fontsource/jetbrains-mono/400.css',
    '@fontsource/jetbrains-mono/500.css',
    '~/assets/css/tokens.css',
    '~/assets/css/main.css',
    '~/assets/css/editor-content.css'
  ],
  app: {
    head: {
      htmlAttrs: { lang: 'fa', dir: 'rtl' }
    }
  },
  vuetify: {
    moduleOptions: {},
    vuetifyOptions: {
      ssr: true,
      locale: {
        locale: 'fa',
        rtl: { fa: true }
      },
      icons: {
        defaultSet: 'mdi'
      },
      theme: {
        defaultTheme: 'davat',
        themes: {
          davat: {
            dark: false,
            colors: {
              background: '#f4f3ee',
              surface: '#ffffff',
              'surface-bright': '#ffffff',
              primary: '#2f4b7c',
              'primary-darken-1': '#22375c',
              secondary: '#4a4844',
              error: '#a3402e',
              success: '#3d6b4a',
              'on-background': '#201f1c',
              'on-surface': '#201f1c'
            },
            variables: {
              'border-color': '#dedbd1'
            }
          }
        }
      }
    }
  }
})
