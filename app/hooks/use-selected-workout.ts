import { useCallback, useMemo } from 'react'
import { useAppDispatch, usePlans } from '@hooks/redux'
import { useSessionUserId } from '@stores/session/use-session-store'
import { plansAC } from '@store/plans-reducer/plans-ac'
import useWorkout from '@services/workouts/use-workout'
import useSaveWorkout from '@services/workouts/use-save-workout'
import { WorkoutType } from '@utils/types'

type UseSelectedWorkoutArgs = { workoutId?: string; isInPlan: boolean }

const useSelectedWorkout = ({ workoutId, isInPlan }: UseSelectedWorkoutArgs) => {
  const dispatch = useAppDispatch()
  const userId = useSessionUserId()
  const { selectedPlan } = usePlans()
  const libraryWorkout = useWorkout({ userId, workoutId: isInPlan ? undefined : workoutId })
  const { saveWorkout } = useSaveWorkout()

  const planWorkout = useMemo(
    () => (isInPlan ? selectedPlan?.workouts.find(workout => workout.uid === workoutId) ?? null : null),
    [isInPlan, selectedPlan?.workouts, workoutId]
  )

  const handleSaveWorkout = useCallback(
    (workout: WorkoutType) => {
      if (isInPlan) dispatch(plansAC.updateSelectedPlanWorkout(workout))
      else if (userId) saveWorkout(userId, workout)
    },
    [dispatch, isInPlan, saveWorkout, userId]
  )

  return {
    workout: isInPlan ? planWorkout : libraryWorkout.data ?? null,
    isLoading: !isInPlan && libraryWorkout.isLoading,
    onSaveWorkout: handleSaveWorkout,
  }
}

export default useSelectedWorkout
