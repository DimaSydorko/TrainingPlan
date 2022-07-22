import { useCallback } from 'react'
import { useAppDispatch, usePlans } from './redux'
import { PlanType, WorkoutType } from '../Utils/types'
import { workoutActionCreators } from '../store/WorkoutReducer/WorkoutActionCreators'
import { plansActionCreators } from '../store/PlansReducer/PlansActionCreators'

export default function useWorkoutPlan() {
  const dispatch = useAppDispatch()
  const { selectedPlan } = usePlans()

  const addWorkout = useCallback(
    (workout: WorkoutType, isInPlan: boolean) => {
      if (selectedPlan?.uid && isInPlan) {
        dispatch(workoutActionCreators.addWorkout({ ...workout, plansUid: [selectedPlan.uid] }))
      } else {
        dispatch(workoutActionCreators.addWorkout(workout))
      }
    },
    [selectedPlan?.uid]
  )

  const deleteWorkouts = useCallback(
    (workoutUids: string[], isInPlan: boolean) => {
      if (selectedPlan?.uid && isInPlan) {
        dispatch(
          plansActionCreators.changeWorkoutsCount({
            planUid: selectedPlan.uid,
            workoutUids,
            type: 'delete',
          })
        )
        workoutUids.forEach(workoutUid => {
          dispatch(workoutActionCreators.removeFromPlan({ workoutUid, planUid: selectedPlan.uid }))
        })
      } else {
        dispatch(workoutActionCreators.deleteWorkout(workoutUids[0]))
      }
    },
    [selectedPlan?.uid]
  )

  const moveWorkout = useCallback(
    (workouts: WorkoutType[]) => {
      const workoutUids = workouts.map(workout => workout.uid)
      dispatch(plansActionCreators.updatePlan({ ...selectedPlan, workoutUids }))
    },
    [selectedPlan]
  )

  const copyWorkouts = useCallback((workouts: WorkoutType[], plans: PlanType[]) => {
    workouts.forEach(workout =>
      dispatch(
        workoutActionCreators.updateWorkout({
          ...workout,
          plansUid: [...workout.plansUid, ...plans.map(p => p.uid)],
        })
      )
    )
    plans.forEach(plan =>
      dispatch(
        plansActionCreators.updatePlan({
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
