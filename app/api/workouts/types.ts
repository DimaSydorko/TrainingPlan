import type { WorkoutType } from '@utils/types'

export type Workout = WorkoutType

export type SaveWorkoutArgs = { workout: Workout; isInLibrary?: boolean }

export type SetTargetPayload = { reps?: number; weight?: number; duration_sec?: number | null }

export type WorkoutExercisePayload = {
  id: string
  exercise_key: string
  exercise_name: string
  exercise_metric: string
  laps: number
  rest_sec: number
  is_visible: boolean
  color_idx: number
  sets: SetTargetPayload[]
}

export type SaveWorkoutPayload = {
  id: string
  name: string
  color_idx: number
  labels: string[]
  in_library: boolean
  exercises: WorkoutExercisePayload[]
}
