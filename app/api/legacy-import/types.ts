import type { PlanType, WorkoutType } from '@utils/types'
import type { ExerciseMetric } from './legacy-import.constants'

export type LegacySetTarget = {
  reps?: number
  weight?: number
  duration_sec?: number | null
}

export type LegacyExercisePayload = {
  key: string
  name: string
  metric: ExerciseMetric
  image_file_name?: string
  catalog_exercise_id?: string
}

export type LegacyWorkoutExercisePayload = {
  exercise_key: string
  laps: number
  rest_sec: number
  is_visible: boolean
  color_idx: number
  sets: LegacySetTarget[]
}

export type LegacyWorkoutPayload = {
  legacy_id: string
  name: string
  color_idx: number
  labels: string[]
  updated_at_ms?: number
  source_legacy_id?: string
  exercises: LegacyWorkoutExercisePayload[]
}

export type LegacyPlanPayload = Omit<LegacyWorkoutPayload, 'exercises' | 'source_legacy_id'> & {
  workouts: LegacyWorkoutPayload[]
}

export type LegacyImportPayload = {
  exercises: LegacyExercisePayload[]
  workouts: LegacyWorkoutPayload[]
  plans: LegacyPlanPayload[]
  include_baseline: boolean
}

export type LegacyImportResult = {
  exercises: number
  workouts: number
  plans: number
  baseline_sets: number
}

export type MapLegacyDataArgs = {
  workouts: WorkoutType[]
  plans: PlanType[]
  catalogExerciseIds?: Record<string, string>
  isBaselineIncluded?: boolean
}
