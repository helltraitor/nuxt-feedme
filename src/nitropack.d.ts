import type { H3Event } from 'h3'
import type { Feed, FeedOptions } from 'feed'

import type { FeedmeRSSOptions } from './types'

export interface NitroFeedmeHandleOptions {
  context: {
    event: H3Event
  }
  feed: {
    create: (options: FeedOptions) => Feed
    invoke: () => Feed | undefined
    feedme: FeedmeRSSOptions
  }
}

declare module 'nitropack' {
  interface NitroRuntimeHooks {
    [_: `feedme:handle[${string}]`]: (options: NitroFeedmeHandleOptions) => void
    'feedme:handle': (options: NitroFeedmeHandleOptions) => void
  }
}

export {}
