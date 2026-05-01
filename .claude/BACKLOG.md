# 個人サイト Backlog

最終更新: 2026-04-24

本ドキュメントは**作業中の backlog** です。Phase ごとのタスク・ADR・未決事項・追補ノートを集約し、方針が固まり恒久化できる項目（コマンド・コーディング規約・アーキテクチャ原則）は、確定次第 `CLAUDE.md` に昇格させます。

---

## 進め方プロトコル

1. 本ファイルで合意 → Phase ごとに着手
2. 決定・実装・検証で新情報が出た都度、該当チェックボックスの ✅ 化と追補ノートを**随時**反映する（Phase 完了を待たない）
3. 安定した決定事項は適切なタイミングで `CLAUDE.md` に昇格
4. 予期せぬ仕様変更は「ADR-00X」として本ファイル §2 に追記

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

### 1.5 MCP 構成

**user スコープ（全プロジェクト共有）**

- [x] Cloudflare Developer Platform
- [x] GitHub
- [x] Context7

**project スコープ（`.mcp.json` に集約、Phase 1 着手前にまとめて導入）**

- [x] **Nuxt MCP**（`https://nuxt.com/mcp`）— docs / blog / deploy
- [x] **Nuxt UI MCP**（`https://ui.nuxt.com/mcp`）— コンポーネント検索、Migration ガイド、アイコン検索
- [x] **Nuxt Content MCP**（`https://content.nuxt.com/mcp`）— Content モジュール固有のドキュメント
- [x] **Nuxt Studio MCP**（`https://nuxt.studio/mcp`）— Studio 連携時の情報参照
- [x] **Playwright MCP**（Microsoft 公式 `@playwright/mcp`）— E2E デバッグ、スクリーンショット確認
- [x] **Chrome DevTools MCP**（Google 公式 `chrome-devtools-mcp`）— パフォーマンストレース / CWV 自動計測

**Tier 2（Phase 2 以降に評価）**: `nuxt-mcp` (antfu, Experimental) / `vite-plugin-vue-mcp` (webfansplz) — 自プロジェクトの auto-imports / components / Pinia state を LLM に introspection させる dev サーバー組み込み型。components が増えてから効くため Phase 1 では見送り。

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
- [x] `vite.esbuild` / `build.rollupOptions` 使用禁止ルールを CLAUDE.md 昇格時に明記

**検証結果 (2026-04-19)**: `pnpm format:check` / `pnpm lint` / `pnpm typecheck` / `pnpm build` / `pnpm test:unit` / `pnpm exec playwright test --list` すべて ✅。ビルド出力 1.33 MB (gzip 414 kB)、Cloudflare Workers 互換 `.output/` 生成確認。

**追補 (2026-04-20)**: 初回 push の CI で E2E job が `pnpm dev` の optimizeDeps 解決 hang により timeout。`nuxt preview` も ARM64 devcontainer 上の workerd が 99% CPU で応答せず不安定。E2E 専用ビルドを **Nitro `node-server` preset** に分岐して対処。`package.json` に `build:node` / `start` スクリプト追加、`playwright.config.ts` webServer を `pnpm start` に変更、CI e2e job に `pnpm build:node` ステップを追加。本番 deploy は従来通り `cloudflare_module`（ADR-001 不変）。

**追補 (2026-04-20, 続)**: GitHub Actions の Node.js 20 非推奨警告に対応。`actions/checkout@v4→v6` / `actions/setup-node@v4→v6` / `pnpm/action-setup@v4→v5` / `actions/upload-artifact@v4→v7` をすべて Node 24 ネイティブ版へ引き上げ。あわせて `.github/workflows/ci.yml` → `ci.yaml` に改名（拡張子統一）。run `24633935805` で警告 0 件・全ジョブ緑を確認。

**完了条件**: 本番 deploy 経路（`pnpm build` による `cloudflare_module` 出力 1.33 MB / gzip 414 kB）が生成でき、CI が全ステップ緑。実 deploy は Phase 5 で実施。

### Phase 1 — デザイン基盤（1〜2 日）

