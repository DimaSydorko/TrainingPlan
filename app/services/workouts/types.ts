import type { Workout } from '@api/workouts/types'

export type { Workout }

export type SaveWorkoutVariables = { userId: string; workout: Workout }
export type DeleteWorkoutsVariables = { userId: string; workoutIds: string[] }
export type ReorderWorkoutsVariables = { userId: string; workoutIds: string[] }
export type WorkoutsSnapshot = { previous?: Workout[] }
