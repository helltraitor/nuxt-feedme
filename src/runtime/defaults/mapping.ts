import type { Item } from 'feed'

import type { ParsedContentItems } from '../../content'

const PARSED_CONTENT_KEYS: (keyof Item)[] = [
  'audio',
  'author',
  'category',
  'content',
  'contributor',
  'copyright',
  'date',
  'description',
  'enclosure',
  'extensions',
  'guid',
  'id',
  'image',
  'link',
  'published',
  'title',
  'video',
]

export const intoParsedContentTemplateMapping = (root: string | true): ParsedContentItems[] => {
  return PARSED_CONTENT_KEYS.map((key) => {
    const alias = root === true ? key : `${root}.${key}`
    const map = key === 'date' ? [(date: string) => new Date(date)] : []

    // Note: typescript is too stupid for now
    return [key, alias, ...map] as any
  })
}
