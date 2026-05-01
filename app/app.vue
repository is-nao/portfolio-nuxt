<script setup lang="ts">
import { ja } from '@nuxt/ui/locale'
</script>

<template>
  <UApp :locale="ja">
    <NuxtRouteAnnouncer />
    <NuxtLoadingIndicator />

    <AppHeader />

    <UMain>
      <NuxtPage />
    </UMain>

    <AppFooter />
  </UApp>
</template>
