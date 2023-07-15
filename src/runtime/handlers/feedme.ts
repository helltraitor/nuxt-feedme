import { defineEventHandler, setHeaders } from 'h3'

import type { FeedRSSContentType, FeedRSSType, FeedRevisit, FeedRevisitObject, FeedmeModuleOptions } from '../../types'
import feedme from '#feedme'

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
    (revisit?.days ?? 0) * 24 * 60 * 60
    + (revisit?.hours ?? 0) * 60 * 60
    + (revisit?.minutes ?? 0) * 60
    + (revisit?.seconds ?? 0)
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

const getFeedmeModuleOptions = (): FeedmeModuleOptions => {
  return feedme as any as FeedmeModuleOptions
}

export default defineEventHandler((event) => {
  const moduleOptions = getFeedmeModuleOptions()
  const feed = moduleOptions.feeds[event.path]
  if (!feed) {
    console.warn(
      `[nuxt-feedme]: Incorrect handler set for route '${event.path}'. That route is not found in feeds:`,
      moduleOptions.feeds,
    )
    return
  }

  setHeaders(event, {
    'Content-Type': intoContentType(feed.type) ?? 'text/plain',
    'Cache-Control': `Max-Age=${intoSeconds(feed.revisit)}`,
  })

  return ''
})
