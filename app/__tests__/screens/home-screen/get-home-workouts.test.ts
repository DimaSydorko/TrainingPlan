import getHomeWorkouts from '@screens/home-screen/hooks/get-home-workouts'
import { defaultWorkout } from '@utils/constants'
import { WorkoutType } from '@utils/types'

const createWorkout = (uid: string): WorkoutType => ({ ...defaultWorkout, uid, name: uid })

describe('getHomeWorkouts', () => {
  it('returns no today workout when the list is empty', () => {
    expect(getHomeWorkouts([])).toEqual({ todayWorkout: null, upcomingWorkouts: [] })
  })

  it('picks the first workout in the library order as today and the next three as upcoming', () => {
    const { todayWorkout, upcomingWorkouts } = getHomeWorkouts(['e', 'd', 'c', 'b', 'a'].map(createWorkout))

    expect(todayWorkout?.uid).toBe('e')
    expect(upcomingWorkouts.map(workout => workout.uid)).toEqual(['d', 'c', 'b'])
  })
})
