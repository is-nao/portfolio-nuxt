# Design Guidelines — Kintsugi Precision

本ドキュメントは `naoki.dev` のデザインシステム仕様書です。コンセプト名は **Kintsugi Precision**。実装は以下 3 層にマップされます。

- `app/assets/css/main.css` の `@theme`（生トークン: 色・フォント・ブレークポイント）
- `app/assets/css/main.css` の `:root` / `.dark`（Nuxt UI の `--ui-*` 実効値。Light は Dark の鏡像として設計し、`:root` / `.dark` で `--ui-*` を切り替える）
- `app.config.ts` の `ui.*`（セマンティックロール割当・コンポーネント slot 拡張）
- 新規セマンティック色の追加は `nuxt.config.ts` の `ui.theme.colors` 配列に登録

---

## 0. ブランド & スタイル

本デザインシステムは、**構造的エレガンス（Structural Elegance）** を哲学に置きます — システム工学の技術的精度と、自然素材の有機的な美しさを橋渡しする System Engineer のために構築されています。ブランドパーソナリティは **権威的で、同時に芸術的**。技術的熟練と審美的卓越性の両方を価値とするハイエンドなステークホルダーに向けて作られます。

デザインスタイルは **Minimalism × Tactile Materialism** のハイブリッド。広いネガティブスペースでラグジュアリーを演出しつつ、高精細な turquoise marble テクスチャと金属的ゴールドアクセントで UI を接地します。**"Kintsugi"（金継ぎ）** の影響は UI の接合部に現れます — 単なる区切り線ではなく、技術的な接続を細く輝くゴールドの線でハイライトし、「複雑なシステムにおける破れや挑戦こそが最も価値を生む場所である」という思想を表現します。

Dark を設計の原典として据え、**Light は Dark の鏡像として設計** します。CSS 機構としては `:root` / `.dark` で `--ui-*` を切り替え、`:root` に Light 値・`.dark` に Dark 値を置きます（§1 参照）。Kintsugi の意匠（dark canvas に Gold / Turquoise が浮かび上がる構図）は Dark で最大化され、Light は日中・高輝度環境向けの鏡像バリアントとして機能します。

## 1. カラートークン

### 1.1 ベースパレット（生トークン）

`@theme` で定義する固定値。高コントラストなダークモードを軸に据え、プロフェッショナルな深度と技術的精度を強調します。

| 名称            | 値        | 役割                                                                    |
| --------------- | --------- | ----------------------------------------------------------------------- |
| Deep Turquoise  | `#004B4D` | 主要サーフェス、ブランド重要コンポーネント、marble テクスチャ母色       |
| Shimmering Gold | `#D4AF37` | "The Join" — 構造的アクセント、アクティブ状態、インタラクティブボーダー |
| Dark Charcoal   | `#121212` | 主キャンバス。void 感のある深度で Gold / Turquoise を際立たせる         |
| Crisp White     | `#F5F5F5` | 高可読性ボディテキスト・クリティカルラベル（WCAG 確保のため）           |

Gold は **節度を持って** 使うこと — 構造的接合（Kintsugi Divider）、アクティブボーダー、メタリックエッジに限定します。

Turquoise / Gold は Nuxt UI の要件に従い 50–950 の 11 段階を **独自生成** し、`--color-turquoise-*` / `--color-gold-*` として `@theme` に登録します。**Tailwind の `teal` / `amber` の借用は行わず**、以下の実測アンカー値を起点に OKLCH 空間で補間して 11 段階を構成します。

**Turquoise スケール（#004B4D 基準）**

