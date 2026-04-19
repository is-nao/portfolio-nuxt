# CLAUDE.md

個人ポートフォリオサイト（Nuxt 4 + Cloudflare Workers）。工程の詳細・未決事項は `plan.md`。

## スタック前提

- Node 24 / pnpm 10 / devcontainer（`DEVCONTAINER=true`）
- Nuxt 4.4.2 + `future.compatibilityVersion: 5`（Nuxt 5 GA 後に移行）
- Nuxt UI 4 + Tailwind CSS v4（`@theme` ディレクティブ、`tailwind.config.js` は使わない）
- Nuxt Content 3 + Zod 4（Cloudflare デプロイでは D1 `DB` バインディングに自動切替）
- VueUse / Nuxt Image / Nuxt Studio
- Deploy: Cloudflare Workers Static Assets（Pages ではない）

## コード規約

- 単一引用符、行末セミコロン無し、`trailingComma: 'all'`、`printWidth: 100`
- js/ts/vue `<script>` には適宜 TSDoc を書く（`eslint-plugin-tsdoc` が `warn`）
- コメントは WHY が非自明なときのみ。WHAT の説明は書かない
- フォーマット: Prettier（+ `prettier-plugin-tailwindcss`）
- リント: ESLint flat（`@nuxt/eslint` `stylistic: false` + 末尾 `eslint-config-prettier`）
- `vite.esbuild` / `build.rollupOptions` は使わない（Nuxt 5 の Rolldown 移行で破壊される API のため）

## 設定の置き場所

- pnpm 設定（`peerDependencyRules` / `onlyBuiltDependencies`）は `package.json` の `pnpm` キーに集約。`pnpm-workspace.yaml` は作らない
- `pnpm approve-builds` が `pnpm-workspace.yaml` を生成した場合は、中身を `package.json` に移してから YAML ファイルを削除する
- モノレポ化 / `catalog:` 採用時に限り `pnpm-workspace.yaml` を作成し、その場合は pnpm 設定を YAML 側に一本化する

## テスト

- Unit: Vitest（`test/unit/**`）。Nuxt ランタイムが必要なテストは先頭に `// @vitest-environment nuxt` を付与
- E2E: Playwright（`test/e2e/**`）。`pnpm build:node`（Nitro `node-server` preset）でビルド後、`pnpm start` で `.output/server/index.mjs` を Node 起動。本番 deploy 用の `cloudflare_module` ビルド (`pnpm build`) と使い分ける
- Workers 互換: `@cloudflare/vitest-pool-workers`（Phase 6 で project 定義を追加予定）

## 開発フロー

- 「失敗するテスト → 最小実装 → グリーン → リファクタ」を単位とする
- Phase 完了ごとに `plan.md` のチェックを更新し、安定した決定事項は本ファイルへ昇格する
- 任意の変更後の検証セット: `pnpm format:check && pnpm lint && pnpm typecheck && pnpm test:unit && pnpm build`
- 破壊的 / 公開影響のある操作（push, force push, ブランチ削除, デプロイ等）は実行前に必ず確認する