DESIGN.md が **Kintsugi Precision** として確定済み。実装パレットは **独自生成の `turquoise` / `gold` 11 段階スケール**。方針は `CLAUDE.md` §デザインシステムへ昇格済み。

- [x] トークン層: `main.css` の `@theme` に OS ネイティブ sans stack・`--ui-container`・独自 `--color-turquoise-*` / `--color-gold-*` を定義、`:root`/`.dark` で `--ui-*` オーバーライド（DESIGN.md §1.3 の表どおり）、`.label-caps` ユーティリティ
- [x] セマンティック層: `app.config.ts` で `ui.colors` 割当（primary=turquoise / secondary=gold / neutral=stone）。`tertiary` カスタムロール追加は見送り、Nuxt UI 既定セマンティックで必要十分と判断
- [x] 形状言語: Sharp（`--ui-radius: 0`）、`Button` は `rounded-none` 固定。`Avatar` など本来円形が期待される要素は個別 slot で `rounded-full` 復帰
- [x] App シェル: `app.vue` を Header/Main/Footer 構成に差し替え、`AppHeader.vue` に `UColorModeSelect` + モバイル Drawer
- [x] `useViewTransition` composable（reduce-motion 時は startViewTransition を短絡、`window.matchMedia` 直叩きで `@vueuse/core` 直接依存を回避）
- [x] テスト: `.dark` クラスの `--ui-bg` 切替 unit、`@axe-core/playwright` の e2e ベースライン、reduce-motion 時の VT 無効化
- [x] サイト名を **naoki.dev** に確定。h1 は `naoki — System Engineer`（仮）。`titleTemplate: '%s — naoki.dev'` で WCAG 2.4.2 を全ページで担保

**追補 (2026-04-23)**: Phase 1 検証完了。`pnpm format:check` / `pnpm lint` / `pnpm typecheck` / `pnpm test:unit` (4 tests) / `pnpm build` (Cloudflare 1.6 MB / gzip 480 kB) / `pnpm build:node` / `pnpm exec playwright test` (2/2 chromium) すべて ✅。

**追補 (2026-04-24)**: デザインシステムを **Kintsugi Precision** として確定。(1) Light は Dark の鏡像として設計する二層アプローチ、(2) 独自 `turquoise` / `gold` 11 段階スケール、(3) `tertiary` ロールは追加せず Nuxt UI 既定セマンティックに収める、(4) 形状言語は Sharp（`--ui-radius: 0`）で統一。`CLAUDE.md` §デザインシステムへ昇格済み。

**追補 (2026-04-23, devcontainer)**: Playwright E2E を devcontainer で動かすために下記を整備。

- `.devcontainer/Dockerfile`: Chromium 用共有ライブラリ（`libglib2.0-0t64` ほか計 19 個）を apt で焼き込み。`/home/node/.cache/ms-playwright` を node 所有で事前作成し、named volume マウント時のパーミッション問題を回避
- `.devcontainer/compose.yaml`: `playwright-cache` named volume を追加してブラウザバイナリ (~475 MiB) をリビルド横断で永続化
- `playwright.config.ts` は chromium のみ。Firefox/WebKit 依存 (`libgtk-3-0t64` 等) は必要になった時点で追加

**決定事項の CLAUDE.md 昇格候補**: Playwright は `pnpm exec playwright install chromium` 限定で運用（config が chromium のみ）。Phase 完了時に昇格を検討。

### Phase 2 — Content 基盤（1 日、各コレクション定義は後続指示）

- [x] `content.config.ts` 骨格（`defineContentConfig` + Zod、コレクション: `about` / `company` / `project` / `icon` / `blog`）
- [x] 雛形 YAML / MD を `content/` 配下に配置（`about.yaml` / `company/01-example.yaml` / `project/01-example.yaml` / `icons.yaml` / `blog/hello-world.md`）
- [x] `app/pages/resume.vue` で `project.stack` 横断集計ロジックを実装（`Map.groupBy` で `category:name` キー化 → `totalMonths` 合計 / 最高 `level` 採用）
- [ ] `tl` コレクションは `type: 'data'` でスキーマ雛形（`date`, `kind`, `title` のみ。詳細は後続指示で確定）
- [ ] MDC コンポーネントディレクトリ（`app/components/content/`）
- [ ] **末尾 `.md` raw 表示ルート**（`server/routes/[...slug].md.get.ts`）
- [ ] 共通 `[...slug].vue` でプレビュー