| Step | 値        | 用途 / 位置付け                                |
| ---- | --------- | ---------------------------------------------- |
| 50   | `#E6F4F5` | 最淡トーン（Light のサブトルな背景用）         |
| 100  | `#B1EDEF` | 淡色アクセント                                 |
| 200  | `#96D1D3` | Dark モードの Primary テキスト・アクセント     |
| 300  | `#7FBABC` | 淡 Turquoise（コンテナ on-color）              |
| 400  | `#2A6769` | 中間トーン（inverse primary 相当）             |
| 500  | `#084F51` | 暗色アクセント                                 |
| 600  | `#004B4D` | **ブランドベース（Deep Turquoise）**           |
| 700  | `#003738` | 濃色 Primary（Light モードの on-primary 相当） |
| 800  | `#002021` | 暗深トーン                                     |
| 900  | `#001515` | 最深トーン                                     |
| 950  | `#000A0A` | 最深トーン（near-black）                       |

**Gold スケール（#D4AF37 基準）**

| Step | 値        | 用途 / 位置付け                                |
| ---- | --------- | ---------------------------------------------- |
| 50   | `#FFF8E0` | 最淡トーン                                     |
| 100  | `#FFE088` | 淡色アクセント                                 |
| 200  | `#E9C349` | Dark モードの Gold アクセント                  |
| 300  | `#D4AF37` | **ブランドベース（Shimmering Gold）**          |
| 400  | `#AF8D11` | Light モードの Gold アクセント（コンテナ相当） |
| 500  | `#574500` | 中間トーン                                     |
| 600  | `#3C2F00` | 暗色 Gold テキスト                             |
| 700  | `#342800` | 暗深トーン                                     |
| 800  | `#241A00` | 暗深トーン                                     |
| 900  | `#1A1200` | 最深トーン                                     |
| 950  | `#0D0900` | 最深トーン                                     |

実装時は Culori 等で OKLCH / HSL 空間での補間検証を行い、視覚的に連続した階調を担保する。

### 1.2 セマンティックロール

`app.config.ts` の `ui.colors` で割り当てます。Nuxt UI 既定のセマンティックロールのみを使用し、カスタムロール（例: `tertiary`）は追加しません — Gold の用途は全て `secondary` に集約します。

| Role                                     | 割当            | 用途                                                        |
| ---------------------------------------- | --------------- | ----------------------------------------------------------- |
| `primary`                                | Deep Turquoise  | 主要サーフェス、プログレス、ブランド重要コンポーネント      |
| `secondary`                              | Shimmering Gold | "The Join"、アクティブボーダー、Kintsugi Divider、署名的 UI |
| `neutral`                                | Stone 系        | テキスト・ボーダー階調（Crisp White を含む）                |
| `success` / `warning` / `error` / `info` | Nuxt UI 既定    | 状態通知                                                    |

将来 Gold 以外の第 3 アクセント（例: neutral gray 系の補助的な区切り用）が必要になった時点で `tertiary` を追加検討する。

### 1.3 Light / Dark モード

**Light は Dark の鏡像として設計** し、`:root` / `.dark` で `--ui-*` を切り替えます。Dark が設計の原典であり、Kintsugi の意匠（dark canvas に Gold / Turquoise が浮かび上がる）はここで最大化されます。Light はその鏡像として明度・階調を反転した表現です。

| Token                   | Light（`:root`・鏡像）    | Dark（`.dark`・原典）     |
| ----------------------- | ------------------------- | ------------------------- |
| `--ui-bg`               | `#F5F5F5` (Crisp White)   | `#131313` (Charcoal)      |
| `--ui-bg-elevated`      | `#FFFFFF`                 | `#1C1B1B`                 |
| `--ui-bg-accented`      | `#EDEDEB`                 | `#201F1F`                 |
| `--ui-text`             | `#1A1C1E`                 | `#E5E2E1`                 |
| `--ui-text-muted`       | `#4A5353` 相当            | `#BFC8C8`                 |
| `--ui-border`           | `#D9DCDC` 相当            | `#3F4849`                 |
| `--ui-primary`          | `#004B4D` (turquoise-600) | `#96D1D3` (turquoise-200) |
| `--ui-secondary` (Gold) | `#AF8D11` (gold-400)      | `#E9C349` (gold-200)      |

