// Workaround for https://github.com/nuxt/nuxt/issues/34142
// Nuxt 4.3+ with future.compatibilityVersion: 5 leaves the defineAppConfig macro
// unresolved in the Nitro bundle, causing ReferenceError during prerender.
// Remove once #34157 (or its follow-up) ships.
// const defineAppConfig = <T>(config: T): T => config

export default defineAppConfig({
  ui: {
    colors: {
      primary: 'turquoise',
      secondary: 'gold',
      neutral: 'stone',
    },
    button: {
      slots: { base: 'font-medium rounded-none' },
      defaultVariants: { color: 'primary' },
    },

    prose: {
      a: {
        base: 'hover:border-secondary',
      },

      // デフォルト neutral variant: bg-muted / text-highlighted → primary カラーに変更
      code: {
        variants: {
          color: {
            neutral: 'border border-default bg-elevated text-primary',
          },
        },
      },

      codeGroup: {
        list: 'border border-secondary',
      },

      // border-muted → border-default、bg-muted → bg-elevated
      pre: {
        slots: {
          base: 'border bg-elevated px-6 py-5',
        },
      },

      // border-s-4 / border-accented → border-s-2 / border-secondary
      blockquote: {
        base: 'border-s-2 border-secondary ps-5 my-6 text-muted [&_p]:my-0',
      },

      // border-t border-default / my-12 → my-[3em]
      hr: { base: 'border-secondary' },

      // [&_th/td]:border-0 border-b で縦罫線を除去（詳細度で個別クラスに勝つ）
      table: {
        slots: {
          base: 'border border-accented [&_th]:border-b-secondary [&_th]:border-x-0 [&_td]:border-b-muted [&_td]:border-x-0',
        },
      },
    },
  },
})
