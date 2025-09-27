import type { FeedmeContentMapping, FeedmeContentMappingRuleTarget } from '../types/content'

const PARSED_CONTENT_KEYS: FeedmeContentMappingRuleTarget[] = [
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

export const defaultContentMapping = (): FeedmeContentMapping => {
  return PARSED_CONTENT_KEYS.map(key => [key, key])
}

export const templateContentMapping = (key: string, mapping: FeedmeContentMapping): FeedmeContentMapping => {
  return mapping.map(([item, path]) => [item, `${key}.${path}`])
}