両モードで可読性を保つため、Primary / Secondary はモードごとに異なる濃度を当てます（Light は深く、Dark は浅く寄せる）。

### 1.4 アクセシビリティ

本文と背景のコントラスト比は **WCAG AA (4.5:1)** を必須、見出しは **AAA (7:1)** を推奨。Gold をテキストに使う場合は Light では `gold-500` 以上（濃い側）、Dark では `gold-200` 以下（淡い側）に濃度を限定します。

## 2. タイポグラフィ

"Refined Utility" を基調に、建築的シャープさと日本語可読性を両立させます。**CLAUDE.md の決定に従い、欧文 Web フォントは採用せず OS ネイティブ sans stack に委譲します**（和欧混植のコスト・FOUT・ウェイト不整合回避のため）。spec としては Inter / Space Grotesk の意図を保持し、実装は近似スタックで実現します。

- **フォントファミリー（`--font-sans`）**: `ui-sans-serif, system-ui, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'`。和文は各 OS 既定 UI フォント（San Francisco / Hiragino Sans / Yu Gothic UI / Segoe UI / Noto Sans CJK）に委譲
- **スペック上の意図**: Display / Body = Inter 系 neutral / Label = Space Grotesk 系 technical。OS ネイティブ stack でその性格を近似する
- **スケール**（`@theme` に `--text-*` を augmentation）:

| トークン     | font-size | weight | line-height | letter-spacing |
| ------------ | --------- | ------ | ----------- | -------------- |
| `display-lg` | 64px      | 700    | 1.1         | -0.02em        |
| `h1`         | 40px      | 600    | 1.2         | -0.01em        |
| `h2`         | 32px      | 500    | 1.3         | 0.02em         |
| `body-lg`    | 18px      | 400    | 1.6         | 0.01em         |
| `body-md`    | 16px      | 400    | 1.6         | 0.01em         |
| `label-caps` | 12px      | 600    | 1.0         | 0.2em          |

- **Label Caps**: セクションヘッダ・メタデータ・Kintsugi アノテーションに適用する `.label-caps` ユーティリティ — `uppercase` / `tracking-[0.2em]` / `font-semibold` / `text-xs` — で "blueprint" 感を演出（欧文・英数字限定、和文には適用しない）
- **ウェイト**: 400 / 500 / 600 / 700 / 800 の 5 段階に限定。OS 間のウェイト可用性差を吸収
- **見出しトラッキング**: 大見出しは負トラッキング（-0.01 〜 -0.02em）で editorial な密度を、小ラベルは正トラッキング（0.2em）で structural marker としての抜け感を作る
- **数値表示**: 比較可読性を要する箇所（カウンタ・メトリクス）は `font-variant-numeric: tabular-nums`

実装マッピング: `@theme` に `--font-sans: ...` / `--text-display-lg` 等、`main.css` の `@layer components` に `.label-caps`。

## 3. 余白スケール

- **12 カラム固定グリッド**（デスクトップ）— "Precision-Driven Geometry"。要素はグリッドに厳格に整列させ、意図的に非対称・洗練された構図を作る
- **哲学**: ネガティブスペースをプレミアムな資産として扱う。各プロジェクト・各技術概念が「呼吸」できる広さを確保
- **リズム**: 全ての padding/margin は **8px 線形スケール**（Tailwind 既定と一致）
- **Gutter**: `32px` を共通とし、スケール時も要素間の関係が破綻しないようにする
- **Page Margin**: `80px`（デスクトップ）
- **Section Gap**: `160px` — プロジェクト間・大セクション間。"The Join" としてのゴールドラインはこの余白を横切るように配置される
- サブセクション間の垂直リズムは `py-16` / `py-20` を基準とする

## 4. ブレークポイント

モバイルファースト。Tailwind 既定を踏襲しつつコンテナ最大幅のみ augmentation。

