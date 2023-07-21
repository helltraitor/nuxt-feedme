const baseUrl = 'http://localhost:3000'

export default defineNuxtConfig({
  modules: [
    '@nuxt/content',
    '../src/module',
  ],
  feedme: {
    feeds: {
      '/feed.atom': {},
      '/feed.xml': {},
      '/contentDefaults.xml': { content: true },
      '/contentCustomized.xml': {
        feed: {
          defaults: {
            id: 'helltraitor-content',
            title: 'Helltraitor Content',
          },
        },
        content: true,
      },
    },
    content: {
      feed: {
        defaults: {
          id: baseUrl,
          title: 'Content driven',
          link: baseUrl,
          author: { email: 'helltraitor@hotmail.com', name: 'Helltraitor' },
          categories: ['Content driven'],
          copyright: 'CC BY-NC-SA 4.0 2023 © Helltraitor',
        },
      },
      tags: [
        /**
         * Replace all strings that starts with `/.*` with by `base/.*`
         * Tags applied at the last, when values received, but not set to feed or items yet
         *
         * Tags are applied for any root value:
         *
         * ```
         * {
         *  link, // <-- affected
         *  image: {
         *     link, // <-- affected
         *   }
         * }
         * ```
         */
        [/^\/.*/, source => `${baseUrl}${source}`],
      ],
      revisit: '1h',
    },
  },
  devtools: { enabled: true },
})
