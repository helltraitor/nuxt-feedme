import type { FeedOptions, Item } from 'feed'
import { Feed, type FeedOptions, type Item } from 'feed'

interface CreateFeedFromOptions {
  baseUrl: string
import type { FeedmeContentOptions } from '../content'

export const mergeFeedmeContentOptions = (...variants: FeedmeContentOptions[]): FeedmeContentOptions => {
  const merged: FeedmeContentOptions = {}

  for (const variant of variants) {
    /**
     * FEED
     *   self - once when empty
     */
    merged.feed ??= {}
    merged.feed.defaults ??= { ...variant.feed?.defaults, ...merged.feed?.defaults }

    /**
     * ITEM
     *   self - once when empty
     *   defaults - merged (first prioritized)
     *   mapping - merged (first prioritized)
     *   query - once when empty
     */
    merged.item ??= {}
    merged.item.defaults ??= { ...variant.item?.defaults, ...merged.item?.defaults }
    merged.item.mapping ??= { ...variant.item?.mapping, ...merged.item?.mapping }
    merged.item.query ??= variant.item?.query

    /**
     * TAGS
     *  self - merged
     */
    merged.tags ??= []
    merged.tags.push(...variant.tags ?? [])
  }

  return merged
}

export const replaceValueTags = <T extends object>(target: T, tags: FeedmeContentTag[]): T => {
  const replaceValueTagsFor = (target: string, tags: FeedmeContentTag[]): string => {
    for (const [match, value] of tags) {
      target = target.replace(
        match,
        typeof value === 'function' ? value(target) : value,
      )
    }
    return target
  }

  const replaced: Partial<T> = {}

  for (const [key, value] of Object.entries(target)) {
    replaced[key as keyof T] = (
      typeof value === 'string'
        ? replaceValueTagsFor(value, tags)
        : typeof value === 'object'
          ? replaceValueTags(value, tags)
          : value
    )
  }

  return target
}

}

export const createFeedFrom = (options: CreateFeedFromOptions, ...variants: Partial<Record<keyof FeedOptions, any>>[]): FeedOptions => {
  // no updated (to Date), no author (object), no feedLinks (array)
  const feedOptionsKeys: (keyof FeedOptions)[] = [
    'copyright',
    'description',
    'docs',
    'feed', // url?
    'generator',
    'hub',
    'id',
    'language',
    'title',
    'ttl',
  ]

  const feedOptions: Partial<FeedOptions> = {}

  for (const variant of variants) {
    // author (object)
    if (typeof variant.author === 'object')
      feedOptions.author ??= variant.author

    // favicon: url? (string)
    if (typeof variant.favicon === 'string')
      feedOptions.favicon ??= `${options.baseUrl}${variant.favicon}`

    // feedLinks: url[] (string[])
    if (Array.isArray(variant.feedLinks)) {
      feedOptions.feedLinks ??= (
        variant.feedLinks
          .filter(x => typeof x === 'string')
          .map(x => `${options.baseUrl}${x}`)
      )
    }

    // link: url (string)
    if (typeof variant.link === 'string')
      feedOptions.link ??= `${options.baseUrl}${variant.link}`

    // link: url (string)
    if (typeof variant.image === 'string')
      feedOptions.link ??= `${options.baseUrl}${variant.image}`

    // updated: string | float
    if (variant.updated && !+new Date(variant.updated))
      feedOptions.updated ??= new Date(variant.updated)

    // rest: string
    for (const feedOptionsKey of feedOptionsKeys) {
      const variantValue = variant[feedOptionsKey]
      if (variantValue)
        feedOptions[feedOptionsKey] ??= variantValue
    }
  }

  return {
    id: 'unknown',
    title: 'unknown',
    copyright: 'unknown',
    ...feedOptions,
  }
}

interface CreateItemFromOptions {
  baseUrl: string
}

export const createItemFrom = (options: CreateItemFromOptions, ...variants: Partial<Record<keyof Item, any>>[]): Item => {
  const itemOptionsKeys: (keyof Item)[] = [
    'audio',
    'content',
    'copyright',
    'description',
    'enclosure',
    'guid',
    'id',
    'image',
    'title',
    'video',
  ]

  const itemOptions: Partial<Item> = {}

  for (const variant of variants) {
    // author: Author[] (object[])
    if (Array.isArray(variant.author)) {
      itemOptions.author ??= (
        variant.author
          .filter(x => typeof x === 'object')
      )
    }

    // category: Category[] (object[])
    if (Array.isArray(variant.category)) {
      itemOptions.category ??= (
        variant.category
          .filter(x => typeof x === 'object')
      )
    }

    // category: Author[] (object[])
    if (Array.isArray(variant.contributor)) {
      itemOptions.contributor ??= (
        variant.contributor
          .filter(x => typeof x === 'object')
      )
    }

    // category: Category[] (object[])
    if (Array.isArray(variant.extensions)) {
      itemOptions.extensions ??= (
        variant.extensions
          .filter(x => typeof x === 'object')
      )
    }

    // link: url (string)
    if (typeof variant.link === 'string')
      itemOptions.link ??= `${options.baseUrl}${variant.link}`

    // date: string | float
    if (variant.date && !+new Date(variant.date))
      itemOptions.date ??= new Date(variant.date)

    // published: string | float
    if (variant.published && !+new Date(variant.published))
      itemOptions.published ??= new Date(variant.published)

    // rest: string
    for (const itemOptionsKey of itemOptionsKeys) {
      const variantValue = variant[itemOptionsKey]
      if (variantValue)
        itemOptions[itemOptionsKey] ??= variantValue
    }
  }

  return {
    date: new Date(),
    link: '',
    title: 'unknown',
    ...itemOptions,
  }
}
