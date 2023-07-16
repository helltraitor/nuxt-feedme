import type { H3Event } from 'h3'
import type { Feed, FeedOptions } from 'feed'

import type { FeedmeRSSOptions } from './types'

export interface NitroFeedmeHandleOptions {
  context: {
    event: H3Event
  }
  feed: {
    create: (options: FeedOptions) => Feed
    feedme: FeedmeRSSOptions
  }
}

declare module 'nitropack' {
  interface NitroRuntimeHooks {
    // TODO: replace `void` type by Feed (requires to resolve https://github.com/unjs/hookable/issues/87)
    'feedme:handle': (options: NitroFeedmeHandleOptions) => void
  }
}

export {}
