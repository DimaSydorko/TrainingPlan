import { useCallback, useMemo } from 'react'
import { useSessionUserId } from '@stores/session/use-session-store'
import useWorkout from '@services/workouts/use-workout'
import useSaveWorkout from '@services/workouts/use-save-workout'
import usePlan from '@services/plans/use-plan'
import useSavePlanWorkout from '@services/plans/use-save-plan-workout'
import { WorkoutType } from '@utils/types'

type UseSelectedWorkoutArgs = { workoutId?: string; planId?: string }

const useSelectedWorkout = ({ workoutId, planId }: UseSelectedWorkoutArgs) => {
  const userId = useSessionUserId()
  const libraryWorkout = useWorkout({ userId, workoutId: planId ? undefined : workoutId })
  const { data: plan } = usePlan({ userId, planId })
  const { saveWorkout } = useSaveWorkout()
  const { savePlanWorkout } = useSavePlanWorkout()

  const planWorkout = useMemo(
    () => plan?.workouts.find(workout => workout.uid === workoutId) ?? null,
    [plan?.workouts, workoutId]
  )

  const handleSaveWorkout = useCallback(
    (workout: WorkoutType) => {
      if (!userId) return
      if (planId) savePlanWorkout(userId, planId, workout)
      else saveWorkout(userId, workout)
    },
    [planId, saveWorkout, savePlanWorkout, userId]
  )

  return {
    workout: planId ? planWorkout : libraryWorkout.data ?? null,
    onSaveWorkout: handleSaveWorkout,
  }
}

export default useSelectedWorkout
