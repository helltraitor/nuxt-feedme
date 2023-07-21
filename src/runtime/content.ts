import { Feed, type Item } from 'feed'

import type { FeedmeContentOptions, FeedmeContentTag, ParsedContentItems } from '../content'

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
    merged.item.mapping = [...variant.item?.mapping ?? [], ...merged.item?.mapping ?? []]
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
    if (Array.isArray(value))
      replaced[key as keyof T] = value.map(item => replaceValueTags(item, tags)) as T[keyof T]

    else if (value instanceof Date)
      replaced[key as keyof T] = new Date(replaceValueTagsFor(`${value}`, tags)) as T[keyof T]

    else if (typeof value === 'object')
      replaced[key as keyof T] = replaceValueTags(value, tags)

    else if (typeof value === 'string')
      replaced[key as keyof T] = replaceValueTagsFor(value, tags) as T[keyof T]

    else
      replaced[key as keyof T] = value
  }

  return replaced as T
}

export const createFeedFrom = (options: FeedmeContentOptions): Feed => {
  const feedOptions = replaceValueTags(options.feed?.defaults ?? {}, options.tags ?? [])
  const feed = new Feed({ copyright: '', id: '', title: '', ...feedOptions })

  for (const category of feedOptions.categories ?? [])
    feed.addCategory(category)

  return feed
}

export const getItemOptionsFrom = (parsed: Record<string, any>, mapping: ParsedContentItems[]): Partial<Item> => {
  const getValueByPath = (target: any, path: string): any => {
    for (const part of path.split('.')) {
      if (typeof target !== 'object')
        return undefined
      target = target[part]
    }
    return target
  }

  const selected: Partial<Item> = {}
  const intoSelf = (item: any) => item

  for (const variant of mapping) {
    const [key, path, map = intoSelf] = variant
    selected[key] ??= map(getValueByPath(parsed, path))
  }

  return selected
}

export const createItemFrom = (options: FeedmeContentOptions): Item => {
  const itemOptions = replaceValueTags(options.item?.defaults ?? {}, options.tags ?? [])
  const item: Item = { date: new Date(), link: '', title: '', ...itemOptions }
  return item
}
