## Constants

### Keep constants in the file that uses them

Constants (magic numbers, labels, keys, option lists, timings) go at the top of the file that uses them, below
imports. Create a separate `<name>.constants.ts` only when ≥2 files share them (e.g. an entity's table name used by
`app/api` and `app/services`), or a list is so large it buries the file's logic.

App-wide constants (`ScreenName`, `QUERY_LIMIT`, storage keys) live in `app/utils/constants.ts` (legacy) or a domain
constants file (`app/api/<entity>/<entity>.constants.ts`).

Object constants use SCREAMING_SNAKE_CASE keys and `as const`; derive the union type from them instead of using
`enum` in new code:

```ts
export const PLAYBACK_STATUS = {
  IDLE: 'idle',
  PLAYING: 'playing',
  PAUSED: 'paused',
  FINISHED: 'finished',
} as const

export type PlaybackStatus = (typeof PLAYBACK_STATUS)[keyof typeof PLAYBACK_STATUS]
```

Durations carry their unit in the name (`REST_DURATION_SEC`, `CUE_LEAD_MS`).
