import type { H3Event } from 'h3'
import type { NitroApp } from 'nitropack'
import type { CollectionQueryBuilder, PageCollectionItemBase } from '@nuxt/content'

import { deepmerge } from 'deepmerge-ts'
import { Feed, type Item } from 'feed'
import { defineEventHandler, setHeaders, H3Error } from 'h3'
import { queryCollection } from '@nuxt/content/server'

import { useNitroApp } from '#imports'

import type { FeedmeRSSRouteSettings, NitroFeedmeHandleOptions } from '../types'
import type { NitroFeedmeContentOptionsAfter, NitroFeedmeContentOptionsBefore, NitroFeedmeContentOptionsItem, NitroFeedmeContentOptionsQuery } from '../types/content'

import { applyReplacements, getItemOptionsFrom } from './content'
import { intoContentType, intoSeconds, getFeedmeRSSTypeFrom, getFeedmeModuleOptions } from './feedme'
import { templateContentMapping } from './mapping'

declare module '#imports' {
  function useNitroApp(): NitroApp
}

interface FeedmeHandlePersistent {
  feed?: Feed
}

interface FeedmeQueryPersistent {
  queries: CollectionQueryBuilder<PageCollectionItemBase>[]
}

interface FeedmeItemPersistent {
  raw: PageCollectionItemBase
  item?: Partial<Item>
}

const feedmeHandleDefault = async (event: H3Event, routeSettings: FeedmeRSSRouteSettings, feedmeHandlePersistent: FeedmeHandlePersistent): Promise<FeedmeHandlePersistent> => {
  const feedmeHandleOptions: NitroFeedmeHandleOptions = {
    context: { event, routeSettings },
    feed: {
      obtain: (options = routeSettings.feed) => {
        feedmeHandlePersistent.feed ??= new Feed({ id: '', title: '', copyright: '', ...options })
        return feedmeHandlePersistent.feed
      },
    },
  }

  await useNitroApp().hooks.callHook(`feedme:handle[${event.path}]`, feedmeHandleOptions)
  await useNitroApp().hooks.callHook('feedme:handle', feedmeHandleOptions)

  return feedmeHandlePersistent
}

const feedmeHandleContent = async (event: H3Event, routeSettings: FeedmeRSSRouteSettings, feedmeHandlePersistent: FeedmeHandlePersistent): Promise<FeedmeHandlePersistent> => {
  const feedmeHandleOptionsBefore: NitroFeedmeContentOptionsBefore = {
    context: { event, routeSettings },
    feed: {
      obtain: (options = routeSettings.feed) => {
        feedmeHandlePersistent.feed ??= new Feed({ id: '', title: '', copyright: '', ...options })
        return feedmeHandlePersistent.feed
      },
    },
  }

  await useNitroApp().hooks.callHook(`feedme:handle:content:before[${event.path}]`, feedmeHandleOptionsBefore)
  await useNitroApp().hooks.callHook('feedme:handle:content:before', feedmeHandleOptionsBefore)

  feedmeHandlePersistent.feed = feedmeHandleOptionsBefore.feed.obtain()

  const feedmeQueryPersistent: FeedmeQueryPersistent = { queries: [] }

  const feedmeHandleQueryOptions: NitroFeedmeContentOptionsQuery = {
    context: { event, routeSettings },
    query: {
      fromCollections: (collections) => {
        routeSettings.collections = collections
      },
      add: (query) => {
        feedmeQueryPersistent.queries.push(query)
        return feedmeHandleQueryOptions.query
      },
      reset: () => {
        feedmeQueryPersistent.queries = []
        return feedmeHandleQueryOptions.query
      },
    },
  }

  await useNitroApp().hooks.callHook(`feedme:handle:content:query[${event.path}]`, feedmeHandleQueryOptions)
  await useNitroApp().hooks.callHook('feedme:handle:content:query', feedmeHandleQueryOptions)

  if (!feedmeQueryPersistent.queries.length) {
    for (const collection of routeSettings.collections ?? []) {
      feedmeHandleQueryOptions.query.add(queryCollection(event, collection as never))
    }
  }

  const parsedItems: PageCollectionItemBase[] = []
  for (const query of feedmeQueryPersistent.queries) {
    try {
      parsedItems.push(...await query.all())
    }
    catch (error) {
      console.error(`
        [nuxt-feedme]: Received an error while try to 'query.all()' from provided (or default) content collections. Please, ensure that:
          1. Collection defined in 'nuxt.content.ts' or any other supported settings source
          2. Defined collection is exist and returns valid result
        Error is not critical, continue...`.replace(/^ {8}|^\n/gm, ''))
      console.warn('[nuxt-feedme]: Received an error from nuxt (see message above)', error)
    }
  }

  for (const raw of parsedItems) {
    let item = getItemOptionsFrom(raw, routeSettings.mapping ?? [])

    if (routeSettings.fixDateFields) {
      if (item.date) {
        item.date = new Date(item.date)
      }
      if (item.published) {
        item.published = new Date(item.published)
      }
    }

    if (routeSettings.replace && routeSettings.replace.length > 0) {
      item = applyReplacements(item, routeSettings.replace)
    }

    const feedmeItemPersistent: FeedmeItemPersistent = { raw, item }
    const feedmeHandleItemOptions: NitroFeedmeContentOptionsItem = {
      context: {
        event,
        routeSettings,
      },
      item: {
        raw: () => feedmeItemPersistent.raw,
        get: () => feedmeItemPersistent.item as Item,
        set: item => feedmeItemPersistent.item = item,
        del: () => feedmeItemPersistent.item = undefined,
      },
    }

    await useNitroApp().hooks.callHook(`feedme:handle:content:item[${event.path}]`, feedmeHandleItemOptions)
    await useNitroApp().hooks.callHook('feedme:handle:content:item', feedmeHandleItemOptions)

    if (feedmeItemPersistent.item) {
      feedmeHandlePersistent.feed.addItem(feedmeItemPersistent.item as Item)
    }
  }

  const feedmeHandleOptionsAfter: NitroFeedmeContentOptionsAfter = {
    context: {
      event,
      routeSettings,
    },
    feed: {
      invoke: () => feedmeHandlePersistent.feed as Feed,
    },
  }

  await useNitroApp().hooks.callHook(`feedme:handle:content:after[${event.path}]`, feedmeHandleOptionsAfter)
  await useNitroApp().hooks.callHook('feedme:handle:content:after', feedmeHandleOptionsAfter)

  return feedmeHandlePersistent
}

