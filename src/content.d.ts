import type { H3Event } from 'h3'

import type { Feed, FeedOptions, Item, Author} from 'feed'
import type { Category } from 'feed/lib/typings'

import type { ParsedContent, QueryBuilderParams } from '@nuxt/content/dist/runtime/types'

import type { FeedmeRSSOptions, FeedRSSRoute } from './types'

export type ParsedContentSimpleAlias = string
export type ParsedContentMappedAlias = [string, (source: any) => any]
export type ParsedContentItems = [keyof Item, ...ParsedContentMappedAlias | [ParsedContentSimpleAlias] ]

export type FeedmeContentTag = [(string | RegExp), (((source: string) => string) | string)]

export interface FeedmeContentOptions {
  feed?: {
    defaults?: Partial<FeedOptions> & { categories?: string[] }
  }

  item?: {
    mapping?: ParsedContentItems[]
    query?: QueryBuilderParams
    defaults?: Partial<Item>
  }

  tags?: FeedmeContentTag[]
}

export interface FeedmeRSSContentOptions extends
  FeedmeRSSOptions,
  FeedmeContentOptions
{
  /**
   * Set to true when content processing required for this feed
   */
  content?: true
}

export interface FeedmeModuleContentOptions
  extends Omit<FeedmeRSSContentOptions, 'content'> {
}

export interface NitroFeedmeContentBeforeOptions {
  context: {
    event: H3Event
  }
  feed: {
    create: (options: Partial<FeedOptions>) => void
    invoke: () => Partial<FeedOptions> | undefined
    feedme: FeedRSSContentOptions
    content: FeedmeModuleContentOptions
  }
}

export interface NitroFeedmeContentItemOptions {
  context: {
    event: H3Event
  }
  feed: {
    insert: (options: Partial<Item>) => void
    invoke: () => Partial<Item> | undefined
    parsed: ParsedContent
    feedme: FeedmeRSSContentOptions
    content: FeedmeModuleContentOptions
  }
}

export interface NitroFeedmeContentAfterOptions {
  context: {
    event: H3Event
  }
  feed: {
    invoke: () => Feed
    feedme: FeedmeRSSContentOptions
    content: FeedmeModuleContentOptions
  }
}

declare module 'nitropack' {
  interface NitroRuntimeHooks {
    [_: `feedme:handle:content:before[${string}]`]: (options: NitroFeedmeContentBeforeOptions) => void
    'feedme:handle:content:before': (options: NitroFeedmeContentBeforeOptions) => void

    [_: `feedme:handle:content:item[${string}]`]: (options: NitroFeedmeContentItemOptions) => void
    'feedme:handle:content:item': (options: NitroFeedmeContentItemOptions) => void

    [_: `feedme:handle:content:after[${string}]`]: (options: NitroFeedmeContentAfterOptions) => void
    'feedme:handle:content:after': (options: NitroFeedmeContentAfterOptions) => void
  }
}

export {}
