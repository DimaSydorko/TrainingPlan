import { useCallback } from 'react'
import { useAppDispatch, usePlans } from './redux'
import { WorkoutType } from '../Utils/types'
import { workoutActionCreators } from '../store/WorkoutReducer/WorkoutActionCreators'
import { plansActionCreators } from '../store/PlansReducer/PlansActionCreators'

export default function useWorkoutPlan() {
  const dispatch = useAppDispatch()
  const { selectedPlan } = usePlans()

  const addWorkoutInPlane = useCallback(
    (workout: WorkoutType) => {
      if (!selectedPlan) return
      dispatch(workoutActionCreators.addWorkout({ ...workout, plansUid: [selectedPlan.uid] }))
    },
    [selectedPlan]
  )

  const addWorkout = useCallback((workout: WorkoutType) => {
    dispatch(workoutActionCreators.addWorkout(workout))
  }, [])

  const deleteWorkoutInPlane = useCallback(
    (workout: WorkoutType) => {
      if (!selectedPlan) return
      const plansUid = workout.plansUid.filter(uid => uid !== selectedPlan.uid)
      dispatch(workoutActionCreators.updateWorkout({ ...workout, plansUid }))
    },
    [selectedPlan]
  )

  const deleteWorkout = useCallback((workout: WorkoutType) => {
    dispatch(workoutActionCreators.deleteWorkout(workout))
  }, [])

  const moveWorkout = useCallback(
    (workouts: WorkoutType[]) => {
      const workoutUids = workouts.map(workout => workout.uid)
      dispatch(plansActionCreators.updatePlan({ ...selectedPlan, workoutUids }))
    },
    [selectedPlan]
  )

  return {
    deleteWorkoutInPlane,
    addWorkoutInPlane,
    deleteWorkout,
    addWorkout,
    moveWorkout,
    selectedPlan
  }
}
