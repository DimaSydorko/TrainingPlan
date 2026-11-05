import type { QueryClient } from '@tanstack/react-query'
import { deleteWorkouts } from '@api/workouts/delete-workouts'
import { reorderWorkouts } from '@api/workouts/reorder-workouts'
import { saveWorkout } from '@api/workouts/save-workout'
import { workoutsKeys } from './query-keys'
import type { DeleteWorkoutsVariables, ReorderWorkoutsVariables, SaveWorkoutVariables } from './types'
import { WORKOUTS_MUTATION_SCOPE } from './workouts.constants'

const scope = { id: WORKOUTS_MUTATION_SCOPE }

export const registerWorkoutsMutationDefaults = (queryClient: QueryClient) => {
  queryClient.setMutationDefaults(workoutsKeys.save(), {
    mutationFn: ({ workout }: SaveWorkoutVariables) => saveWorkout({ workout }),
    scope,
  })
  queryClient.setMutationDefaults(workoutsKeys.delete(), {
    mutationFn: ({ workoutIds }: DeleteWorkoutsVariables) => deleteWorkouts(workoutIds),
    scope,
  })
  queryClient.setMutationDefaults(workoutsKeys.reorder(), {
    mutationFn: ({ workoutIds }: ReorderWorkoutsVariables) => reorderWorkouts(workoutIds),
    scope,
  })
}
