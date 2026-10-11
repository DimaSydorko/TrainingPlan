/** Checks the shared test helpers in __tests__/utils. */
import * as React from 'react'
import { Text } from 'react-native'
import { screen } from '@testing-library/react-native'
import { useSettings, useUser } from '../app/Hooks/redux'
import { renderWithStore } from './utils/render'
import { getInitialState } from './utils/testStore'

function Probe() {
  const { isVibration, tts } = useSettings()
  const { user } = useUser()
  return <Text>{`vibration=${isVibration} rate=${tts.rate} user=${user?.uid ?? 'none'}`}</Text>
}

describe('renderWithStore', () => {
  it('uses the slices initial state by default', async () => {
    const initial = getInitialState()
    await renderWithStore(<Probe />)
    expect(
      screen.getByText(
        `vibration=${initial.settingsReducer.isVibration} rate=${initial.settingsReducer.tts.rate} user=none`
      )
    ).toBeOnTheScreen()
  })

  it('deep-merges a partial preloaded state', async () => {
    const initial = getInitialState()
    const { store } = await renderWithStore(<Probe />, {
      preloadedState: { settingsReducer: { isVibration: false }, userReducer: { user: { uid: 'u1' } as any } },
    })
    expect(screen.getByText(`vibration=false rate=${initial.settingsReducer.tts.rate} user=u1`)).toBeOnTheScreen()
    expect(store.getState().settingsReducer.sound).toEqual(initial.settingsReducer.sound)
  })
})
