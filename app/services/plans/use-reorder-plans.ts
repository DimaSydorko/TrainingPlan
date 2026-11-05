import { useMutation, useQueryClient } from '@tanstack/react-query'
import { plansKeys } from './query-keys'
import { invalidatePlans, restorePlansCache, updatePlansCache } from './optimistic-plans'
import type { PlansSnapshot, ReorderPlansVariables } from './types'

const useReorderPlans = () => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, ReorderPlansVariables, PlansSnapshot>({
    mutationKey: plansKeys.reorder(),
    onMutate: ({ userId, planIds }) =>
      updatePlansCache(queryClient, userId, list =>
        list.slice().sort((a, b) => planIds.indexOf(a.uid) - planIds.indexOf(b.uid))
      ),
    onError: (_error, { userId }, snapshot) => restorePlansCache(queryClient, userId, snapshot),
    onSettled: (_data, _error, { userId }) => invalidatePlans(queryClient, userId),
  })
}

export default useReorderPlans
