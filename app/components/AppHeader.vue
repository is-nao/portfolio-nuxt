<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const navItems: NavigationMenuItem[] = [
  { label: 'Top', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Resume', to: '/resume' },
  { label: 'Blog', to: '/blog' },
]
</script>

<template>
  <UHeader
    title="naoki.dev"
    mode="slideover"
    :ui="{
      root: 'border-b border-secondary bg-default/80 backdrop-blur-md',
      title: 'font-mono',
    }"
  >
    <!-- Desktop nav -->
    <UNavigationMenu
      :items="navItems"
      color="neutral"
      variant="link"
      highlight
      highlight-color="secondary"
    />

    <template #right>
      <UColorModeSwitch />
    </template>

    <!-- Mobile body -->
    <template #body>
      <UNavigationMenu
        :items="navItems"
        orientation="vertical"
        color="neutral"
        variant="link"
        class="w-full"
      />
    </template>
  </UHeader>
</template>
