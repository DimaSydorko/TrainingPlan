import { useMutation, useQueryClient } from '@tanstack/react-query'
import { workoutsKeys } from './query-keys'
import { invalidateWorkouts, restoreWorkoutsCache, updateWorkoutsCache } from './optimistic-workouts'
import type { DeleteWorkoutsVariables, WorkoutsSnapshot } from './types'

const useDeleteWorkouts = () => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, DeleteWorkoutsVariables, WorkoutsSnapshot>({
    mutationKey: workoutsKeys.delete(),
    onMutate: ({ userId, workoutIds }) =>
      updateWorkoutsCache(queryClient, userId, list => list.filter(workout => !workoutIds.includes(workout.uid))),
    onError: (_error, { userId }, snapshot) => restoreWorkoutsCache(queryClient, userId, snapshot),
    onSettled: (_data, _error, { userId }) => invalidateWorkouts(queryClient, userId),
  })
}

export default useDeleteWorkouts
