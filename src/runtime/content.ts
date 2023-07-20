import { Feed, type FeedOptions, type Item } from 'feed'

import type { FeedmeContentOptions, FeedmeContentTag } from '../content'

export const mergeFeedmeContentOptions = (...variants: FeedmeContentOptions[]): FeedmeContentOptions => {
  const merged: FeedmeContentOptions = {}

  for (const variant of variants) {
    /**
     * FEED
     *   self - once when empty
     */
    merged.feed ??= {}
    merged.feed.defaults = { ...variant.feed?.defaults, ...merged.feed?.defaults }

    /**
     * ITEM
     *   self - once when empty
     *   defaults - merged (first prioritized)
     *   mapping - merged (first prioritized)
     *   query - once when empty
     */
    merged.item ??= {}
    merged.item.defaults = { ...variant.item?.defaults, ...merged.item?.defaults }
    merged.item.mapping = { ...variant.item?.mapping, ...merged.item?.mapping }
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

export const createFeedFrom = (options: FeedmeContentOptions): Feed => {
  const feedOptions = replaceValueTags(options.feed?.defaults ?? {}, options.tags ?? [])
  const feed = new Feed({ copyright: '', id: '', title: '', ...feedOptions })

  for (const category of feedOptions.categories ?? [])
    feed.addCategory(category)

  return feed
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
