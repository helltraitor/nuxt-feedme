export default defineNuxtConfig({
  modules: [
    '@nuxt/content',
    '../src/module',
  ],
  feedme: {
    feeds: {
      '/feed.atom': {},
      '/feed.xml': {},
      '/content.xml': {
        baseUrl: 'http://localhost:3000',
        authors: [{ email: 'helltraitor@hotmail.com', name: 'helltraitor' }],
        revisit: '1h',
        categories: ['example'],
        feed: {
          id: 'Helltraitor',
          title: 'Helltraitor',
          copyright: 'CC BY-NC-SA 4.0 2023 © Helltraitor',
        },
      },
      '/contentDefaults.xml': { content: true },
    },
    content: {
      baseUrl: 'http://localhost:3000',
      authors: [{ email: 'helltraitor@hotmail.com', name: 'helltraitor' }],
      revisit: '1h',
      categories: ['example', 'default'],
      feed: {
        id: 'Helltraitor',
        title: 'Helltraitor',
        copyright: 'CC BY-NC-SA 4.0 2023 © Helltraitor',
      },
    },
  },
  devtools: { enabled: true },
})
