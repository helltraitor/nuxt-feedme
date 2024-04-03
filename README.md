# nuxt-feedme

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

This module provides extra abilities for implementation RSS feed.
It's pretty similar to [`module-feed`](https://nuxt.com/modules/module-feed),
but have support [`nuxt-content`](https://nuxt.com/modules/content).

If you need fully customized feeds, you can freely choose any feed module
(this or the mentioned above). But this module can be more flexible.

- [🏀 Online playground](https://stackblitz.com/github/helltraitor/nuxt-feedme?file=playground%2Fapp.vue)

## Features

- Configured out of the box for `nuxt-content`
- Supports general and specialized hooks for both feed kinds
- Flexible: use configuration defaults (feed, item), mapping (item)
  or hooks for customization
- SSR and SSG support

### Configured out of the box for `nuxt-content`

Default settings are:

```ts
{
  feeds: {
    '/feed.atom': { revisit: '6h', type: 'atom1', content: true },
    '/feed.xml': { revisit: '6h', type: 'rss2', content: true },
    '/feed.json': { revisit: '6h', type: 'json1', content: true },
  },
  content: {
    item: {
      templateRoots: [true, 'feedme'],
    },
  },
}
```

### General and specialized hooks

```ts
// project-name/server/plugins/feedme.ts
import type { NitroApp } from 'nitropack'

// Nitro hooks can be set only in nitro plugin
export default (nitroApp: NitroApp) => {
  // General hook: feedme:handle:content:item
  // Specialized hook: feedme:handle:content:item[*]
  //
  // When specialized hook set, general also will be called
  nitroApp.hooks.hook('feedme:handle:content:item[/contentDefaults.xml]', async ({ feed: { insert, invoke, parsed } }) => {
    if (parsed.title === 'First item') {
      // Invoke in case if item was created by another callback
      const maybeItemOptions = invoke()

      // Insert replaces current item configuration
      insert({
        ...maybeItemOptions,
        category: [
          ...maybeItemOptions?.category ?? [],
          { name: 'content hook processed' },
        ],
      })
    }
  })

  // Specialized hook for default feed
  nitroApp.hooks.hook('feedme:handle[/feed.xml]', async ({ context: { event }, feed: { create } }) => {
    // Create also replaces current feed
    create({ id: '', title: `Special feed for '${event.path}' route`, copyright: '' })
  })

  // General hook for default feed
  nitroApp.hooks.hook('feedme:handle', async ({ context: { event }, feed: { create, invoke } }) => {
    invoke() ?? create({ id: '', title: `Default feed for '${event.path}' route`, copyright: '' })
  })
}
```

### Mapping configuration

Mapping is used for linking [`feed`](https://github.com/jpmonette/feed) item object key
to the path in parsed content:

```ts
{
  item: {
    mapping: [
      // Third item is optional mapping function
      ['date', 'modified', value => value ? new Date(value) : value],
      // When mapping function result is undefined - next variant applied
      ['date', 'created', value => value ? new Date(value) : value],
      // Until the real one value will be set
      ['date', '', () => new Date()],
      // By default mapping is x => x
      ['link', '_path'],
    ],
    // Create default mappings with indicated roots:
    //   [keyof Item /* such as image, id, link */, root + keyof Item]
    //
    // The true value means use empty root:
    //   ['link', 'link']
    //
    // Where any other key means use this as path to value:
    //  ['link', `{root}.link`]
    //
    // Root can be separate by `.` which allows to deep invoking
    templateRoots: [true, 'feedme'],
  }
}
```

**NOTE**: Date value is a special case for `feed` module, so by default mapping provides
the next map for the date field: `value => value ? new Date(value) : new Date()`
So in case when you provide your own alias for date - you need to provide map function

**NOTE**: The mapping function is serialized so its required to not to have any references in outer scopes

### Tags

Tags allow to replace node values according to match:

```ts
{
  // Allows to pass optional map function
  tags: [
    // This tags replace first empty symbol if value starts with /
    // Example: /link -> urlBase/link
    [/^(?=\/)/, urlBase],
  ],
}
```

**Note**: Tags applied recursively, item.field.inner (value) is affected

## Quick Setup

1. Add `nuxt-feedme` dependency to your project

Use your favorite package manager (I prefer yarn)

```bash
npx nuxi@latest module add nuxt-feedme
```

2. Add `nuxt-feedme` to the `modules` section of `nuxt.config.ts`

```js
export default defineNuxtConfig({
  modules: [
    // After nuxt content
    '@nuxt/content',
    'nuxt-feedme'
  ]
})
```

That's it! You can now use `nuxt-feedme` in your Nuxt app ✨

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/nuxt-feedme/latest.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-version-href]: https://npmjs.com/package/nuxt-feedme

[npm-downloads-src]: https://img.shields.io/npm/dm/nuxt-feedme.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-downloads-href]: https://npmjs.com/package/nuxt-feedme

[license-src]: https://img.shields.io/npm/l/nuxt-feedme.svg?style=flat&colorA=18181B&colorB=28CF8D
[license-href]: https://npmjs.com/package/nuxt-feedme

[nuxt-src]: https://img.shields.io/badge/Nuxt-18181B?logo=nuxt.js
[nuxt-href]: https://nuxt.com
