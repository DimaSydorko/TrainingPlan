import { useMemo } from 'react'
import { useWorkout } from '@hooks/redux'
import getHomeWorkouts from './get-home-workouts'

export default function useHomeWorkouts() {
  const { workouts, sortedWorkoutUids } = useWorkout()

  return useMemo(() => getHomeWorkouts(workouts, sortedWorkoutUids), [workouts, sortedWorkoutUids])
}
