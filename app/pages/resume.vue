<script setup lang="ts">
import { SKILL_CATEGORIES } from '~/types/skill'

useSeoMeta({
  title: 'Resume',
  description: 'naoki.dev — 職務経歴と保有スキル',
})

const [{ data: about }, { data: companies }, { data: projects }] = await Promise.all([
  useAsyncData('about', () => queryCollection('about').first()),
  useAsyncData('company', () => queryCollection('company').order('stem', 'ASC').all()),
  useAsyncData('project', () => queryCollection('project').order('from', 'ASC').all()),
])

// ファイル名順（01-..., 02-...）で 1-indexed numId を付与し、表示用に降順ソート
const companiesSorted = computed(() =>
  (companies.value ?? [])
    .map((c, i) => ({ ...c, numId: i + 1 }))
    .sort((a, b) => b.from.localeCompare(a.from)),
)

const projectsByCompany = computed(() =>
  Map.groupBy(projects.value ?? [], p => p.companyId),
)

const aggregatedSkills = computed(() => aggregateSkills(projects.value ?? []))

// SKILL_CATEGORIES の正規順でカテゴリ別グルーピング
const skillsByCategory = computed(() =>
  SKILL_CATEGORIES.map(category => ({
    category,
    skills: aggregatedSkills.value.filter(s => s.category === category),
  })).filter(({ skills }) => skills.length > 0),
)
</script>

