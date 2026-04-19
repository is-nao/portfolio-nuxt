// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'
import tsdoc from 'eslint-plugin-tsdoc'
import prettier from 'eslint-config-prettier'

export default withNuxt(
  {
    name: 'app/tsdoc',
    files: ['**/*.{ts,vue}'],
    plugins: { tsdoc },
    rules: {
      'tsdoc/syntax': 'warn',
    },
  },
  prettier,
)
