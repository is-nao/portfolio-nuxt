# 個人サイト 実装計画

最終更新: 2026-04-19

本ドキュメントは**作業中の計画書**です。方針が固まり恒久化できる項目（コマンド・コーディング規約・アーキテクチャ原則）は、確定次第 `CLAUDE.md` に昇格させます。

---

## 0. ゴール

2026 年 4 月時点の最新スタックで、以下を満たす個人サイトを構築する。

- 最新機能の積極導入 / テストドリブン
- デプロイ先: **Cloudflare Workers**（Static Assets 方式。Pages ではない）
- ページ: top / about / blog / resume / 管理画面(Nuxt Studio)
- View Transition API + アニメーション、カラーモード、レスポンシブ、SEO 一式

---

## 1. 技術選定

### 1.1 コアスタック

| 区分           | 採択                             | バージョン目安 / 備考                                                               |
| -------------- | -------------------------------- | ----------------------------------------------------------------------------------- |
| ランタイム     | Node (ローカル) / workerd (本番) | Docker: `node:24-trixie-slim`                                                       |
| パッケージ     | pnpm                             | v10、`node-linker=isolated` を維持                                                  |
| フレームワーク | Nuxt                             | **v5 GA 時点で採用 / 未 GA なら v4.2+ + `compatibilityVersion: 5`**（ADR-002 参照） |
| UI             | Nuxt UI                          | **v4**（Tailwind CSS v4 + Reka UI 前提）                                            |
| スタイル       | Tailwind CSS                     | **v4**（`@theme` ディレクティブ構成）                                               |
| Content        | Nuxt Content                     | **v3**（`defineContentConfig` + Zod v4）                                            |
| バリデーション | Zod                              | v4                                                                                  |
| CMS            | Nuxt Studio                      | スキーマ連動フォーム生成対応                                                        |
| 画像           | `@nuxt/image`                    | Cloudflare Images provider を採用                                                   |
| ユーティリティ | `@vueuse/nuxt`                   | `useColorMode` / `usePreferredReducedMotion` 等                                     |
| アイコン       | `@nuxt/icon`                     | Nuxt UI 4 に同梱                                                                    |

### 1.2 SEO / メタ

- `@nuxtjs/seo`（メタ集約パック）
- `@nuxtjs/sitemap` / `@nuxtjs/robots`
- `nuxt-og-image`（Satori ベース、Workers 互換）

### 1.3 テスト（TDD 前提）

| レイヤ         | 採択                                                          |
| -------------- | ------------------------------------------------------------- |
| Unit           | Vitest 3 + `@vue/test-utils`                                  |
| コンポーネント | Vitest Browser Mode (Playwright driver)                       |
| Nuxt 統合      | `@nuxt/test-utils/runtime`                                    |
| E2E            | Playwright                                                    |
| Workers 互換   | `@cloudflare/vitest-pool-workers`（workerd ランタイムで検証） |
| 型             | `vue-tsc` を CI 必須ステップに                                |

### 1.4 コード品質

- **`.editorconfig`**: インデント 2 spaces / LF / UTF-8 / trailing-ws（`*.md` は保持）
- **Prettier**: `singleQuote: true`, `semi: false`, `printWidth: 100`, `trailingComma: 'all'`, plugins: `prettier-plugin-tailwindcss`
- **`@nuxt/eslint`**（flat config、`features.stylistic: false` で整形は Prettier に完全委譲）
- **`eslint-plugin-tsdoc`**（TSDoc 構文検査、`tsdoc/syntax: 'warn'`）
- **`eslint-config-prettier`** を flat 末尾に append（衝突ルール無効化）
- `simple-git-hooks` + `lint-staged`（`*.{js,ts,vue}` に `eslint --fix` と `prettier --write`）
- `commit-commands` plugin の hook で push 前に `pnpm test --run` を実行

**方針**: クォート・セミコロンは Prettier に統一。ESLint は整形に関与させずロジック/型/TSDoc 構文のみ検査する。JS/TS/Vue script ブロック内はシングルクォート + セミコロン無し、Vue テンプレート属性は HTML 慣習通りダブルクォート維持。

