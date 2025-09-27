import type { Item } from 'feed'
import type { PageCollectionItemBase } from '@nuxt/content'

import type { FeedmeContentMapping, FeedmeContentReplace } from '../types/content'

export const applyReplacements = <T>(target: T, replacements: FeedmeContentReplace[]): T => {
  const applyReplacementsForString = (target: string, replacements: FeedmeContentReplace[]): string => {
    for (const [from, to] of replacements) {
      if (target.match(from) !== null) {
        target = target.replace(from, to)
      }
    }
    return target
  }

  if (Array.isArray(target))
    return target.map(item => applyReplacements(item, replacements)) as T

  if (target instanceof Date)
    return target

  if (typeof target === 'object') {
    return Object.fromEntries(
      Object.entries(target as object)
        .map(([key, value]) => [key, applyReplacements(value, replacements)]),
    ) as T
  }

  if (typeof target === 'string')
    return applyReplacementsForString(target, replacements) as T

  return target
}

export const getItemOptionsFrom = (parsed: PageCollectionItemBase, mapping: FeedmeContentMapping): Partial<Item> => {
  const getValueByPath = (target: unknown, path: string): Item[keyof Item] => {
    for (const part of path.split('.')) {
      if (typeof target !== 'object' || target === null) {
        return undefined
      }
      target = target[part as keyof typeof target]
    }
    return target as Item[keyof Item]
  }

  const selected: Partial<Item> = {}
  for (const [key, path] of mapping) {
    const value = getValueByPath(parsed, path)
    if (selected[key] === undefined) {
      // Note: Don't really care about what is set to feed Item object,
      //       since it is responsibility of user and surround code to make sure all is fine
      //
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      selected[key] = value as any
    }
  }

  return selected
}

export {}
