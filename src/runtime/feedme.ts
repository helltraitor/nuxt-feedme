import { Feed, type FeedOptions } from 'feed'
import { H3Error, defineEventHandler, setHeaders } from 'h3'

import type { FeedRSSContentType, FeedRSSType, FeedRevisit, FeedRevisitObject, FeedmeModuleOptions } from '../types'
import feedme from '#feedme'
import { useNitroApp } from '#imports'

interface FeedmeHandlePersistent {
  feed?: Feed
}

const intoSeconds = (feedRevisit: FeedRevisit | undefined): number => {
  const EXTRACT = /((?<days>\d+)d)?(\s?(?<hours>\d+)h)?(\s?(?<minutes>\d+)m)?(\s?(?<seconds>\d+)s)?/

  let revisit = feedRevisit as FeedRevisitObject | undefined
  if (typeof feedRevisit === 'string') {
    const extracted = feedRevisit.match(EXTRACT)?.groups ?? { hours: '24' }
    revisit = {
      seconds: +(extracted?.seconds ?? 0),
      minutes: +(extracted?.minutes ?? 0),
      hours: +(extracted?.hours ?? 0),
      days: +(extracted?.days ?? 0),
    }
  }

  return (
    // Calculate in seconds
    (revisit?.days ?? 0) * 24 * 60 * 60
    + (revisit?.hours ?? 0) * 60 * 60
    + (revisit?.minutes ?? 0) * 60
    + (revisit?.seconds ?? 0)
    // Or 6h if 0s
    || 6 * 60 * 60
  )
}

const intoContentType = (feedType: FeedRSSType | undefined): FeedRSSContentType | undefined => {
  const LOOKUP: Record<string, FeedRSSContentType | undefined> = {
    rss2: 'application/rss+xml',
    atom1: 'application/atom+xml',
    json1: 'application/json',
  }

  return LOOKUP[feedType ?? '']
}

const getFeedRSSTypeFrom = (route: string): FeedRSSType | undefined => {
  const EXTRACT = /\.(?<ext>\w+)$/

  switch (route.match(EXTRACT)?.groups?.ext) {
    case 'atom':
      return 'atom1'
    case 'json':
      return 'json1'
    case 'xml':
      return 'rss2'
  }
}

const getFeedmeModuleOptions = (): FeedmeModuleOptions => {
  return feedme as any as FeedmeModuleOptions
}

export default defineEventHandler(async (event) => {
  const moduleOptions = getFeedmeModuleOptions()
  const feedme = moduleOptions.feeds[event.path]
  if (!feedme) {
    console.warn(
      `[nuxt-feedme]: Incorrect handler set for route '${event.path}'. That route is not found in feeds:`,
      moduleOptions.feeds,
    )
    return
  }

  setHeaders(event, {
    'Content-Type': intoContentType(feedme.type) ?? 'text/plain',
    'Cache-Control': `Max-Age=${intoSeconds(feedme.revisit)}`,
  })

  const feedmeHandlePersistent: FeedmeHandlePersistent = {}
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

  const kind = feedme.type ?? getFeedRSSTypeFrom(event.path)
  if (!kind)
    return new H3Error(`[nuxt-feedme]: Unable to determine RSS feed type from route '${event.path}'`)

  const feed = feedmeHandlePersistent.feed
  if (!feed)
    return new H3Error(`[nuxt-feedme]: The RSS feed wasn't created for route '${event.path}'`)

  if (typeof feed[kind] !== 'function')
    return new H3Error(`[nuxt-feedme]: Incorrect kind '${kind}' of RSS feed type from route '${event.path}'`)

  return feed[kind]()
})
