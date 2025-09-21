<template>
  <UApp>
    <UContainer class="grid grid-rows gap-4">
      <UContainer class="p-8 text-2xl">
        Generated feeds
      </UContainer>
      <UContainer>
        <ul class="grid grid-rows gap-4">
          <li
            v-for="route in routes"
            :key="route"
            class="rounded-md border-1 border-solid p-2"
          >
            <ULink
              as="button"
              :to="route"
            >
              {{ route }}
            </ULink>
          </li>
        </ul>
      </UContainer>
    </UContainer>
  </UApp>
</template>

<script setup>
const routes = Object.keys(useRuntimeConfig().public.feedme.feeds.routes)
</script>

<style lang="css">
@import "tailwindcss";
@import "@nuxt/ui";
</style>
