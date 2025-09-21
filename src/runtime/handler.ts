import type { FeedOptions } from 'feed'
import type { H3Event } from 'h3'
import type { NitroApp } from 'nitropack'

import { Feed } from 'feed'
import { defineEventHandler, setHeaders, H3Error } from 'h3'

import { useNitroApp } from '#imports'

import type { FeedmeRSSRouteSettings, NitroFeedmeHandleOptions } from '../types'

import { intoContentType, intoSeconds, getFeedmeRSSTypeFrom, getFeedmeModuleOptions } from './feedme'

declare module '#imports' {
  function useNitroApp(): NitroApp
}

const feedmeHandleDefault = async (event: H3Event, routeSettings: FeedmeRSSRouteSettings) => {
  setHeaders(event, {
    'Content-Type': intoContentType(routeSettings.type ?? getFeedmeRSSTypeFrom(event.path)) ?? 'text/plain',
    'Cache-Control': `Max-Age=${intoSeconds(routeSettings.revisit)}`,
  })

  const feedmeHandlePersistent: { feed?: Feed } = {}
  const feedmeHandleOptions: NitroFeedmeHandleOptions = {
    context: { event, routeSettings },
    feed: {
      obtain: (options?: FeedOptions) => {
        feedmeHandlePersistent.feed ??= new Feed(options ?? { id: '', title: '', copyright: '' })
        return feedmeHandlePersistent.feed
      },
    },
  }

  await useNitroApp().hooks.callHook(`feedme:handle[${event.path}]`, feedmeHandleOptions)
  await useNitroApp().hooks.callHook('feedme:handle', feedmeHandleOptions)

  const kind = routeSettings.type ?? getFeedmeRSSTypeFrom(event.path)
  if (!kind)
    return new H3Error(`[nuxt-feedme]: Unable to determine RSS feed type from route '${event.path}'`)

  if (!feedmeHandlePersistent.feed)
    return new H3Error(`[nuxt-feedme]: The RSS feed wasn't created in any hook for route '${event.path}'`)

  return feedmeHandlePersistent.feed[kind]()
}

export default defineEventHandler(async (event) => {
  const moduleOptions = getFeedmeModuleOptions()

  const routeSettings = (moduleOptions.feeds.routes ?? {})[event.path]
  if (!routeSettings) {
    console.warn(`[nuxt-feedme]: Route '${event.path}' is not found in known feeds, but handler is registered: `, JSON.stringify(moduleOptions, null, 4))
  }

  const routeMergedSettings = { ...moduleOptions.feeds.common, ...routeSettings }
  return await feedmeHandleDefault(event, routeMergedSettings)
})
