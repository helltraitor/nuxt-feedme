import type { H3Event } from 'h3'

import type { Feed, FeedOptions, Item, Author} from 'feed'
import type { Category } from 'feed/lib/typings'

import type { ParsedContent, QueryBuilderParams } from '@nuxt/content/dist/runtime/types'

import type { FeedmeRSSOptions, FeedRSSRoute } from './types'

export type ParsedContentAlias = string
export type ParsedContentMap = [string, (source: string) => any]
export interface ParsedContentMapping
  extends Partial<Record<keyof Item, ParsedContentAlias | ParsedContentMap>> {
}

export type FeedmeContentTag = [(string | RegExp), (((source: string) => string) | string)]

export interface FeedmeRSSContentOptions extends FeedmeRSSOptions {
  feed?: {
    baseUrl?: (() => string) | string
    defaults?: Partial<FeedOptions> & { categories?: string[] }
  }

  item?: {
    mapping?: ParsedContentMapping & { root?: string }
    query?: QueryBuilderParams
    defaults?: Partial<Item>
  }

  tags?: FeedmeContentTag[]

  /**
   * Set to true when content processing required for this feed
   */
  content?: true
}

export interface FeedmeModuleContentOptions
  extends Omit<FeedmeRSSContentOptions, 'content'> {
    /**
     * The alternative way to use content processing by match route.
     * The feeds with `content` property are not passed to this function.
     *
     * @returns Any value that will be used as `!!any`
     */
    match?: (route: string) => any
}

export interface NitroFeedmeContentBeforeOptions {
  context: {
    event: H3Event
  }
  feed: {
    create: (options: FeedOptions) => Feed
    invoke: () => Feed | undefined
    feedme: FeedRSSContentOptions
    content: FeedmeModuleContentOptions
  }
}

export interface NitroFeedmeContentItemOptions {
  context: {
    event: H3Event
  }
  feed: {
    insert: (options: Item) => void
    invoke: () => Item | undefined
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
