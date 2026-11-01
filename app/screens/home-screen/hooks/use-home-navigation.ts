import { useCallback } from 'react'
import { useNavigation } from '@react-navigation/native'
import { useAppDispatch } from '@hooks/redux'
import { updateSelectedWorkout } from '@store/workout-reducer/workout-slice'
import { ScreenName, TabName } from '@utils/constants'
import { HomeNavigation, WorkoutType } from '@utils/types'

export default function useHomeNavigation() {
  const dispatch = useAppDispatch()
  const navigation = useNavigation<HomeNavigation>()

  const handleStartWorkout = useCallback(
    (workout: WorkoutType) => {
      dispatch(updateSelectedWorkout(workout))
      navigation.navigate(ScreenName.Playing)
    },
    [dispatch, navigation]
  )

  const handleOpenWorkout = useCallback(
    (workout: WorkoutType) => {
      dispatch(updateSelectedWorkout(workout))
      navigation.navigate(ScreenName.Workout)
    },
    [dispatch, navigation]
  )

  const handleOpenAllWorkouts = useCallback(() => navigation.navigate(TabName.Workouts), [navigation])

  const handleOpenProfile = useCallback(() => navigation.navigate(TabName.Profile), [navigation])

  return { handleStartWorkout, handleOpenWorkout, handleOpenAllWorkouts, handleOpenProfile }
}
