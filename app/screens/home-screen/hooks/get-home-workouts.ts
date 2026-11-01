import { WorkoutType } from '@utils/types'
import { PREVIEW_WORKOUTS_COUNT } from '../home-screen.constants'

export type HomeWorkouts = {
  todayWorkout: WorkoutType | null
  upcomingWorkouts: WorkoutType[]
}

const getHomeWorkouts = (workouts: WorkoutType[]): HomeWorkouts => ({
  todayWorkout: workouts[0] ?? null,
  upcomingWorkouts: workouts.slice(1, 1 + PREVIEW_WORKOUTS_COUNT),
})

export default getHomeWorkouts
