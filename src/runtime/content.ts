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
     *   templateRoots - once when empty
     *   query - once when empty
     */
    merged.item ??= {}
    merged.item.defaults = { ...variant.item?.defaults, ...merged.item?.defaults }
    merged.item.mapping = [...variant.item?.mapping ?? [], ...merged.item?.mapping ?? []]
    merged.item.templateRoots ??= variant.item?.templateRoots
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

export const replaceValueTags = <T>(target: T, tags: FeedmeContentTag[]): T => {
  const replaceValueTagsForString = (target: string, tags: FeedmeContentTag[]): string => {
    for (const [match, value] of tags) {
      target = target.replace(
        match,
        typeof value === 'function' ? value(target) : value,
      )
    }
    return target
  }

  if (Array.isArray(target))
    return target.map(item => replaceValueTags(item, tags)) as T

  if (target instanceof Date)
    return target

  if (typeof target === 'object') {
    return Object.fromEntries(
      Object.entries(target as object)
        .map(([key, value]) => [key, replaceValueTags(value, tags)]),
    ) as T
  }

  if (typeof target === 'string')
    return replaceValueTagsForString(target, tags) as T

  return target
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
