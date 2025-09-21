export default defineNuxtConfig({
  modules: [
    '../src/module',
    '@nuxt/ui',
  ],
  devtools: { enabled: true },
  compatibilityDate: '2025-09-21',
  feedme: {
    defaults: {
      routes: false,
    },
    feeds: {
      common: {
        feed: { title: 'Overridden title value from module settings' },
      },
      routes: {
        '/feed.xml': { revisit: '1s' },
        '/feed.atom': {},
      },
    },
  },
})
