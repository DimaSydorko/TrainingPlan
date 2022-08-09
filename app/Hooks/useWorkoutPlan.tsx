import { useCallback } from 'react'
import { useAppDispatch, usePlans } from './redux'
import { PlanType, WorkoutType } from '../Utils/types'
import { workoutAC } from '../store/WorkoutReducer/WorkoutActionCreators'
import { plansAC } from '../store/PlansReducer/PlansAC'

export default function useWorkoutPlan() {
  const dispatch = useAppDispatch()
  const { selectedPlan } = usePlans()

  const addWorkout = useCallback(
    (workout: WorkoutType, isInPlan: boolean) => {
      if (selectedPlan?.uid && isInPlan) {
        workout.plansUid = [selectedPlan.uid]
      }
      dispatch(workoutAC.addWorkout({ workout }))
    },
    [selectedPlan?.uid]
  )

  const deleteWorkouts = useCallback(
    (workoutUids: string[], isInPlan: boolean) => {
      if (selectedPlan?.uid && isInPlan) {
        dispatch(
          plansAC.changeWorkoutsCount({
            planUid: selectedPlan.uid,
            workoutUids,
            type: 'delete',
          })
        )
        workoutUids.forEach(workoutUid => {
          dispatch(workoutAC.removeFromPlan({ workoutUid, planUid: selectedPlan.uid }))
        })
      } else {
        dispatch(workoutAC.deleteWorkout(workoutUids[0]))
      }
    },
    [selectedPlan?.uid]
  )

  const moveWorkout = useCallback(
    (workouts: WorkoutType[]) => {
      const workoutUids = workouts.map(workout => workout.uid)
      dispatch(plansAC.updatePlan({ ...selectedPlan, workoutUids }))
    },
    [selectedPlan]
  )

  const copyWorkouts = useCallback((workouts: WorkoutType[], plans: PlanType[]) => {
    workouts.forEach(workout =>
      dispatch(
        workoutAC.updateWorkout({
          ...workout,
          plansUid: [...workout.plansUid, ...plans.map(p => p.uid)],
        })
      )
    )
    plans.forEach(plan =>
      dispatch(
        plansAC.updatePlan({
          ...plan,
          workoutUids: [...plan.workoutUids, ...workouts.map(w => w.uid)],
        })
      )
    )
  }, [])

  return {
    deleteWorkouts,
    addWorkout,
    moveWorkout,
    selectedPlan,
    copyWorkouts,
  }
}
