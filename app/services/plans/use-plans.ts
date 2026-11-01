import { useQuery } from '@tanstack/react-query'
import { getPlans } from '@api/plans/get-plans'
import { plansKeys } from './query-keys'
import { PLANS_STALE_TIME_MS } from './plans.constants'

const usePlans = (userId?: string | null) =>
  useQuery({
    queryKey: plansKeys.list(userId ?? ''),
    queryFn: () => getPlans(userId!),
    enabled: Boolean(userId),
    staleTime: PLANS_STALE_TIME_MS,
  })

export default usePlans
