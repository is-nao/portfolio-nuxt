<script setup lang="ts">
import type { ButtonProps, TimelineItem as TimelineItemBase } from '@nuxt/ui'

useHead({
  titleTemplate: '',
})

const meta = {
  title: 'naoki.dev',
  description: 'naoki.dev portfolio site',
}

useSeoMeta({
  ...meta,
  ogTitle: meta.title,
  ogDescription: meta.description,
})

// const { data: about } = await useAsyncData('about', () => queryCollection('about').first())

// const { data: timeline } = await useAsyncData('timeline', () => queryCollection('timeline').order('date', 'DESC').all())

// const { data: blog } = await useAsyncData('blog', () =>
//   queryCollection('blog')
//     .select('path', 'title', 'description', 'createdAt')
//     .where('draft', '=', false)
//     .order('createdAt', 'DESC')
//     .all(),
// )
const [{ data: about }, { data: timeline }, { data: blog }] = await Promise.all([
  useAsyncData('about', () => queryCollection('about').first()),
  useAsyncData('timeline', () => queryCollection('timeline').order('date', 'DESC').all()),
  useAsyncData('timeline-blog', () => queryCollection('blog')
    .select('path', 'title', 'description', 'createdAt')
    .where('draft', '=', false).order('createdAt', 'DESC').all()),
])

type TimelineItem = TimelineItemBase & { to?: string }

const sortOrder = ref<'DESC' | 'ASC'>('DESC')

const timelineItems = computed<TimelineItem[]>(() => {
  const entries = (timeline.value ?? []).map(e => ({
    sort: e.date,
    date: formatDate(e.date),
    title: e.title,
    description: e.description,
    icon: e.icon,
    value: e.id,
  }))

  const posts = (blog.value ?? []).map(p => ({
    sort: p.createdAt,
    date: formatDate(p.createdAt),
    title: p.title,
    description: p.description,
    icon: 'i-lucide-book-open',
    value: p.path,
    to: p.path,
  }))

  return [...entries, ...posts]
    .sort((a, b) =>
      sortOrder.value === 'DESC'
        ? b.sort.localeCompare(a.sort)
        : a.sort.localeCompare(b.sort),
    )
    .map(({ sort, ...item }) => item)
})

const links = ref<ButtonProps[]>([
  {
    label: 'About me',
    to: '/about',
    icon: 'i-lucide-badge-info',
    variant: 'subtle',
    ui: { base: 'border border-secondary' },
  },
  {
    label: 'Blog',
    to: '/blog',
    icon: 'i-lucide-book-marked',
    trailingIcon: 'i-lucide-arrow-right',
    ui: { base: 'border-2 border-secondary' },
  },
])
</script>

<template>
  <!-- Hero -->
  <UPageHero
    v-if="about"
    :headline="about.job"
    title="naoki"
    :description="about.bio"
    :links="links"
    :ui="{
      headline: 'label-caps',
      title: 'font-mono',
      description: 'whitespace-pre-line',
    }"
  >
    <template #body>
      <UTooltip
        v-for="link in about.links"
        :key="link.label"
        :text="link.url"
        :delay-duration="0"
        :content="{ side: 'top', sideOffset: 0 }"
        arrow
      >
        <UButton
          :icon="link.icon"
          :aria-label="link.label"
          color="neutral"
          variant="link"
          :href="link.url"
          target="_blank"
          rel="noopener noreferrer"
          class="mx-2"
        />
      </UTooltip>
    </template>
  </UPageHero>

  <USeparator
    class="mb-20"
    color="secondary"
    icon="i-lucide-diamond"
    decorative
  />

  <UContainer>
    <!-- Timeline -->
    <div class="flex items-center justify-between">
      <h2 class="label-caps">
        Timeline
      </h2>
      <UButton
        :icon="sortOrder === 'DESC' ? 'i-lucide-sort-desc' : 'i-lucide-sort-asc'"
        :label="sortOrder"
        color="neutral"
        variant="outline"
        size="sm"
        @click="sortOrder = sortOrder === 'DESC' ? 'ASC' : 'DESC'"
      />
    </div>

    <UTimeline
      :items="timelineItems"
      color="neutral"
      class="mt-6"
      :ui="{
        separator: 'bg-secondary/50',
        date: 'tabular-nums text-mu',
      }"
    >
      <template #title="{ item }">
        <NuxtLink
          v-if="item.to"
          :to="item.to"
          class="font-medium underline decoration-transparent transition-colors hover:text-primary hover:decoration-secondary"
        >
          {{ item.title }}
        </NuxtLink>
        <span v-else>{{ item.title }}</span>
      </template>
    </UTimeline>
  </UContainer>
</template>
