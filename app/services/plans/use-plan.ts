import { useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getPlans } from '@api/plans/get-plans'
import { plansKeys } from './query-keys'
import { PLANS_STALE_TIME_MS } from './plans.constants'
import type { Plan } from './types'

type UsePlanArgs = { userId?: string | null; planId?: string }

const usePlan = ({ userId, planId }: UsePlanArgs) => {
  const selectPlan = useCallback((plans: Plan[]) => plans.find(plan => plan.uid === planId) ?? null, [planId])

  return useQuery({
    queryKey: plansKeys.list(userId ?? ''),
    queryFn: () => getPlans(userId!),
    enabled: Boolean(userId && planId),
    staleTime: PLANS_STALE_TIME_MS,
    select: selectPlan,
  })
}

export default usePlan
