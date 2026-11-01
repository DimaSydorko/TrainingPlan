import { getExerciseKey, getImageFileName, mapLegacyDataToPayload } from '@api/legacy-import/mappers'
import type { ExerciseType, PlanType, WorkoutType } from '@utils/types'

const buildExercise = (overrides: Partial<ExerciseType>): ExerciseType => ({
  uid: 'ex',
  name: 'Bench_Press',
  breakTimeInSec: 90,
  laps: 2,
  repeats: 8,
  approaches: [
    { repeats: 8, weight: 60 },
    { repeats: 6, weight: 65 },
  ],
  isVisible: true,
  colorIdx: 1,
  imageUrl:
    'https://firebasestorage.googleapis.com/v0/b/app.appspot.com/o/exercises%2Fbench%20press.gif?alt=media&token=1',
  ...overrides,
})

const buildWorkout = (overrides: Partial<WorkoutType>): WorkoutType => ({
  uid: 'workout1',
  colorIdx: 0,
  name: 'Push',
  labels: ['gym'],
  exercises: [buildExercise({})],
  ownerUid: 'user',
  lastUpdated: 1760000000000,
  ...overrides,
})

const plank = buildExercise({ uid: 'plank', name: 'Plank', repeats: 0, laps: 3, approaches: [], imageUrl: '' })
const pushUps = buildExercise({
  uid: 'push',
  name: 'Push ups',
  approaches: [{ repeats: 20, weight: 0 }],
  laps: 2,
  imageUrl: '',
})

describe('mapLegacyDataToPayload', () => {
  const plan: PlanType = {
    uid: 'plan1',
    colorIdx: 2,
    ownerUid: 'user',
    name: 'Program',
    labels: [],
    lastUpdated: 1761000000000,
    workouts: [
      buildWorkout({ uid: 'workout1' }),
      buildWorkout({ uid: 'workout1', name: 'Core', exercises: [plank, pushUps] }),
    ],
  }
  const payload = mapLegacyDataToPayload({
    workouts: [buildWorkout({})],
    plans: [plan],
    catalogExerciseIds: { 'bench press': 'catalog-bench' },
  })

  it('collects one exercise per normalized name and metric', () => {
    expect(payload.exercises).toEqual([
      {
        key: 'bench press',
        name: 'Bench_Press',
        metric: 'weight_reps',
        image_file_name: 'bench press.gif',
        catalog_exercise_id: 'catalog-bench',
      },
      { key: 'time:plank', name: 'Plank', metric: 'time', image_file_name: undefined, catalog_exercise_id: undefined },
      { key: 'push ups', name: 'Push ups', metric: 'reps', image_file_name: undefined, catalog_exercise_id: undefined },
    ])
  })

  it('maps prescription fields and per-lap sets', () => {
    expect(payload.workouts[0]).toEqual({
      legacy_id: 'workout1',
      name: 'Push',
      color_idx: 0,
      labels: ['gym'],
      updated_at_ms: 1760000000000,
      exercises: [
        {
          exercise_key: 'bench press',
          laps: 2,
          rest_sec: 90,
          is_visible: true,
          color_idx: 1,
          sets: [
            { reps: 8, weight: 60 },
            { reps: 6, weight: 65 },
          ],
        },
      ],
    })
  })

  it('turns timer-only exercises into time sets and pads missing approaches', () => {
    const [plankExercise, pushUpsExercise] = payload.plans[0].workouts[1].exercises

    expect(plankExercise.sets).toEqual([{ duration_sec: null }, { duration_sec: null }, { duration_sec: null }])
    expect(pushUpsExercise.sets).toEqual([{ reps: 20 }, { reps: 20 }])
  })

  it('links plan copies to a matching library workout', () => {
    expect(payload.plans[0].workouts.map(workout => workout.source_legacy_id)).toEqual(['workout1', undefined])
  })

  it('includes the baseline by default', () => {
    expect(payload.include_baseline).toBe(true)
  })
})

describe('getExerciseKey', () => {
  it('normalizes underscores, spaces and case', () => {
    expect(getExerciseKey(buildExercise({ name: '  Bench__Press ' }))).toBe('bench press')
  })
})

describe('getImageFileName', () => {
  it('reads a plain url', () => {
    expect(getImageFileName('https://cdn.example.com/images/curl.gif?v=2')).toBe('curl.gif')
  })

  it('returns undefined for an empty url', () => {
    expect(getImageFileName('')).toBeUndefined()
  })
})
