import {
  SKILL_CATEGORIES,
  SKILL_LEVELS,
  type AggregatedSkill,
  type SkillCategory,
  type SkillLevel,
} from '../types/skill'

export interface ProjectStackItem {
  name: string
  level?: SkillLevel
  months?: number
}

export interface ProjectLike {
  from: string
  to?: string
  stack: Record<SkillCategory, ProjectStackItem[]>
}

/** ISO 日付文字列の差分を月単位で返す。端月を両端含むので +1。`to` 省略時は現在時刻。 */
export const diffMonths = (from: string, to?: string): number => {
  const f = new Date(from)
  const t = to ? new Date(to) : new Date()
  return (t.getFullYear() - f.getFullYear()) * 12 + (t.getMonth() - f.getMonth()) + 1
}

/**
 * SKILL_LEVELS は降順定義（S が最高）。index が小さいほど高レベル。
 * undefined は `Infinity` 扱いで除外される。全 undefined なら undefined を返す。
 */
export const higherLevel = (...levels: (SkillLevel | undefined)[]): SkillLevel | undefined => {
  const minIndex = Math.min(
    ...levels.map(l => (l === undefined ? Infinity : SKILL_LEVELS.indexOf(l))),
  )
  return SKILL_LEVELS[minIndex]
}

/**
 * 複数プロジェクトの `stack` を横断して、スキルごとに経験月数を合計し最高レベルを採用する。
 * `months` 未入力のエントリは project.period から補完する。
 */
export const aggregateSkills = (projects: ProjectLike[]): AggregatedSkill[] => {
  const entries = projects.flatMap((p) => {
    const fallbackMonths = diffMonths(p.from, p.to)
    return SKILL_CATEGORIES.flatMap(category =>
      (p.stack[category] ?? []).map(s => ({
        name: s.name,
        category,
        months: s.months ?? fallbackMonths,
        level: s.level,
      })),
    )
  })

  const grouped = Map.groupBy(entries, e => `${e.category}:${e.name}`)

  return Array.from(grouped.values(), items => ({
    name: items[0]!.name,
    category: items[0]!.category,
    totalMonths: items.reduce((sum, i) => sum + i.months, 0),
    level: higherLevel(...items.map(i => i.level)),
  })).sort((a, b) => b.totalMonths - a.totalMonths)
}
