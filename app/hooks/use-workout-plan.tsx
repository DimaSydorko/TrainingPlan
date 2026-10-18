import { useCallback } from 'react'
import { useAppDispatch, usePlans } from './redux'
import { PlanType, WorkoutType } from '../utils/types'
import { workoutAC } from '../store/workout-reducer/workout-ac'
import { plansAC } from '../store/plans-reducer/plans-ac'
import { nanoid } from '../utils'

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
      // Workouts come from frozen Redux state: copy instead of assigning w.uid
      workouts.forEach(w => dispatch(workoutAC.addWorkout({ ...w, uid: nanoid() })))
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
