import type { Plan } from '@api/plans/types'
import type { Workout } from '@api/workouts/types'

export type { Plan }

export type SavePlanVariables = { userId: string; plan: Plan }
export type SavePlanWorkoutVariables = { userId: string; planId: string; workout: Workout }
export type DeletePlansVariables = { userId: string; planIds: string[] }
export type ReorderPlansVariables = { userId: string; planIds: string[] }
export type PlansSnapshot = { previous?: Plan[] }