### 1.5 追加したい MCP（未実施）

- [x] Cloudflare Developer Platform（既に有効）
- [x] GitHub（既に有効）
- [x] Context7（既に有効）
- [ ] **Playwright MCP** — E2E デバッグ、スクリーンショット確認
- [ ] **Chrome DevTools MCP** — Lighthouse / CWV の自動計測

---

## 2. 重要な設計決定（ADR 相当）

### ADR-001: Cloudflare は Workers (Static Assets) を採用、Pages は不採用

**背景**: 2025-09 以降 Cloudflare は新規プロジェクトを Workers 推奨。新機能は Workers 側で開発。
**決定**: Nitro preset = `cloudflare_module`、`wrangler.jsonc` に `assets.directory` と `main` を併記。
**結果**: wrangler v4.34+ 必須、compatibility_flags に `nodejs_compat`。

### ADR-002: バンドラは Nuxt 5 GA を待って Rolldown、未 GA 時は Vite 7 で先行着手

**背景**: 公式 upgrade ガイドに「**Vite 8 / Rolldown への移行は `compatibilityVersion` で opt-in できない**」と明記あり。Rolldown は Nuxt 5 本体でのみ有効化される。
**決定**:

1. 着手時点で Nuxt 5 が GA 済み → **Nuxt 5 を直接採用**（Rolldown 即利用）
2. 未 GA の場合 → **Nuxt 4.2+ に `future.compatibilityVersion: 5` を設定**。Vite 7 のまま Environment API / 新デフォルト挙動を先取りし、Nuxt 5 GA 時点で 1 段階バージョン上げるだけで Rolldown に移行完了する形にする。
3. beta/RC 採用は避ける（テスト戦略の再現性を優先）。
   **結果**: `vite.esbuild` / `build.rollupOptions` の使用は初日から避ける（非推奨記法に依存しないコードベースを維持）。
   **リスク**: Rolldown 固有の挙動差は GA 後に顕在化 → 切替時は Phase 0 の CI（unit+build+e2e）を全面実行して差分検知。

### ADR-003: Tailwind 設定は `@theme` ディレクティブに集約

**背景**: Nuxt UI 4 / Tailwind 4 は `tailwind.config.js` から CSS 側の `@theme` に移行。
**決定**: `app/assets/css/main.css` に `@import "tailwindcss"; @import "@nuxt/ui";` の順で宣言、続けて `@theme` でトークン定義。`DESIGN.md` と同期。

### ADR-004: Timeline は Nuxt Content の `tl` コレクションで管理

**背景**: Git log 自動パースは履歴改変に弱く、粒度も雑になりがち。Nuxt Studio で手動編集できる方が運用しやすい。また他コレクション (blog / resume) と同じクエリ API で扱える。
**決定**: `content/tl/*.yaml`（もしくは `.md`）を `defineCollection({ type: 'data', source: 'tl/*.yaml' })` として追加。スキーマは `{ date, kind: 'blog'|'resume'|'note', title, refSlug?, summary? }` を想定（詳細は後続指示）。
**描画**: Top ページは `queryCollection('tl').order('date', 'DESC').all()` で取得。カード種別ごとに slot 切替。
**代替案との比較**:

- Git log 自動生成: 運用コスト低いが粒度制御不可・履歴書換で壊れる → 採用しない
- 別 DB (KV/D1): 個人サイトには過剰
  **副次効果**: blog 記事追加と同じ CMS フローで timeline も更新可能（Studio で完結）。

### ADR-005: 管理画面は Nuxt Studio に全振り

**背景**: スキーマ駆動フォーム生成が v3 で整備済み。独自管理 UI は車輪の再発明。
**決定**: Zod スキーマに `.editor({ input: 'media'|'icon' })` を付与して Studio UI を最適化。独自管理ページは作らない。

---

## 3. 段階的実装方針

各 Phase は「失敗するテスト → 最小実装 → グリーン → リファクタ」の単位。Phase 完了条件 = **CI グリーン + (必要なら) Lighthouse スコア基準**。

