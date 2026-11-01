import { useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getWorkouts } from '@api/workouts/get-workouts'
import { workoutsKeys } from './query-keys'
import type { Workout } from './types'
import { WORKOUTS_STALE_TIME_MS } from './workouts.constants'

type UseWorkoutArgs = { userId?: string | null; workoutId?: string }

const useWorkout = ({ userId, workoutId }: UseWorkoutArgs) => {
  const selectWorkout = useCallback(
    (workouts: Workout[]) => workouts.find(workout => workout.uid === workoutId) ?? null,
    [workoutId]
  )

  return useQuery({
    queryKey: workoutsKeys.list(userId ?? ''),
    queryFn: () => getWorkouts(userId!),
    enabled: Boolean(userId && workoutId),
    staleTime: WORKOUTS_STALE_TIME_MS,
    select: selectWorkout,
  })
}

export default useWorkout
