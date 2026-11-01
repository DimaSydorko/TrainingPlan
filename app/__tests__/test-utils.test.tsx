/** Checks the shared test helpers in app/__tests__/utils. */
import { Text } from 'react-native'
import { screen } from '@testing-library/react-native'
import { useAppSelector, useExerciseImages } from '@hooks/redux'
import { renderWithStore } from './utils/render'
import { getInitialState } from './utils/test-store'

function Probe() {
  const images = useExerciseImages()
  const user = useAppSelector(state => state.userReducer?.user)
  return <Text>{`images=${images.map(image => image.fileName).join(',')} user=${user?.uid ?? 'none'}`}</Text>
}

describe('renderWithStore', () => {
  it('uses the slices initial state by default', async () => {
    expect(getInitialState().workoutReducer.exerciseImages).toEqual([])
    await renderWithStore(<Probe />)
    expect(screen.getByText('images= user=none')).toBeOnTheScreen()
  })

  it('deep-merges a partial preloaded state', async () => {
    const { store } = await renderWithStore(<Probe />, {
      preloadedState: {
        workoutReducer: { exerciseImages: [{ fileName: 'a.gif' }] as never },
        userReducer: { user: { uid: 'u1' } as any },
      },
    })
    expect(screen.getByText('images=a.gif user=u1')).toBeOnTheScreen()
    expect(store.getState().settingsReducer).toBeNull()
  })
})
