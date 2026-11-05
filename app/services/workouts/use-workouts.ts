import { useQuery } from '@tanstack/react-query'
import { getWorkouts } from '@api/workouts/get-workouts'
import { workoutsKeys } from './query-keys'
import { WORKOUTS_STALE_TIME_MS } from './workouts.constants'

const useWorkouts = (userId?: string | null) =>
  useQuery({
    queryKey: workoutsKeys.list(userId ?? ''),
    queryFn: () => getWorkouts(userId!),
    enabled: Boolean(userId),
    staleTime: WORKOUTS_STALE_TIME_MS,
  })

export default useWorkouts
