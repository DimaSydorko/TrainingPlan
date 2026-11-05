import { useCallback } from 'react'
import { PlanType, WorkoutType } from '@utils/types'
import { useSessionUserId } from '@stores/session/use-session-store'
import useSaveWorkout from '@services/workouts/use-save-workout'
import useDeleteWorkouts from '@services/workouts/use-delete-workouts'
import { copyWorkout } from '@services/workouts/workout-copies'
import usePlan from '@services/plans/use-plan'
import useSavePlan from '@services/plans/use-save-plan'

const useWorkoutPlan = (planId?: string) => {
  const userId = useSessionUserId()
  const { data: selectedPlan } = usePlan({ userId, planId })
  const { saveWorkout } = useSaveWorkout()
  const { savePlan } = useSavePlan()
  const { mutate: removeWorkouts } = useDeleteWorkouts()

  const addWorkout = useCallback(
    (workout: WorkoutType, isInPlan: boolean) => {
      if (!userId) return
      if (isInPlan && selectedPlan) savePlan(userId, { ...selectedPlan, workouts: [...selectedPlan.workouts, workout] })
      else if (!isInPlan) saveWorkout(userId, workout)
    },
    [selectedPlan, userId, saveWorkout, savePlan]
  )

  const deleteWorkouts = useCallback(
    (workoutUids: string[], isInPlan: boolean) => {
      if (!userId) return
      if (isInPlan && selectedPlan) {
        savePlan(userId, {
          ...selectedPlan,
          workouts: selectedPlan.workouts.filter(workout => !workoutUids.includes(workout.uid)),
        })
      } else if (!isInPlan) removeWorkouts({ userId, workoutIds: workoutUids })
    },
    [selectedPlan, userId, removeWorkouts, savePlan]
  )

  const copyWorkouts = useCallback(
    (workouts: WorkoutType[], plan: PlanType | undefined) => {
      if (!userId) return
      const copies = workouts.map(copyWorkout)
      if (plan) savePlan(userId, { ...plan, workouts: [...plan.workouts, ...copies] })
      else copies.forEach(copy => saveWorkout(userId, copy))
    },
    [userId, saveWorkout, savePlan]
  )

  return {
    deleteWorkouts,
    addWorkout,
    selectedPlan: selectedPlan ?? null,
    copyWorkouts,
  }
}

export default useWorkoutPlan
