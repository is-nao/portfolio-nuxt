// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  // モジュール
  modules: [
    '@nuxt/fonts',
    '@nuxt/ui',
    '@nuxtjs/robots',
    '@nuxtjs/sitemap',
    'nuxt-og-image',
    '@nuxt/content',
    '@nuxt/image',
    '@nuxt/eslint',
    '@vueuse/nuxt',
    'nuxt-studio',
  ],

  // ビルド / デプロイ（preset は prod のみ。dev では node preset が使われ Studio が正常動作する）
  $production: {
    nitro: {
      preset: 'cloudflare_module',
      prerender: {
        crawlLinks: true,
      },
      cloudflare: {
        // nuxt build 時に .output/server/wrangler.json を自動生成する
        // deploy: pnpm exec wrangler --cwd .output deploy
        deployConfig: true,
        wrangler: {
          name: 'portfolio-nuxt',
          observability: { enabled: true },
          d1_databases: [
            {
              binding: 'DB',
              database_name: 'portfolio-nuxt-db',
              database_id: 'f5be5134-8720-4517-ab72-0a0b7d73628d',
            },
          ],
        },
      },
    },
  },

  devtools: {
    enabled: true,
  },

  app: {
    head: {
      htmlAttrs: { lang: 'ja' },
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      title: 'naoki.dev',
      titleTemplate: '%s — naoki.dev',
    },
  },

  css: ['~/assets/css/main.css'],

  // サイト情報（@nuxtjs/seo 全モジュール共通）
  site: {
    url: 'https://naoki.dev',
    name: 'naoki.dev',
    defaultLocale: 'ja',
  },

  content: {
    build: {
      markdown: {
        highlight: {
          theme: {
            default: 'github-light',
            dark: 'github-dark',
          },
          langs: ['1c', '1c-query', 'abap', 'actionscript-3', 'ada', 'adoc', 'angular-html', 'angular-ts', 'apache', 'apex', 'apl', 'applescript', 'ara', 'asciidoc', 'asm', 'astro', 'awk', 'ballerina', 'bash', 'bat', 'batch', 'be', 'beancount', 'berry', 'bibtex', 'bicep', 'blade', 'bsl', 'c', 'cadence', 'cairo', 'cdc', 'clarity', 'clj', 'clojure', 'closure-templates', 'cmake', 'cmd', 'cobol', 'codeowners', 'codeql', 'coffee', 'coffeescript', 'common-lisp', 'console', 'coq', 'cpp', 'cql', 'crystal', 'cs', 'csharp', 'css', 'csv', 'cue', 'cypher', 'd', 'dart', 'dax', 'desktop', 'diff', 'docker', 'dockerfile', 'dotenv', 'dream-maker', 'edge', 'elisp', 'elixir', 'elm', 'emacs-lisp', 'erb', 'erl', 'erlang', 'f', 'f03', 'f08', 'f18', 'f77', 'f90', 'f95', 'fennel', 'fish', 'fluent', 'for', 'fortran-fixed-form', 'fortran-free-form', 'fs', 'fsharp', 'fsl', 'ftl', 'gdresource', 'gdscript', 'gdshader', 'genie', 'gherkin', 'git-commit', 'git-rebase', 'gjs', 'gleam', 'glimmer-js', 'glimmer-ts', 'glsl', 'gnuplot', 'go', 'gql', 'graphql', 'groovy', 'gts', 'hack', 'haml', 'handlebars', 'haskell', 'haxe', 'hbs', 'hcl', 'hjson', 'hlsl', 'hs', 'html', 'html-derivative', 'http', 'hxml', 'hy', 'imba', 'ini', 'jade', 'java', 'javascript', 'jinja', 'jison', 'jl', 'js', 'json', 'json5', 'jsonc', 'jsonl', 'jsonnet', 'jssm', 'jsx', 'julia', 'kotlin', 'kql', 'kt', 'kts', 'kusto', 'latex', 'lean', 'lean4', 'less', 'liquid', 'lisp', 'lit', 'llvm', 'log', 'logo', 'lua', 'luau', 'make', 'makefile', 'markdown', 'marko', 'matlab', 'md', 'mdc', 'mdx', 'mediawiki', 'mermaid', 'mips', 'mipsasm', 'mmd', 'mojo', 'move', 'nar', 'narrat', 'nextflow', 'nf', 'nginx', 'nim', 'nix', 'nu', 'nushell', 'objc', 'objective-c', 'objective-cpp', 'ocaml', 'pascal', 'perl', 'perl6', 'php', 'plsql', 'po', 'polar', 'postcss', 'pot', 'potx', 'powerquery', 'powershell', 'prisma', 'prolog', 'properties', 'proto', 'protobuf', 'ps', 'ps1', 'pug', 'puppet', 'purescript', 'py', 'python', 'ql', 'qml', 'qmldir', 'qss', 'r', 'racket', 'raku', 'razor', 'rb', 'reg', 'regex', 'regexp', 'rel', 'riscv', 'rs', 'rst', 'ruby', 'rust', 'sas', 'sass', 'scala', 'scheme', 'scss', 'sdbl', 'sh', 'shader', 'shaderlab', 'shell', 'shellscript', 'shellsession', 'smalltalk', 'solidity', 'soy', 'sparql', 'spl', 'splunk', 'sql', 'ssh-config', 'stata', 'styl', 'stylus', 'svelte', 'swift', 'system-verilog', 'systemd', 'talon', 'talonscript', 'tasl', 'tcl', 'templ', 'terraform', 'tex', 'tf', 'tfvars', 'toml', 'ts', 'ts-tags', 'tsp', 'tsv', 'tsx', 'turtle', 'twig', 'typ', 'typescript', 'typespec', 'typst', 'v', 'vala', 'vb', 'verilog', 'vhdl', 'vim', 'viml', 'vimscript', 'vue', 'vue-html', 'vy', 'vyper', 'wasm', 'wenyan', 'wgsl', 'wiki', 'wikitext', 'wit', 'wl', 'wolfram', 'xml', 'xsl', 'yaml', 'yml', 'zenscript', 'zig', 'zsh'],
        },
      },
    },
  },

  ui: {
    theme: {
      colors: ['primary', 'secondary', 'info', 'success', 'warning', 'error'],
    },
  },

  // Hybrid prerender: about / resume / blog は各ページ実装後に追加予定
  routeRules: {
    '/': { prerender: true },
  },

  // future: {
  //   compatibilityVersion: 5,
  // },

  experimental: {
    viewTransition: true,
  },
  compatibilityDate: '2026-04-19',

  // @nuxtjs/mdc が include に追加する unresolvable エントリを除去
  // DevServerPlugin.config が Set 完全一致でフィルタするため、プレフィックス込みで指定する
  vite: {
    optimizeDeps: {
      exclude: [
        '@nuxtjs/mdc > remark-gfm',
        '@nuxtjs/mdc > remark-emoji',
        '@nuxtjs/mdc > remark-mdc',
        '@nuxtjs/mdc > remark-rehype',
        '@nuxtjs/mdc > rehype-raw',
        '@nuxtjs/mdc > parse5',
        '@nuxtjs/mdc > unist-util-visit',
        '@nuxtjs/mdc > unified',
        '@nuxtjs/mdc > debug',
        '@nuxtjs/mdc > extend',
      ],
    },
  },

  // 開発ツール
  typescript: {
    strict: true,
  },

  eslint: {
    config: {
      stylistic: {
        braceStyle: '1tbs',
      },
    },
  },

  fonts: {
    families: [
      { name: 'Noto Sans JP', global: true },
    ],
  },
  robots: {
    // AI クローラーをブロック
    blockAiBots: true,
    // 本番以外は全クロールをブロック（NUXT_SITE_ENV=staging で適用）
  },

  sitemap: {
    // アプリのページ（/、/about、/resume）も含める
    includeAppSources: true,
    // draft 記事はサイトマップに含めない
    exclude: ['/blog/__sitemap__/**'],
  },

  studio: {
    repository: {
      provider: 'github',
      owner: 'is-nao',
      repo: 'portfolio-nuxt',
    },
    i18n: {
      defaultLocale: 'ja',
    },
  },
})
