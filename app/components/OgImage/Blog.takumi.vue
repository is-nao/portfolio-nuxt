<script setup lang="ts">
const { title = '{Title placeholder}', description = '{Description placeholder}' } = defineProps<{
  title?: string
  description?: string
}>()

const lineClamp = (n: number) => ({ lineClamp: n, overflow: 'hidden', textOverflow: 'ellipsis' })
</script>

<template>
  <div class="flex h-full bg-turquoise-500">
    <div class="mx-15 w-2 shrink-0 bg-gold-300" />

    <div class="flex flex-col justify-center gap-8 py-12 pr-30 text-default">
      <h1
        class="text-6xl"
        :style="lineClamp(2)"
      >
        {{ title }}
      </h1>

      <hr class="border border-solid border-gold-200">

      <p
        v-if="description"
        class="text-4xl"
        :style="lineClamp(2)"
      >
        {{ description }}
      </p>
    </div>
  </div>
</template>