export default defineEventHandler(async (event) => {
  const moduleOptions = getFeedmeModuleOptions()

  const routeSettings = (moduleOptions.feeds.routes ?? {})[event.path]
  if (!routeSettings) {
    console.warn(`[nuxt-feedme]: Route '${event.path}' is not found in known feeds, but handler is registered: `, JSON.stringify(moduleOptions, null, 4))
  }

  const feedmeHandlePersistent: FeedmeHandlePersistent = {}
  const routeMergedSettings = deepmerge(moduleOptions.feeds.common, routeSettings)

  // Patch mappings
  const routeMergedTemplateMapping = (routeMergedSettings.templateMapping ?? []).filter(template => template !== '')
  routeMergedSettings.mapping = [...routeMergedSettings.mapping ?? []]
  routeMergedSettings.mapping.push(
    ...routeMergedTemplateMapping.flatMap(prefix => templateContentMapping(prefix, routeMergedSettings.mapping ?? [])),
  )

  setHeaders(event, {
    'Content-Type': intoContentType(routeMergedSettings.type ?? getFeedmeRSSTypeFrom(event.path)) ?? 'text/plain',
    'Cache-Control': `Max-Age=${intoSeconds(routeMergedSettings.revisit)}`,
  })

  const kind = routeMergedSettings.type ?? getFeedmeRSSTypeFrom(event.path)
  if (!kind)
    return new H3Error(`[nuxt-feedme]: Unable to determine RSS feed type from route '${event.path}'`)

  // CALL HANDLE
  const feedmeHandlePersistentHandle = await feedmeHandleDefault(event, routeMergedSettings, feedmeHandlePersistent)
  if (feedmeHandlePersistentHandle.feed)
    return feedmeHandlePersistentHandle.feed[kind]()

  // CALL CONTENT
  const feedmeHandlePersistentContent = await feedmeHandleContent(event, routeMergedSettings, feedmeHandlePersistent)
  if (feedmeHandlePersistentContent.feed)
    return feedmeHandlePersistentContent.feed[kind]()

  return new H3Error(`[nuxt-feedme]: The RSS feed wasn't created in any hook for route '${event.path}'`)
})
