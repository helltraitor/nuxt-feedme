import type { NitroEventHandler } from 'nitropack'

import { deepmerge } from 'deepmerge-ts'
import { defineNuxtModule, createResolver, addTypeTemplate, addServerHandler, addPrerenderRoutes } from '@nuxt/kit'

import type { FeedmeModuleOptions, FeedmeRSSOptions, FeedmeRSSRoute, FeedmeRSSRouteSettings } from './types'

export default defineNuxtModule<FeedmeModuleOptions>({
  meta: {
    name: 'nuxt-feedme',
    configKey: 'feedme',
    compatibility: {
      nuxt: '>=4.0.0',
    },
  },

  defaults: {
    defaults: {
      common: true,
      routes: true,
    },
    feeds: {},
  } as FeedmeModuleOptions,

  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    if (options.defaults.common) {
      options.feeds.common = deepmerge(
        options.feeds.common ?? {},
        { revisit: '6h', feed: { title: 'Generated title by nuxt-feedme!' } },
      ) as FeedmeRSSOptions
    }

    if (options.defaults.routes) {
      options.feeds.routes = deepmerge(
        options.feeds.routes ?? {},
        {
          '/feed.atom': { type: 'atom1' },
          '/feed.json': { type: 'json1' },
          '/feed.xml': { type: 'rss2' },
        },
      ) as Record<FeedmeRSSRoute, FeedmeRSSRouteSettings>
    }

    nuxt.options.runtimeConfig.public.feedme = options

    const routes = Object.keys(options.feeds.routes ?? {})
    addPrerenderRoutes(routes)

    for (const route of routes) {
      addServerHandler({
        route,
        handler: resolver.resolve('./runtime/handler'),
        method: 'get',
        lazy: true,
      } as NitroEventHandler)
    }

    addTypeTemplate({
      filename: 'types/types.routes.d.ts',
      getContents: () => {
        let templateBody = ''
        for (const route of routes) {
          templateBody = `${templateBody}
              'feedme:handle[${route}]': (options: NitroFeedmeHandleOptions) => void
          `
        }

        return `// Runtime typing for route based hooks
        declare module 'nitropack/types' {
          interface NitroRuntimeHooks {
            ${templateBody}
          }
        }

        export {}
        `.replace(/^ {8}/gm, '')
      },
    })

    nuxt.hook('prepare:types', ({ references }) => {
      references.push({ path: resolver.resolve('./types/revisit') })
      references.push({ path: resolver.resolve('./types/index') })
    })
  },
})
