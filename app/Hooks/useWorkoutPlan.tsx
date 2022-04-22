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
    dispatch(workoutActionCreators.addWorkout({ ...workout, plansUid: [selectedPlan.uid] }))
    dispatch(plansActionCreators.incrementPlanWorkoutsCount({ planUid: selectedPlan.uid, value: 1 }))
  }, [])

  const addWorkout = useCallback((workout: WorkoutType) => {
    dispatch(workoutActionCreators.addWorkout(workout))
  }, [])

  const deleteWorkoutInPlane = useCallback((workout: WorkoutType) => {
    if (!selectedPlan) return
    const plansUid = workout.plansUid.filter(uid => uid !== selectedPlan.uid)
    dispatch(workoutActionCreators.updateWorkout({ ...workout, plansUid }))
    dispatch(plansActionCreators.incrementPlanWorkoutsCount({ planUid: selectedPlan.uid, value: -1 }))
  }, [])

  const deleteWorkout = useCallback((workout: WorkoutType) => {
    workout.plansUid.forEach(planUid => {
      dispatch(plansActionCreators.incrementPlanWorkoutsCount({ planUid, value: -1 }))
    })
    dispatch(workoutActionCreators.deleteWorkout(workout.uid))
  }, [])

  return {
    deleteWorkoutInPlane,
    addWorkoutInPlane,
    deleteWorkout,
    addWorkout,
  }
}