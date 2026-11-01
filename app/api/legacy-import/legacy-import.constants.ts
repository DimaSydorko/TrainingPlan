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
export const LEGACY_PERSIST_ROOT_KEY = 'persist:root'
export const LEGACY_USER_SLICE_KEY = 'userReducer'
export const LEGACY_WORKOUT_SLICE_KEY = 'workoutReducer'
export const LEGACY_PLANS_SLICE_KEY = 'plansReducer'
