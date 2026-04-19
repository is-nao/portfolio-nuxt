# Design Guidelines

本ドキュメントは個人サイトのデザインシステム仕様書です。実装は `app/assets/css/main.css` の `@theme` に対応します。

---

## 1. カラートークン

_Phase 1 で定義_

- ベースパレット（`--color-*`）
- セマンティックロール（primary / secondary / accent / neutral / success / warning / error / info）
- カラーモード（light / dark）別のオーバーライド
- アクセシビリティ: 本文と背景のコントラスト比は **WCAG AA (4.5:1 以上)** を必須、見出しは AAA (7:1) を推奨

## 2. タイポグラフィ

_Phase 1 で定義_

- フォントファミリー（sans / mono）— 日本語と欧文の両立を考慮
- サイズスケール（`--text-*`）
- 行間・字間
- フォントウェイト方針

## 3. 余白スケール

_Phase 1 で定義_

- Tailwind の spacing scale を基準に、サイト固有の augmentation を `@theme` で追加
- セクション間の垂直リズム

## 4. ブレークポイント

_Phase 1 で定義_

- モバイルファースト
- `sm` / `md` / `lg` / `xl` の各閾値
- コンテナ最大幅

## 5. モーション原則

_Phase 1 で定義_

- 基本 duration / easing
- **`prefers-reduced-motion: reduce` への追従は必須** — 該当時は transition / animation を即完了
- アクセシビリティ上の禁止事項（3 Hz 以上の点滅等）

## 6. View Transition 命名規則

_Phase 3a で定義_

- `view-transition-name` のプレフィックス規約（例: `vt-hero-`, `vt-card-`）
- トップ ↔ about の遷移で共有する要素の ID 設計

## 7. アイコン

_Phase 1 で定義_

- `@nuxt/icon` を使用、アイコンセット選定（Lucide / Iconify 一部）
- サイズ / カラー継承方針

## 8. アクセシビリティ基準

- WCAG 2.2 AA を最低ライン
- キーボード操作でのフォーカス可視化
- ランドマーク（`<header>`, `<main>`, `<nav>`, `<footer>`）の適切な使用
- スクリーンリーダー向けの `aria-*` 属性
