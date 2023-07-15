import { Feed, FeedOptions } from 'feed'
import { H3Event } from 'h3'
import { RenderResponse } from 'nitropack'

type RouteString = string

export type FeedRSSContentType = 'application/json' | 'application/atom+xml' | 'application/rss+xml'
export type FeedRSSType = 'json1' | 'atom1' | 'rss2'

export interface FeedRevisitObject {
  seconds?: number
  minutes?: number
  hours?: number
  days?: number
}

type FRQDays = `${number}d`
type FRQHours = `${number}h`
type FRQMinutes = `${number}m`
type FRQSeconds = `${number}s`

type FRQDaysHours = `${FRQDays} ${FRQHours}`
type FRQDaysHoursMinutes = `${FRQDaysHours} ${FRQMinutes}`
type FRQDaysHoursMinutesSeconds = `${FRQDaysHoursMinutes} ${FRQSeconds}`

type FRQHoursMinutes = `${FRQHours} ${FRQMinutes}`
type FRQHoursMinutesSeconds = `${FRQHoursMinutes} ${FRQSeconds}`

type FRQMinutesSeconds = `${FRQMinutes} ${FRQSeconds}`

export type FeedRevisitQuery = (
  // DAYS
  FRQDays
  | FRQDaysHours
  | FRQDaysHoursMinutes
  | FRQDaysHoursMinutesSeconds
  // HOURS
  | FRQHours
  | FRQHoursMinutes
  | FRQHoursMinutesSeconds
  // MINUTES
  | FRQMinutes
  | FRQMinutesSeconds
  // SECONDS
  | FRQSeconds
)

export type FeedRevisit = FeedRevisitQuery | FeedRevisitObject

export interface FeedmeRSSOptions {
  type?: FeedRSSType
  revisit?: FeedRevisit
}

export interface FeedmeModuleOptions {
  feeds: Record<RouteString, FeedmeRSSOptions | undefined>
}

declare module 'nitropack' {
  export interface NitroFeedmeHandleOptions {
    context: {
      event: H3Event
    }
    feed: {
      create: (options: FeedOptions) => Feed
      feedme: FeedmeRSSOptions
    }
  }

  interface NitroRuntimeHooks {
    'feedme:handle': (options: NitroFeedmeHandleOptions) => Feed;
  }
}

declare module '#feedme' {
  // TODO: Rollup works incorrect for exports in shims (https://github.com/Swatinem/rollup-plugin-dts/issues/162)
  // export default FeedmeModuleOptions
}

export {}
