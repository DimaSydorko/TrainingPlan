import { copyWorkout, toSaveWorkoutPayload, toWorkout, withWorkoutIds, type WorkoutRow } from '@api/workouts/mappers'
import { defaultExercise } from '@utils/constants'
import { ExerciseType, WorkoutType } from '@utils/types'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const W_ID = '11111111-1111-4111-8111-111111111111'
const E_ID = '22222222-2222-4222-8222-222222222222'

const row: WorkoutRow = {
  id: W_ID,
  owner_id: 'u1',
  name: 'Push',
  color_idx: 2,
  labels: ['gym'],
  updated_at: '2026-11-01T10:00:00.000Z',
  source_workout_id: null,
  workout_exercises: [
    {
      id: 'we-2',
      position: 1,
      laps: 2,
      rest_sec: 60,
      is_visible: true,
      color_idx: 0,
      sets: [{ duration_sec: null }, { duration_sec: null }],
      exercises: { id: 'ex-plank', name: 'Plank', metric: 'time' },
    },
    {
      id: 'we-1',
      position: 0,
      laps: 2,
      rest_sec: 90,
      is_visible: false,
      color_idx: 1,
      sets: [
        { reps: 8, weight: 60 },
        { reps: 6, weight: 65 },
      ],
      exercises: { id: 'ex-bench', name: 'Bench press', metric: 'weight_reps' },
    },
  ],
}

const exercise = (extra: Partial<ExerciseType>): ExerciseType => ({ ...defaultExercise, uid: E_ID, ...extra })

describe('toWorkout', () => {
  it('maps a row with its exercises in position order', () => {
    const workout = toWorkout(row)

    expect(workout).toMatchObject({ uid: W_ID, ownerUid: 'u1', name: 'Push', colorIdx: 2, labels: ['gym'] })
    expect(workout.lastUpdated).toBe(Date.parse('2026-11-01T10:00:00.000Z'))
    expect(workout.exercises.map(item => item.uid)).toEqual(['we-1', 'we-2'])
    expect(workout.exercises[0]).toMatchObject({
      exerciseId: 'ex-bench',
      name: 'Bench press',
      laps: 2,
      repeats: 8,
      isVisible: false,
      breakTimeInSec: 90,
      approaches: [
        { repeats: 8, weight: 60 },
        { repeats: 6, weight: 65 },
      ],
    })
    expect(workout.exercises[1]).toMatchObject({ name: 'Plank', repeats: 0, approaches: [] })
  })
})

describe('toSaveWorkoutPayload', () => {
  it('sends exercises by key and metric, one set per lap', () => {
    const workout: WorkoutType = {
      uid: W_ID,
      name: 'Push',
      colorIdx: 1,
      labels: [],
      exercises: [
        exercise({ name: ' Bench_Press ', laps: 3, repeats: 10, approaches: [{ repeats: 0, weight: 40 }] }),
        exercise({ name: 'Pull-up', laps: 1, repeats: 5, approaches: [] }),
        exercise({ name: 'Plank', laps: 2, repeats: 0, breakTimeInSec: 5000 }),
      ],
    }

    const payload = toSaveWorkoutPayload(workout, true)

    expect(payload).toMatchObject({ id: W_ID, name: 'Push', color_idx: 1, labels: [], in_library: true })
    expect(payload.exercises[0]).toMatchObject({
      exercise_key: 'bench press',
      exercise_name: 'Bench_Press',
      exercise_metric: 'weight_reps',
      laps: 3,
      sets: [
        { reps: 10, weight: 40 },
        { reps: 10, weight: 40 },
        { reps: 10, weight: 40 },
      ],
    })
    expect(payload.exercises[1]).toMatchObject({ exercise_metric: 'reps', sets: [{ reps: 5 }] })
    expect(payload.exercises[2]).toMatchObject({
      exercise_key: 'time:plank',
      exercise_metric: 'time',
      rest_sec: 3600,
      sets: [{ duration_sec: null }, { duration_sec: null }],
    })
  })

  it('round-trips a loaded workout', () => {
    const payload = toSaveWorkoutPayload(toWorkout(row), false)

    expect(payload.in_library).toBe(false)
    expect(payload.exercises[0].sets).toEqual(row.workout_exercises[1].sets)
    expect(payload.exercises[1].sets).toEqual(row.workout_exercises[0].sets)
  })
})

describe('workout ids', () => {
  const legacy: WorkoutType = { uid: 'nano', name: 'W', colorIdx: 0, labels: [], exercises: [exercise({ uid: 'x' })] }

  it('withWorkoutIds replaces non-uuid ids and keeps uuids', () => {
    const prepared = withWorkoutIds(legacy)
    expect(prepared.uid).toMatch(UUID)
    expect(prepared.exercises[0].uid).toMatch(UUID)

    const kept = withWorkoutIds({ ...legacy, uid: W_ID, exercises: [exercise({})] })
    expect(kept.uid).toBe(W_ID)
    expect(kept.exercises[0].uid).toBe(E_ID)
  })

  it('copyWorkout gives the workout and every exercise new ids', () => {
    const copy = copyWorkout({ ...legacy, uid: W_ID, exercises: [exercise({})] })
    expect(copy.uid).not.toBe(W_ID)
    expect(copy.exercises[0].uid).not.toBe(E_ID)
    expect(copy.exercises[0].uid).toMatch(UUID)
    expect(copy.sourceWorkoutId).toBe(W_ID)
    expect(toSaveWorkoutPayload(copy, false).source_workout_id).toBe(W_ID)
  })
})