| キー | 閾値   | 想定                                      |
| ---- | ------ | ----------------------------------------- |
| `sm` | 640px  | 縦向けスマホ → 横向け                     |
| `md` | 768px  | タブレット                                |
| `lg` | 1024px | デスクトップ（12 col fixed が効き始める） |
| `xl` | 1280px | ワイドデスクトップ                        |

コンテナ最大幅: `--ui-container: 1200px`。

## 5. モーション原則

- 基本 duration: `150ms`（micro）/ `250ms`（standard）/ `400ms`（emphasized）
- 基本 easing: `cubic-bezier(0.2, 0.8, 0.2, 1)`（standard ease-out）
- **`prefers-reduced-motion: reduce` への追従は必須** — transition / animation を `duration: 0.01ms` に差し替え
- 3 Hz 以上の点滅は禁止（光感受性発作の回避）
- **Gold Gleam**: Primary Button ホバー時、金色の斜光がサーフェスを横切る sweep アニメーション（400ms, ease-out）。強調的な瞬間のみ
- **Kintsugi Stroke**: Featured Card ホバー時、ゴールドボーダーが `stroke-dasharray` で 1 周描画される（250ms）

## 6. View Transition 命名規則

Phase 3a で詳細化。現時点の枠のみ記載。

- `view-transition-name` のプレフィックス: `vt-hero-`, `vt-card-`, `vt-label-`
- トップ ↔ about の遷移で共有する要素には一意 ID を付け、遷移前後で一貫させる

## 7. アイコン

`@nuxt/icon` を使用し、以下 3 つの Iconify セットを併用します。

| セット         | 用途                                                    | 例                                                 |
| -------------- | ------------------------------------------------------- | -------------------------------------------------- |
| `lucide`       | 汎用 UI アイコン（ナビ、アクション、状態）              | `i-lucide-arrow-right`, `i-lucide-check`           |
| `simple-icons` | 技術スタックの **モノクロ** ロゴ                        | `i-simple-icons-nuxt`, `i-simple-icons-typescript` |
| `logos`        | **カラー付き** ブランドロゴ（公式配色が意味を持つ場面） | `i-logos-cloudflare`, `i-logos-vue`                |

- モノクロ統一が望ましい文脈は `simple-icons` を優先し、`currentColor` で継承
- カラーでブランドを直接示したい場面（実績セクションのロゴウォールなど）のみ `logos` を使用
- サイズは `size-4` / `size-5` / `size-6` を基準とし、テキストと並ぶ場合は行の x-height に合わせて `size-4`

## 8. エレベーション & 奥行き

Dark mode では **Tonal Layering** と **Material Texture** で奥行きを表現し、従来のドロップシャドウは最小限にします。

1. **Base Layer**: Dark Charcoal `#131313` マット仕上げ
2. **Mid Layer**: Deep Turquoise marble テクスチャ（20% opacity オーバーレイで使用）
3. **Top Layer**: インタラクティブ要素にサブトルな **Gold Inner-glow (1px)** を当て、金属的エッジを表現
4. **Glassmorphism**: ナビゲーションバー・フローティング技術パネルのみに限定。`backdrop-blur: 20px` + `0.5px white border` で高級時計のクリスタルを模す

シャドウが必要な場合は **Ambient Glows**（深い turquoise hue）を用い、黒い影ではなくリッチなカラープロファイルを維持。

## 9. Shapes（角丸）

形状言語は **Sharp (0)**。システム工学の精密性と剛性の高い構造を反映するため、コンテナ・ボタン・画像マスクの border radius は **0px** を基本とします。

| トークン      | 値    | 適用先                                           |
| ------------- | ----- | ------------------------------------------------ |
| `--ui-radius` | `0px` | ボタン、入力フィールド、チップ、カード、モーダル |
| 例外          | `0px` | — 例外を作らないことでデザイン原則を徹底         |

唯一許容される「有機的な形状」は、turquoise marble テクスチャ内部のヴェイン、および **Kintsugi ゴールドライン**（手描き風のクラック／回路トレースのような線）のみ。鋭利な UI コンテナと有機的な内部テクスチャの対比が、ラグジュアリーな張りを生む。

