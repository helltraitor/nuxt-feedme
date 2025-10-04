<script setup>
const routes = Object.keys(useRuntimeConfig().public.feedme.feeds.routes)

const pages = [
  ...(await queryCollection('content').all()),
  ...(await queryCollection('pages').all()),
]
</script>

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
              :external="true"
            >
              {{ route }}
            </ULink>
          </li>
        </ul>
      </UContainer>
      <UContainer class="p-8 text-2xl">
        Content pages
      </UContainer>
      <UContainer>
        <ul class="grid grid-rows gap-4">
          <li
            v-for="page in pages"
            :key="page.path"
            class="rounded-md border-1 border-solid p-2"
          >
            <ULink
              as="button"
              :to="page.path"
              :external="true"
            >
              {{ page.title }}
            </ULink>
          </li>
        </ul>
      </UContainer>
    </UContainer>
  </UApp>
</template>
