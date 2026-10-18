import {
  advance,
  buildCues,
  buildSegments,
  Clock,
  elapsedMs,
  findSegmentIndex,
  pauseClock,
  remainingMs,
  resetClock,
  resumeClock,
  ScheduleExercise,
  segmentEndsAt,
  upcomingBoundaries,
} from '../playback-schedule'

const T0 = 1_700_000_000_000
const s = (sec: number) => sec * 1000

// Timed circuit (no repeats): auto-advances. Then a strength exercise (repeats): pauses per lap.
const circuit: ScheduleExercise[] = [
  { name: 'Jumping jacks', laps: 2, breakTimeInSec: 30 },
  { name: 'Plank', laps: 1, breakTimeInSec: 60 },
]
const mixed: ScheduleExercise[] = [
  { name: 'Warm-up', laps: 1, breakTimeInSec: 60 },
  { name: 'Squats', laps: 3, breakTimeInSec: 90, repeats: 10 },
  { name: 'Stretch', laps: 1, breakTimeInSec: 120 },
]

describe('buildSegments', () => {
  it('flattens exercises into (idx, lap) segments with durations and manual starts', () => {
    const segments = buildSegments(mixed)
    expect(segments.map(x => [x.idx, x.lap, x.durationMs, x.manualStart])).toEqual([
      [0, 1, s(60), false],
      [1, 1, s(90), true],
      [1, 2, s(90), true],
      [1, 3, s(90), true],
      [2, 1, s(120), false],
    ])
    expect(findSegmentIndex(segments, 1, 3)).toBe(3)
    expect(findSegmentIndex(segments, 9, 9)).toBe(0)
  })

  it('treats missing laps/break time safely', () => {
    const segments = buildSegments([{ name: 'X', laps: 0, breakTimeInSec: undefined as any }])
    expect(segments).toHaveLength(1)
    expect(segments[0].durationMs).toBe(0)
  })
})

describe('clock', () => {
  const segments = buildSegments(circuit)

  it('derives remaining time from timestamps, not ticks', () => {
    const clock = resetClock(0, true, T0)
    expect(remainingMs(segments, clock, T0 + s(10))).toBe(s(20))
    expect(remainingMs(segments, clock, T0 + s(45))).toBe(0)
    expect(segmentEndsAt(segments, clock)).toBe(T0 + s(30))
  })

  it('pause and resume keep the elapsed time', () => {
    let clock: Clock = resetClock(0, true, T0)
    clock = pauseClock(clock, T0 + s(10))
    expect(elapsedMs(clock, T0 + s(500))).toBe(s(10))
    expect(segmentEndsAt(segments, clock)).toBe(null)
    clock = resumeClock(clock, T0 + s(100))
    expect(remainingMs(segments, clock, T0 + s(105))).toBe(s(15))
    expect(segmentEndsAt(segments, clock)).toBe(T0 + s(120))
    // Pausing twice or resuming twice is a no-op
    expect(resumeClock(clock, T0 + s(200))).toBe(clock)
    const paused = pauseClock(clock, T0 + s(110))
    expect(pauseClock(paused, T0 + s(300))).toBe(paused)
  })
})

