import buildSetLogs from '@screens/playing-screen/build-set-logs'
import { defaultExercise } from '@utils/constants'
import { SelectedExerciseType } from '@utils/types'

const BENCH_ROW = '11111111-1111-4111-8111-111111111111'

const exercise = (extra: Partial<SelectedExerciseType>): SelectedExerciseType => ({
  ...defaultExercise,
  uid: BENCH_ROW,
  exerciseId: 'ex-bench',
  name: 'Bench',
  laps: 2,
  repeats: 8,
  breakTimeInSec: 90,
  approaches: [
    { repeats: 8, weight: 60, currentRepeats: 6, currentWeight: 62.5 },
    { repeats: 8, weight: 60 },
  ],
  ...extra,
})

let counter = 0
const args = { loggedAt: '2026-11-05T10:00:00.000Z', createId: () => `id-${++counter}` }

beforeEach(() => {
  counter = 0
})

describe('buildSetLogs', () => {
  it('logs what was done and marks the rest skipped', () => {
    const logs = buildSetLogs({
      ...args,
      exercises: [exercise({}), exercise({ uid: 'nano', exerciseId: 'ex-plank', laps: 1, repeats: 0, approaches: [] })],
      position: { idx: 0, lap: 2 },
      isComplete: false,
    })

    expect(logs).toEqual([
      {
        id: 'id-1',
        exerciseId: 'ex-bench',
        workoutExerciseId: BENCH_ROW,
        exerciseOrder: 0,
        lapNo: 1,
        isSkipped: false,
        loggedAt: args.loggedAt,
        plannedReps: 8,
        plannedWeight: 60,
        plannedRestSec: 90,
        reps: 6,
        weight: 62.5,
      },
      expect.objectContaining({ lapNo: 2, isSkipped: true, reps: undefined, weight: undefined, plannedReps: 8 }),
      expect.objectContaining({
        exerciseId: 'ex-plank',
        workoutExerciseId: undefined,
        exerciseOrder: 1,
        isSkipped: true,
        plannedDurationSec: 90,
        durationSec: undefined,
      }),
    ])
  })

  it('logs every set as done when the workout is complete, using planned values when unchanged', () => {
    const logs = buildSetLogs({ ...args, exercises: [exercise({})], position: { idx: 0, lap: 2 }, isComplete: true })

    expect(logs.map(log => [log.isSkipped, log.reps, log.weight])).toEqual([
      [false, 6, 62.5],
      [false, 8, 60],
    ])
  })

  it('leaves weight out for bodyweight exercises and skips exercises without an exercise id', () => {
    const logs = buildSetLogs({
      ...args,
      exercises: [
        exercise({ approaches: [{ repeats: 12, weight: 0 }], laps: 1, repeats: 12 }),
        exercise({ exerciseId: undefined }),
      ],
      position: { idx: 0, lap: 1 },
      isComplete: true,
    })

    expect(logs).toHaveLength(1)
    expect(logs[0]).toMatchObject({ reps: 12, weight: undefined, plannedWeight: undefined })
  })

  it('clamps out-of-range values to what the database accepts', () => {
    const logs = buildSetLogs({
      ...args,
      exercises: [
        exercise({ laps: 1, approaches: [{ repeats: 8, weight: 60, currentRepeats: 4000.4, currentWeight: -5 }] }),
      ],
      position: { idx: 0, lap: 1 },
      isComplete: true,
    })

    expect(logs[0]).toMatchObject({ reps: 1000, weight: 0 })
  })
})
