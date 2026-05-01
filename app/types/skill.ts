export const SKILL_LEVELS = ['S', 'A', 'B', 'C'] as const
export const SKILL_CATEGORIES = [
  'language',
  'framework',
  'database',
  'os',
  'cloud',
  'other',
] as const

export type SkillLevel = (typeof SKILL_LEVELS)[number]
export type SkillCategory = (typeof SKILL_CATEGORIES)[number]

export interface AggregatedSkill {
  name: string
  category: SkillCategory
  totalMonths: number
  level?: SkillLevel
}
