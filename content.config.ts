import { defineCollection, defineContentConfig, property } from '@nuxt/content'
import { defineRobotsSchema } from '@nuxtjs/robots/content'
import { defineSitemapSchema } from '@nuxtjs/sitemap/content'
import { z } from 'zod/v4'

import { SKILL_CATEGORIES, SKILL_LEVELS } from './app/types/skill'

const textarea = () => property(z.string()).editor({ input: 'textarea' })
const mediaPicker = () => property(z.string()).editor({ input: 'media' })

/**
 * Nuxt Studio の Iconify アイコンピッカーとして表示されるフィールドスキーマを生成する。
 * @param iconLibraries - 使用するアイコンライブラリ名の配列
 */
const iconPicker = (iconLibraries: string[] = ['lucide', 'simple-icons', 'logos']) =>
  property(z.string()).editor({ input: 'icon', iconLibraries })

const skillCategoryMap = <T>(schema: T) =>
  Object.fromEntries(SKILL_CATEGORIES.map(c => [c, schema]))

const resumeEntry = () =>
  z.object({
    name: z.string(),
    description: textarea(),
    from: z.iso.date(),
    to: z.iso.date().optional(),
  })

const stackItems = () =>
  z.array(
    z.object({
      name: z.string(),
      level: z.enum(SKILL_LEVELS).optional(),
      months: z.number().optional(),
    }),
  )

const iconItems = () =>
  z.array(
    z.object({
      name: iconPicker(),
      labels: z.array(z.string()),
    }),
  )

export default defineContentConfig({
  collections: {
    about: defineCollection({
      type: 'data',
      source: 'about.yaml',
      schema: z.object({
        name: z.string(),
        bio: textarea(),
        job: z.string(),
        countryCode: z.string().length(2),
        city: z.string(),
        birthYear: z.number(),
        links: z.array(
          z.object({
            icon: iconPicker(),
            label: z.string(),
            url: z.string(),
          }),
        ),
        strengths: z.array(
          z.object({
            icon: iconPicker(),
            summary: z.string(),
            detail: textarea(),
          }),
        ),
        education: z.array(
          z.object({
            name: z.string(),
            date: z.iso.date(),
            event: z.enum(['入学', '卒業', '中退', '修了']),
          }),
        ),
        certifications: z.array(
          z.object({
            name: z.string(),
            date: z.iso.date(),
          }),
        ),
      }),
    }),

    company: defineCollection({
      type: 'data',
      source: 'company/*.yaml',
      schema: resumeEntry().extend({
        employment: z.string(),
      }),
    }),

    project: defineCollection({
      type: 'data',
      source: 'project/*.yaml',
      schema: resumeEntry().extend({
        companyId: z.number(),
        role: z.string(),
        teamSize: z.number().optional(),
        phases: z.array(z.string()),
        achievements: z.array(
          z.object({
            description: textarea(),
          }),
        ),
        stack: z.object(skillCategoryMap(stackItems())),
      }),
    }),

    icon: defineCollection({
      type: 'data',
      source: 'icon.yaml',
      schema: z.object({
        ...skillCategoryMap(iconItems()),
        fallback: iconPicker(),
      }),
    }),

    blog: defineCollection({
      type: 'page',
      source: 'blog/**/*.md',
      schema: z.object({
        title: z.string(),
        description: textarea(),
        createdAt: z.iso.datetime(),
        updatedAt: z.iso.datetime().optional(),
        tags: z.array(z.string()).optional(),
        draft: z.boolean().default(false),
        ogImage: z.object({
          template: z.enum(['Blog']).default('Blog'),
          title: z.string(),
          description: z.string(),
          background: mediaPicker(),
        }).optional(),
        rawbody: z.string(),
        sitemap: defineSitemapSchema(),
        robots: defineRobotsSchema(),
      }),
    }),

    timeline: defineCollection({
      type: 'data',
      source: 'timeline/**/*.yaml',
      schema: z.object({
        title: z.string(),
        description: textarea().optional(),
        date: z.iso.date(),
        icon: iconPicker(),
      }),
    }),
  },
})
