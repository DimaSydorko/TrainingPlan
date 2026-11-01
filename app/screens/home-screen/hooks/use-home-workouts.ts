import { useMemo } from 'react'
import { useSessionUserId } from '@stores/session/use-session-store'
import useWorkouts from '@services/workouts/use-workouts'
import getHomeWorkouts from './get-home-workouts'

const NO_WORKOUTS: never[] = []

const useHomeWorkouts = () => {
  const userId = useSessionUserId()
  const { data: workouts = NO_WORKOUTS } = useWorkouts(userId)

  return useMemo(() => getHomeWorkouts(workouts), [workouts])
}

export default useHomeWorkouts
