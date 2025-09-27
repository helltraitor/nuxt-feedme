import { defineContentConfig, defineCollection } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    content: defineCollection({
      type: 'page',
      source: '*.md',
    }),
    pages: defineCollection({
      type: 'page',
      source: 'pages/*.md',
    }),
  },
})
