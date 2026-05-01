import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  aggregateSkills,
  diffMonths,
  higherLevel,
  type ProjectLike,
  type ProjectStackItem,
} from '../../app/utils/aggregateSkills'
import { SKILL_CATEGORIES, type SkillCategory } from '../../app/types/skill'

/** 指定カテゴリだけ埋めた `ProjectLike['stack']` を生成する。未指定カテゴリは空配列。 */
const stack = (partial: Partial<Record<SkillCategory, ProjectStackItem[]>>): ProjectLike['stack'] =>
  Object.fromEntries(SKILL_CATEGORIES.map(c => [c, partial[c] ?? []])) as ProjectLike['stack']

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-04-24'))
})

afterEach(() => {
  vi.useRealTimers()
})

describe('diffMonths', () => {
  it('両端を含む月数を返す', () => {
    expect(diffMonths('2020-04-01', '2020-04-30')).toBe(1)
    expect(diffMonths('2020-01-01', '2020-12-31')).toBe(12)
    expect(diffMonths('2020-01-01', '2021-03-31')).toBe(15)
  })

  it('to 省略時は現在時刻を終端とする', () => {
    expect(diffMonths('2026-01-01')).toBe(4)
  })
})

describe('higherLevel', () => {
  it('全 undefined なら undefined', () => {
    expect(higherLevel()).toBeUndefined()
    expect(higherLevel(undefined, undefined)).toBeUndefined()
  })

  it('一部だけ存在すれば存在する方を返す', () => {
    expect(higherLevel('B', undefined)).toBe('B')
    expect(higherLevel(undefined, 'C')).toBe('C')
  })

  it('S > A > B > C の順で高い方を返す', () => {
    expect(higherLevel('S', 'A')).toBe('S')
    expect(higherLevel('B', 'A')).toBe('A')
    expect(higherLevel('C', 'B')).toBe('B')
  })

  it('3 引数以上にも対応する', () => {
    expect(higherLevel('C', 'A', 'B')).toBe('A')
    expect(higherLevel(undefined, 'B', 'S', 'A')).toBe('S')
  })
})

describe('aggregateSkills', () => {
  it('同一 category+name を合計し、最高レベルを採用する', () => {
    const result = aggregateSkills([
      {
        from: '2020-01-01',
        to: '2020-06-30',
        stack: stack({ language: [{ name: 'TypeScript', level: 'B', months: 6 }] }),
      },
      {
        from: '2021-01-01',
        to: '2021-12-31',
        stack: stack({ language: [{ name: 'TypeScript', level: 'A', months: 12 }] }),
      },
    ])

    expect(result).toHaveLength(1)
    expect(result[0]).toEqual({
      name: 'TypeScript',
      category: 'language',
      totalMonths: 18,
      level: 'A',
    })
  })

  it('months 未指定なら period から補完する', () => {
    const result = aggregateSkills([
      {
        from: '2026-01-01',
        to: '2026-04-30',
        stack: stack({ language: [{ name: 'Go' }] }),
      },
    ])

    expect(result).toHaveLength(1)
    expect(result[0]!.totalMonths).toBe(4)
    expect(result[0]!.level).toBeUndefined()
  })

  it('to 省略時は現在時刻で補完する（在籍中プロジェクト）', () => {
    const result = aggregateSkills([
      {
        from: '2026-01-01',
        stack: stack({ language: [{ name: 'Rust' }] }),
      },
    ])

    expect(result[0]?.totalMonths).toBe(4)
  })

  it('category が異なれば別スキルとして扱う', () => {
    const result = aggregateSkills([
      {
        from: '2024-01-01',
        to: '2024-06-30',
        stack: stack({
          language: [{ name: 'X', months: 6 }],
          framework: [{ name: 'X', months: 6 }],
        }),
      },
    ])

    expect(result).toHaveLength(2)
    expect(result.map(r => r.category).sort()).toEqual(['framework', 'language'])
  })

  it('totalMonths 降順でソートされる', () => {
    const result = aggregateSkills([
      {
        from: '2024-01-01',
        to: '2024-06-30',
        stack: stack({
          language: [
            { name: 'Short', months: 2 },
            { name: 'Long', months: 20 },
            { name: 'Mid', months: 10 },
          ],
        }),
      },
    ])

    expect(result.map(r => r.name)).toEqual(['Long', 'Mid', 'Short'])
  })
})
