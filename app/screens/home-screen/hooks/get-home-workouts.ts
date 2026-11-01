import { WorkoutType } from '@utils/types'
import { PREVIEW_WORKOUTS_COUNT } from '../home-screen.constants'

export type HomeWorkouts = {
  todayWorkout: WorkoutType | null
  upcomingWorkouts: WorkoutType[]
}

export default function getHomeWorkouts(workouts: WorkoutType[], sortedWorkoutUids: string[]): HomeWorkouts {
  const sortedWorkouts = workouts
    .slice()
    .sort((a, b) => sortedWorkoutUids.indexOf(a.uid) - sortedWorkoutUids.indexOf(b.uid))

  return {
    todayWorkout: sortedWorkouts[0] ?? null,
    upcomingWorkouts: sortedWorkouts.slice(1, 1 + PREVIEW_WORKOUTS_COUNT),
  }
}
