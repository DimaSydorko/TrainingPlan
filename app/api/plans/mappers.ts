import type { Tables } from '@lib/supabase/database.types'
import { toSaveWorkoutPayload, toWorkout, withWorkoutIds, type WorkoutRow } from '@api/workouts/mappers'
import { createUuid, isUuid } from '@platform/uuid'
import type { Plan, SavePlanPayload } from './types'

type PlanWorkoutRow = Pick<Tables<'plan_workouts'>, 'position'> & { workouts: WorkoutRow | null }

export type PlanRow = Pick<Tables<'plans'>, 'id' | 'owner_id' | 'name' | 'color_idx' | 'labels' | 'updated_at'> & {
  plan_workouts: PlanWorkoutRow[]
}

export const toPlan = (row: PlanRow): Plan => ({
  uid: row.id,
  ownerUid: row.owner_id,
  name: row.name,
  colorIdx: row.color_idx,
  labels: row.labels,
  lastUpdated: new Date(row.updated_at).getTime(),
  workouts: [...row.plan_workouts]
    .sort((a, b) => a.position - b.position)
    .flatMap(planWorkout => (planWorkout.workouts ? [toWorkout(planWorkout.workouts)] : [])),
})

export const toSavePlanPayload = (plan: Plan): SavePlanPayload => ({
  id: plan.uid,
  name: plan.name,
  color_idx: plan.colorIdx,
  labels: plan.labels ?? [],
  workouts: (plan.workouts ?? []).map(workout => toSaveWorkoutPayload(workout, false)),
})

export const withPlanIds = (plan: Plan): Plan => ({
  ...plan,
  uid: isUuid(plan.uid) ? plan.uid : createUuid(),
  workouts: (plan.workouts ?? []).map(withWorkoutIds),
})
