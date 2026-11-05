import { useCallback } from 'react'
import { useNavigation } from '@react-navigation/native'
import { ScreenName, TabName } from '@utils/constants'
import { HomeNavigation, WorkoutType } from '@utils/types'

const useHomeNavigation = () => {
  const navigation = useNavigation<HomeNavigation>()

  const handleStartWorkout = useCallback(
    (workout: WorkoutType) => navigation.navigate(ScreenName.Playing, { workoutId: workout.uid }),
    [navigation]
  )

  const handleOpenWorkout = useCallback(
    (workout: WorkoutType) => navigation.navigate(ScreenName.Workout, { workoutId: workout.uid }),
    [navigation]
  )

  const handleOpenAllWorkouts = useCallback(() => navigation.navigate(TabName.Workouts), [navigation])

  const handleOpenProfile = useCallback(() => navigation.navigate(TabName.Profile), [navigation])

  return { handleStartWorkout, handleOpenWorkout, handleOpenAllWorkouts, handleOpenProfile }
}

export default useHomeNavigation
