/** Checks the shared test helpers in app/__tests__/utils. */
import { Text } from 'react-native'
import { screen } from '@testing-library/react-native'
import { useUser, useWorkout } from '@hooks/redux'
import { renderWithStore } from './utils/render'
import { getInitialState } from './utils/test-store'

function Probe() {
  const { sortedWorkoutUids, error } = useWorkout()
  const { user } = useUser()
  return <Text>{`sorted=${sortedWorkoutUids.join(',')} error=${error} user=${user?.uid ?? 'none'}`}</Text>
}

describe('renderWithStore', () => {
  it('uses the slices initial state by default', async () => {
    const initial = getInitialState()
    await renderWithStore(<Probe />)
    expect(
      screen.getByText(
        `sorted=${initial.workoutReducer.sortedWorkoutUids.join(',')} error=${initial.workoutReducer.error} user=none`
      )
    ).toBeOnTheScreen()
  })

  it('deep-merges a partial preloaded state', async () => {
    const initial = getInitialState()
    const { store } = await renderWithStore(<Probe />, {
      preloadedState: { workoutReducer: { sortedWorkoutUids: ['w1'] }, userReducer: { user: { uid: 'u1' } as any } },
    })
    expect(screen.getByText(`sorted=w1 error=${initial.workoutReducer.error} user=u1`)).toBeOnTheScreen()
    expect(store.getState().workoutReducer.workouts).toEqual(initial.workoutReducer.workouts)
  })
})
