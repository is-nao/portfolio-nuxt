// @ts-check
import { fileURLToPath } from 'node:url'
import withNuxt from './.nuxt/eslint.config.mjs'
import tsdoc from 'eslint-plugin-tsdoc'
import tailwindcss from 'eslint-plugin-tailwindcss'
import { mdcLint } from 'mdclint'

const twCssPath = fileURLToPath(new URL('./app/assets/css/main.css', import.meta.url))

export default withNuxt(
  {
    name: 'app/tsdoc',
    files: ['**/*.{ts,vue}'],
    plugins: { tsdoc },
    rules: {
      'tsdoc/syntax': 'warn',
    },
  },
  {
    name: 'app/vue-overrides',
    files: ['**/*.vue'],
    rules: {
      'vue/no-multiple-template-root': 'off',
    },
  },
)
  // eslint-plugin-tailwindcss は @types/eslint の型を返すが、@nuxt/eslint は @eslint/core の型を期待するため型不一致になる
  .append(/** @type {any} */ (tailwindcss.configs['flat/recommended']))
  .append({
    name: 'app/tailwindcss-overrides',
    settings: {
      // Tailwind v4 は CSS ベース設定のため、エントリポイントを config キーで指定する
      tailwindcss: {
        config: twCssPath,
        classAttributes: ['class', 'ui'],
      },
    },
    rules: {
      // Nuxt UI のカスタムクラスが false positive になるため無効化
      'tailwindcss/no-custom-classname': 'off',
    },
  })
  .append(
    await mdcLint({
      files: ['content/**/*.md'],
    }),
  )
