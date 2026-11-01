import { useCallback } from 'react'
import { useAppDispatch, usePlans } from './redux'
import { PlanType, WorkoutType } from '@utils/types'
import { plansAC } from '@store/plans-reducer/plans-ac'
import { useSessionUserId } from '@stores/session/use-session-store'
import useSaveWorkout from '@services/workouts/use-save-workout'
import useDeleteWorkouts from '@services/workouts/use-delete-workouts'
import { copyWorkout } from '@services/workouts/workout-copies'
import { nanoid } from '@utils'

const toPlanWorkout = (workout: WorkoutType): WorkoutType => {
  const { lastUpdated, ownerUid, ...planWorkout } = workout
  return planWorkout
}

const useWorkoutPlan = () => {
  const dispatch = useAppDispatch()
  const userId = useSessionUserId()
  const { selectedPlan } = usePlans()
  const { saveWorkout } = useSaveWorkout()
  const { mutate: removeWorkouts } = useDeleteWorkouts()

  const addWorkout = useCallback(
    (workout: WorkoutType, isInPlan: boolean) => {
      if (isInPlan) {
        const newPlan = {
          ...selectedPlan,
          workouts: [...selectedPlan.workouts, { ...toPlanWorkout(workout), uid: nanoid() }],
        }
        dispatch(plansAC.updatePlan(newPlan))
      } else if (userId) saveWorkout(userId, workout)
    },
    [selectedPlan, userId, saveWorkout, dispatch]
  )

  const deleteWorkouts = useCallback(
    (workoutUids: string[], isInPlan: boolean) => {
      if (isInPlan) {
        const newPlan = {
          ...selectedPlan,
          workouts: selectedPlan.workouts.filter(w => !workoutUids.includes(w.uid)),
        }
        dispatch(plansAC.updatePlan(newPlan))
      } else if (userId) removeWorkouts({ userId, workoutIds: workoutUids })
    },
    [selectedPlan, userId, removeWorkouts, dispatch]
  )

  const copyWorkouts = useCallback(
    (workouts: WorkoutType[], plan: PlanType | undefined) => {
      const copies = workouts.map(copyWorkout)

      if (!plan) {
        if (userId) copies.forEach(copy => saveWorkout(userId, copy))
      } else {
        dispatch(plansAC.updatePlan({ ...plan, workouts: [...plan.workouts, ...copies.map(toPlanWorkout)] }))
      }
    },
    [userId, saveWorkout, dispatch]
  )

  return {
    deleteWorkouts,
    addWorkout,
    selectedPlan,
    copyWorkouts,
  }
}

export default useWorkoutPlan
