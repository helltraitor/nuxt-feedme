import serialize from 'serialize-javascript'

import { createResolver, defineNuxtModule } from '@nuxt/kit'

import pkg from '../package.json'

import type { FeedmeModuleOptions } from './types'

export default defineNuxtModule<FeedmeModuleOptions>({
  meta: {
    name: 'nuxt-feedme',
    configKey: 'feedme',
    compatibility: {
      nuxt: '^3.0.0',
    },
    version: pkg.version,
  },
  // Default configuration options of the Nuxt module
  defaults: {
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
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    nuxt.options.runtimeConfig.feedme = serialize(options)

    nuxt.hook('nitro:config', (config) => {
      for (const route in options.feeds) {
        config.handlers ??= []
        config.handlers.push({
          handler: resolver.resolve('./runtime/handler'),
          method: 'get',
          route,
        })

        if (nuxt.options.ssr) {
          config.prerender ??= {}
          config.prerender.routes ??= []
          config.prerender.routes.push(route)
        }
      }
    })

    nuxt.hook('prepare:types', ({ references }) => {
      references.push({ path: resolver.resolve('./content.d.ts') })
      references.push({ path: resolver.resolve('./feedme.d.ts') })
      references.push({ path: resolver.resolve('./types.d.ts') })
      references.push({ path: resolver.resolve('./virtual.d.ts') })
    })
  },
})
