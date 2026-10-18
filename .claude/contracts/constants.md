## Constants

### Component and module constants live in a co-located `<name>.constants.ts`

When creating or editing a component, hook, store or fetcher, move its constants (magic numbers, labels, keys,
option lists, timings) to a co-located `<name>.constants.ts` — always, independently of how many there are.

App-wide constants (`ScreenName`, `appScreen`, `QUERY_LIMIT`, table names, storage keys) live in
`app/Utils/constants.ts` (legacy) or a domain constants file (`app/api/<entity>/<entity>.constants.ts`).

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
