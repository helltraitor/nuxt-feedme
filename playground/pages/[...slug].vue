<script setup>
const rawSlug = useRoute().params.slug
const slug = Array.isArray(rawSlug) ? rawSlug.join('-') : rawSlug

const path = useRoute().path

const { data } = await useAsyncData(`blog-${slug}`, async () => {
  const content = await queryCollection('content').path(path).first()
  const pages = await queryCollection('pages').path(path).first()
  return content ?? pages
})
</script>

<template>
  <UApp>
    <UContainer class="grid grid-rows gap-4">
      <UContainer class="p-8 text-2xl">
        <ULink to="/">
          Home
        </ULink>
      </UContainer>
      <UContainer>
        <ContentRenderer
          v-if="data"
          :value="data"
        />
        <div v-else>
          Page not found
        </div>
      </UContainer>
    </UContainer>
  </UApp>
</template>
