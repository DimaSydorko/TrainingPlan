import { useMutation, useQueryClient } from '@tanstack/react-query'
import { plansKeys } from './query-keys'
import { invalidatePlans, restorePlansCache, updatePlansCache } from './optimistic-plans'
import type { DeletePlansVariables, PlansSnapshot } from './types'

const useDeletePlans = () => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, DeletePlansVariables, PlansSnapshot>({
    mutationKey: plansKeys.delete(),
    onMutate: ({ userId, planIds }) =>
      updatePlansCache(queryClient, userId, list => list.filter(plan => !planIds.includes(plan.uid))),
    onError: (_error, { userId }, snapshot) => restorePlansCache(queryClient, userId, snapshot),
    onSettled: (_data, _error, { userId }) => invalidatePlans(queryClient, userId),
  })
}

export default useDeletePlans
