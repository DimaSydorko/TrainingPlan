import { useCallback } from 'react'
import { useAppDispatch, usePlans } from './redux'
import { WorkoutType } from '../Utils/types'
import { plansActionCreators } from '../store/PlansReducer/PlansActionCreators'
import { workoutActionCreators } from '../store/WorkoutReducer/WorkoutActionCreators'

export default function useWorkoutPlan() {
  const dispatch = useAppDispatch()
  const { selectedPlan } = usePlans()

  const addWorkoutInPlane = useCallback((workout: WorkoutType) => {
    if (!selectedPlan) return
    dispatch(workoutActionCreators.addWorkout({ ...workout, planUid: selectedPlan.uid }))
    dispatch(plansActionCreators.updatePlan({ ...selectedPlan, workoutsCount: selectedPlan.workoutsCount + 1 }))
  }, [])

  const addWorkout = useCallback((workout: WorkoutType) => {
    dispatch(workoutActionCreators.addWorkout(workout))
  }, [])

  const deleteWorkoutInPlane = useCallback((workoutUid: string) => {
    if (!selectedPlan) return
    dispatch(workoutActionCreators.deleteWorkout(workoutUid))
    dispatch(plansActionCreators.updatePlan({ ...selectedPlan, workoutsCount: selectedPlan.workoutsCount - 1 }))
  }, [])

  const deleteWorkout = useCallback((workoutUid: string) => {
    dispatch(workoutActionCreators.deleteWorkout(workoutUid))
  }, [])

  return {
    deleteWorkoutInPlane,
    addWorkoutInPlane,
    deleteWorkout,
    addWorkout,
  }
}