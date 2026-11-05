import { useMutation, useQueryClient } from '@tanstack/react-query'
import { workoutsKeys } from './query-keys'
import { invalidateWorkouts, restoreWorkoutsCache, updateWorkoutsCache } from './optimistic-workouts'
import type { ReorderWorkoutsVariables, WorkoutsSnapshot } from './types'

const useReorderWorkouts = () => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, ReorderWorkoutsVariables, WorkoutsSnapshot>({
    mutationKey: workoutsKeys.reorder(),
    onMutate: ({ userId, workoutIds }) =>
      updateWorkoutsCache(queryClient, userId, list =>
        list.slice().sort((a, b) => workoutIds.indexOf(a.uid) - workoutIds.indexOf(b.uid))
      ),
    onError: (_error, { userId }, snapshot) => restoreWorkoutsCache(queryClient, userId, snapshot),
    onSettled: (_data, _error, { userId }) => invalidateWorkouts(queryClient, userId),
  })
}

export default useReorderWorkouts
