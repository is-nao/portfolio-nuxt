/** ISO 日付文字列を "yyyy年M月" 形式にフォーマットする。 */
export const formatDate = (date: string): string =>
  new Date(date).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' })

/** "yyyy年M月 — yyyy年M月 / 現在" 形式の期間文字列を返す。 */
export const formatPeriod = (from: string, to?: string): string =>
  `${formatDate(from)} — ${to ? formatDate(to) : '現在'}`
