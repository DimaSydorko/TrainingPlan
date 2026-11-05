import { useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { getCurrentTime } from '@utils'
import { plansKeys } from './query-keys'
import { invalidatePlans, restorePlansCache, updatePlansCache } from './optimistic-plans'
import { withPlanIds } from './plan-ids'
import type { Plan, PlansSnapshot, SavePlanVariables } from './types'

const upsertPlan = (plans: Plan[], plan: Plan) =>
  plans.some(item => item.uid === plan.uid)
    ? plans.map(item => (item.uid === plan.uid ? plan : item))
    : [...plans, plan]

const useSavePlan = () => {
  const queryClient = useQueryClient()
  const mutation = useMutation<string, Error, SavePlanVariables, PlansSnapshot>({
    mutationKey: plansKeys.save(),
    onMutate: ({ userId, plan }) => updatePlansCache(queryClient, userId, list => upsertPlan(list, plan)),
    onError: (_error, { userId }, snapshot) => restorePlansCache(queryClient, userId, snapshot),
    onSettled: (_data, _error, { userId }) => invalidatePlans(queryClient, userId),
  })
  const { mutate } = mutation

  const savePlan = useCallback(
    (userId: string, plan: Plan): Plan => {
      const prepared = { ...withPlanIds(plan), ownerUid: userId, lastUpdated: getCurrentTime() }
      mutate({ userId, plan: prepared })
      return prepared
    },
    [mutate]
  )

  return { ...mutation, savePlan }
}

export default useSavePlan