### Phase 0 — 足場（0.5〜1 日）

- [x] Nuxt 5 GA 状況を確認 → 未 GA のため **Nuxt 4.4.2 + `future.compatibilityVersion: 5`** で採用
- [x] `pnpm create nuxt@latest`、TS strict、`app/` 構成
- [x] Prettier / `@nuxt/eslint` / `eslint-plugin-tsdoc` / `eslint-config-prettier` / `prettier-plugin-tailwindcss` を追加
- [x] `.prettierrc.json`（`singleQuote: true`, `semi: false` 等）と `.prettierignore` 作成
- [x] `eslint.config.mjs`（`features.stylistic: false` + tsdoc + prettier flat を末尾 append）
- [x] Vitest / Playwright 雛形（`vitest.config.ts`, `playwright.config.ts`, `test/unit/sanity.spec.ts`, `test/e2e/home.spec.ts`）
- [x] `@cloudflare/vitest-pool-workers` 追加（deps 追加済、Phase 6 で workerd プロジェクト定義を追加予定）
- [x] CI: `format:check → lint → typecheck → unit → build → e2e(chromium)`（`.github/workflows/ci.yml` 作成済、test 工程も結線済み）
- [x] `DESIGN.md` 初稿（カラートークン / タイポ / 余白 / モーション / a11y 基準）
- [x] `wrangler.jsonc` 最小版 + `NITRO_PRESET=cloudflare_module`
- [x] `compatibility_date` を作業日付に、`compatibility_flags=['nodejs_compat']`
- [ ] `vite.esbuild` / `build.rollupOptions` 使用禁止ルールを CLAUDE.md 昇格時に明記

**検証結果 (2026-04-19)**: `pnpm format:check` / `pnpm lint` / `pnpm typecheck` / `pnpm build` / `pnpm test:unit` / `pnpm exec playwright test --list` すべて ✅。ビルド出力 1.33 MB (gzip 414 kB)、Cloudflare Workers 互換 `.output/` 生成確認。

**追補 (2026-04-20)**: 初回 push の CI で E2E job が `pnpm dev` の optimizeDeps 解決 hang により timeout。`nuxt preview` も ARM64 devcontainer 上の workerd が 99% CPU で応答せず不安定。E2E 専用ビルドを **Nitro `node-server` preset** に分岐して対処。`package.json` に `build:node` / `start` スクリプト追加、`playwright.config.ts` webServer を `pnpm start` に変更、CI e2e job に `pnpm build:node` ステップを追加。本番 deploy は従来通り `cloudflare_module`（ADR-001 不変）。

**完了条件**: 空ページが Workers プレビューにデプロイでき、CI が全ステップ緑。

### Phase 1 — デザイン基盤（1〜2 日）

- [ ] Nuxt UI 4 導入、`main.css` に `@theme` でトークン定義
- [ ] `useColorMode` + `<UColorModeSelect>` で light/dark/system
- [ ] `app.vue` シェル（Header/Footer/Drawer）、reduce-motion 分岐
- [ ] `useViewTransition` ラッパー作成
- [ ] テスト: カラーモード切替スナップショット、axe-core baseline

### Phase 2 — Content 基盤（1 日、各コレクション定義は後続指示）

- [ ] `content.config.ts` 骨格（`defineContentConfig` + Zod、コレクション枠: `about` / `resume` / `blog` / `icon` / `tl`）
- [ ] `tl` コレクションは `type: 'data'` でスキーマ雛形（`date`, `kind`, `title` のみ。詳細は後続指示で確定）
- [ ] MDC コンポーネントディレクトリ（`app/components/content/`）
- [ ] **末尾 `.md` raw 表示ルート**（`server/routes/[...slug].md.get.ts`）
- [ ] 共通 `[...slug].vue` でプレビュー

### Phase 3a — Top / About（1〜2 日）

