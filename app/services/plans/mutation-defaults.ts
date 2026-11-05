import type { QueryClient } from '@tanstack/react-query'
import { deletePlans } from '@api/plans/delete-plans'
import { reorderPlans } from '@api/plans/reorder-plans'
import { savePlan } from '@api/plans/save-plan'
import { saveWorkout } from '@api/workouts/save-workout'
import { plansKeys } from './query-keys'
import { PLANS_MUTATION_SCOPE } from './plans.constants'
import type { DeletePlansVariables, ReorderPlansVariables, SavePlanVariables, SavePlanWorkoutVariables } from './types'

const scope = { id: PLANS_MUTATION_SCOPE }

export const registerPlansMutationDefaults = (queryClient: QueryClient) => {
  queryClient.setMutationDefaults(plansKeys.save(), {
    mutationFn: ({ plan }: SavePlanVariables) => savePlan(plan),
    scope,
  })
  queryClient.setMutationDefaults(plansKeys.saveWorkout(), {
    mutationFn: ({ workout }: SavePlanWorkoutVariables) => saveWorkout({ workout, isInLibrary: false }),
    scope,
  })
  queryClient.setMutationDefaults(plansKeys.delete(), {
    mutationFn: ({ planIds }: DeletePlansVariables) => deletePlans(planIds),
    scope,
  })
  queryClient.setMutationDefaults(plansKeys.reorder(), {
    mutationFn: ({ planIds }: ReorderPlansVariables) => reorderPlans(planIds),
    scope,
  })
}
