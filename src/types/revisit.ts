export interface FeedmeRevisitObject {
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

export type FeedmeRevisitQuery = (
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

export type FeedmeRevisit = FeedmeRevisitQuery | FeedmeRevisitObject

export {}
