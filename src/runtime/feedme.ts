import type { FeedmeRevisit, FeedmeRevisitObject } from '../types/revisit'
import type { FeedmeModuleOptions, FeedmeRSSContentType, FeedmeRSSType } from '../types'

import { useRuntimeConfig } from '#imports'

export const intoSeconds = (feedRevisit: FeedmeRevisit | undefined): number => {
  const EXTRACT = /((?<days>\d+)d)?(\s?(?<hours>\d+)h)?(\s?(?<minutes>\d+)m)?(\s?(?<seconds>\d+)s)?/

  if (!feedRevisit) {
    return 6 * 60 * 60
  }

  let revisit = feedRevisit as FeedmeRevisitObject
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
  )
}

export const intoContentType = (feedType: FeedmeRSSType | undefined): FeedmeRSSContentType | undefined => {
  const LOOKUP: Record<string, FeedmeRSSContentType | undefined> = {
    rss2: 'application/rss+xml',
    atom1: 'application/atom+xml',
    json1: 'application/json',
  }

  return LOOKUP[feedType ?? '']
}

export const getFeedmeRSSTypeFrom = (route: string): FeedmeRSSType | undefined => {
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

export const getFeedmeModuleOptions = (): FeedmeModuleOptions => {
  return useRuntimeConfig().public.feedme as FeedmeModuleOptions
}

export {}
