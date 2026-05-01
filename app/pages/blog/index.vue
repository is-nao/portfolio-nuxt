<script setup lang="ts">
import type { OgImageComponents } from '#og-image/components'

const route = useRoute()

const meta = {
  title: 'Blog',
  description: 'naoki.dev blog page list',
}

useSeoMeta({
  ...meta,
  ogTitle: meta.title,
  ogDescription: meta.description,
})

const { data: posts } = await useAsyncData(route.path, () =>
  queryCollection('blog').where('draft', '=', false).order('createdAt', 'DESC').all(),
)

defineOgImage('Blog.takumi' as keyof OgImageComponents, meta)

/** @param date - "yyyy-mm-dd HH:MM:SS" or ISO 8601 */
const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })
</script>

<template>
  <UContainer>
    <section class="pt-20 pb-4">
      <p class="label-caps text-muted">
        Blog
      </p>
      <h1 class="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
        Articles
      </h1>
    </section>

    <section class="pb-20">
      <div
        v-if="!posts?.length"
        class="py-20 text-center text-muted"
      >
        記事はまだありません。
      </div>

      <ul
        v-else
        class="divide-y divide-default"
      >
        <li
          v-for="post in posts"
          :key="post.path"
          class="py-8"
        >
          <NuxtLink
            :to="post.path"
            class="group flex items-start gap-6"
          >
            <div class="min-w-0 flex-1 space-y-2">
              <div class="flex flex-wrap items-center gap-2">
                <time class="label-caps text-muted">{{ formatDate(post.createdAt) }}</time>
                <UBadge
                  v-for="tag in post.tags"
                  :key="tag"
                  color="neutral"
                  variant="subtle"
                  size="sm"
                >
                  {{ tag }}
                </UBadge>
              </div>
              <h2
                class="text-xl font-semibold tracking-tight transition-colors group-hover:text-primary"
              >
                {{ post.title }}
              </h2>
              <p class="line-clamp-2 text-sm text-muted">{{ post.description }}</p>
            </div>
            <div class="hidden w-48 shrink-0 overflow-hidden sm:block">
              <img
                :src="`/_og/r${post.path}`"
                :alt="post.title"
                class="aspect-40/21 w-full object-cover transition-opacity group-hover:opacity-80"
                loading="lazy"
                width="1200"
                height="630"
              >
            </div>
          </NuxtLink>
        </li>
      </ul>
    </section>
  </UContainer>
</template>
