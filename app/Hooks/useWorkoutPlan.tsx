import { useCallback } from 'react'
import { useAppDispatch, usePlans } from './redux'
import { PlanType, WorkoutType } from '../Utils/types'
import { workoutAC } from '../store/WorkoutReducer/WorkoutAC'
import { plansAC } from '../store/PlansReducer/PlansAC'
import { nanoid } from '../Utils'

export default function useWorkoutPlan() {
  const dispatch = useAppDispatch()
  const { selectedPlan } = usePlans()

  const addWorkout = useCallback(
    (workout: WorkoutType, isInPlan: boolean) => {
      if (isInPlan) {
        const { lastUpdated, ownerUid, ...planWorkout } = workout
        const newPlan = {
          ...selectedPlan,
          workouts: [...selectedPlan.workouts, { ...planWorkout, uid: nanoid() } as WorkoutType],
        }
        dispatch(plansAC.updatePlan(newPlan))
      } else dispatch(workoutAC.addWorkout(workout))
    },
    [selectedPlan?.uid, selectedPlan]
  )

  const deleteWorkouts = useCallback(
    (workoutUids: string[], isInPlan: boolean) => {
      if (isInPlan) {
        const newPlan = {
          ...selectedPlan,
          workouts: selectedPlan.workouts.filter(w => !workoutUids.includes(w.uid)),
        }
        dispatch(plansAC.updatePlan(newPlan))
      } else {
        dispatch(workoutAC.deleteWorkouts(workoutUids))
      }
    },
    [selectedPlan]
  )

  const copyWorkouts = useCallback((workouts: WorkoutType[], plan: PlanType | undefined) => {
    const newWorkouts = workouts.map(w => {
      const { ownerUid, lastUpdated, ...newWorkout } = w
      newWorkout.uid = nanoid()
      return newWorkout
    })

    if (!plan) {
      workouts.forEach(w => {
        w.uid = nanoid()
        dispatch(workoutAC.addWorkout(w))
      })
    } else {
      const newPlan = {
        ...plan,
        workouts: [...plan.workouts, ...newWorkouts],
      }
      dispatch(plansAC.updatePlan(newPlan))
    }
  }, [])

  return {
    deleteWorkouts,
    addWorkout,
    selectedPlan,
    copyWorkouts,
  }
}