## 10. コンポーネント指針

Nuxt UI v4 の Tailwind Variants 拡張を前提に、`app.config.ts` の `ui.*` で slot をオーバーライドします。

### 10.1 Button

- **Primary**: Deep Turquoise background、Crisp White text、**1px Gold solid border**、radius 0。ホバーで **Gold Gleam**（斜光 sweep）を発火
- **Ghost**: 透明背景、1px Gold border（30% opacity）。セカンダリアクション限定

```ts
// app.config.ts
ui: {
  button: {
    slots: { base: 'font-medium rounded-none' },
    defaultVariants: { color: 'primary' },
  },
}
```

### 10.2 Card (Project Card)

- 背景: Full-bleed turquoise marble テクスチャ、その上に半透明 Charcoal オーバーレイ（コンテンツ可読性確保）
- ボーダー: 通常時は不可視。ホバーで **Kintsugi Stroke** によりゴールドボーダーが描画される
- 内部 padding は `lg`（32px）を基準。情報密度が高い場合は `md`（24px）

### 10.3 Input Field

- ミニマル: 下辺 1px の Crisp White ボーダーのみ。他辺はボーダー無し
- Focus で下辺が Gold に遷移（150ms）
- ラベルは Space Grotesk 系 `.label-caps`、フィールド上部に配置
- エラー時は `error` semantic を用い、下辺を error 色に

### 10.4 Chip / Technical Tag

- アウトライン型: 1px Crisp White border (30% opacity)、背景なし
- タイポグラフィは `.label-caps` を適用
- 技術スタック列挙（Kubernetes / AWS 等）に使用

### 10.5 Kintsugi Divider（`USeparator` 拡張）

独自コンポーネントを新規作成せず、**Nuxt UI の `USeparator` を拡張** する方針を第一候補とします。

- ベース: `<USeparator color="secondary" type="solid" />`（`secondary` = Gold）
- Gold 1px ライン描画は `color` / `type` で Nuxt UI 既定機構に委譲
- 幾何学ノード（菱形 or 円）は `USeparator` の `icon` slot もしくは `avatar` slot を利用して中央に 1 点配置する形で表現
- 非対称配置（複数ノード、ラインの途切れ）が必要な場合は、`app.config.ts` の `ui.separator` に `type: 'kintsugi'` のカスタムバリアントを追加し、`border` 系ユーティリティと疑似要素で表現
- どうしても `USeparator` の slot / variant で表現しきれない場合のみ、`<UKintsugiDivider>` を薄い wrapper として実装（`USeparator` を内部で呼び出す合成コンポーネント）
- セクション間（160px gap）を横切る「接合」として機能

実装優先度:

1. `USeparator` の `color="secondary"` + `icon` slot で済むか試す
2. 不足なら `app.config.ts` の `ui.separator.variants` を augmentation
3. それでも表現困難な場合のみ wrapper コンポーネント化

### 10.6 Data Visualization

- ライン: Gold を排他的に使用
- 面塗り: Turquoise（透過あり）
- グリッド線: Stone-800 相当（Dark）/ Stone-200 相当（Light）
- 背景: 透明（親サーフェスに載せる）

## 11. アクセシビリティ基準

- WCAG 2.2 AA を最低ライン、見出しは AAA 推奨
- キーボード操作でフォーカス可視化（`focus-visible` で Gold 2px ring + 2px offset — インタラクティブな「接合」として Gold を用いる文脈と一貫）
- ランドマーク（`<header>`, `<main>`, `<nav>`, `<footer>`）の適切な使用
- スクリーンリーダー向け `aria-*` 属性（特にアイコンオンリーボタン、Kintsugi Divider のノード等の装飾要素には `aria-hidden`）
- §5 のモーション削減、§1.4 のコントラスト要件を併せて遵守
