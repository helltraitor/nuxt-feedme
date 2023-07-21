import { Feed, type FeedOptions, type Item } from 'feed'

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
    replaced[key as keyof T] = (
      typeof value === 'string'
        ? replaceValueTagsFor(value, tags)
        : typeof value === 'object'
          ? replaceValueTags(value, tags)
          : value
    )
  }

  return replaced
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

  // selected.date = selected.date ? new Date(selected.date) : undefined
  // selected.published = selected.published ? new Date(selected.published) : undefined

  return selected
}

export const createItemFrom = (options: FeedmeContentOptions): Item => {
  const itemOptions = replaceValueTags(options.item?.defaults ?? {}, options.tags ?? [])
  const item: Item = { date: new Date(), link: '', title: '', ...itemOptions }
  return item
}
