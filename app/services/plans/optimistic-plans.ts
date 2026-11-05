import type { QueryClient } from '@tanstack/react-query'
import { plansKeys } from './query-keys'
import type { Plan, PlansSnapshot } from './types'

export const updatePlansCache = async (
  queryClient: QueryClient,
  userId: string,
  update: (plans: Plan[]) => Plan[]
): Promise<PlansSnapshot> => {
  const queryKey = plansKeys.list(userId)
  await queryClient.cancelQueries({ queryKey })
  const previous = queryClient.getQueryData<Plan[]>(queryKey)
  queryClient.setQueryData<Plan[]>(queryKey, update(previous ?? []))
  return { previous }
}

export const restorePlansCache = (queryClient: QueryClient, userId: string, snapshot?: PlansSnapshot) => {
  if (snapshot) queryClient.setQueryData(plansKeys.list(userId), snapshot.previous)
}

export const invalidatePlans = (queryClient: QueryClient, userId: string) =>
  queryClient.invalidateQueries({ queryKey: plansKeys.list(userId) })
