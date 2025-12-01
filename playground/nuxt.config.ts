const baseUrl = 'http://localhost:3000'

export default defineNuxtConfig({
  modules: [
    '@nuxt/ui',
    '@nuxt/content',
    '../src/module',
  ],
  devtools: { enabled: true },
  compatibilityDate: '2025-09-21',
  nitro: {
    prerender: {
      failOnError: false,
    },
  },
  feedme: {
    defaults: {
      routes: false,
    },
    feeds: {
      common: {
        feed: { title: 'Overridden title value from module settings' },
        replace: [[/^(?=\/)/.toString(), baseUrl]],
        contentType: 'utf8',
      },
      routes: {
        '/feed.xml': { revisit: '1s' },
        '/feed.atom': {},
        '/content.xml': {
          feed: {
            id: baseUrl,
            title: 'Content driven',
            link: baseUrl,
            author: { email: 'helltraitor@hotmail.com', name: 'Helltraitor' },
            category: 'Content driven',
            copyright: 'CC BY-NC-SA 4.0 2023 by Helltraitor',
          },
        },
        '/pages.json': {
          feed: {
            id: baseUrl,
            title: 'Content driven (pages + content from defaults)',
            link: baseUrl,
            author: { email: 'helltraitor@hotmail.com', name: 'Helltraitor' },
            category: 'Content driven (pages)',
            copyright: 'CC BY-NC-SA 4.0 2023 by Helltraitor',
          },
          collections: ['pages'],
          contentType: 'utf-16',
        },
        '/hooked.xml': {
          feed: {
            id: baseUrl,
            title: 'Content driven (filtered pages)',
            link: baseUrl,
            author: { email: 'helltraitor@hotmail.com', name: 'Helltraitor' },
            category: 'Content driven (hooked)',
            copyright: 'CC BY-NC-SA 4.0 2023 by Helltraitor',
          },
        },
      },
    },
  },
})
