import { Feed, type FeedOptions, type Item } from 'feed'
import { H3Error, type H3Event, defineEventHandler, setHeaders } from 'h3'

import type { NitroApp } from 'nitropack'
import type { FeedmeRSSOptions } from '../types'
import type { FeedmeModuleContentOptions, FeedmeRSSContentOptions } from '../content'
import { getFeedmeModuleOptions, getFeedmeRSSTypeFrom, intoContentType, intoSeconds } from './feedme'
import { createFeedFrom, createItemFrom, getItemOptionsFrom, mergeFeedmeContentOptions } from './content'

import { serverQueryContent } from '#content/server'
import { useNitroApp } from '#imports'

declare module '#imports' {
  function useNitroApp(): NitroApp
}

const feedmeHandleContent = async (event: H3Event, feedme: FeedmeRSSContentOptions, content: FeedmeModuleContentOptions) => {
  setHeaders(event, {
    'Content-Type': intoContentType(feedme?.type ?? getFeedmeRSSTypeFrom(event.path)) ?? 'text/plain',
    'Cache-Control': `Max-Age=${intoSeconds(feedme?.revisit)}`,
  })

  // FEEDME:HANDLE:CONTENT:BEFORE
  let maybeFeedOptions: Partial<FeedOptions> | undefined
  const feedmeHandleContentBefore = {
    context: { event },
    feed: {
      create: (options: Partial<FeedOptions>) => {
        maybeFeedOptions = options
      },
      invoke: () => maybeFeedOptions,
      feedme,
      content,
    },
  }

  await useNitroApp().hooks.callHook(`feedme:handle:content:before[${event.path}]`, feedmeHandleContentBefore)
  await useNitroApp().hooks.callHook('feedme:handle:content:before', feedmeHandleContentBefore)

  // FEEDME:HANDLE:CONTENT:ITEM
  const feedmeContentDefaults: Partial<FeedOptions> = {
    ttl: intoSeconds(feedme.revisit ?? content.revisit) / 60,
  }
  const feedmeContentOptions = mergeFeedmeContentOptions(
    // Highest priory - user preferences
    { feed: { defaults: feedmeContentDefaults } },
    feedme,
    content,
    // Lowest priority - most specialized options
    { feed: { defaults: feedmeContentDefaults } },
  )

  const feed = createFeedFrom(feedmeContentOptions)

  const records = await serverQueryContent(event, feedmeContentOptions.item?.query).find()
  for (const parsed of records) {
    let maybeItem: Partial<Item> | undefined

    const feedmeHandleContentItem = {
      context: { event },
      feed: {
        invoke: () => maybeItem,
        insert: (item: Partial<Item>) => {
          maybeItem = item
        },
        parsed,
        feedme,
        content,
      },
    }

    await useNitroApp().hooks.callHook(`feedme:handle:content:item[${event.path}]`, feedmeHandleContentItem)
    await useNitroApp().hooks.callHook('feedme:handle:content:item', feedmeHandleContentItem)

    const feedmeItemParsedDefaults = getItemOptionsFrom(parsed, feedmeContentOptions.item?.mapping ?? [])
    const feedmeItemContentOptions = mergeFeedmeContentOptions(
      // Highest priority - user preferences
      { item: { defaults: maybeItem } },
      feedme,
      content,
      // Lowest priority - defaults from parsed
      { item: { defaults: feedmeItemParsedDefaults } },
    )

    feed.addItem(createItemFrom(feedmeItemContentOptions))
  }

  // FEEDME:HANDLE:CONTENT:AFTER
  const feedmeHandleContentAfter = {
    context: { event },
    feed: {
      invoke: () => feed,
      feedme,
      content,
    },
  }

  await useNitroApp().hooks.callHook(`feedme:handle:content:after[${event.path}]`, feedmeHandleContentAfter)
  await useNitroApp().hooks.callHook('feedme:handle:content:after', feedmeHandleContentAfter)

  const kind = feedme?.type ?? getFeedmeRSSTypeFrom(event.path)
  if (!kind)
    return new H3Error(`[nuxt-feedme]: Unable to determine RSS feed type from route '${event.path}'`)

  if (typeof feed[kind] !== 'function')
    return new H3Error(`[nuxt-feedme]: Incorrect kind '${kind}' of RSS feed type from route '${event.path}'`)

  return feed[kind]()
}

interface FeedmeHandleDefaultPersistent {
  feed?: Feed
}

const feedmeHandleDefault = async (event: H3Event, feedme: FeedmeRSSOptions) => {
  setHeaders(event, {
    'Content-Type': intoContentType(feedme?.type ?? getFeedmeRSSTypeFrom(event.path)) ?? 'text/plain',
    'Cache-Control': `Max-Age=${intoSeconds(feedme.revisit)}`,
  })

  const feedmeHandlePersistent: FeedmeHandleDefaultPersistent = {}
  const feedmeHandleOptions = {
    context: { event },
    feed: {
      create: (options: FeedOptions) => {
        feedmeHandlePersistent.feed = new Feed(options)
        return feedmeHandlePersistent.feed
      },
      invoke: () => feedmeHandlePersistent.feed,
      feedme,
    },
  }

  await useNitroApp().hooks.callHook(`feedme:handle[${event.path}]`, feedmeHandleOptions)
  await useNitroApp().hooks.callHook('feedme:handle', feedmeHandleOptions)

  const kind = feedme.type ?? getFeedmeRSSTypeFrom(event.path)
  if (!kind)
    return new H3Error(`[nuxt-feedme]: Unable to determine RSS feed type from route '${event.path}'`)

  const feed = feedmeHandlePersistent.feed
  if (!feed)
    return new H3Error(`[nuxt-feedme]: The RSS feed wasn't created for route '${event.path}'`)

  if (typeof feed[kind] !== 'function')
    return new H3Error(`[nuxt-feedme]: Incorrect kind '${kind}' of RSS feed type from route '${event.path}'`)

  return feed[kind]()
}

export default defineEventHandler(async (event) => {
  const moduleOptions = getFeedmeModuleOptions()
  const feedme = moduleOptions.feeds[event.path]
  if (!feedme) {
    return new H3Error(
      `[nuxt-feedme]: Incorrect handler set for route '${event.path}'`
      + ` That route is not found in feeds: ${JSON.stringify(moduleOptions.feeds)}`)
  }

  const feedmeContent = feedme as FeedmeRSSContentOptions
  if (feedmeContent.content)
    return await feedmeHandleContent(event, feedme, moduleOptions.content ?? {})

  return await feedmeHandleDefault(event, feedme)
})
