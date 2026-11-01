import type { QueryClient } from '@tanstack/react-query'
import { workoutsKeys } from './query-keys'
import type { Workout, WorkoutsSnapshot } from './types'

export const updateWorkoutsCache = async (
  queryClient: QueryClient,
  userId: string,
  update: (workouts: Workout[]) => Workout[]
): Promise<WorkoutsSnapshot> => {
  const queryKey = workoutsKeys.list(userId)
  await queryClient.cancelQueries({ queryKey })
  const previous = queryClient.getQueryData<Workout[]>(queryKey)
  queryClient.setQueryData<Workout[]>(queryKey, update(previous ?? []))
  return { previous }
}

export const restoreWorkoutsCache = (queryClient: QueryClient, userId: string, snapshot?: WorkoutsSnapshot) => {
  if (snapshot) queryClient.setQueryData(workoutsKeys.list(userId), snapshot.previous)
}

export const invalidateWorkouts = (queryClient: QueryClient, userId: string) =>
  queryClient.invalidateQueries({ queryKey: workoutsKeys.list(userId) })
