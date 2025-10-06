# nuxt-feedme

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]
[![Tests (GitHub Actions)][tests-common-src]][tests-common-href]

This module provides extra abilities for implementing RSS feeds.
It's pretty similar to [`module-feed`](https://nuxt.com/modules/module-feed),
but have support for [`nuxt-content`](https://nuxt.com/modules/content).

If you need fully customized feeds, you can freely choose any feed module
(this or the one mentioned above). But this module can be more flexible.

- [🏀 Online playground](https://stackblitz.com/github/helltraitor/nuxt-feedme?file=playground%2Fapp.vue)

## Features

- Configured out of the box for `nuxt-content`
- Supports general and specialized hooks for both feed kinds
- Flexible: use configuration defaults (feed, item, routes), mapping (nuxt content to item)
  or hooks for customization
- SSR and SSG support

### Configured out of the box for `nuxt-content`

Default settings are:

```ts
{
  defaults: {
    common: true,
    routes: true,
    mapping: true,
    mappingTemplates: true,
  },
  feeds: {
    common: {
        revisit: '6h',
        fixDateFields: true,
        feed: { title: 'Generated title by nuxt-feedme!' },
        collections: ['content'],
        templateMapping: ['', 'meta', 'meta.feedme'],
        mapping: [
          ['link', 'path'],
        ],
      },
    routes: {
        '/feed.atom': { type: 'atom1' },
        '/feed.json': { type: 'json1' },
        '/feed.xml': { type: 'rss2' },
    }
  },
}
```

By design, Nuxt will merge default settings and user-provided ones.
And sometimes you'll need to omit defaults in favor of your own settings.
To do this, just set false to needed default.

The `fixDateFields` option affects only created Feed Items (`date` and `published` fields).

### General and specialized hooks

Feedme supports the following general and specialized hooks:
- `feedme:handle[${PATH}]`
- `feedme:handle`
- `feedme:handle:content:before[${PATH}]`
- `feedme:handle:content:before`
- `feedme:handle:content:query[${PATH}]`
- `feedme:handle:content:query`
- `feedme:handle:content:item[${PATH}]`
- `feedme:handle:content:item`
- `feedme:handle:content:after[${PATH}]`
- `feedme:handle:content:after`

*Where `PATH` is the feed route (e.g., `/feed.xml` or any user-defined).*

Content hooks are executed **only** when the default handle doesn't create a feed.
The feed creation in `feedme:content*` hooks prevents Feedme from automatic creation via content module.

You may use a specialized hook for creating a custom feed, or "escape" route from your custom creation.

```ts
import type { NitroApp } from 'nitropack'

export default (nitroApp: NitroApp) => {
  nitroApp.hooks.hook('feedme:handle', async ({ context: { event, routeSettings }, feed: { obtain } }) => {
    // Note: You need to manually escape content paths when use both manual and content approaches
    const escapeRoutes = new Set(['/content.xml', '/pages.json'])
    if (escapeRoutes.has(event.path)) return

    // Note: Since there's no specialized hooks for atom feed, general will create feed object
    const feed = obtain({ title: `Default feed for '${event.path}'`, ...routeSettings.feed })
    feed.addItem({ date: new Date('2025-09-20'), link: '/', title: 'General hook article' })
  })

  nitroApp.hooks.hook('feedme:handle[/feed.xml]', async ({ context: { event }, feed: { obtain } }) => {
    // Note: Specialized hook is always called before general
    const feed = obtain({ title: `Special feed for '${event.path}' route` })
    feed.addItem({ date: new Date('2025-09-21'), title: 'Exclusive for xml (from specialized hook)' })
  })
}
```

*You still can modify the content feed via content hooks.*

#### Content hooks roles

- Use `feedme:handle:content:before*` hooks to setup Feed before any interaction.
- Use `feedme:handle:content:query*` hooks to provide custom queries or collections (collections are ignored when queries are provided).
- Use `feedme:handle:content:item*` hooks to manipulate the feed item candidate or delete (discard) it.
- Use `feedme:handle:content:after*` hooks to manipulate over completed feeds when you need it.

See examples in `playground/server/plugins/feed.ts`.

### Mapping configuration

Mapping is used for linking [`feed`](https://github.com/jpmonette/feed)
item keys to the paths in parsed content.

**BREAKING CHANGE**: Since v2, the third argument is no longer supported.
Use `feedme:handle:content:item*` hooks to modify data
(raw parsed content via `raw` or item candidate via `set`, `get` and `del`).

The Feedme module provides default mapping as is and template roots for `''` (root),
`'meta'` (nuxt parsed content field for user object in `.md` file),
`'meta.feedme'` (nested object in `.md` file object).

Also, Feedme provides additional mapping `['link', 'path']`
(nuxt default field `link` in parsed content object to feed item `path` field).

With template roots, it is possible to automatically create a feed item
from the `.md` content page (see the `playground` directory).

For simplicity, Feedme sets `feeds.common.fixDateFields` to `true`,
which enables string-to-date conversion for **candidate** items before `feedme:handle:content:item*` hooks.

### Replace

*Previously known as tags.*

The replace field is an array of pairs.

The first item is string, which is considered a serialized `RegExp` object and used
for searching replacement in parsed content object values (with recursion).

The second item is an actual string that is being used to replace all matched `RegExp`.

*Most settings can be set in common and per route.*

```ts
{
  feeds: {
    common: {
      replace: [[/^(?=\/)/.toString(), baseUrl]],
    },
  }
}
```

## Quick Setup

1. Add the `nuxt-feedme` dependency to your project.

    Use your favorite package manager (I prefer yarn)

    ```bash
    yarn add -D nuxt-feedme

    pnpm add -D nuxt-feedme

    npm install --save-dev nuxt-feedme
    ```

    Or install it via `nuxi module`

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

## Contribution

<details>
  <summary>Local development</summary>

  For local development is highly recommended to use `docker`:
  ```bash
  docker compose --profile develop up
  ```

  Optional: run with detach (flag `-d`) if you want to release you session.

  Alternative:

  ```bash
  # Install dependencies
  yarn install

  # Run playground
  yarn run dev --host '0.0.0.0'

  # Run prepack to make sure, that module is ready
  yarn run prepack
  ```

  **Warning**: Please, use [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/), otherwise you changes maybe rejected or pushed in alternative branch.
</details>

<!-- Badges -->
[npm-version-src]: https://img.shields.io/npm/v/nuxt-feedme/latest.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-version-href]: https://npmjs.com/package/nuxt-feedme

[npm-downloads-src]: https://img.shields.io/npm/dm/nuxt-feedme.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-downloads-href]: https://npmjs.com/package/nuxt-feedme

[license-src]: https://img.shields.io/npm/l/nuxt-feedme.svg?style=flat&colorA=18181B&colorB=28CF8D
[license-href]: https://npmjs.com/package/nuxt-feedme

[nuxt-src]: https://img.shields.io/badge/Nuxt-18181B?logo=nuxt.js
[nuxt-href]: https://nuxt.com

[tests-common-src]: https://github.com/helltraitor/nuxt-feedme/actions/workflows/tests.common.yml/badge.svg?branch=main
[tests-common-href]: https://github.com/helltraitor/nuxt-feedme/actions/workflows/tests.common.yml
