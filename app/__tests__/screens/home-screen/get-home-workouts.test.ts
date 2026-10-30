import getHomeWorkouts from '@screens/home-screen/hooks/get-home-workouts'
import { defaultWorkout } from '@utils/constants'
import { WorkoutType } from '@utils/types'

const createWorkout = (uid: string): WorkoutType => ({ ...defaultWorkout, uid, name: uid })

describe('getHomeWorkouts', () => {
  it('returns no today workout when the list is empty', () => {
    expect(getHomeWorkouts([], [])).toEqual({ todayWorkout: null, upcomingWorkouts: [] })
  })

  it('picks the first workout in the user order as today and the next three as upcoming', () => {
    const workouts = ['a', 'b', 'c', 'd', 'e'].map(createWorkout)
    const { todayWorkout, upcomingWorkouts } = getHomeWorkouts(workouts, ['e', 'd', 'c', 'b', 'a'])

    expect(todayWorkout?.uid).toBe('e')
    expect(upcomingWorkouts.map(workout => workout.uid)).toEqual(['d', 'c', 'b'])
  })

  it('does not mutate the source list', () => {
    const workouts = ['a', 'b'].map(createWorkout)
    getHomeWorkouts(workouts, ['b', 'a'])

    expect(workouts.map(workout => workout.uid)).toEqual(['a', 'b'])
  })
})