describe('advance (resync after background)', () => {
  it('does nothing while the segment is still running', () => {
    const segments = buildSegments(circuit)
    const clock = resetClock(0, true, T0)
    const result = advance(segments, clock, T0 + s(29))
    expect(result.crossed).toHaveLength(0)
    expect(result.clock).toBe(clock)
  })

  it('crosses several auto segments and starts each at the previous end', () => {
    const segments = buildSegments(circuit) // 30s, 30s, 60s
    const result = advance(segments, resetClock(0, true, T0), T0 + s(75))
    expect(result.crossed.map(b => [b.from, b.to, b.at])).toEqual([
      [0, 1, T0 + s(30)],
      [1, 2, T0 + s(60)],
    ])
    expect(result.clock.segmentIndex).toBe(2)
    expect(result.clock.startedAt).toBe(T0 + s(60))
    expect(remainingMs(segments, result.clock, T0 + s(75))).toBe(s(45))
    expect(result.finished).toBe(false)
  })

  it('finishes the workout and stops on the last segment', () => {
    const segments = buildSegments(circuit)
    const result = advance(segments, resetClock(0, true, T0), T0 + s(600))
    expect(result.finished).toBe(true)
    expect(result.crossed[result.crossed.length - 1].to).toBeNull()
    expect(result.clock.segmentIndex).toBe(2)
    expect(result.clock.startedAt).toBeNull()
    expect(remainingMs(segments, result.clock, T0 + s(700))).toBe(0)
  })

  it('stops at a segment that needs a manual start (strength set)', () => {
    const segments = buildSegments(mixed)
    const result = advance(segments, resetClock(0, true, T0), T0 + s(1000))
    expect(result.crossed).toHaveLength(1)
    expect(result.crossed[0].pauses).toBe(true)
    expect(result.clock).toEqual({ segmentIndex: 1, startedAt: null, pausedAccumulatedMs: 0 })
    expect(result.finished).toBe(false)
  })

  it('takes paused time into account (pause/resume before locking)', () => {
    const segments = buildSegments(circuit)
    let clock: Clock = resetClock(0, true, T0)
    clock = pauseClock(clock, T0 + s(20)) // 10s left
    clock = resumeClock(clock, T0 + s(80))
    const result = advance(segments, clock, T0 + s(95))
    expect(result.crossed.map(b => b.at)).toEqual([T0 + s(90)])
    expect(remainingMs(segments, result.clock, T0 + s(95))).toBe(s(25))
  })

  it('a paused clock never advances', () => {
    const segments = buildSegments(circuit)
    const clock = pauseClock(resetClock(0, true, T0), T0 + s(5))
    expect(advance(segments, clock, T0 + s(9999)).crossed).toHaveLength(0)
  })

  it('handles an empty workout', () => {
    const clock = resetClock(0, true, T0)
    expect(advance([], clock, T0 + s(10)).crossed).toHaveLength(0)
    expect(upcomingBoundaries([], clock, T0, 10)).toHaveLength(0)
  })
})

describe('upcomingBoundaries (notification schedule)', () => {
  it('lists the boundaries until the end of the workout', () => {
    const segments = buildSegments(circuit)
    const boundaries = upcomingBoundaries(segments, resetClock(0, true, T0), T0 + s(1), 10)
    expect(boundaries.map(b => [b.at, b.to])).toEqual([
      [T0 + s(30), 1],
      [T0 + s(60), 2],
      [T0 + s(120), null],
    ])
  })

  it('stops at the first pause point and respects the limit', () => {
    const segments = buildSegments(mixed)
    expect(upcomingBoundaries(segments, resetClock(0, true, T0), T0, 10)).toHaveLength(1)
    expect(upcomingBoundaries(buildSegments(circuit), resetClock(0, true, T0), T0, 2)).toHaveLength(2)
  })

  it('is empty while paused', () => {
    const segments = buildSegments(circuit)
    expect(upcomingBoundaries(segments, resetClock(0, false, T0), T0, 10)).toHaveLength(0)
  })

  it('after a skip, the schedule starts from the new segment (no duplicates)', () => {
    const segments = buildSegments(circuit)
    const before = upcomingBoundaries(segments, resetClock(0, true, T0), T0, 10)
    // User skips to segment 1 at T0 + 10s
    const after = upcomingBoundaries(segments, resetClock(1, true, T0 + s(10)), T0 + s(10), 10)
    expect(after.map(b => b.at)).toEqual([T0 + s(40), T0 + s(100)])
    // Cue ids are per boundary origin, so rescheduling replaces rather than duplicates
    const ids = buildCues(segments, after).map(c => c.id)
    expect(ids).toEqual(['workout-cue-1', 'workout-cue-2'])
    expect(buildCues(segments, before).map(c => c.id)).toEqual(['workout-cue-0', 'workout-cue-1', 'workout-cue-2'])
  })

  it('drops boundaries in the past', () => {
    const segments = buildSegments(circuit)
    const boundaries = upcomingBoundaries(segments, resetClock(0, true, T0), T0 + s(45), 10)
    expect(boundaries.map(b => b.at)).toEqual([T0 + s(60), T0 + s(120)])
  })
})

describe('buildCues', () => {
  it('writes texts for lap changes, next exercise, pause points and the finish', () => {
    const segments = buildSegments(mixed)
    const cues = buildCues(segments, [
      { at: 1, from: 0, to: 1, pauses: true },
      { at: 2, from: 1, to: 2, pauses: true },
      { at: 3, from: 3, to: 4, pauses: false },
      { at: 4, from: 4, to: null, pauses: true },
    ])
    expect(cues.map(c => c.title)).toEqual(['Next: Squats', 'Squats: lap 2/3', 'Next: Stretch', 'Workout complete'])
    expect(cues[0].body).toBe('Lap 1/3. Rest is over, tap play after your set.')
    expect(cues[2].body).toBe('Lap 1/1 · 2:00')
  })
})
