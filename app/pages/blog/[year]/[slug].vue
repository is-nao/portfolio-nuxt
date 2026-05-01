<script setup lang="ts">
import type { OgImageComponents } from '#og-image/components'

const route = useRoute()

const { data: page } = await useAsyncData(route.path, () =>
  queryCollection('blog').path(route.path).where('draft', '=', false).first(),
)

if (!page.value) {
  throw createError({ status: 404, statusText: 'Not Found' })
}

/** @param date - "yyyy-mm-dd HH:MM:SS" or ISO 8601 */
const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })

useSeoMeta({
  title: page.value.title,
  description: page.value.description,
  ogTitle: page.value.title,
  ogDescription: page.value.description,
  ogImageAlt: page.value.title,
})

defineOgImage(
  (page.value.ogImage?.template || 'Blog') as keyof OgImageComponents,
  {
    title: page.value.ogImage?.title || page.value.title,
    description: page.value.ogImage?.description || page.value.description,
  },
)

const { data: surround } = await useAsyncData(`${route.path}-surround`, () =>
  queryCollectionItemSurroundings('blog', route.path)
    .where('draft', '=', false)
    .order('createdAt', 'DESC'),
)
</script>

<template>
  <UContainer>
    <UPage v-if="page">
      <!-- <img
      v-if="ogImageUrl"
      :src="ogImageUrl"
      :alt="page.title"
      class="aspect-40/21 w-full object-cover"
    /> -->
      <UPageHeader
        :title="page.title"
        :description="page.description"
        class="border-secondary"
      >
        <template #links>
          <UButton
            :href="`${page.path}.md`"
            trailing-icon="i-lucide-download"
            label=".md"
            color="neutral"
            variant="ghost"
            size="sm"
          />
        </template>

        <div class="mt-2 flex flex-wrap items-center gap-3">
          <time class="label-caps text-muted">{{ formatDate(page.createdAt) }}</time>
          <UBadge
            v-for="tag in page.tags"
            :key="tag"
            color="neutral"
            variant="subtle"
            size="sm"
          >
            {{ tag }}
          </UBadge>
        </div>
      </UPageHeader>

      <UPageBody>
        <div class="prose">
          <ContentRenderer :value="page" />
        </div>

        <USeparator
          color="secondary"
          icon="i-lucide-diamond"
          decorative
        />

        <UContentSurround :surround="surround" />
      </UPageBody>

      <template #right>
        <UContentToc
          :links="page.body.toc?.links"
          title="目次"
          highlight
          highlight-color="secondary"
          highlight-variant="circuit"
          :ui="{ container: 'border-solid border-secondary' }"
        >
          <template #leading>
            <UIcon name="i-lucide-table-of-contents" />
          </template>
        </UContentToc>
      </template>
    </UPage>
  </UContainer>
</template>
