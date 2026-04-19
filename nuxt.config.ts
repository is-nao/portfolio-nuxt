// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-04-19',
  devtools: { enabled: true },

  future: {
    compatibilityVersion: 5,
  },

  modules: ['@nuxt/eslint', '@nuxt/ui', '@nuxt/content', '@nuxt/image', '@vueuse/nuxt'],

  css: ['~/assets/css/main.css'],

  experimental: {
    viewTransition: true,
  },

  nitro: {
    preset: 'cloudflare_module',
  },

  eslint: {
    config: {
      stylistic: false,
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'ja' },
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
    },
  },

  typescript: {
    strict: true,
  },
})
