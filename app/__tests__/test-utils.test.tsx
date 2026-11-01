/** Checks the shared test helpers in app/__tests__/utils. */
import { Text } from 'react-native'
import { screen } from '@testing-library/react-native'
import { useAppSelector, usePlans } from '@hooks/redux'
import { renderWithStore } from './utils/render'
import { getInitialState } from './utils/test-store'

function Probe() {
  const { sortedPlanUids, error } = usePlans()
  const user = useAppSelector(state => state.userReducer?.user)
  return <Text>{`sorted=${sortedPlanUids.join(',')} error=${error} user=${user?.uid ?? 'none'}`}</Text>
}

describe('renderWithStore', () => {
  it('uses the slices initial state by default', async () => {
    const initial = getInitialState()
    await renderWithStore(<Probe />)
    expect(
      screen.getByText(
        `sorted=${initial.plansReducer.sortedPlanUids.join(',')} error=${initial.plansReducer.error} user=none`
      )
    ).toBeOnTheScreen()
  })

  it('deep-merges a partial preloaded state', async () => {
    const initial = getInitialState()
    const { store } = await renderWithStore(<Probe />, {
      preloadedState: { plansReducer: { sortedPlanUids: ['p1'] }, userReducer: { user: { uid: 'u1' } as any } },
    })
    expect(screen.getByText(`sorted=p1 error=${initial.plansReducer.error} user=u1`)).toBeOnTheScreen()
    expect(store.getState().plansReducer.plans).toEqual(initial.plansReducer.plans)
  })
})
