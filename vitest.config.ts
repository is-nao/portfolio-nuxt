import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    include: ['test/unit/**/*.{test,spec}.ts'],
    reporters: process.env.CI ? ['default', 'github-actions'] : ['default'],
  },
})