<template>
  <UContainer>
    <!-- Identity + Strengths -->
    <section class="py-20">
      <div class="flex flex-col gap-12 lg:flex-row lg:gap-20">
        <!-- Left: Identity -->
        <div class="shrink-0">
          <UAvatar
            :alt="about?.name ?? 'Avatar'"
            size="3xl"
            class="rounded-full"
          />

          <h1 class="mt-6 text-3xl font-bold tracking-tight">
            {{ about?.name }}
          </h1>
          <p class="mt-1 text-muted">
            {{ about?.job }}
          </p>

          <div class="mt-2 space-y-1 text-muted">
            <p class="flex items-center gap-1.5 text-sm">
              <UIcon
                name="i-lucide-map-pin"
                class="size-4 shrink-0"
                aria-hidden="true"
              />
              {{ about?.city }}, {{ about?.countryCode }}
            </p>
            <p
              v-if="about?.birthYear"
              class="flex items-center gap-1.5 text-sm"
            >
              <UIcon
                name="i-lucide-cake"
                class="size-4 shrink-0"
                aria-hidden="true"
              />
              {{ about.birthYear }}年生
            </p>
          </div>

          <div class="mt-4 flex gap-1">
            <UButton
              v-for="link in about?.links"
              :key="link.label"
              :icon="link.icon"
              :aria-label="link.label"
              color="neutral"
              variant="ghost"
              :href="link.url"
              target="_blank"
              rel="noopener noreferrer"
            />
          </div>
        </div>

        <!-- Right: Strengths -->
        <div
          v-if="about?.strengths?.length"
          class="flex-1"
        >
          <p class="label-caps text-muted">
            Strengths
          </p>
          <ul class="mt-4 space-y-5">
            <li
              v-for="(strength, i) in about.strengths"
              :key="i"
              class="flex gap-4"
            >
              <UIcon
                :name="strength.icon"
                class="mt-0.5 size-5 shrink-0 text-primary"
                aria-hidden="true"
              />
              <div>
                <p class="font-medium">
                  {{ strength.summary }}
                </p>
                <p class="mt-1 text-sm leading-relaxed whitespace-pre-line text-muted">
                  {{ strength.detail }}
                </p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- Skills -->
    <template v-if="aggregatedSkills.length">
      <USeparator
        color="secondary"
        icon="i-lucide-layers"
        decorative
      />
      <section class="py-12">
        <p class="label-caps text-muted">
          Skills
        </p>
        <div class="mt-6 space-y-8">
          <div
            v-for="{ category, skills } in skillsByCategory"
            :key="category"
          >
            <p class="label-caps mb-3 text-secondary">
              {{ category }}
            </p>
            <ul class="divide-y divide-default">
              <li
                v-for="skill in skills"
                :key="`${skill.category}:${skill.name}`"
                class="flex items-baseline justify-between py-2.5"
              >
                <div class="flex items-baseline gap-3">
                  <span class="font-medium">{{ skill.name }}</span>
                  <UBadge
                    v-if="skill.level"
                    :label="skill.level"
                    color="secondary"
                    variant="soft"
                    size="xs"
                  />
                </div>
                <span class="text-sm text-muted tabular-nums">{{ skill.totalMonths }} ヶ月</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </template>

    <!-- Experience -->
    <template v-if="companiesSorted.length">
      <USeparator
        color="secondary"
        icon="i-lucide-briefcase"
        decorative
      />
      <section class="py-12">
        <p class="label-caps text-muted">
          Experience
        </p>

        <div class="mt-8 space-y-6">
          <UCard
            v-for="company in companiesSorted"
            :key="company.name"
            variant="outline"
            :ui="{ body: 'pt-0' }"
          >
            <template #header>
              <!-- Company header -->
              <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div class="flex flex-wrap items-center gap-3">
                  <h2 class="text-xl font-bold">
                    {{ company.name }}
                  </h2>
                  <UBadge
                    color="neutral"
                    variant="outline"
                    size="sm"
                  >
                    {{ company.employment }}
                  </UBadge>
                </div>
                <span class="shrink-0 text-sm text-muted tabular-nums">
                  {{ formatPeriod(company.from, company.to) }}
                </span>
              </div>
              <p
                v-if="company.description"
                class="mt-2 max-w-prose text-sm leading-relaxed whitespace-pre-line text-muted"
              >
                {{ company.description }}
              </p>
            </template>

            <!-- Projects -->
            <ul
              v-if="projectsByCompany.get(company.numId)?.length"
              class="space-y-6"
            >
              <li
                v-for="project in projectsByCompany.get(company.numId)"
                :key="project.name"
                class="border-l-2 border-secondary pl-5"
              >
                <!-- Project header -->
                <div class="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                  <div class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h3 class="font-semibold">
                      {{ project.name }}
                    </h3>
                    <span class="text-sm text-muted">{{ project.role }}</span>
                    <span
                      v-if="project.teamSize"
                      class="text-sm text-muted"
                    >
                      {{ project.teamSize }}名チーム
                    </span>
                  </div>
                  <span class="shrink-0 text-sm text-muted tabular-nums">
                    {{ formatPeriod(project.from, project.to) }}
                  </span>
                </div>

                <p
                  v-if="project.description"
                  class="mt-2 text-sm leading-relaxed whitespace-pre-line text-muted"
                >
                  {{ project.description }}
                </p>

                <!-- Phases -->
                <div
                  v-if="project.phases?.length"
                  class="mt-3 flex flex-wrap gap-1.5"
                >
                  <UBadge
                    v-for="phase in project.phases"
                    :key="phase"
                    color="neutral"
                    variant="outline"
                    size="sm"
                  >
                    {{ phase }}
                  </UBadge>
                </div>

                <!-- Achievements -->
                <ul
                  v-if="project.achievements?.length"
                  class="mt-3 space-y-1.5"
                >
                  <li
                    v-for="(ach, i) in project.achievements"
                    :key="i"
                    class="flex gap-2 text-sm leading-relaxed text-muted"
                  >
                    <UIcon
                      name="i-lucide-check"
                      class="mt-0.5 size-4 shrink-0 text-primary"
                      aria-hidden="true"
                    />
                    <span class="whitespace-pre-line">{{ ach.description }}</span>
                  </li>
                </ul>

                <!-- Stack -->
                <div
                  v-if="Object.values(project.stack).some((items) => items?.length)"
                  class="mt-3 flex flex-wrap gap-1.5"
                >
                  <template
                    v-for="(items, category) in project.stack"
                    :key="category"
                  >
                    <UBadge
                      v-for="item in items"
                      :key="item.name"
                      color="primary"
                      variant="soft"
                      size="sm"
                    >
                      {{ item.name }}
                    </UBadge>
                  </template>
                </div>
              </li>
            </ul>
          </UCard>
        </div>
      </section>
    </template>

    <!-- Education & Certifications -->
    <template v-if="about?.education?.length || about?.certifications?.length">
      <USeparator
        color="secondary"
        icon="i-lucide-graduation-cap"
        decorative
      />
      <section class="py-12">
        <div class="grid gap-12 sm:grid-cols-2">
          <!-- Education -->
          <div v-if="about?.education?.length">
            <p class="label-caps text-muted">
              Education
            </p>
            <ul class="mt-4 divide-y divide-default">
              <li
                v-for="(edu, i) in about.education"
                :key="i"
                class="grid grid-cols-[7rem_1fr] gap-4 py-3"
              >
                <time class="pt-0.5 text-sm text-muted tabular-nums">
                  {{ formatDate(edu.date) }}
                </time>
                <div>
                  <p class="font-medium">
                    {{ edu.name }}
                  </p>
                  <p class="text-sm text-muted">
                    {{ edu.event }}
                  </p>
                </div>
              </li>
            </ul>
          </div>

          <!-- Certifications -->
          <div v-if="about?.certifications?.length">
            <p class="label-caps text-muted">
              Certifications
            </p>
            <ul class="mt-4 divide-y divide-default">
              <li
                v-for="(cert, i) in about.certifications"
                :key="i"
                class="grid grid-cols-[7rem_1fr] gap-4 py-3"
              >
                <time class="pt-0.5 text-sm text-muted tabular-nums">
                  {{ formatDate(cert.date) }}
                </time>
                <p class="font-medium">
                  {{ cert.name }}
                </p>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </template>
  </UContainer>
</template>
