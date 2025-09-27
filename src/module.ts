import type { NitroEventHandler } from 'nitropack'

import { deepmerge } from 'deepmerge-ts'
import { defineNuxtModule, createResolver, addTypeTemplate, addServerHandler, addPrerenderRoutes } from '@nuxt/kit'

import type { FeedmeModuleOptions, FeedmeRSSOptions, FeedmeRSSRoute, FeedmeRSSRouteSettings } from './types'
import type { FeedmeContentMappingRule } from './types/content'

import { defaultContentMapping } from './runtime/mapping'

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
      mapping: true,
      mappingTemplates: true,
    },
    feeds: {},
  } as FeedmeModuleOptions,

  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    if (options.defaults.common) {
      options.feeds.common = deepmerge(
        options.feeds.common ?? {},
        {
          revisit: '6h',
          fixDateFields: true,
          feed: { title: 'Generated title by nuxt-feedme!' },
          collections: ['content'],
        },
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

    if (options.defaults.mappingTemplates) {
      options.feeds.common ??= {}
      options.feeds.common.templateMapping = deepmerge(
        options.feeds.common?.templateMapping ?? [],
        ['', 'meta', 'meta.feedme'],
      )
    }

    if (options.defaults.mapping) {
      options.feeds.common ??= {}
      options.feeds.common.mapping = deepmerge(
        options.feeds.common.mapping ?? [['link', 'path'] as FeedmeContentMappingRule],
        defaultContentMapping(),
      )
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

              'feedme:handle:content:before[${route}]': (options: NitroFeedmeContentOptionsBefore) => void
              'feedme:handle:content:query[${route}]': (options: NitroFeedmeContentOptionsQuery) => void
              'feedme:handle:content:item[${route}]': (options: NitroFeedmeContentOptionsItem) => void
              'feedme:handle:content:after[${route}]': (options: NitroFeedmeContentOptionsAfter) => void
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
      references.push({ path: resolver.resolve('./types/content') })
      references.push({ path: resolver.resolve('./types/index') })
    })
  },
})
