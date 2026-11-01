export const EXERCISE_METRIC = {
  WEIGHT_REPS: 'weight_reps',
  REPS: 'reps',
  TIME: 'time',
} as const

export type ExerciseMetric = (typeof EXERCISE_METRIC)[keyof typeof EXERCISE_METRIC]

export const TIME_EXERCISE_KEY_PREFIX = 'time:'
export const MIN_LAPS = 1
export const MAX_LAPS = 50
export const MAX_REST_SEC = 3600
export const FIREBASE_STORAGE_OBJECT_MARKER = '/o/'
