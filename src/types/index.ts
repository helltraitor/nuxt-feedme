import type { H3Event } from 'h3'
import type { Feed, FeedOptions, Item } from 'feed'

import type { FeedmeRevisit } from './revisit'
import type { FeedmeContentOptions } from './content'

export type FeedmeRSSRoute = string

export type FeedmeRSSContentType = 'application/json' | 'application/atom+xml' | 'application/rss+xml'
export type FeedmeRSSType = 'json1' | 'atom1' | 'rss2'

export interface FeedmeRSSOptions {
  type?: FeedmeRSSType
  /**
   * Allowed object syntax and string syntax:
   * ```
   * const revisitObject: FeedmeRevisit = { days: 1, hours: 10, minutes: 9, seconds: 30 }
   *
   * const revisitString: FeedmeRevisit = '1d 10h 9m 30s'
   * ```
   */
  revisit?: FeedmeRevisit
  feed?: Partial<FeedOptions>
  item?: Partial<Item>
}

export type FeedmeRSSRouteSettings = FeedmeRSSOptions & FeedmeContentOptions

export interface FeedmeModuleOptions {
  defaults: {
    common?: boolean
    routes?: boolean
    mapping?: boolean
    mappingTemplates?: boolean
  }
  feeds: {
    common?: FeedmeRSSRouteSettings
    routes?: Record<FeedmeRSSRoute, FeedmeRSSRouteSettings>
  }
}

export interface NitroFeedmeHandleOptions {
  context: {
    event: H3Event
    routeSettings: FeedmeRSSRouteSettings
  }
  feed: {
    obtain: (options?: Partial<FeedOptions>) => Feed
  }
}

declare module 'nitropack' {
  interface NitroRuntimeHooks {
    [_: `feedme:handle[${string}]`]: (options: NitroFeedmeHandleOptions) => void
    'feedme:handle': (options: NitroFeedmeHandleOptions) => void
  }
}

declare module 'nuxt/schema' {
  interface SharedPublicRuntimeConfig {
    feedme: FeedmeModuleOptions
  }
}

export {}
