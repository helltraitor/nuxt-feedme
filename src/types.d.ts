import { Feed, FeedOptions } from 'feed'
import { H3Event } from 'h3'

type RouteString = string

export type FeedRSSContentType = 'application/json' | 'application/atom+xml' | 'application/rss+xml'
export type FeedRSSType = 'json1' | 'atom1' | 'rss2'

export interface FeedRevisitObject {
  seconds?: number
  minutes?: number
  hours?: number
  days?: number
}

// Duration primitives
type FRQDays = `${number}d`
type FRQHours = `${number}h`
type FRQMinutes = `${number}m`
type FRQSeconds = `${number}s`

// Days\Hours\*
type FRQDaysHours = `${FRQDays} ${FRQHours}`
type FRQDaysHoursMinutes = `${FRQDaysHours} ${FRQMinutes}`
type FRQDaysHoursMinutesSeconds = `${FRQDaysHoursMinutes} ${FRQSeconds}`

// Days\Minutes\*
type FRQDaysMinutes = `${FRQDays} ${FRQMinutes}`
type FRQDaysMinutesSeconds = `${FRQDaysMinutes} ${FRQSeconds}`

// Days\Seconds
type FRQDaysSeconds = `${FRQDays} ${FRQSeconds}`

// Hours\Minutes\*
type FRQHoursMinutes = `${FRQHours} ${FRQMinutes}`
type FRQHoursMinutesSeconds = `${FRQHoursMinutes} ${FRQSeconds}`

// Hours\Seconds
type FRQHoursSeconds = `${FRQHours} ${FRQSeconds}`

// Minutes\Seconds
type FRQMinutesSeconds = `${FRQMinutes} ${FRQSeconds}`

export type FeedRevisitQuery = (
  // DAYS
  FRQDays
  | FRQDaysHours
  | FRQDaysHoursMinutes
  | FRQDaysHoursMinutesSeconds
  | FRQDaysMinutes
  | FRQDaysMinutesSeconds
  | FRQDaysSeconds
  // HOURS
  | FRQHours
  | FRQHoursMinutes
  | FRQHoursMinutesSeconds
  | FRQHoursSeconds
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
