import { useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { getCurrentTime } from '@utils'
import { workoutsKeys } from './query-keys'
import { invalidateWorkouts, restoreWorkoutsCache, updateWorkoutsCache } from './optimistic-workouts'
import type { SaveWorkoutVariables, Workout, WorkoutsSnapshot } from './types'
import { withWorkoutIds } from './workout-copies'

const upsertWorkout = (workouts: Workout[], workout: Workout) =>
  workouts.some(item => item.uid === workout.uid)
    ? workouts.map(item => (item.uid === workout.uid ? workout : item))
    : [...workouts, workout]

const useSaveWorkout = () => {
  const queryClient = useQueryClient()
  const mutation = useMutation<string, Error, SaveWorkoutVariables, WorkoutsSnapshot>({
    mutationKey: workoutsKeys.save(),
    onMutate: ({ userId, workout }) => updateWorkoutsCache(queryClient, userId, list => upsertWorkout(list, workout)),
    onError: (_error, { userId }, snapshot) => restoreWorkoutsCache(queryClient, userId, snapshot),
    onSettled: (_data, _error, { userId }) => invalidateWorkouts(queryClient, userId),
  })
  const { mutate } = mutation

  const saveWorkout = useCallback(
    (userId: string, workout: Workout): Workout => {
      const prepared = { ...withWorkoutIds(workout), ownerUid: userId, lastUpdated: getCurrentTime() }
      mutate({ userId, workout: prepared })
      return prepared
    },
    [mutate]
  )

  return { ...mutation, saveWorkout }
}

export default useSaveWorkout
