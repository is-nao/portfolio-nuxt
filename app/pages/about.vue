<script setup lang="ts">
useSeoMeta({
  title: 'About',
  description: 'naoki のプロフィール',
})

const { data: about } = await useAsyncData('about', () => queryCollection('about').first())
</script>

<template>
  <UContainer>
    <section class="py-20">
      <div class="flex flex-col gap-12 lg:flex-row lg:gap-20">
        <!-- Identity -->
        <div class="shrink-0">
          <UAvatar
            :alt="about?.name ?? 'Avatar'"
            size="3xl"
            class="rounded-full"
            style="view-transition-name: hero-avatar"
          />

          <h1 class="mt-6 text-3xl font-bold tracking-tight">
            {{ about?.name }}
          </h1>
          <p class="mt-1 text-muted">
            {{ about?.job }}
          </p>

          <p class="mt-2 flex items-center gap-1.5 text-sm text-muted">
            <UIcon
              name="i-lucide-map-pin"
              class="size-4 shrink-0"
              aria-hidden="true"
            />
            {{ about?.city }}, {{ about?.countryCode }}
          </p>

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

        <!-- Details -->
        <div class="flex-1">
          <!-- Bio -->
          <div>
            <p class="label-caps">
              About me
            </p>
            <p class="mt-4 max-w-prose leading-relaxed whitespace-pre-line text-muted">
              {{ about?.bio }}
            </p>
          </div>
        </div>
      </div>
    </section>
  </UContainer>
</template>
