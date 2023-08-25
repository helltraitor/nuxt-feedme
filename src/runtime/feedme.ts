import type { FeedmeModuleOptions, FeedmeRSSContentType, FeedmeRSSType, FeedmeRevisit, FeedmeRevisitObject } from '../types'

import { useRuntimeConfig } from "#imports"

export const intoSeconds = (feedRevisit: FeedmeRevisit | undefined): number => {
  const EXTRACT = /((?<days>\d+)d)?(\s?(?<hours>\d+)h)?(\s?(?<minutes>\d+)m)?(\s?(?<seconds>\d+)s)?/

  let revisit = feedRevisit as FeedmeRevisitObject | undefined
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
  /**
   * SAFE: feedme content accessible only as private code in `.nuxt` directory
   *   so it's unsafeness is the same as for any other module
   */
  // eslint-disable-next-line no-eval
  return eval(`(${useRuntimeConfig().feedme})`) as any as FeedmeModuleOptions
}
