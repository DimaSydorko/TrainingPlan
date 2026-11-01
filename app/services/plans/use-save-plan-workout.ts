import { useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { withWorkoutIds } from '@services/workouts/workout-copies'
import { plansKeys } from './query-keys'
import { invalidatePlans, restorePlansCache, updatePlansCache } from './optimistic-plans'
import type { Plan, PlansSnapshot, SavePlanWorkoutVariables } from './types'
import type { Workout } from '@services/workouts/types'

const replaceWorkout = (plans: Plan[], planId: string, workout: Workout) =>
  plans.map(plan =>
    plan.uid === planId
      ? { ...plan, workouts: plan.workouts.map(item => (item.uid === workout.uid ? workout : item)) }
      : plan
  )

const useSavePlanWorkout = () => {
  const queryClient = useQueryClient()
  const mutation = useMutation<string, Error, SavePlanWorkoutVariables, PlansSnapshot>({
    mutationKey: plansKeys.saveWorkout(),
    onMutate: ({ userId, planId, workout }) =>
      updatePlansCache(queryClient, userId, list => replaceWorkout(list, planId, workout)),
    onError: (_error, { userId }, snapshot) => restorePlansCache(queryClient, userId, snapshot),
    onSettled: (_data, _error, { userId }) => invalidatePlans(queryClient, userId),
  })
  const { mutate } = mutation

  const savePlanWorkout = useCallback(
    (userId: string, planId: string, workout: Workout) => {
      const exercisesWithIds = withWorkoutIds(workout).exercises
      mutate({ userId, planId, workout: { ...workout, exercises: exercisesWithIds } })
    },
    [mutate]
  )

  return { ...mutation, savePlanWorkout }
}

export default useSavePlanWorkout
