<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<template>
  <UFooter
    :ui="{
      root: 'border-t border-default',
    }"
  >
    <template #left>
      <p class="text-xs text-muted">
        &copy; {{ year }} — Copyright <ULink
          to="/"
          active
        >naoki.dev</ULink>, All Rights reserved.
      </p>
    </template>
    <template #right>
      <p class="text-xs text-muted">
        Built with Nuxt &amp; Cloudflare Workers
      </p>
    </template>
  </UFooter>
</template>
