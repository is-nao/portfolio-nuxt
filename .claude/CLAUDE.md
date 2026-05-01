# CLAUDE.md

個人ポートフォリオサイト（Nuxt 4 + Cloudflare Workers）。工程の詳細・未決事項は `BACKLOG.md`。

## スタック前提

- Node 24 / pnpm 10 / devcontainer（`DEVCONTAINER=true`）
- Nuxt 4.4.2 + `future.compatibilityVersion: 5`（Nuxt 5 GA 後に移行）
- Nuxt UI 4 + Tailwind CSS v4（`@theme` ディレクティブ、`tailwind.config.js` は使わない）
- Nuxt Content 3 + Zod 4（Cloudflare デプロイでは D1 `DB` バインディングに自動切替）
- VueUse / Nuxt Image / Nuxt Studio
- Deploy: Cloudflare Workers Static Assets（Pages ではない）

## デザインシステム

- 単一真実源は `DESIGN.md`（コンセプト名 **Kintsugi Precision**）
- Dark を設計の原典とし、**Light は Dark の鏡像として設計**。CSS 機構としては `:root` / `.dark` で Nuxt UI の `--ui-*` をオーバーライドして切替（`:root` = Light、`.dark` = Dark）
- フォントは OS ネイティブ sans stack のみ（和欧混植のため欧文 Web フォントは採用しない）
- セマンティック色は `primary`（Turquoise）/ `secondary`（Gold）/ `neutral`（Stone）/ success/warning/error/info。Nuxt UI 既定のセマンティックで足り、`ui.theme.colors` へのカスタムロール追加は行わない
- カラーパレットは **独自生成の `turquoise` / `gold` 11 段階スケール**（`@theme` で `--color-turquoise-*` / `--color-gold-*` を定義）。Tailwind の `teal` / `amber` 借用は行わない
- 形状言語は Sharp（`--ui-radius: 0`）。例外は `Avatar` など本来円形が期待される要素のみ個別に slot で `rounded-full` に戻す

## コード規約

- 単一引用符、行末セミコロン無し、`trailingComma: 'all'`、`printWidth: 100`
- js/ts/vue `<script>` には適宜 TSDoc を書く（`eslint-plugin-tsdoc` が `warn`）
- コメントは WHY が非自明なときのみ。WHAT の説明は書かない
- フォーマット: Prettier（+ `prettier-plugin-tailwindcss`）
- リント: ESLint flat（`@nuxt/eslint` `stylistic: false` + 末尾 `eslint-config-prettier`）
- `vite.esbuild` / `build.rollupOptions` は使わない（Nuxt 5 の Rolldown 移行で破壊される API のため）

## 設定の置き場所

- pnpm 設定（`peerDependencyRules` / `onlyBuiltDependencies` / `catalog:` 等）は `pnpm-workspace.yaml` に集約する。`package.json` の `pnpm` キーは使わない（単一パッケージ構成でも同様）
  - 理由: (1) pnpm の方針として pnpm 専用設定は YAML 側へ集約する流れで、`package.json` の `pnpm` キーは将来的に冷遇される見込み / (2) `catalog:` 等の YAML 専用機能をいつでも使える状態にしておく / (3) 「アプリのマニフェスト」と「パッケージマネージャの設定」をファイル単位で分離したい
- `pnpm approve-builds` が生成した `onlyBuiltDependencies` エントリも `pnpm-workspace.yaml` 側にマージする（`package.json` に戻さない）
- `@types/*` は直接の devDependency として宣言する。`node-linker=isolated` では transitive `@types/*` は `node_modules/@types/` に hoist されず、Nuxt 管轄外の設定ファイル（`playwright.config.ts` / `vitest.config.ts` など）で型解決に失敗するため（例: `@types/node` 無しだと `process` が `ts(2591)`）
- Nuxt 4 は `srcDir: 'app/'` なので `app.config.ts` / `app.vue` / `error.vue` は `app/` 直下に置く（ルート直下では Nuxt が拾わない）

## テスト

- Unit: Vitest（`test/unit/**`）。Nuxt ランタイムが必要なテストは先頭に `// @vitest-environment nuxt` を付与
- E2E: Playwright（`test/e2e/**`）。`pnpm build:node`（Nitro `node-server` preset）でビルド後、`pnpm start` で `.output/server/index.mjs` を Node 起動。本番 deploy 用の `cloudflare_module` ビルド (`pnpm build`) と使い分ける
- Workers 互換: `@cloudflare/vitest-pool-workers`（Phase 6 で project 定義を追加予定）

## 開発フロー

- 「失敗するテスト → 最小実装 → グリーン → リファクタ」を単位とする
- `BACKLOG.md` は Phase 境界を待たず、決定・実装・検証で新情報が出た都度更新する（チェックボックス・追補ノート・ADR）。安定した決定事項は本ファイルへ昇格する
- 任意の変更後の検証セット: `pnpm format:check && pnpm lint && pnpm typecheck && pnpm test:unit && pnpm build`
- 破壊的 / 公開影響のある操作（push, force push, ブランチ削除, デプロイ等）は実行前に必ず確認する

## Claude Code 環境

- MCP 経路の優先順位: (1) plugin が配布されているならそれを使う（skill / agent もセットで降ってくる）/ (2) チーム全員に強制したいサーバーのみ `.mcp.json` に置く（clone 時点で利用可能）/ (3) 個人横断ツール（Cloudflare / GitHub / Context7）は user スコープ
- 同じ MCP サーバーを plugin と `.mcp.json` の両方に登録しない（`mcp__<server>__*` と `mcp__plugin_<plugin>_<server>__*` で重複露出する）
- 別環境・初回利用時は project スコープ MCP の承認プロンプトが出る。接続状態は `claude mcp list`、過去承認のリセットは `claude mcp reset-project-choices`
- `.mcp.json` / `skills-lock.json` / `.claude/skills/`（symlink 群）はチーム共有（commit 対象）。symlink の参照先実体は `.agents/skills/` で、[skills.sh](https://skills.sh) (`npx skills` / `npx skills update`) が `skills-lock.json` から再生成するため `.agents/skills/` のみ gitignore
