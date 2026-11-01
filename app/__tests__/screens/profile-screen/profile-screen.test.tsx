import * as React from 'react'
import { Provider } from 'react-redux'
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useNetworkStore } from '@stores/network/use-network-store'
import { USER_SCOPED_STORES } from '@stores/reset-stores'
import { useSessionStore } from '@stores/session/use-session-store'
import ProfileScreen from '@screens/profile-screen/profile-screen'
import { createTestStore } from '../../utils/test-store'

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: jest.fn() }),
}))

const cachedPlan = { uid: 'p1', name: 'Plan', colorIdx: 0, labels: [], workouts: [], ownerUid: 'f1' }

describe('ProfileScreen logout', () => {
  it('clears cached plans and user stores after signing out', async () => {
    useNetworkStore.setState({ isOnline: true })
    useSessionStore.setState({ userId: 'u1', email: 'a@test.com' })
    const resetUserStore = jest.fn()
    USER_SCOPED_STORES.push({ getState: () => ({ reset: resetUserStore }) })
    const store = createTestStore({
      plansReducer: { plans: [cachedPlan] as never },
    })
    const queryClient = new QueryClient()

    await render(
      <QueryClientProvider client={queryClient}>
        <Provider store={store}>
          <ProfileScreen />
        </Provider>
      </QueryClientProvider>
    )
    await fireEvent.press(screen.getByTestId('profile.logout'))
    await fireEvent.press(screen.getByTestId('appModal.confirm'))

    await waitFor(() => expect(store.getState().plansReducer.plans).toEqual([]))
    expect(resetUserStore).toHaveBeenCalled()
    USER_SCOPED_STORES.pop()
  })
})
