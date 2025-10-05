import type { H3Event } from 'h3'
import type { Feed, FeedOptions, Item } from 'feed'

import type { FeedmeRSSRouteSettings } from '.'
import type { CollectionQueryBuilder, PageCollectionItemBase } from '@nuxt/content'

export type FeedmeContentReplace = [string, string]

export type FeedmeContentMappingRuleSource = string
export type FeedmeContentMappingRuleTarget = keyof Item
export type FeedmeContentMappingRule = [FeedmeContentMappingRuleTarget, FeedmeContentMappingRuleSource]
export type FeedmeContentMapping = FeedmeContentMappingRule[]

export interface FeedmeContentOptions {
  /**
   * Mapping: Item key, Path.to.field.of.parsed [, any to any map function ]
   * Keeps the first item, that receives value by its path.
   *
   * Note: map function is being serialized, so it's required to not to have
   *   any references to values out of the function scope
   */
  mapping?: FeedmeContentMapping
  /**
   * Applies additional prefix path to current mapping set. Priority depends on ordering of items in Array.
   * The root string can be same path as in mapping.
   *
   * Empty string means use use root of the parsed content
   */
  templateMapping?: string[]
  /**
   * This mapping is used for searching and replacing all values inside parsed item (full depth)
   *
   * Note: The first value is considered a RegExp (toString)
   */
  replace?: FeedmeContentReplace[]

  /**
   * Apply automatic date conversion for `date` and `published` fields (in Item candidate object)
   */
  fixDateFields?: boolean

  collections?: string[]
}

export interface NitroFeedmeContentOptionsBefore {
  context: {
    event: H3Event
    routeSettings: FeedmeRSSRouteSettings
  }
  feed: {
    obtain: (options?: Partial<FeedOptions>) => Feed
  }
}

export interface NitroFeedmeContentOptionsQuery {
  context: {
    event: H3Event
    routeSettings: FeedmeRSSRouteSettings
  }
  query: {
    fromCollections: (collections: string[]) => void
    add: (query: CollectionQueryBuilder<PageCollectionItemBase>) => NitroFeedmeContentOptionsQuery['query']
    reset: () => NitroFeedmeContentOptionsQuery['query']
  }
}

export interface NitroFeedmeContentOptionsItem {
  context: {
    event: H3Event
    routeSettings: FeedmeRSSRouteSettings
  }
  item: {
    raw: () => PageCollectionItemBase

    get: () => Partial<Item>
    set: (item?: Partial<Item>) => void
    del: () => void
  }
}

export interface NitroFeedmeContentOptionsAfter {
  context: {
    event: H3Event
    routeSettings: FeedmeRSSRouteSettings
  }
  feed: {
    invoke: () => Feed
  }
}

declare module 'nitropack' {
  interface NitroRuntimeHooks {
    [_: `feedme:handle:content:before[${string}]`]: (options: NitroFeedmeContentOptionsBefore) => void
    'feedme:handle:content:before': (options: NitroFeedmeContentOptionsBefore) => void

    [_: `feedme:handle:content:query[${string}]`]: (options: NitroFeedmeContentOptionsQuery) => void
    'feedme:handle:content:query': (options: NitroFeedmeContentOptionsQuery) => void

    [_: `feedme:handle:content:item[${string}]`]: (options: NitroFeedmeContentOptionsItem) => void
    'feedme:handle:content:item': (options: NitroFeedmeContentOptionsItem) => void

    [_: `feedme:handle:content:after[${string}]`]: (options: NitroFeedmeContentOptionsAfter) => void
    'feedme:handle:content:after': (options: NitroFeedmeContentOptionsAfter) => void
  }
}

export {}
