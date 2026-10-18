// Pure, timestamp-based workout schedule. No React, no native modules, so it can be unit
// tested in isolation (see app/__tests__/screens/playing-screen/playback-schedule.test.ts).
//
// A workout is flattened into segments, one per (exercise, lap). Each segment is a countdown of the
// exercise's `breakTimeInSec`. When a segment's countdown ends the player moves to the next segment:
// - if the next segment belongs to an exercise with `repeats` (a strength set), the player pauses
//   and waits for the user to press play (this mirrors `onChangeTimer` in usePlaying);
// - otherwise the next countdown starts right away, at the exact moment the previous one ended;
// - after the last segment the workout is finished (usePlaying sets `isWaitForSubmit`).
//
// The clock never counts ticks. It stores when the current segment was (re)started and how much of
// it had elapsed before the last pause, and derives everything else from `now`. This keeps the
// position correct after the JS thread was suspended (screen locked, app in background).

export type ScheduleExercise = {
  name: string
  laps: number
  breakTimeInSec: number
  repeats?: number
}

export type Segment = {
  /** Position in the flattened list */
  index: number
  /** Exercise index (usePlaying `playing.idx`) */
  idx: number
  /** 1-based lap (usePlaying `playing.lap`) */
  lap: number
  laps: number
  name: string
  durationMs: number
  /** The player pauses before this segment when it is reached automatically */
  manualStart: boolean
}

export type Clock = {
  segmentIndex: number
  /** Epoch ms when the clock was last started/resumed; null while paused */
  startedAt: number | null
  /** Ms of the current segment that elapsed before `startedAt` (time spent before the last pause) */
  pausedAccumulatedMs: number
}

export type Boundary = {
  /** Epoch ms when the segment `from` ends */
  at: number
  from: number
  /** Next segment index, or null when the workout finishes at this boundary */
  to: number | null
  /** The player pauses at this boundary (next segment needs a manual start) */
  pauses: boolean
}

export type AdvanceResult = {
  clock: Clock
  /** Boundaries crossed between the clock's last known state and `now`, in order */
  crossed: Boundary[]
  finished: boolean
}

export function buildSegments(exercises: ScheduleExercise[]): Segment[] {
  const segments: Segment[] = []
  exercises.forEach((exercise, idx) => {
    const laps = Math.max(1, exercise.laps || 1)
    for (let lap = 1; lap <= laps; lap++) {
      segments.push({
        index: segments.length,
        idx,
        lap,
        laps,
        name: exercise.name,
        durationMs: Math.max(0, (exercise.breakTimeInSec || 0) * 1000),
        manualStart: !!exercise.repeats,
      })
    }
  })
  return segments
}

export function findSegmentIndex(segments: Segment[], idx: number, lap: number): number {
  const found = segments.findIndex(s => s.idx === idx && s.lap === lap)
  return found === -1 ? 0 : found
}

export function isRunning(clock: Clock): boolean {
  return clock.startedAt !== null
}

/** A clock positioned at the start of `segmentIndex`. `startAt` defaults to now when running. */
export function resetClock(segmentIndex: number, running: boolean, now: number, startAt?: number): Clock {
  return { segmentIndex, startedAt: running ? startAt ?? now : null, pausedAccumulatedMs: 0 }
}

export function elapsedMs(clock: Clock, now: number): number {
  const running = clock.startedAt === null ? 0 : Math.max(0, now - clock.startedAt)
  return clock.pausedAccumulatedMs + running
}

export function pauseClock(clock: Clock, now: number): Clock {
  if (clock.startedAt === null) return clock
  return { ...clock, startedAt: null, pausedAccumulatedMs: elapsedMs(clock, now) }
}

export function resumeClock(clock: Clock, now: number): Clock {
  if (clock.startedAt !== null) return clock
  return { ...clock, startedAt: now }
}

export function remainingMs(segments: Segment[], clock: Clock, now: number): number {
  const segment = segments[clock.segmentIndex]
  if (!segment) return 0
  return Math.max(0, segment.durationMs - elapsedMs(clock, now))
}

/** Epoch ms when the current segment ends, or null while paused */
export function segmentEndsAt(segments: Segment[], clock: Clock): number | null {
  const segment = segments[clock.segmentIndex]
  if (!segment || clock.startedAt === null) return null
  return clock.startedAt - clock.pausedAccumulatedMs + segment.durationMs
}

// Walks forward from `clock` through every boundary that happens at or before `until`, stopping at
// a pause point, at the end of the workout, or after `limit` boundaries.
function walk(segments: Segment[], clock: Clock, until: number, limit: number): AdvanceResult {
  const crossed: Boundary[] = []
  let current = clock
  let finished = false
  while (current.startedAt !== null && crossed.length < limit) {
    const end = segmentEndsAt(segments, current)
    if (end === null || end > until) break
    const next = segments[current.segmentIndex + 1]
    if (!next) {
      crossed.push({ at: end, from: current.segmentIndex, to: null, pauses: true })
      // Finished: stay on the last segment, stopped, with nothing left
      current = {
        segmentIndex: current.segmentIndex,
        startedAt: null,
        pausedAccumulatedMs: segments[current.segmentIndex].durationMs,
      }
      finished = true
      break
    }
    crossed.push({ at: end, from: current.segmentIndex, to: next.index, pauses: next.manualStart })
    current = next.manualStart ? resetClock(next.index, false, end) : resetClock(next.index, true, end, end)
  }
  return { clock: current, crossed, finished }
}

/**
 * Where the workout should be at `now`. Used when the app comes back to the foreground: apply the
 * returned clock and segment without replaying the cues of the crossed boundaries.
 */
export function advance(segments: Segment[], clock: Clock, now: number): AdvanceResult {
  if (!segments.length) return { clock, crossed: [], finished: false }
  return walk(segments, clock, now, segments.length + 1)
}

/** The next `limit` boundaries if nobody touches the player (for scheduling notifications). */
export function upcomingBoundaries(segments: Segment[], clock: Clock, now: number, limit: number): Boundary[] {
  if (!segments.length) return []
  return walk(segments, clock, Number.POSITIVE_INFINITY, limit).crossed.filter(b => b.at > now)
}

export type CueContent = { id: string; at: number; title: string; body: string }

function formatSeconds(ms: number): string {
  const total = Math.round(ms / 1000)
  const m = Math.floor(total / 60)
  const s = total % 60
  return m > 0 ? `${m}:${String(s).padStart(2, '0')}` : `${s}s`
}

/** Notification texts for boundaries. Ids are stable per boundary so rescheduling replaces them. */
export function buildCues(segments: Segment[], boundaries: Boundary[]): CueContent[] {
  return boundaries.map(b => {
    const id = `workout-cue-${b.from}`
    if (b.to === null) {
      return { id, at: b.at, title: 'Workout complete', body: 'Open Training Plan to save your results.' }
    }
    const next = segments[b.to]
    const from = segments[b.from]
    const title = next.idx === from.idx ? `${next.name}: lap ${next.lap}/${next.laps}` : `Next: ${next.name}`
    const body = b.pauses
      ? `Lap ${next.lap}/${next.laps}. Rest is over, tap play after your set.`
      : `Lap ${next.lap}/${next.laps} · ${formatSeconds(next.durationMs)}`
    return { id, at: b.at, title, body }
  })
}