**追補 (2026-04-24, Zod / Studio)**: 実装中に判明した要点を `CLAUDE.md` へ昇格済み（§Zod / §Nuxt Studio スキーマ対応）。要点は以下。

- Zod は `zod` パッケージの root import だと v3 API にフォールバックするため、**`import { z } from 'zod/v4'` サブパス指定が必須**（`z.iso` / `z.int()` 等 v4 新 API が使えない）
- Studio のフォーム UI は JSON Schema Draft-07 経由で自動マッピングされる。`z.record(...)` は**非対応**なので、カテゴリ横断の構造は `Object.fromEntries(SKILL_CATEGORIES.map(...))` で静的キーの `z.object` に展開する（`skillCategoryMap` ヘルパ）
- 日付系 (`z.date()` / `z.iso.date()` / `z.iso.datetime()`) は Nuxt Content 上ではすべて**文字列**として渡る（Date 化されない）。表示は `new Date(str).toLocaleDateString('ja-JP')` で行う
- `property().editor()` で Studio 用 UI 拡張（`'icon'` / `'media'` / `'textarea'` / `hidden`）。`@nuxt/content` から直接 import

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

| リスク                                                                                                                                                                                                                                | 対策                                                                                                                                                                |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Nuxt 5 未 GA 時の Rolldown 不使用                                                                                                                                                                                                     | Phase 0 から `compatibilityVersion: 5` で Vite 7 先行着手、GA 時に段階的切替（ADR-002）                                                                             |
| Workers で Node API 未対応                                                                                                                                                                                                            | `nodejs_compat` フラグ、画像変換は Cloudflare Images に委譲                                                                                                         |
| View Transition の SSR/CSR 差分                                                                                                                                                                                                       | SSR 無効、クライアント遷移のみ。reduce-motion で自動 off                                                                                                            |
| Studio がスキーマ変更に追従遅れ                                                                                                                                                                                                       | Phase 2 は空コレクションで骨格のみ、後続指示で拡張                                                                                                                  |
| Workers バンドルサイズ上限                                                                                                                                                                                                            | Nitro 静的化可能な箇所は `routeRules.prerender: true` を活用                                                                                                        |
| Nuxt 4.3+ × `compatibilityVersion: 5` で `defineAppConfig` が nitro バンドルで未解決になる regression（[nuxt/nuxt#34142](https://github.com/nuxt/nuxt/issues/34142) / PR [#34157](https://github.com/nuxt/nuxt/pull/34157) 未マージ） | `app/app.config.ts` にローカル shim（`const defineAppConfig = <T>(c: T): T => c`）を入れて回避中（未 commit）。本体修正が出たら shim を削除し、回避 commit を避ける |

---

## 5. オープンな論点（要判断）

- [x] **Biome vs Prettier** → **Prettier 採用決定**（2026-04-19）。`prettier-plugin-tailwindcss` によるクラス順整列を重視。Biome は不採用。
- [x] **デザインシステム** → **Kintsugi Precision 採用決定**（2026-04-24 確定）。詳細は `DESIGN.md`、安定した決定事項は `CLAUDE.md` §デザインシステムに昇格済み。
- [ ] **Timeline のカード種別**: `blog` / `resume` 以外に `note` / `milestone` を増やすか
- [ ] **Nuxt Content コレクション定義**: ユーザー指示待ち（about / resume / blog / icon）
- [ ] **Nuxt #34142 の修正取り込み**: `future.compatibilityVersion: 5` で prerender 時に `defineAppConfig is not defined` が出るリグレッション。ローカル shim で回避中（未ステージ）。[nuxt/nuxt#34142](https://github.com/nuxt/nuxt/issues/34142) / PR [#34157](https://github.com/nuxt/nuxt/pull/34157) がリリースに入ったら shim を削除する
