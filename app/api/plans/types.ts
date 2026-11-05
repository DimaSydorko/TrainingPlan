import type { PlanType } from '@utils/types'
import type { SaveWorkoutPayload } from '@api/workouts/types'

export type Plan = PlanType

export type SavePlanPayload = {
  id: string
  name: string
  color_idx: number
  labels: string[]
  workouts: SaveWorkoutPayload[]
}
