---
title: Typography Sample
createdAt: 2026-05-01 00:00:00
description: |
  Nuxt UI × Nuxt Content のタイポグラフィを確認するためのサンプル。
  Nuxt Studio エディターを開いて整形されると崩れることがあるため注意
draft: false
ogImage:
  template: Blog
sitemap:
  loc: /blog/2026/typography-sample
---

## `Heading`

## Heading

```md [markdown]
## `Heading`

## Heading

# H1

## H2

### H3

#### H4

##### H5

###### H6
```

# H1

## H2

### H3

#### H4

##### H5

###### H6

## `Separator`

```md [markdown]
---
```

---

## `Paragraph`

```md [markdown]
Just a paragraph.
Just a paragraph.

Just a paragraph.  
Just a paragraph.
```

Just a paragraph.
Just a paragraph.

Just a paragraph. :br
Just a paragraph.

## `Strong`

```md [markdown]
**Just a strong paragraph.**
```

**Just a strong paragraph.**

## `Italic`

```md [markdown]
_Just an italic paragraph._
```

*Just an italic paragraph.*

## `Blockquote`

```md [markdown]
> Block quote
>
> > Nested Block quote
```

> Block quote
>
> > Nested Block quote

## `Unordered List`

```md [markdown]
- Just
- An
- Unordered
- List
  - element
```

- Just
- An
- Unordered
- List
  - element

## `ordered List`

```md [markdown]
1. Just
2. An
3. ordered
4. List
   1. element
```

1. Just
2. An
3. ordered
4. List
   1. element

## `Check List`

```md [markdown]
- [ ] Just
- [ ] An
- [x] Check
- [ ] List
  - [x] element
```

- Just
- An
- Check
- List
  - element

::warning
nuxt-studio のエディタを開くと ul に変換されてしまう
::

## `Link`

```md [markdown]
[Prose Components](https://content.nuxt.com/docs/components/prose)
```

[Prose Components](https://content.nuxt.com/docs/components/prose)

## `Footnote`

```md [markdown]
Footnote[^1]

[^1]: Footnote content
```

Footnote[1](#user-content-fn-1)

::warning
nuxt-studio のエディタを開くと通常の Link に変換されてしまい、脚釈でジャンプできなくなる
::

## `Pre`

````md [markdown]
```js [file.js]{3}
export default () => {
  console.log('Code block')
  console.log('highlight')
  console.log('diff +') // [!code ++]
  console.log('diff -') // [!code --]
}
```
````

```js [file.js]
export default () => {
  console.log('Code block')
  console.log('highlight')
  console.log('diff +') // [!code ++]
  console.log('diff -') // [!code --]
}
```

::warning
ファイル名に `]` を使用したい場合は、2 つのバックスラッシュでエスケープする必要があります: `\\]`。
JS は文字列のバックスラッシュを自動的にエスケープし、`\]` が `]` として解決されます。
::

::note
`// [!code ++]` で追加行、 `// [!code --]` で削除行をマークします。

行末に書くとその行のみをマークし、`// [!code ++:2]` のように数字を使ってその行以降から数字の行数分、差分を表現できます。

コピーボタンでコピーすると、`// [!code ++]` 付きでクリップボードに保存される。
::

## `Inline Code`

```md [markdown]
`code`
text
`const code: string = 'highlighted code inline'`{lang="ts"}
```

`code`
text
`const code: string = 'highlighted code inline'`

## `Image`

```md [markdown]
![placeholder Image](https://placehold.jp/100x20.png){height="20" width="100"}
```

![placeholder Image](https://placehold.jp/100x20.png "placeholder Image"){height="20" width="100"}

## `Emoji`

::code-group
```md [markdown]
:cat:
```

  :::code-preview{icon="i-lucide-eye" label="Preview"}
  🐱
  :::
::

## `Table`

```md [markdown]
| Key | Type      | Description |
| --- | --------- | ----------- |
| 1   | Wonderful | Table       |
| 2   | Wonderful | Data        |
| 3   | Wonderful | Website     |
```

| Key | Type      | Description |
| --- | --------- | ----------- |
| 1   | Wonderful | Table       |
| 2   | Wonderful | Data        |
| 3   | Wonderful | Website     |

## Code group

::code-group
```bash [pnpm]
pnpm add @nuxt/content
```

```bash [yarn]
yarn add @nuxt/content
```

```bash [npm]
npm install @nuxt/content
```

```bash [bun]
bun add @nuxt/content
```
::

## Code Preview

````mdc
::code-group

```js [code.js]
console.log('code-preview')
```

  :::code-preview{icon="i-lucide-eye" label="Preview"}

  ```js [preview]
  console.log('code-preview')
  ```

  :::
::
````

::code-group
```js [code.js]
console.log('code-preview')
```

  :::code-preview{icon="i-lucide-eye" label="Preview"}
  ```js [preview]
  console.log('code-preview')
  ```
  :::
::

::callout{color="primary" icon="i-lucide-rocket"}
Use MDC components for rich interactions!
::

## Tabs

```mdc
::tabs
  :::tabs-item{label="Installation"}
  Use pnpm add @nuxt/ui to install
  :::

  :::tabs-item{label="Usage"}
  Import components and use them in your templates
  :::
::
```

::tabs
  :::tabs-item{label="Installation"}
  Use pnpm add @nuxt/ui to install
  :::

  :::tabs-item{label="Usage"}
  Import components and use them in your templates
  :::
::

## Footnotes

1. Footnote content ↩
