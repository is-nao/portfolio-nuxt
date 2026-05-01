# naoki.dev

個人ポートフォリオサイト。Nuxt 4 + Nuxt UI 4 + Nuxt Content 3 を Cloudflare Workers Static Assets にデプロイする構成。

デザインシステムのコードネームは **Kintsugi Precision**（詳細は [`DESIGN.md`](./DESIGN.md)）、プロジェクトの backlog は [`.claude/BACKLOG.md`](./.claude/BACKLOG.md)、開発規約は [`.claude/CLAUDE.md`](./.claude/CLAUDE.md) を参照。

## 前提

- Node.js 24 / pnpm 10（devcontainer 推奨）
- Cloudflare Workers アカウント（本番デプロイ時）

`@types/*` 等の devDependency は `node-linker=isolated` 前提なので、パッケージ操作は必ず pnpm で行う（npm / yarn / bun は使わない）。

## セットアップ

```bash
pnpm install                              # 依存インストール（postinstall で nuxt prepare + simple-git-hooks が走る）
pnpm exec playwright install chromium     # E2E 用ブラウザ。playwright.config.ts が chromium 限定なので他ブラウザは入れない
```

### Claude Code スキル

スキル管理は [skills.sh](https://skills.sh) ([vercel-labs/skills](https://github.com/vercel-labs/skills)) を使う。

```bash
npx skills            # 対話的にスキル追加（symlink / claude-code を選択）
npx skills update     # 追加済みスキルを最新版へ更新
```

- 実体は `.agents/skills/` に DL され、`.claude/skills/` にはそこへの symlink が作られる
- スキル情報は `skills-lock.json` に記録される（`npx skills update` で更新）
- git では `.agents/skills/` は ignore、`.claude/skills/`（symlink 群）と `skills-lock.json` は commit 対象

## 開発

```bash
pnpm dev           # http://localhost:3000
```

## ビルド

```bash
pnpm build         # 本番用（Cloudflare Workers / cloudflare_module preset）
pnpm build:node    # E2E 用（Nitro node-server preset）
pnpm preview       # 本番ビルドのローカルプレビュー
```

## 検証

変更後の標準検証セット:

```bash
pnpm lint && pnpm typecheck && pnpm test:unit && pnpm build
```

個別:

```bash
pnpm test:unit         # Vitest（Nuxt ランタイムが要るテストは先頭に `// @vitest-environment nuxt`）
pnpm build:node        # Nitro node-server preset でビルド（E2E の前提）
pnpm start             # .output/server/index.mjs を Node 起動
pnpm test:e2e          # Playwright（別ターミナルで pnpm start した状態で実行）
pnpm lint:fix          # ESLint 自動修正（スタイル整形 + クラス順序修正を含む）
```

## デプロイ

Cloudflare Workers Static Assets にデプロイする。Pages ではない点に注意。

```bash
pnpm deploy
```