- [ ] Hero に `view-transition-name: hero-avatar` 等の命名規則を DESIGN.md に追記
- [ ] Timeline: `queryCollection('tl').order('date','DESC').all()` で取得、種別ごとに表示切替（ADR-004）
- [ ] About 遷移時に `document.startViewTransition` を `beforeResolve` でラップ
- [ ] テスト: Timeline 並び順（日付 desc）、種別フィルタ、reduce-motion 時 VT 無効

### Phase 3b — Blog（2〜3 日）

- [ ] Shiki シンタックスハイライト（Nuxt Content 内蔵）
- [ ] 独自 MDC コンポーネント（Callout / Note など）
- [ ] リンクカード: `ProseA` 上書き、OGP ビルド時プリフェッチ
- [ ] `.md` 末尾ルート（Phase 2 流用）
- [ ] プレビュー機能（Studio preview mode & `?preview` クエリ対応）
- [ ] サムネ自動生成: `nuxt-og-image` + `<OgImageTemplate>` Vue テンプレ

### Phase 3c — Resume（1 日）

- [ ] YAML を Zod で型付け（`z.object({ periods: z.array(...) })`）
- [ ] `/resume.md` サーバエンドポイント（YAML → md）
- [ ] ダウンロード: `/resume.md`（`Content-Disposition: attachment`）

### Phase 4 — SEO / インデックス（0.5 日）

- [ ] `@nuxtjs/seo` 一式
- [ ] `@nuxtjs/sitemap` に Content の navigation を渡す
- [ ] `robots.txt` 環境別（preview は Disallow: /）
- [ ] OG 画像を全ページに適用

### Phase 5 — Cloudflare Workers デプロイ（0.5 日）

- [ ] `wrangler.jsonc` 本番化（ASSETS binding、observability 有効）
- [ ] CI: `pnpm build && wrangler deploy --env production`
- [ ] PR プレビュー: `wrangler versions upload` → URL を PR コメント

### Phase 6 — Studio 連携（0.5〜1 日）

- [ ] Studio プロジェクト登録
- [ ] `content.config.ts` の `.editor()` で入力タイプ調整
- [ ] 独自管理 UI は作らない（ADR-005）

### Phase 7 — 観測 / 最適化（継続）

- [ ] Workers Observability 有効化
- [ ] Lighthouse CI を GitHub Actions に追加、CWV 退行を PR で検知
- [ ] bundle analyzer で Workers サイズ監視（1 MB 上限を意識）

---

## 4. リスクと先回り対策

| リスク                            | 対策                                                                                    |
| --------------------------------- | --------------------------------------------------------------------------------------- |
| Nuxt 5 未 GA 時の Rolldown 不使用 | Phase 0 から `compatibilityVersion: 5` で Vite 7 先行着手、GA 時に段階的切替（ADR-002） |
| Workers で Node API 未対応        | `nodejs_compat` フラグ、画像変換は Cloudflare Images に委譲                             |
| View Transition の SSR/CSR 差分   | SSR 無効、クライアント遷移のみ。reduce-motion で自動 off                                |
| Studio がスキーマ変更に追従遅れ   | Phase 2 は空コレクションで骨格のみ、後続指示で拡張                                      |
| Workers バンドルサイズ上限        | Nitro 静的化可能な箇所は `routeRules.prerender: true` を活用                            |

---

## 5. オープンな論点（要判断）

- [x] **Biome vs Prettier** → **Prettier 採用決定**（2026-04-19）。`prettier-plugin-tailwindcss` によるクラス順整列を重視。Biome は不採用。
- [ ] **Timeline のカード種別**: `blog` / `resume` 以外に `note` / `milestone` を増やすか
- [ ] **Nuxt Content コレクション定義**: ユーザー指示待ち（about / resume / blog / icon）

---

## 6. 進め方プロトコル

1. 本ファイルで合意 → Phase ごとに着手
2. Phase 完了時に該当チェックボックスを ✅ に更新
3. Phase 完了ごとに恒久的な決定事項を `CLAUDE.md` に昇格
4. 予期せぬ仕様変更は「ADR-00X」として本ファイル §2 に追記
