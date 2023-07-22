import type { H3Event } from 'h3'

import type { Feed, FeedOptions, Item} from 'feed'

import type { ParsedContent, QueryBuilderParams } from '@nuxt/content/dist/runtime/types'

import type { FeedmeRSSOptions } from './types'

export type ParsedContentSimpleAlias = string
export type ParsedContentMappedAlias = [string, (source: any) => any]
export type ParsedContentItems = [keyof Item, ...ParsedContentMappedAlias | [ParsedContentSimpleAlias] ]

export type FeedmeContentTag = [(string | RegExp), (((source: string) => string) | string)]

export interface FeedmeContentOptions {
  feed?: {
    defaults?: Partial<FeedOptions> & { categories?: string[] }
  }

  item?: {
    /**
     * Mapping: Item key, Path.to.field.of.parsed [, any to any map function ]
     *
     * Note: map function is being serialized so it's required to not to have
     *   any references to values out of the function scope
     */
    mapping?: ParsedContentItems[]
    /**
     * Creates default mapping with lowest priority and passed string as root.
     * The root string can be same path as in mapping.
     *
     * True value means use use root of the parsed content
     */
    templateRoots?: (string | true)[]
    query?: QueryBuilderParams
    defaults?: Partial<Item>
  }

  /**
   * Tags will be used for replace any string in any depth of feed and item
   */
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
